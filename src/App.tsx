import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";
import ChannelPlayer from "./components/ChannelPlayer";

function App() {
  const [play, setPlay] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState("");

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

      <ChannelPlayer></ChannelPlayer>

    </main>
  );
}

export default App;
