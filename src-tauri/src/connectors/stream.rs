use std::process::{Child, Command, Stdio};

pub(super) fn start_yt_dlp() -> Result<(), String> {
    let cmd = Command::new("yt-dlp");
    dbg!(cmd.get_program());
    Ok(())
}

pub(super) fn pipe_with_file_stream(music_url: &str) -> Result<Child, String> {
    let output = Command::new("yt-dlp")
        .arg("-o")
        .arg("-")
        .arg("--quiet")
        .arg("--no-warnings")
        .arg(music_url)
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(output)
}

pub(super) fn get_audio_url(video_url: &str) -> Result<Option<String>, String> {
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
