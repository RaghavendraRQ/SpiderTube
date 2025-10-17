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

