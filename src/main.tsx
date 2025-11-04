import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import SearchPage from "./components/UI/SearchPage";
import ProfilePage from "./profile";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/genre/:id" element={React.createElement(React.lazy(() => import("./genre")))} />
        <Route path="/tracks/:id" element={React.createElement(React.lazy(() => import("./tracks")))} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
