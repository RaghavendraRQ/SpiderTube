use std::{
    fs::File,
    io::Read,
    path::{Path, PathBuf},
};

use tauri::ipc::Channel;

use crate::model::song::{self, AudioStreamEvent};

const CHUNK_SIZE: usize = 256 * 1024;

pub async fn stream(file_path: &Path, channel: Channel<AudioStreamEvent>) -> Result<(), String> {
    let file_size = tokio::fs::metadata(file_path)
        .await
        .map_err(|e| e.to_string())?
        .len();

    let file_name = file_path
        .file_name()
        .and_then(|e| e.to_str())
        .unwrap_or("temp")
        .to_string();

    let metadata = song::Metadata::new(file_size, "audio/mp4".to_string(), file_name);

    // tokio::spawn(move || {
    //     let mut file = File::open(file_name).map_err(|e| e.to_string())?;
    //     let mut buffer = [0u8; CHUNK_SIZE];
    //     file.read(&mut buffer).unwrap();
    // });

    Ok(())
}
