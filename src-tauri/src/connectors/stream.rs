use std::process::Command;

pub(super) fn start_yt_dlp() -> Result<(), String> {
    let cmd = Command::new("yt-dlp");
    dbg!(cmd.get_program());
    Ok(())
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
        return  Ok(None);
    }

    let url= String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
    
    Ok(Some(url))
}
