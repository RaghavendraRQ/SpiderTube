use std::path::PathBuf;

use rustypipe::{
    client::RustyPipe,
    model::{MusicItem, MusicSearchResult, Thumbnail},
};
use tauri::State;

use crate::{AppState, error::{self, SpideyTubeError, TauriError}};

use super::Song;

pub fn get_rustypipe(path: PathBuf) -> error::Result<RustyPipe> {
    let rp = RustyPipe::builder()
        .storage_dir(path)
        .build()?;
    Ok(rp)
}

#[tauri::command]
pub async fn get_song_info(state: State<'_, AppState>, video_id: String) -> Result<String, TauriError> {
    let metadata = state.rp
        .query()
        .music_details(video_id)
        .await
        .map_err(SpideyTubeError::from)?;

    dbg!(&metadata);
    Ok(metadata.track.id)
}

/// There is a bug in this function
/// TODO: Change the player usage to music track
#[allow(dead_code)]
#[tauri::command]
pub async fn get_track_thumbnail(
    state: State<'_, AppState>,
    video_id: String,
) -> Result<Option<Vec<Thumbnail>>, TauriError> {
    let track = state.rp
        .query()
        .music_details(video_id)
        .await
        .map_err(SpideyTubeError::from)?;
    dbg!(&track.track.cover);

    if track.track.cover.len() > 0 {
        Ok(Some(track.track.cover))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn search_result(state: State<'_, AppState>, track_name: String) -> Result<Vec<Song>, TauriError> {
    let tracks: MusicSearchResult<MusicItem> = state.rp
        .query()
        .music_search(&track_name, None)
        .await
        .map_err(SpideyTubeError::from)?;

    let mut res: Vec<Song> = vec![];
    let mut limit = 10;

    for item in tracks.items.items.to_vec().iter() {
        if limit != 0 {
            limit -= 1;
            res.push(Song::from(&item));
        }
    }
    // dbg!(tracks.items.items[0..5].to_vec());
    Ok(res)
}

#[tauri::command]
pub async fn get_search_suggestions(
    state: State<'_, AppState>,
    search_buffer: &str,
) -> Result<Vec<String>, TauriError> {
    let suggestions = state.rp
        .query()
        .search_suggestion(search_buffer)
        .await
        .map_err(SpideyTubeError::from)?;
    // dbg!(&suggestions);
    Ok(suggestions)
}
