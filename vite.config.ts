import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./shared"),
      "@": path.resolve(__dirname, "./client"),
    },
  },
  server: {
    port: 5173,
  },
  define: {
    "process.env.VITE_PUBLIC_API_URL": JSON.stringify(
      process.env.VITE_PUBLIC_API_URL || "http://localhost:3001"
    ),
  },
});
