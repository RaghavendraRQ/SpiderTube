use std::process::{Command, Stdio};

pub(super) fn start_yt_dlp() -> Result<(), String> {
    let cmd = Command::new("yt-dlp");
    dbg!(cmd.get_program());
    Ok(())
}

pub fn save_audio(video_url: &str) -> Result<std::process::Child, String> {
    let child = Command::new("yt-dlp")
        .arg("-o")
        .arg("-")
        .arg("--quiet")
        .arg("--no-warnings")
        .arg(video_url)
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit())
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

pub(super) fn get_stream_url(video_url: &str) -> Result<Option<String>, String> {
    let output = Command::new("yt-dlp")
        .arg("-f")
        .arg("bestaudio")
        .arg("-g")
        .arg(video_url)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Ok(None);
    }

    let url = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;

    Ok(Some(url))
}
