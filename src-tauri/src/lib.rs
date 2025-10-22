mod request;
mod connectors;
mod model;
mod rusty;



#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            request::fetch_song,
            request::stream::stream_audio,
            request::stream::stream_audio_through_channel,
            request::api_stream::stream_from_api,
            rusty::get_song_info,
            rusty::get_song_url,
            connectors::request::test_url_access
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}