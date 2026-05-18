import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { isAuthenticated, logout } from "./services/authService.js";

if (!isAuthenticated()) {
  logout();
  console.log(
    "🔄 Token je istekao ili ne postoji - korisnik je automatski odjavljen"
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
