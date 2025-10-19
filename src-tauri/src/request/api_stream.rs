
use std::{path::Path, thread};

use futures::StreamExt;
use tauri::ipc::Channel;

use crate::model::song;


#[tauri::command]
pub async fn stream_from_api(url: String, on_event: Channel<song::AudioStreamEvent>) -> Result<song::Metadata, String> {
    let response = reqwest::get(&url).await
                                .map_err(|e| e.to_string())?;

    let content = response.headers()
                          .get("content-type")
                          .and_then(|s| s.to_str().ok())
                          .unwrap_or("audio/mpeg")
                          .to_string();
    
    let metadata = song::Metadata::new(
        response.content_length().unwrap_or(0), content, extract_file_name(&url));

    // thread::spawn(move || {
    //     if let Err(e) = stream_audio_from_api(&url, &on_event) {
    //         eprintln!("Error in streaming audio from api: {}", e);
    //     }
    // });
    tokio::spawn(async move {
        stream_audio_from_api(response, &on_event).await.map_err(|e| e.to_string());
    });

    Ok(metadata)
}

async fn stream_audio_from_api(stream: reqwest::Response, channel: &Channel<song::AudioStreamEvent>) -> Result<(), String> {

    let mut stream = stream.bytes_stream();
    let mut chunk_index = 0;
    let mut total_size = 0;

    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|e| e.to_string())?;
        total_size += bytes.len();

        let chunk = song::AudioChunk::new(bytes.to_vec(), false, chunk_index);


    }
    

    Ok(())
}

fn  extract_file_name(url: &str) -> String {
    url.split('/')
       .last()
       .and_then(|s| s.split('?').next())
       .unwrap_or("temp_song")
       .to_string()
}