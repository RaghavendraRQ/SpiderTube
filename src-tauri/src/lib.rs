mod connectors;
mod error;
mod model;
mod request;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            request::stream::start,
            request::stream::start_stream,
            // Rustypipe and yt_dlp
            connectors::request::get_search_suggestions,
            connectors::request::get_song_info,
            connectors::request::search_result
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
