import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SearchPage from "./components/Search/SearchPage";
import ProfilePage from "./profile";
import SideBar from "./components/overlay/SideBar";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="flex h-screen bg-[#e8e9f2] text-white">
        <SideBar />
        <main className="flex-1 overflow-y-auto scrollbar-hide relative pb-16 [&::-webkit-scrollbar]:hidden">
          <div className="min-h-full">
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/genre/:id" element={React.createElement(React.lazy(() => import("./genre")))} />
              <Route path="/tracks/:id" element={React.createElement(React.lazy(() => import("./tracks")))} />
            </Routes>
          </div>
        </main>
        <div className="w-full fixed bottom-0 left-0 right-0 bg-neutral-800 text-white py-2">
          <div className="mx-auto max-w-7xl px-4">Player placeholder (to be implemented)</div>
        </div>
      </div>
    </BrowserRouter>
  </React.StrictMode>,
);
