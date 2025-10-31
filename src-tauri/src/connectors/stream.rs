use std::process::{Command, Stdio};

pub fn yt_dlp(video_url: &str) -> Result<std::process::Child, String> {
    let child = Command::new("yt-dlp")
        .arg("-o")
        .arg("-")
        .arg("--quiet")
        .arg("--no-warnings")
        .arg(video_url)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;

    eprintln!("yt-dlp started");
    Ok(child)
}

pub fn ffmpeg() -> Result<std::process::Child, String> {
    let child = Command::new("ffmpeg")
        .args([
            "-i",
            "pipe:0",
            "-f",
            "mp3",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "192k",
            "-",
        ])
        .stdout(Stdio::piped())
        .stdin(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    eprintln!("ffmpeg started");
    Ok(child)
}
