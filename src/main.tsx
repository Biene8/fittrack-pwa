import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerSW } from "virtual:pwa-register";

// Register service worker with auto-update
// skipWaiting + clientsClaim in workbox config ensures immediate activation
registerSW({
  onNeedRefresh() {
    // New content available – reload to get latest version
    window.location.reload();
  },
  onOfflineReady() {
    // App is ready for offline use
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
