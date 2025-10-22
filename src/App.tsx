import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { useState } from "react";

function App() {

  let [search, setSearch] = useState<string>();
  let [searchResult, setSearchResult] = useState<string[]>();

  const handleSearch = async function() {
    if (search == null) {
      return;
    }
    try {
      const res = await invoke<Array<string>>("search_result", { trackName: search});
      setSearchResult(res);

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
          {searchResult.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
       )}
    </div>
  )
}

export default App;
