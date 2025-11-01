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