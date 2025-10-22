import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";
import ChannelPlayer from "./components/ChannelPlayer";
import MediaPlayer from "./components/MediaPlayer";

function App() {
  const [play, setPlay] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState<string | null>(null);
  const [result, setResult] = useState<Array<string> | null>(null);


  async function songInfo() {
    // await invoke("get_song_url", {url: url});
    const url = "dQw4w9WgXcQ";
    try {
      const report = await invoke<string>("get_song_info", { videoUrl: url });
      console.log('report', report)
      // const thumbnail = await invoke("get_track_thumbnail", { videoUrl: url});
      // console.log('thumbnail', thumbnail)
    } catch(err) {
      console.log('err', err)
    }
  }

  async function searchSongs() {
    if (search == null) {
      return
    }
    try {
      const res = await invoke<Array<string>>("search_result", {trackName: search});
      setResult(res);
    } catch (err) {
      console.log('err:', err)
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
        value={search? search : ""}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={searchSongs}> Search Song </button>


      {result && 
        result.map((res) => {
          return (
            <li>{res}</li>
          )
        })
      }

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
