use std::{fs::File, io::Read, os::unix::fs::MetadataExt, path::Path};

use crate::model::song;

use tauri::{ipc::Channel, AppHandle, Emitter};

const CHUNK_SIZE: usize = 256 * 1024;

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

#[tauri::command]
pub async fn stream_audio(app: AppHandle, file_path: String) -> Result<(), String> {
    eprint!("Started the streaming");

    std::thread::spawn(move || {
        if let Err(e) = stream_audio_chunks(&app, &file_path) {
            eprint!("Error in streaming: {}", e);
            let _ = app.emit(Event::StreamError.as_str(), e);
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn stream_audio_through_channel(
    file_path: String,
    on_event: Channel<song::AudioStreamEvent>,
) -> Result<song::Metadata, String> {
    let mut file = File::open(&file_path).map_err(|e| e.to_string())?;

    let metadata = file.metadata().map_err(|e| e.to_string())?;
    let filename = Path::new(&file_path)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("Renu.mp3")
        .to_string();

    let size = metadata.size() as usize;

    std::thread::spawn(move || {
        if let Err(e) = stream_audio_channel(&mut file, size, "123", on_event) {
            eprintln!("Error in streaming thorough channels: {}", e);
        }
    });

    Ok(song::Metadata::new(
        metadata.size(),
        get_mime_type(&file_path),
        filename,
    ))
}

fn stream_audio_chunks(app: &AppHandle, file_path: &str) -> Result<(), String> {
    let mut file = File::open(file_path).map_err(|e| e.to_string())?;

    let metadata = file.metadata().map_err(|e| e.to_string())?;
    let filename = Path::new(file_path)
        .file_name()
        .and_then(|s| s.to_str())
        .unwrap_or("Renu.MP3")
        .to_string();

    let stream_md = song::Metadata::new(metadata.size(), get_mime_type(&file_path), filename);

    app.emit(Event::MetadataStream.as_str(), stream_md)
        .map_err(|e| e.to_string())?;

    eprintln!("Sent metadata");

    let mut buffer = vec![0u8; CHUNK_SIZE];
    let mut chunk_index = 0;

    loop {
        let bytes_read = file.read(&mut buffer).unwrap();
        if bytes_read == 0 {
            eprint!("Finished Streaming");
            break;
        }

        let chunk_data = buffer[..bytes_read].to_vec();
        let is_last = bytes_read < CHUNK_SIZE;

        let chunk = song::AudioChunk::new(chunk_data, is_last, chunk_index);

        app.emit(Event::AudioChunkContinue.as_str(), chunk)
            .map_err(|e| e.to_string())?;
        chunk_index += 1;

        // Should be removed in future.
        // This is just not to overwhelm the frontend
        std::thread::sleep(std::time::Duration::from_millis(10));

        if is_last {
            break;
        }
    }

    app.emit(Event::StreamComplete.as_str(), ())
        .map_err(|e| e.to_string())?;
    eprint!("Stream Completed");
    Ok(())
}

fn get_mime_type(path: &str) -> String {
    match Path::new(path).extension().and_then(|s| s.to_str()) {
        Some("mp3") => "audio/mpeg".to_string(),
        Some("m4a") => "audio/mp4".to_string(),
        _ => "audio/mpeg".to_string(),
    }
}

#[tauri::command]
fn stream_audio_channel(
    file: &mut File,
    total_size: usize,
    song_id: &str,
    audio_channel: Channel<song::AudioStreamEvent>,
) -> Result<(), String> {
    let mut buffer = vec![0u8; CHUNK_SIZE];
    let mut chunk_id = 0;
    let mut bytes_sent = 0;

    audio_channel
        .send(song::AudioStreamEvent::Started {
            song_id: song_id.to_string(),
        })
        .map_err(|e| e.to_string())?;

    loop {
        let bytes_read = file.read(&mut buffer).map_err(|e| e.to_string())?;
        if bytes_read == 0 {
            break;
        }

        bytes_sent += bytes_read;
        let is_last = bytes_sent >= total_size || bytes_read < CHUNK_SIZE;
        chunk_id += 1;

        audio_channel
            .send(song::AudioStreamEvent::Progress {
                chunk_data: buffer.to_vec(),
                chunk_id: chunk_id,
                is_last,
            })
            .map_err(|e| e.to_string())?;

        if is_last {
            break;
        }
    }

    audio_channel
        .send(song::AudioStreamEvent::Finished)
        .map_err(|e| e.to_string())?;

    Ok(())
}
