use rustypipe::client::RustyPipe;

use tauri::Manager;

mod connectors;
mod error;
mod model;
mod request;


#[derive(Default)]
struct AppState {
    rp: RustyPipe
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let cache_dir = app.path().app_cache_dir().unwrap();
            app.manage(AppState {
                rp: connectors::request::get_rustypipe(cache_dir)?
            });
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            request::stream::start,
            request::stream::start_stream,
            // Rustypipe 
            connectors::request::get_search_suggestions,
            connectors::request::get_song_info,
            connectors::request::search_result,
            // User-level Utilites
            request::utils::clear_cache
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
