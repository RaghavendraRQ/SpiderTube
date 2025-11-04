use rustypipe::model::{traits::YtEntity, MusicItem, Thumbnail};

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    pub size: u64,
    pub mime_type: String,
    pub filename: String,
}

#[derive(Clone, serde::Serialize)]
#[serde(
    rename_all = "PascalCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
pub enum AudioStreamEvent {
    Started {
        song_id: String,
    },
    Progress {
        chunk_data: Vec<u8>,
        chunk_id: usize,
        is_last: bool,
    },
    Finished,
}

impl Metadata {
    pub fn new(size: u64, mime_type: String, filename: String) -> Self {
        Self {
            size,
            mime_type,
            filename,
        }
    }
}

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
