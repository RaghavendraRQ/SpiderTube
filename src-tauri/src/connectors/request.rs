use rustypipe::{
    client::RustyPipe,
    model::{traits::YtEntity, MusicItem, MusicSearchResult},
};
use tauri::Manager;

fn get_rustypipe(app: &tauri::AppHandle) -> RustyPipe {
    RustyPipe::builder()
        .storage_dir(app.path().app_cache_dir().unwrap())
        .build()
        .unwrap()
}

#[tauri::command]
pub async fn get_song_info(app: tauri::AppHandle, video_url: String) -> Result<String, String> {
    let rp = get_rustypipe(&app);
    let metadata = rp
        .query()
        .music_details(video_url)
        .await
        .map_err(|e| e.to_string())?;

    dbg!(&metadata);
    Ok(metadata.track.id)
}

/// There is a bug in this function
#[tauri::command]
pub async fn get_track_thumbnail(video_url: String) -> Result<(), String> {
    let rp = RustyPipe::new();

    let track = rp
        .query()
        .player(video_url)
        .await
        .map_err(|e| e.to_string())?;
    dbg!(&track);

    if let Err(e) = super::stream::start_yt_dlp() {
        eprintln!("Error in starting yt-dlp: {}", e);
        return Err(e);
    }

    Ok(())
}

#[tauri::command]
pub async fn search_result(track_name: String) -> Result<Vec<String>, String> {
    let rp = RustyPipe::new();
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

    let mut res: Vec<String> = vec![];
    let mut limit = 10;

    for item in tracks.items.items.to_vec().iter() {
        if limit != 0 {
            limit -= 1;
            res.push(item.id().to_string());
        }
    }
    // dbg!(tracks.items.items[0..5].to_vec());
    dbg!(suggestion);
    Ok(res)
}
