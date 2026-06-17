import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["icon.svg", "apple-touch-icon.png"],
    manifest: {
      name: "Mis Turnos",
      short_name: "Mis Turnos",
      description: "Organiza la programación semanal del conductor y genera la hoja para imprimir.",
      lang: "es",
      theme_color: "#1c4f8a",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/",
      icons: [
        { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
  }), cloudflare()],
});