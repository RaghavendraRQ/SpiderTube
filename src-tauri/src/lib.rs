mod connectors;
mod model;
mod request;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            request::stream::start,
            request::stream::get_file_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
