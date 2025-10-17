import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { type Song, ConvertToSong } from "./models/song";
import "./App.css";

function App() {
  const [searchTerm, SetSearchTerm] = useState("");
  const [searchResult, SetSearchResult] = useState("");
  
  const [song, SetSong] = useState<Song>();
  
  async function Search() {
    const res = await invoke<string>("search", { searchTerm: searchTerm});
    console.log(res)
    SetSearchResult(res);
  }

  async function getTempSong() {
    const result = await invoke<Song>("get_template_song");
    SetSong(
      ConvertToSong(result)
    );
    console.log(song);
    console.log(result);
  }

  return (
    <main className="container">
      <h1>Spider Tube</h1>
      
      <div>
        <input
          type="text"
          placeholder="Enter search term"
          value={searchTerm}
          onChange={(e) => SetSearchTerm(e.target.value)}
        />
        <button onClick={Search}>Search</button>
        <p>{searchResult ? searchResult: "No match found."}</p>
      </div>

      <div>
         <button onClick={getTempSong}>Get Template Song</button>
         {song && 
          <div>
            <h2>Song Details:</h2>
            <p><strong>Title:</strong> {song.Title}</p>
            <p><strong>Duration:</strong> {String(song.Duration)}</p>
            <p><strong>Liked:</strong> {song.Liked ? "Yes" : "No"}</p>
            <p><strong>Play Count:</strong> {String(song.PlayCount)}</p>
          </div>
         }
      </div>

    </main>
  );
}

export default App;
