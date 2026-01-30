import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API calls to avoid CORS issues
      '/api/map/search': {
        target: 'https://api.ninja-map.dollopinfotech.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Proxy error handling
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Request logging can be added here if needed
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Response logging can be added here if needed
          });
        },
      },
      '/api/map/reverse-geocoding': {
        target: 'https://api.ninja-map.dollopinfotech.com',
        changeOrigin: true,
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Reverse geocoding proxy error handling
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Request logging can be added here if needed
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Response logging can be added here if needed
          });
        },
      }
    }
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const app = createServer();

      // Add Express app as middleware to Vite dev server
      server.middlewares.use(app);
    },
  };
}
