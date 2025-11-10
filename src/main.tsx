import React from "react";
import ReactDOM from "react-dom/client";
// Ensure the dark theme variables are available at the root so body/background pick them up
document.documentElement.classList.add("dark");
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SearchPage from "./components/Search/SearchPage";
import ProfilePage from "./profile";
import SideBar from "./components/overlay/SideBar";
import Player from "./components/overlay/player";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="flex h-screen bg-background text-foreground dark">
        <SideBar />
        <main className="flex-1  overflow-y-auto scrollbar-hide relative pb-16 [&::-webkit-scrollbar]:hidden">
          <div className="min-h-full rounded-lg">
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/genre/:id" element={React.createElement(React.lazy(() => import("./genre")))} />
              <Route path="/tracks/:id" element={React.createElement(React.lazy(() => import("./tracks")))} />
            </Routes>
          </div>
  </main>
  <Player />
      </div>
    </BrowserRouter>
  </React.StrictMode>,
);
