import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";
import ChannelPlayer from "./components/ChannelPlayer";
import MediaPlayer from "./components/MediaPlayer";

function App() {
  const [play, setPlay] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState("");


  async function songInfo() {
    // await invoke("get_song_url", {url: url});
    const url = "dQw4w9WgXcQ";
    try {
      const report = await invoke<string>("get_song_info", { videoUrl: url });
      console.log('report', report)
      // const thumbnail = await invoke("get_track_thumbnail", { videoUrl: url});
      // console.log('thumbnail', thumbnail)
      const searchResults = await invoke<string>("search_result", { query: "never gonna give you up"});
      console.log('searchResults', searchResults)
    } catch(err) {
      console.log('err', err)
    }
  }

  

  async function PlaySong() {
    // const filePath = await invoke<string>("fetch_song");
    // console.log(filePath)
    if (!audio) {
      const filePath = await invoke<string>("fetch_song", {url: url})
      setAudio(new Audio(`data:audio/mpeg;base64,${filePath}`));
    }
    setPlay(!play);

    if (play) audio?.pause();
    else  audio?.play();
    
   
 }

  return (
    <main className="container">
      <h1>Spider Tube</h1>
      <input type="text" placeholder="Search"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
     <div>
        <button onClick={PlaySong}>
          Play Audio
        </button>

      </div>

      <div>
        <button onClick={songInfo}>Click here please</button>
      </div>

      <ChannelPlayer></ChannelPlayer>

      <div>
        <MediaPlayer></MediaPlayer>
      </div>

    </main>
  );
}

export default App;
