

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

