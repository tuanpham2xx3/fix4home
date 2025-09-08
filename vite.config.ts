import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  // Lấy tên repository từ environment variable hoặc sử dụng tên mặc định
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'fix4home_ver0.1';
  const base = isProduction ? `/${repoName}/` : '/';

  return {
    base,
    server: {
      host: "::",
      port: 8100,
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
          }
        }
      }
    },
    plugins: [react(), expressPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./client"),
        "@shared": path.resolve(__dirname, "./shared"),
      },
    },
  };
});

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
