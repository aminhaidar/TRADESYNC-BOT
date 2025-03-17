import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
  },
  // Fix client-side routing
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  base: "/",
});
