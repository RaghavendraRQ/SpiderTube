mod request;

mod model;


#[tauri::command]
fn search(search_term: String) -> String {
    let lowercase_term = search_term.to_lowercase();
    let search_terms: Vec<_> = vec![
        "spider".to_string(),
        "tube".to_string(),
        "spider tube".to_string(),
        "video".to_string(),
        "streaming".to_string(),
        "entertainment".to_string(),
        "movies".to_string(),
        "shows".to_string(),
    ];

    if let Some(term) = search_terms.iter().find(|t| lowercase_term.contains(&t[..])) {
        return term.clone();
    }
    "Please Wait as we add this term to list".to_string()
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![search, request::sent_request, request::get_template_song, request::fetch_song])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
