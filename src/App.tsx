import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";
import { type Song, createSong } from "./models/song";
import ChannelPlayer from "./components/ChannelPlayer";
import MediaPlayer from "./components/MediaPlayer";

function App() {

  let [search, setSearch] = useState<string>();
  let [searchResult, setSearchResult] = useState<Song[]>();

  const handleSearch = async function() {
    if (search == null) {
      return;
    }
    try {
      const res = await invoke<Array<Song>>("search_result", { trackName: search});
      console.log('res', res);
      const songs = res.map((item: Song) => createSong(item.id, item.name, item.thumbnail));
      setSearchResult(songs);
    } catch(err) {
      console.log('err', err)
    }
  } 

  return (
    <div>
      <input type="text"
      value={search}
      onChange={(e) => {setSearch(e.target.value)}}
       />
       <button onClick={handleSearch}>Search</button>
       {searchResult && (
        <ul>
          {searchResult.map((song, index) => (
            <div key={index}>
            <li>{song.name}</li>
            <li>
              <img
                src={song.thumbnail ? song.thumbnail[0].url : 'https://via.placeholder.com/150'}
                alt={song.name}
                width={song.thumbnail ? song.thumbnail[0].width : 150}
                height={song.thumbnail ? song.thumbnail[0].height : 150}
              />
            </li>
            </div>
          ))}
        </ul>
       )}
          <ChannelPlayer />
          <MediaPlayer />
          
    </div>
  )
}

export default App;
