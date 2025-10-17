import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

function App() {
  const [sum, SetSum] = useState(0);
  const [searchTerm, SetSearchTerm] = useState("");
  const [searchResult, SetSearchResult] = useState("");
  
  async function Search() {
    const res = await invoke<string>("search", { searchTerm: searchTerm});
    console.log(res)
    SetSearchResult(res);
  }

  async function addNumbers() {
    const result = await invoke<number>("add", { a: 12, b: 7 });
    SetSum(result);
  }

  return (
    <main className="container">
      <h1>Spider Tube</h1>
      <div className="row">
        <button onClick={addNumbers}>Click to calculate</button>
        <p>{sum}</p>
        </div>
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

    </main>
  );
}

export default App;
