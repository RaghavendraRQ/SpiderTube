use std::process::Stdio;
use tauri::command;
use tokio::process::Command;
use serde_json::Value;

#[command]
pub async fn test_url_access(video_url: String) -> Result<String, String> {
    // Run yt-dlp to fetch best audio URL (no download)
    eprint!("First Check");
    let output = Command::new("yt-dlp")
        .args([
            "-f", "bestaudio",
            "--dump-json",
            "--no-warnings",
            &video_url,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .output()
        .await
        .map_err(|e| format!("failed to run yt-dlp: {e}"))?;

    eprint!("second Check");
    if !output.status.success() {
        return Err(format!("yt-dlp exited with code {:?}", output.status.code()));
    }

    eprint!("First Check");

    // Parse JSON output
    let json: Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("invalid yt-dlp JSON: {e}"))?;

    eprint!("First Check");
    // Extract the audio URL
    if let Some(url) = json["url"].as_str() {
        eprint!("{}", url.to_string());
        Ok(url.to_string())
    } else {
        Err("yt-dlp returned no audio URL".to_string())
    }
}
