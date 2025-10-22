
use rustypipe::client::{RustyPipe};

#[tauri::command]
pub async fn final_trick(url: &str) -> Result<rustypipe::model::TrackDetails, String> {
    let rp = RustyPipe::builder()
                        .botguard_bin("/home/raghavendra/.cargo/bin/rustypipe-botguard")
                        .build()
                        .unwrap();
                      
    let metadata = rp.query()
                     .music_details(url)
                     .await
                     .map_err(|e| e.to_string())?;

    Ok(metadata)
}

#[tauri::command]
pub async fn test_url_access(video_id: String) -> Result<String, String> {
    use rustypipe::client::RustyPipe;
    use rustypipe::param::StreamFilter;
    use reqwest::header::{HeaderMap, HeaderValue};
    
    eprintln!("=== Testing URL Access ===");
    
    let rp = RustyPipe::builder()
                        .botguard_bin("/home/raghavendra/.cargo/bin/rustypipe-botguard")
                        .build()
                        .unwrap();
    // Get player
    let player = rp.query()
        .player(&video_id)
        .await
        .map_err(|e| format!("Player error: {}", e))?;
    
    let stream_filter = StreamFilter::default();
    let (_video, audio) = player.select_video_audio_stream(&stream_filter);
    
    let audio_stream = audio.ok_or("No audio stream")?;
    let url = &audio_stream.url;
    
    eprintln!("Testing URL accessibility...");
    
    // Build client with headers
    let mut headers: HeaderMap = HeaderMap::new();
    headers.insert(
        "User-Agent",
        HeaderValue::from_static(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        )
    );
    
    let client = reqwest::Client::builder()
        .default_headers(headers)
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("Client error: {}", e))?;
    
    // Try HEAD request
    eprintln!("Sending HEAD request...");
    let response = client.head(url)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;
    
    let status = response.status();
    eprintln!("Response status: {}", status);
    
    let mut report = format!("HTTP Status: {}\n\n", status);
    report.push_str("Response Headers:\n");
    
    for (key, value) in response.headers() {
        let line = format!("{}: {:?}\n", key, value);
        report.push_str(&line);
        eprintln!("{}", line.trim());
    }
    
    if status.is_success() {
        report.push_str("\n✅ URL is accessible!");
        Ok(report)
    } else {
        report.push_str("\n❌ URL returned error status");
        Err(report)
    }
}