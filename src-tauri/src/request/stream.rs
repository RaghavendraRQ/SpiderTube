use std::{
    io::{self, Read},
    path::PathBuf,
};

use tokio::{fs::File, io::AsyncWriteExt, sync::broadcast, task};

use bytes::Bytes;

use crate::{
    connectors::{self, request::get_song_info},
    error::TauriError,
    model::song::{AudioStreamEvent, Metadata},
    AppState,
};

use tauri::{ipc::Channel, AppHandle, Manager, State};

const CHUNK_SIZE: usize = 256 * 1024; // 256 Bytes

// Tauri Commands will go here

/// Improvise this fn to respond with file_path or stream
#[tauri::command]
pub async fn start(app: AppHandle, video_url: String) -> Option<PathBuf> {
    if let Some(path) = get_file_path(&app, &video_url).expect("Can't get the file path") {
        return Some(path);
    }
    None
}

#[tauri::command]
pub async fn start_stream(
    app: AppHandle,
    state: State<'_, AppState>,
    video_url: String,
    channel: Channel<AudioStreamEvent>,
) -> Result<Metadata, TauriError> {
    let video_id = get_video_id(&video_url).unwrap_or(String::from("Raghav"));
    let metadata = get_song_info(state, video_id).await?;

    // Create subprocess
    let mut yt_dlp = connectors::stream::yt_dlp(&video_url)?;
    let mut ffmpeg = connectors::stream::ffmpeg()?;

    // Take the handles for both
    let yt_dlp_stdout = yt_dlp
        .stdout
        .take()
        .ok_or("Failed to capture".to_string())?;
    let ffmpeg_stdin = ffmpeg.stdin.take().ok_or("Failed to read".to_string())?;
    let ff_stdout = ffmpeg
        .stdout
        .take()
        .ok_or("Faied to open stdout".to_string())?;

    // Cache Path
    let cache_path = get_create_file_path(&app, &video_url).map_err(|e| e.to_string())?;
    // let cache_path = cache_path.unwrap_or_default();

    tokio::spawn(async move {
        if let Err(e) = stream_and_cache(
            yt_dlp_stdout,
            ffmpeg_stdin,
            ff_stdout,
            cache_path,
            channel.clone(),
        )
        .await
        {
            eprintln!("Error in stdout: {}", e);
        } else {
            let _ = yt_dlp.wait();
            let _ = ffmpeg.wait();
        }
    });

    Ok(metadata)
}

// All the priv functions

/// Get the file path if it exsists
/// File Path = CACHE/video_id.mp3
#[tauri::command]
pub fn get_file_path(app: &AppHandle, video_url: &str) -> Result<Option<PathBuf>, String> {
    let cache = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let video_id = get_video_id(video_url).unwrap_or("temp".to_string());

    let mut file_path = cache.join(video_id);
    file_path.set_extension("mp3");
    dbg!(&file_path);
    if file_path.exists() {
        return Ok(Some(file_path));
    }
    Ok(None)
}

/// Get the file path to be created
fn get_create_file_path(app: &AppHandle, video_url: &str) -> Result<PathBuf, String> {
    let cache = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let video_id = get_video_id(video_url).unwrap_or("temp".to_string());

    let mut file_path = cache.join(video_id);
    file_path.set_extension("mp3");
    Ok(file_path)
}

// Same logic for youtube and music.youtube
fn get_video_id(video_url: &str) -> Option<String> {
    video_url
        .split("watch?v=")
        .nth(1)
        .and_then(|s| s.split('&').next())
        .map(|s| s.to_string())
}

async fn stream_and_cache(
    mut yt_stdout: std::process::ChildStdout,
    mut ff_stdin: std::process::ChildStdin,
    mut ff_stdout: std::process::ChildStdout,
    cache_path: PathBuf,
    channel: Channel<AudioStreamEvent>,
) -> io::Result<()> {
    // yt-dlp stdout ---> ffmpeg stdin in seperate blocking thread.
    let pipe_task = task::spawn_blocking(move || -> io::Result<()> {
        io::copy(&mut yt_stdout, &mut ff_stdin)?;
        drop(ff_stdin);
        Ok(())
    });

    // ffmpeg -> async broadcast
    let (tx, _) = broadcast::channel::<Bytes>(32);
    let tx_clone = tx.clone();

    // Producer Reading from stdout
    let read_task = task::spawn_blocking(move || -> io::Result<()> {
        let mut buffer = [0u8; CHUNK_SIZE];
        while let Ok(size) = ff_stdout.read(&mut buffer) {
            if size == 0 {
                break;
            }
            let chunk = Bytes::copy_from_slice(&buffer[..size]);
            if tx_clone.send(chunk).is_err() {
                break;
            }
        }

        Ok(())
    });

    // Cache file Reciever -> Async Consumer
    let mut cache_rx = tx.subscribe();
    let file_stream = tokio::spawn(async move {
        let mut cache_file = File::create(cache_path).await?;
        while let Ok(chunk) = cache_rx.recv().await {
            cache_file.write_all(&chunk).await?;
        }
        cache_file.flush().await?;
        Ok::<_, io::Error>(())
    });

    // Channel Stream -> Async Consumer
    let mut channel_rx = tx.subscribe();
    let frontend_stream = task::spawn(async move {
        let mut chunk_id = 0;

        // TODO: Handle error properly (Use anyhow)
        let _ = channel.send(AudioStreamEvent::Started {
            song_id: "song".to_string(),
        });
        while let Ok(chunk) = channel_rx.recv().await {
            chunk_id += 1;
            let _ = channel.send(AudioStreamEvent::Progress {
                chunk_data: chunk.to_vec(),
                chunk_id,
                is_last: false,
            });
        }
        let _ = channel.send(AudioStreamEvent::Finished);
        Ok::<_, io::Error>(())
    });

    // Wait for everything
    let _ = tokio::try_join!(pipe_task, read_task)?;
    let _ = tokio::try_join!(file_stream, frontend_stream)?;

    Ok(())
}
