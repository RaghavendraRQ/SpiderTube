import { useEffect } from "react";
import "./App.css";
import LocalPlayer from "./components/LocalPlayer";
import { Menu } from "@tauri-apps/api/menu";
import { navigateTo, setNavigateFunction } from "./navigate";
import { useNavigate } from "react-router-dom";

function App() {

  const navigator = useNavigate();

  useEffect(() => {
    setNavigateFunction(navigator);
    async function setupMenu() {
      const menu = await Menu.new({
        items: [
          {
            id: 'home',
            text: 'home',
            action: () => navigateTo('/')
          },
          {
            id: 'search',
            text: 'search',
            action: () => navigateTo('/search')
          },
          {
            id: 'profile',
            text: 'profile',
            action: () => navigateTo('/profile')
          }
        ]
      });

      await menu.setAsAppMenu();
    }
    setupMenu();
  }, [])


  return (
    <div>
      <LocalPlayer />
    </div>
  )
}

export default App;
