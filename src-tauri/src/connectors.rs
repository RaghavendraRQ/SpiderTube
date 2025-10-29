use rustypipe::model::{traits::YtEntity, MusicItem, Thumbnail};

pub mod request;
pub mod stream;

#[derive(Clone, serde::Serialize)]
pub struct Song {
    pub id: String,
    pub name: String,
    pub thumbnail: Option<Vec<Thumbnail>>,
}

impl Song {
    pub fn from(music_item: &MusicItem) -> Self {
        match music_item {
            MusicItem::Track(track) => Self {
                id: track.id().to_string(),
                name: track.name().to_string(),
                thumbnail: Some(track.cover.clone()),
            },
            _ => Self {
                id: "fake".to_string(),
                name: "fake".to_string(),
                thumbnail: None,
            },
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_ytdlp() {
        let res = stream::start_yt_dlp();
        assert!(res.is_ok());
    }
}
