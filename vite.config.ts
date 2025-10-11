import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "sales-manage-crm.onrender.com"
    ],
  },
  plugins: [
    react({
      jsxRuntime: "classic",
    }), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(mode === "production" ? "production" : "development"),
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
}));
