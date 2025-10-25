use rustypipe::model::{traits::YtEntity, MusicItem, Thumbnail};
use tauri::ipc::Channel;

use crate::model::song::{self, Metadata};

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

#[tauri::command]
pub async fn stream_song(
    video_url: &str,
    on_event: Channel<song::AudioStreamEvent>,
) -> Result<Metadata, String> {
    let urls = stream::get_audio_url(video_url)
        .map_err(|e| e.to_string())?
        .unwrap();
    eprintln!("urls: {:?}", urls);
    let metadata = crate::request::api_stream::stream_from_api(&urls, on_event)
        .await
        .map_err(|e| e.to_string())?;
    Ok(metadata)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn check_ytdlp() {
        let res = stream::start_yt_dlp();
        assert!(res.is_ok());
    }

    #[test]
    fn test_ytdlp_url() {
        let res = stream::get_audio_url("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
        assert!(res.is_ok());
    }
}
