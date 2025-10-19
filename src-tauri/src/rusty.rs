use rustypipe::{client::RustyPipe};


#[tauri::command]
pub async fn get_song_info(url: &str) -> Result<(), String>{
    eprintln!("Called the function");
    let rp = RustyPipe::new();
    let song = rp
                .query()
                .music_details(url)
                .await
                .map_err(|e| e.to_string())?;
    dbg!(song);

    Ok(())
}

#[tauri::command]
pub async fn get_song_url(url: &str) -> Result<(), String> {
    let rp = RustyPipe::new();
    let song_url = rp.query()
                     .music_search_tracks(url)
                     .await
                     .map_err(|e| e.to_string())?;
    let url = song_url.items.endpoint;
    dbg!(url);
    Ok(())
} 