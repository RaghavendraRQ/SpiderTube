
#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    pub size: u64,
    pub mime_type: String,
    pub filename: String,
}

#[derive(Clone, serde::Serialize)]
#[serde(
    rename_all = "PascalCase",
    rename_all_fields = "camelCase",
    tag = "event",
    content = "data"
)]
pub enum AudioStreamEvent {
    Started {
        song_id: String,
    },
    Progress {
        chunk_data: Vec<u8>,
        chunk_id: usize,
        is_last: bool,
    },
    Finished,
}

impl Metadata {
    pub fn new(size: u64, mime_type: String, filename: String) -> Self {
        Self {
            size,
            mime_type,
            filename,
        }
    }
}
