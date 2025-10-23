mod connectors;
mod model;
mod request;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            request::fetch_song,
            request::stream::stream_audio,
            request::stream::stream_audio_through_channel,
            request::api_stream::stream_from_api,
            connectors::request::get_song_info,
            connectors::request::get_track_thumbnail,
            connectors::request::search_result,
            connectors::stream_song
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
