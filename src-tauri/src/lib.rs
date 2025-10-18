// src-tauri/src/main.rs
use tauri::Manager;
use std::path::PathBuf;
use std::fs;

// mod request;

#[derive(Debug, serde::Serialize, serde::Deserialize)]
struct SongMetadata {
    id: String,
    title: String,
    artist: String,
    cached: bool,
}

// Command to fetch and cache song
#[tauri::command]
async fn fetch_and_cache_song(
    app: tauri::AppHandle,
    song_id: String,
    innertube_url: String,
) -> Result<String, String> {
    // Get cache directory
    let cache_dir = app.path().app_cache_dir()
        .map_err(|e| e.to_string())?;
    
    fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    
    let file_path = cache_dir.join(format!("{}.mp3", song_id));
    
    // Check if already cached
    if file_path.exists() {
        return Ok(song_id);
    }
    
    // Fetch from InnerTube
    let response = reqwest::get(&innertube_url)
        .await
        .map_err(|e| e.to_string())?;
    
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    
    // Save to cache
    fs::write(&file_path, bytes).map_err(|e| e.to_string())?;
    
    Ok(song_id)
}

// Command to check if song is cached
#[tauri::command]
fn is_song_cached(app: tauri::AppHandle, song_id: String) -> Result<bool, String> {
    let cache_dir = app.path().app_cache_dir()
        .map_err(|e| e.to_string())?;
    
    let file_path = cache_dir.join(format!("{}.mp3", song_id));
    Ok(file_path.exists())
}

// Command to get cache path
#[tauri::command]
fn get_cache_path(app: tauri::AppHandle) -> Result<String, String> {
    app.path()
        .app_cache_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| e.to_string())
}

// Custom protocol handler for streaming
fn stream_protocol_handler(
    ctx: tauri::UriSchemeContext<'_, tauri::Wry>,
    request: tauri::http::Request<Vec<u8>>,
    responder: tauri::UriSchemeResponder,
) {
    let app = ctx.app_handle().clone();
    
    // Spawn async task to handle the request
    tauri::async_runtime::spawn(async move {
        let response = handle_stream_request(&app, request).await;
        responder.respond(response);
    });
}

async fn handle_stream_request(
    app: &tauri::AppHandle,
    request: tauri::http::Request<Vec<u8>>,
) -> tauri::http::Response<Vec<u8>> {
    // Parse the URL to get song_id
    // Format: stream://localhost/song_id
    let path = request.uri().path();
    let song_id = path.trim_start_matches('/');
    
    let cache_dir = match app.path().app_cache_dir() {
        Ok(dir) => dir,
        Err(e) => {
            return tauri::http::Response::builder()
                .status(500)
                .body(format!("Cache dir error: {}", e).into_bytes())
                .unwrap();
        }
    };
    
    let file_path = cache_dir.join(format!("{}.mp3", song_id));
    
    if !file_path.exists() {
        return tauri::http::Response::builder()
            .status(404)
            .body(b"Song not found".to_vec())
            .unwrap();
    }
    
    // Read the file
    let file_content = match fs::read(&file_path) {
        Ok(content) => content,
        Err(e) => {
            return tauri::http::Response::builder()
                .status(500)
                .body(format!("File read error: {}", e).into_bytes())
                .unwrap();
        }
    };
    
    // Handle range requests for seeking
    let range_header = request.headers().get("range");
    
    if let Some(range) = range_header {
        // Parse range header (e.g., "bytes=0-1023")
        if let Ok(range_str) = range.to_str() {
            if let Some(range_val) = range_str.strip_prefix("bytes=") {
                let parts: Vec<&str> = range_val.split('-').collect();
                let start: usize = parts[0].parse().unwrap_or(0);
                let end: usize = if parts.len() > 1 && !parts[1].is_empty() {
                    parts[1].parse().unwrap_or(file_content.len() - 1)
                } else {
                    file_content.len() - 1
                };
                
                let end = end.min(file_content.len() - 1);
                let chunk = file_content[start..=end].to_vec();
                
                return tauri::http::Response::builder()
                    .status(206) // Partial Content
                    .header("Content-Type", "audio/mpeg")
                    .header("Content-Length", chunk.len().to_string())
                    .header("Content-Range", format!("bytes {}-{}/{}", start, end, file_content.len()))
                    .header("Accept-Ranges", "bytes")
                    .body(chunk)
                    .unwrap();
            }
        }
    }
    
    // Return full file if no range requested
    tauri::http::Response::builder()
        .status(200)
        .header("Content-Type", "audio/mpeg")
        .header("Content-Length", file_content.len().to_string())
        .header("Accept-Ranges", "bytes")
        .body(file_content)
        .unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .register_asynchronous_uri_scheme_protocol("stream", stream_protocol_handler)
        .invoke_handler(tauri::generate_handler![
            fetch_and_cache_song,
            is_song_cached,
            get_cache_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}