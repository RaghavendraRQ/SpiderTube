use base64::{engine::general_purpose, Engine as _};
use std::fs;
use tauri::{AppHandle, Manager};

pub mod api_stream;
pub mod file;
pub mod stream;
