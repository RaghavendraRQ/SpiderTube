use std::fs;
use tauri::{AppHandle, Manager};
use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
pub async fn fetch_song(app: AppHandle, url: String) -> Result<String, String> {
    let song_name= url.split("/").last().unwrap();
    let file_path = app.path().app_cache_dir().map_err(|e| e.to_string())?
    .join(&song_name);
    println!("{:?}", file_path);
    if file_path.exists() {
        println!("Cache Hit");
        Ok(general_purpose::STANDARD.encode(fs::read(file_path).unwrap()))
    } else {
        println!("Cache Miss");
        fetch_song_and_cache(app, &url).await
    }
}

pub async fn fetch_song_and_cache(app: AppHandle, url: &String) -> Result<String, String> {
    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let song_bytes = response.bytes().await.map_err(|e | e.to_string())?;
    let song_name = url.split("/").last().unwrap();

    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&cache_dir).unwrap();
    let file_path = cache_dir.join(song_name);

    fs::write(&file_path, &song_bytes).unwrap();

    Ok(general_purpose::STANDARD.encode(song_bytes))

}

#[tauri::command]
pub async fn fetch_song_path(app:AppHandle, url: String) -> Result<String, String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let song_bytes = response.bytes().await.map_err(|e | e.to_string())?;
    let song_name = url.split("/").last().unwrap();

    let cache_dir = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&cache_dir).unwrap();
    let file_path = cache_dir.join(song_name);

    fs::write(&file_path, &song_bytes).unwrap();

    Ok(file_path.to_string_lossy().to_string())


}

