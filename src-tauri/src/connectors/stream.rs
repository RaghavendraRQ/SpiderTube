use std::process::Command;

pub(super) fn start_yt_dlp() -> Result<(), String> {
    let cmd = Command::new("yt-dlp");
    dbg!(cmd.get_program());
    Ok(())
}

pub(super) fn get_audio_url(video_url: &str) -> Result<Option<Vec<String>>, String> {
    let output = Command::new("yt-dlp")
        .arg("-g")
        .arg(video_url)
        .output()
        .map_err(|e| e.to_string())?;

    let urls= String::from_utf8(output.stdout).map_err(|e| e.to_string())?;

    let mut res = vec![];
    for url in urls.split("\n").into_iter() {
        res.push(url.to_string());
    }
    dbg!(res);
    Ok(None)
}
