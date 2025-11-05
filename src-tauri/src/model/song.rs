use rustypipe::model::{MusicItem, Thumbnail, TrackDetails, TrackItem, TrackType, traits::YtEntity};

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    pub id: String,
    pub name: String,
    pub r#type: TrackType,
    pub related_id: Option<String>,
    pub size: Option<u64>
}

impl Metadata {
    pub fn from(id: String, name: String) -> Self {
        Self {
            id,
            name,
            r#type: TrackType::Track,
            related_id: None,
            size: None
        }

    }
}

impl From<TrackDetails> for Metadata  {
    fn from(value: TrackDetails) -> Self {
        Self {
            id: value.track.id,
            name: value.track.name,
            r#type: value.track.track_type,
            size: None,
            related_id: value.related_id
        }
    }
    
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


#[derive(Clone, serde::Serialize)]
pub struct Song {
    pub id: String,
    pub name: String,
    pub thumbnail: Option<Vec<Thumbnail>>,
    pub r#type: SongType,
}

#[derive(Clone, serde::Serialize)]
pub enum SongType {
    Playlist,
    Track,
    Album,
    Artist,
    User,
}

impl Song {
    pub fn from(music_item: &MusicItem) -> Self {
        let id = music_item.id().to_string();
        let name = music_item.name().to_string();
        let thumbnail;
        let r#type;

        match music_item {
            MusicItem::Playlist(t) => {
                thumbnail = Some(t.thumbnail.clone());
                r#type = SongType::Playlist;
            }
            MusicItem::Album(t) => {
                thumbnail = Some(t.cover.clone());
                r#type = SongType::Album;
            }
            MusicItem::Track(t) => {
                thumbnail = Some(t.cover.clone());
                r#type = SongType::Track;
            }
            MusicItem::User(u) => {
                thumbnail = Some(u.avatar.clone());
                r#type = SongType::User;
            }
            MusicItem::Artist(t) => {
                thumbnail = Some(t.avatar.clone());
                r#type = SongType::Artist;
            }
        };

        Self {
            id,
            name,
            thumbnail,
            r#type,
        }
    }
}

impl From<TrackItem> for Song {
    fn from(value: TrackItem) -> Self {
        Self {
            id: value.id,
            name: value.name,
            thumbnail: Some(value.cover),
            r#type: SongType::Track,
        }
    }
}
