use std::{
    io::{self, Read},
    path::PathBuf,
};

use crate::{
    connectors,
    model::song::{self, AudioStreamEvent, Metadata},
    request::file,
};

use tauri::{ipc::Channel, AppHandle, Emitter, Manager};

const CHUNK_SIZE: usize = 1024 * 1024;

enum Event {
    MetadataStream,

    AudioChunkContinue,

    StreamComplete,
    StreamError,
}

impl Event {
    fn as_str(&self) -> &'static str {
        match self {
            Event::MetadataStream => "metadata-stream",
            Event::AudioChunkContinue => "audio-chunk-continue",
            Event::StreamComplete => "stream-complete",
            Event::StreamError => "stream-error",
        }
    }
}

// Tauri Commands will go here
#[tauri::command]
pub async fn start(
    app: AppHandle,
    music_url: String,
    channel: Channel<AudioStreamEvent>,
) -> Result<Metadata, String> {
    // Already Cached Stream from there
    if let Ok(Some(file_path)) = get_file_path(app, &music_url) {
        if let Err(e) = file::stream(&file_path, channel)
            .await
            .map_err(|e| e.to_string())
        {
            eprintln!("Error in reading file: {}", e);
        }
    }

    let metadata = song::Metadata::new(0, "audio.mp3".to_string(), "file".to_string());
    Ok(metadata)
}

#[tauri::command]
pub async fn start_stream(
    video_url: String,
    channel: Channel<AudioStreamEvent>,
) -> Result<song::Metadata, String> {

    let metadata = song::Metadata::new(100, "audio/mpeg".to_string(), video_url.clone());
    let mut yt_dlp = connectors::stream::save_audio(&video_url)?;
    let stdout = yt_dlp.stdout.take().ok_or("Failed to capture")?;

    let mut ffmpeg = connectors::stream::ffmpeg()?;
    let ffmpeg_stdin = ffmpeg.stdin.take().ok_or("Failed to read")?;
    let ff_stdout = ffmpeg.stdout.take().ok_or("Faied to open stdout")?;

    tokio::spawn(async move {
        if let Err(e) = pipe_ff(stdout,ffmpeg_stdin, ff_stdout, channel.clone()).await {
            eprintln!("Error in stdout: {}", e);
        }
    });

    Ok(metadata)
}

// All the priv functions

/// File Path = CACHE/video_id.mp3

#[tauri::command]
pub fn get_file_path(app: AppHandle, music_url: &str) -> Result<Option<PathBuf>, String> {
    let cache = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let video_id = get_video_id(music_url).unwrap_or("temp".to_string());

    let mut file_path = cache.join(video_id);
    file_path.set_extension("mp3");
    dbg!(&file_path);
    if file_path.exists() {
        return Ok(Some(file_path));
    }
    Ok(None)
}

// Same logic for youtube and music.youtube
fn get_video_id(music_url: &str) -> Option<String> {
    music_url
        .split("watch?v=")
        .nth(1)
        .and_then(|s| s.split('&').next())
        .map(|s| s.to_string())
}

fn read_stdout(
    mut stdout: std::process::ChildStdout,
    channel: &Channel<AudioStreamEvent>,
) -> Result<(), String> {
    channel
        .send(AudioStreamEvent::Started {
            song_id: "test".to_string(),
        })
        .map_err(|e| e.to_string())?;

    let mut buffer = vec![0u8; CHUNK_SIZE];
    let mut chunk_id = 0;
    // let mut total_size = 0;

    loop {
        let bytes_read = stdout.read(&mut buffer).map_err(|e| e.to_string())?;

        if bytes_read == 0 {
            break;
        }
        let chunk_data = buffer[..bytes_read].to_vec();
        channel
            .send(AudioStreamEvent::Progress {
                chunk_data,
                chunk_id,
                is_last: false,
            })
            .map_err(|e| e.to_string())?;

        // Implement Cache here

        chunk_id += 1;
    }
    channel
        .send(AudioStreamEvent::Finished)
        .map_err(|e| e.to_string())?;
    Ok(())
}

async fn pipe_ff(
    mut yt_stdout: std::process::ChildStdout,
    mut ff_stdin: std::process::ChildStdin,
    mut ff_stdout: std::process::ChildStdout,
    channel: Channel<AudioStreamEvent>,
) -> Result<(), String> {
    let pipe_task = tokio::task::spawn_blocking(move || {
        if let Err(e) = io::copy(&mut yt_stdout, &mut ff_stdin) {
            eprintln!("Error in coping: {}", e);
        }
    });


    tokio::task::spawn_blocking(move || {
        let mut buffer = [0u8; CHUNK_SIZE];
        let mut chunk_id = 0;
        while let Ok(bytes_read) = ff_stdout.read(&mut buffer) {
            if bytes_read == 0 {
                break;
            }
            let chunk_data = buffer[..bytes_read].to_vec();
            channel
                .send(AudioStreamEvent::Progress {
                    chunk_data,
                    chunk_id,
                    is_last: false,
                })
                .map_err(|e| e.to_string())
                .expect("Err in sending");

            // Implement Cache here

            chunk_id += 1;
        }

        channel
            .send(AudioStreamEvent::Finished).unwrap();
    });

    pipe_task.await.map_err(|e| e.to_string())?;

    Ok(())
}
