
use reqwest::Url;


#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct Song {
    pub title: String,
    pub duration: u16,
    pub date: std::time::SystemTime,
    pub liked: bool,
    pub play_count: u32,
} 

impl Song {
    pub fn new(title: String, duration: u16, date: std::time::SystemTime) -> Self {
        Self {
            title,
            duration,
            date,
            liked: false,
            play_count: 0,
        }
    }
}

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

