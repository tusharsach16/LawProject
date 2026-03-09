import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/stats.html",
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — loaded on every page, keep tiny
          if (id.includes("node_modules/react/")) return "react";
          // React DOM — large, split separately so it's cached aggressively
          if (id.includes("node_modules/react-dom/")) return "react-dom";
          // Router
          if (id.includes("node_modules/react-router") || id.includes("node_modules/react-router-dom"))
            return "router";
          // Recharts — only loaded on ActivityAndStats / Overview pages
          if (id.includes("node_modules/recharts")) return "recharts";
          // All D3 modules — pulled in by recharts, keep in a single cacheable chunk
          if (id.includes("node_modules/d3") || id.includes("node_modules/d3-")) return "d3";
          // decimal.js — used by recharts internally
          if (id.includes("node_modules/decimal.js")) return "d3";
          // GSAP core
          if (id.includes("node_modules/gsap")) return "gsap";
          // Redux ecosystem
          if (
            id.includes("node_modules/redux") ||
            id.includes("node_modules/@reduxjs") ||
            id.includes("node_modules/react-redux") ||
            id.includes("node_modules/redux-persist") ||
            id.includes("node_modules/immer")
          )
            return "redux";
          // Axios
          if (id.includes("node_modules/axios")) return "axios";
        },
      },
    },
  },
});