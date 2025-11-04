use rustypipe::model::MusicPlaylist;

use crate::model::Song;

#[derive(Clone, serde::Serialize)]
pub struct SpideyTubePlaylist {
    pub id: String,
    pub name: String,
    pub tracks: Vec<Song>,
    pub track_count: Option<u64>,
}

impl From<MusicPlaylist> for SpideyTubePlaylist {
    fn from(value: MusicPlaylist) -> Self {
        Self {
            id: value.id,
            name: value.name,
            track_count: value.track_count,
            tracks: value.tracks.items.into_iter().map(Into::into).collect(),
        }
    }
}
