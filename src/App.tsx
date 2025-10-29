import "./App.css";
import ChannelPlayer from "./components/ChannelPlayer";
import LocalPlayer from "./components/LocalPlayer";
import MediaPlayer from "./components/MediaPlayer";

function App() {


  return (
    <div>
      <LocalPlayer />
      <ChannelPlayer />
      <MediaPlayer />
    </div>
  )
}

export default App;
