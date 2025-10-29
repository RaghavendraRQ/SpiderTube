use rustypipe::{
    client::RustyPipe,
    model::{MusicItem, MusicSearchResult, Thumbnail},
};
use tauri::{AppHandle, Manager};

use super::Song;

fn get_rustypipe(app: &AppHandle) -> RustyPipe {
    RustyPipe::builder()
        .storage_dir(app.path().app_cache_dir().unwrap())
        .build()
        .unwrap()
}

#[tauri::command]
pub async fn get_song_info(app: AppHandle, video_id: String) -> Result<String, String> {
    let rp = get_rustypipe(&app);
    let metadata = rp
        .query()
        .music_details(video_id)
        .await
        .map_err(|e| e.to_string())?;

    dbg!(&metadata);
    Ok(metadata.track.id)
}

/// There is a bug in this function
/// TODO: Change the player usage to music track
#[allow(dead_code)]
#[tauri::command]
pub async fn get_track_thumbnail(
    app: AppHandle,
    video_id: String,
) -> Result<Option<Vec<Thumbnail>>, String> {
    let rp = get_rustypipe(&app);

    let track = rp
        .query()
        .music_details(video_id)
        .await
        .map_err(|e| e.to_string())?;
    dbg!(&track.track.cover);

    if track.track.cover.len() > 0 {
        Ok(Some(track.track.cover))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn search_result(app: AppHandle, track_name: String) -> Result<Vec<Song>, String> {
    let rp = get_rustypipe(&app);
    let tracks: MusicSearchResult<MusicItem> = rp
        .query()
        .music_search(&track_name, None)
        .await
        .map_err(|e| e.to_string())?;
    let suggestion = rp
        .query()
        .search_suggestion("chuttamalle")
        .await
        .map_err(|e| e.to_string())?;

    let mut res: Vec<Song> = vec![];
    let mut limit = 10;

    for item in tracks.items.items.to_vec().iter() {
        if limit != 0 {
            limit -= 1;
            res.push(Song::from(&item));
        }
    }
    // dbg!(tracks.items.items[0..5].to_vec());
    dbg!(suggestion);
    Ok(res)
}
