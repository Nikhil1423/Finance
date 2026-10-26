import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

const copy404Plugin = () => ({
  name: 'copy-404',
  closeBundle() {
    try {
      if (fs.existsSync('dist/index.html')) {
        fs.copyFileSync('dist/index.html', 'dist/404.html');
      }
    } catch {}
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), copy404Plugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api/portfolios': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/api/rules': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/api/macro': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/api/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/api/screener': {
        target: 'https://www.screener.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/screener/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      },
      '/api/yahoo': {
        target: 'https://query1.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yahoo/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    }
  }
})
