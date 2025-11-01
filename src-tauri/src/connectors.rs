
use rustypipe::model::{traits::YtEntity, MusicItem, Thumbnail};

pub mod request;
pub mod stream;

#[derive(Clone, serde::Serialize)]
pub struct Song {
    pub id: String,
    pub name: String,
    pub thumbnail: Option<Vec<Thumbnail>>,
    pub r#type: SongType
}

#[derive(Clone, serde::Serialize)]
pub enum  SongType{
    Playlist,
    Track,
    Album,
    Artist,
    User
}

impl Song {
    pub fn from(music_item: &MusicItem) -> Self {
        let id = music_item.id().to_string();
        let name = music_item.name().to_string();
        let thumbnail;
        let r#type;
         
        match music_item {
            MusicItem::Playlist(t) => {thumbnail = Some(t.thumbnail.clone()); r#type = SongType::Playlist;}
            MusicItem::Album(t) => {thumbnail = Some(t.cover.clone()); r#type = SongType::Album;}
            MusicItem::Track(t) => {thumbnail = Some(t.cover.clone()); r#type = SongType::Track;}
            MusicItem::User(u) => {thumbnail = Some(u.avatar.clone()); r#type = SongType::User;}
            MusicItem::Artist(t) => {thumbnail = Some(t.avatar.clone()); r#type = SongType::Artist;}
        };

        Self { id, name, thumbnail, r#type}
        
    }
}
