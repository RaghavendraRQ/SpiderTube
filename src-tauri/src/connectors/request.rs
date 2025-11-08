use std::path::PathBuf;

use rustypipe::{
    client::RustyPipe,
    model::{MusicGenreItem, MusicItem, MusicPlaylistItem, MusicSearchResult, Thumbnail}, param::Country,
};
use tauri::State;

use crate::{
    error::{self, SpideyTubeError, TauriError},
    model::{song::Metadata, SpideyTubePlaylist},
    AppState,
};

use crate::model::Song;

pub fn get_rustypipe(path: PathBuf) -> error::Result<RustyPipe> {
    let rp = RustyPipe::builder().storage_dir(path).build()?;
    Ok(rp)
}

#[tauri::command]
pub async fn get_song_info(
    state: State<'_, AppState>,
    video_id: String,
) -> Result<Metadata, TauriError> {
    let metadata = state
        .rp
        .query()
        .music_details(video_id)
        .await
        .map_err(SpideyTubeError::from)?;

    let lyrics = get_lyrics(&state, metadata.lyrics_id.as_ref().unwrap()).await.unwrap_or(
        "Fake".to_string()
    );
    dbg!(lyrics);
    Ok(metadata.into())
}

/// There is a bug in this function
/// TODO: Change the player usage to music track
#[allow(dead_code)]
#[tauri::command]
pub async fn get_track_thumbnail(
    state: State<'_, AppState>,
    video_id: String,
) -> Result<Option<Vec<Thumbnail>>, TauriError> {
    let track = state
        .rp
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
pub async fn search_result(
    state: State<'_, AppState>,
    track_name: String,
    mut limit: u8,
) -> Result<Vec<Song>, TauriError> {
    let tracks: MusicSearchResult<MusicItem> = state
        .rp
        .query()
        .music_search(&track_name, None)
        .await
        .map_err(SpideyTubeError::from)?;

    let mut res: Vec<Song> = vec![];

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
    let suggestions = state
        .rp
        .query()
        .music_search_suggestion(search_buffer)
        .await
        .map_err(SpideyTubeError::from)?
        .terms;
    // dbg!(&suggestions);
    Ok(suggestions)
}

#[tauri::command]
pub async fn get_genres(state: State<'_, AppState>) -> Result<Vec<MusicGenreItem>, TauriError> {
    let genres = state
        .rp
        .query()
        .music_genres()
        .await
        .map_err(SpideyTubeError::from)?;

    Ok(genres)
}

#[tauri::command]
pub async fn get_genre_playlist(
    state: State<'_, AppState>,
    genre: &str,
) -> Result<Vec<MusicPlaylistItem>, TauriError> {
    let res = state
        .rp
        .query()
        .music_genre(genre)
        .await
        .map_err(SpideyTubeError::from)?
        .sections;

    Ok(res
        .into_iter()
        .flat_map(|section| section.playlists)
        .filter(|section| section.from_ytm)
        .collect())
}

#[tauri::command]
pub async fn get_playlist(
    state: State<'_, AppState>,
    id: &str,
) -> Result<SpideyTubePlaylist, TauriError> {
    let playlist = state
        .rp
        .query()
        .music_playlist(id)
        .await
        .map_err(SpideyTubeError::from)?;

    Ok(playlist.into())
}


/// Bring the Shit back
#[tauri::command]
pub async fn get_charts(
    state: State<'_, AppState>
) -> Result<(), TauriError> {
    let top_tracks = state
        .rp
        .query()
        .music_charts(Some(Country::In))
        .await
        .map_err(SpideyTubeError::from)?
        .top_playlist_id;
    dbg!(&top_tracks);
    Ok(())
}

/// UnSeen to other
async fn get_lyrics(
    state: &State<'_, AppState>,
    lyrics_id: &str
) -> Result<String, String> {
    let lyrics = state
        .rp
        .query()
        .music_lyrics(lyrics_id)
        .await
        .map_err(|e| e.to_string())?
        .body;
    Ok(lyrics)
}