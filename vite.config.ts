import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: "all",
  },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "apple-touch-icon.png"],
      manifest: {
        name: "FitTrack",
        short_name: "FitTrack",
        description: "Dein persönlicher Fitness & Kalorien Tracker",
        theme_color: "#16a34a",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
          { src: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/world\.openfoodfacts\.org\/.*/i,
            handler: "NetworkFirst",
            options: { cacheName: "openfoodfacts-cache", expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
        ],
      },
    }),
  ],
});
