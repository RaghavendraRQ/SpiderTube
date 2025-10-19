#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Song {
    pub title: String,
    pub duration: u16,
    pub date: std::time::SystemTime,
    pub liked: bool,
    pub play_count: u32,
} 

#[derive(Clone, serde::Serialize)]
pub struct Metadata {
    pub size: u64,
    pub mime_type: String,
    pub filename: String
}

#[derive(Clone, serde::Serialize)]
pub struct AudioChunk {
    pub data: Vec<u8>,
    pub is_last: bool,
    pub index: usize
}

#[derive(Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub enum AudioStreamEvent {
    Started {
        song_id: String
    },
    Progress {
        chunk_data: Vec<u8>,
        chunk_id: usize,
        is_last: bool
    },
    Finished
}

impl Song {
    pub fn new(title: String, duration: u16, date: std::time::SystemTime) -> Self {
        Self {
            title,
            duration,
            date,
            liked: false,
            play_count: 0,
        }
    }
}


impl Metadata {
    pub fn new(size: u64, mime_type: String, filename: String ) -> Self {
        Self {
            size,
            mime_type,
            filename
        }
    }
}

impl AudioChunk {
    pub fn new(data: Vec<u8>, is_last: bool, index: usize) -> Self {
        Self {
            data,
            is_last,
            index
        }
    }
}