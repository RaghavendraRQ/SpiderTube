use std::path::PathBuf;

use crate::{
    model::song::{self, AudioStreamEvent, Metadata},
    request::file,
};

use tauri::{ipc::Channel, AppHandle, Emitter, Manager};

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
