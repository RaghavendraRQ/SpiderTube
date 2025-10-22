
use rustypipe::{client::RustyPipe, model::{SearchResult, TrackItem}};


#[tauri::command]
pub async fn get_song_info(video_url: String) -> Result<String, String> {

    let rp = RustyPipe::new();
    let metadata = rp.query().music_details(video_url).await.map_err(|e| e.to_string())?;

    dbg!(&metadata);
    Ok(metadata.track.id)
} 


/// There is a bug in this function
#[tauri::command]
pub async fn get_track_thumbnail(video_url: String) -> Result<(), String> {
    let rp = RustyPipe::new();

    let track = rp.query().player(video_url).await.map_err(|e| e.to_string())?;
    dbg!(&track);

    if let Err(e) = super::stream::start_yt_dlp() {
        eprintln!("Error in starting yt-dlp: {}", e);
        return Err(e);
    }

    Ok(())
}


#[tauri::command]
pub async  fn search_result(track_name: String) -> Result <SearchResult<TrackItem>, String> {
    let rp = RustyPipe::new();
    let tracks: SearchResult<TrackItem> = rp.query().search(track_name).await.map_err(|e| e.to_string())?;
    dbg!(&tracks);
    Ok(tracks)
}