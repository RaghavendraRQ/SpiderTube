use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn clear_cache(app: AppHandle) -> Result<(), String> {
    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;

    if cache_dir.exists() {
        std::fs::remove_dir_all(&cache_dir).map_err(|e| e.to_string())?;
        std::fs::create_dir_all(&cache_dir).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn stream_from_cache(app: AppHandle, video_id: &str) -> Result<Vec<u8>, String> {
    let cache_dir = app
        .path()
        .app_cache_dir()
        .map_err(|e: tauri::Error| e.to_string())?;
    let file_path = cache_dir.join(video_id);
    dbg!(&file_path);

    std::fs::read(file_path).map_err(|e| e.to_string())
}
