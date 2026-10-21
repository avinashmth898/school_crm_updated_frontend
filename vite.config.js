import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      // Forward /api/* calls made by the frontend (apiClient's baseURL is
      // just "/api") to the Spring Boot backend, which runs on 8080.
      // Without this, "/api/students" would resolve against Vite's own
      // dev server and 404 — which is what's causing the student list
      // (and everything else) to fail to load.
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
