#[derive(thiserror::Error, Debug)]
pub enum SpideyTubeError {
    // Network error from reqwest
    #[error("Network error: {0}")]
    Network(#[from] reqwest::Error),

    // Streaming error from tokio mpsc
    #[error("Streaming error: {0}")]
    Stream(#[from] tokio::sync::broadcast::error::RecvError),

    // Rusty Internal Error
    #[error("Rusty pipe crate error: {0}")]
    Rusty(#[from] rustypipe::error::Error),

    // Tauri Errors that implements Serialize
    #[error("Tauri Error: {0}")]
    Tauri(#[from] tauri::Error),
}

pub type Result<T> = std::result::Result<T, SpideyTubeError>;

#[derive(serde::Serialize)]
pub(crate) struct TauriError {
    pub code: u16,
    pub msg: String,
}

impl From<SpideyTubeError> for TauriError {
    fn from(value: SpideyTubeError) -> Self {
        let msg = value.to_string();
        let code = match value {
            SpideyTubeError::Network(_) => 511,
            SpideyTubeError::Stream(_) => 512,
            SpideyTubeError::Rusty(_) => 513,
            SpideyTubeError::Tauri(_) => 514,
        };

        Self { code, msg }
    }
}

impl From<String> for TauriError {
    fn from(value: String) -> Self {
        Self {
            code: 515,
            msg: value,
        }
    }
}
