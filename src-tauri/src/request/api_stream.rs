
use std::vec;

use futures::StreamExt;
use tauri::ipc::Channel;

use crate::model::song;

const CHUNK_SIZE: usize  = 512 * 1024;

#[tauri::command]
pub async fn stream_from_api(url: String, on_event: Channel<song::AudioStreamEvent>) -> Result<song::Metadata, String> {
    let response = reqwest::get(&url).await
                                .map_err(|e| e.to_string())?;

    let content_type = response.headers()
                          .get("content-type")
                          .and_then(|s| s.to_str().ok())
                          .unwrap_or("audio/mpeg")
                          .to_string();
    
    let content_length = response.content_length().unwrap_or(0);
    let metadata = song::Metadata::new(
        content_length, content_type, extract_file_name(&url));

    // thread::spawn(move || {
    //     if let Err(e) = stream_audio_from_api(&url, &on_event) {
    //         eprintln!("Error in streaming audio from api: {}", e);
    //     }
    // });

    tokio::spawn(async move {
        if let Err(e) = stream_audio_from_api(response, &on_event).await {
            eprintln!("Error in streaming audio from api: {}", e);
        };
    });

    eprintln!("Content-length: {}", content_length);

    Ok(metadata)
}

async fn stream_audio_from_api(stream: reqwest::Response, channel: &Channel<song::AudioStreamEvent>) -> Result<(), String> {

    let mut stream = stream.bytes_stream();
    let mut chunk_index = 0;
    let mut total_bytes_sent = 0;
    let mut data = vec![0u8];

    channel.send(song::AudioStreamEvent::Started {song_id: "rangdom".to_string()}).unwrap();
    while let Some(chunk) = stream.next().await {
        let bytes = chunk.map_err(|e| e.to_string())?;

        data.extend_from_slice(&bytes);

        if data.len() >= CHUNK_SIZE {
            let chunk = song::AudioStreamEvent::Progress{
                chunk_data: data.to_vec(),
                is_last: false,
                chunk_id: chunk_index
            };
            channel.send(chunk).map_err(|e| e.to_string())?;

            total_bytes_sent += data.len();
            chunk_index += 1;
            data.clear();
        }
    }
    channel.send(song::AudioStreamEvent::Progress { chunk_data:data.to_vec(), chunk_id: chunk_index, is_last: true }).unwrap();
    channel.send(song::AudioStreamEvent::Finished).map_err(|e| e.to_string())?;

    eprintln!("Total Sent: {}", total_bytes_sent);
    Ok(())
}

fn  extract_file_name(url: &str) -> String {
    url.split('/')
       .last()
       .and_then(|s| s.split('?').next())
       .unwrap_or("temp_song")
       .to_string()
}