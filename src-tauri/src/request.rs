use std::io::Write;

use tauri::{AppHandle, Manager};
use reqwest::Url;
use crate::model::song::Song;

#[tauri::command]
pub async fn sent_request(url: String) -> Result<String, ()> {
    let response = reqwest::get(Url::parse(&url).unwrap()).await.unwrap();
    let body = response.text().await.unwrap();
    Ok(body)
}

#[tauri::command]
pub fn get_template_song() -> Song {
    Song::new("Spider Man".to_string(), 3, std::time::SystemTime::now())
}

#[tauri::command]
pub async fn fetch_song(app: AppHandle) -> Result<String, String>{
    let url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3";
    println!("Fetched song");
    let cache_dir = app.path().app_cache_dir().unwrap();

    if !cache_dir.exists() {
        std::fs::create_dir(&cache_dir).unwrap();
    }

    let file_name = url.split('/').last().unwrap_or("some_song.mp3");
    let file_path = cache_dir.join(file_name);

    let client = reqwest::Client::new();
    let res = client.get(url).send().await.unwrap();
    let bytes = res.bytes().await.map_err(|e| e.to_string())?;

    if !file_path.exists() {
        let mut file = std::fs::File::create(&file_path).unwrap();
        file.write_all(&bytes).unwrap();
    }
    println!("Error here");

    Ok(file_path.to_string_lossy().to_string())
}

