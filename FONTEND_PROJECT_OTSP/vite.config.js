import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-signalr': ['@microsoft/signalr'],
          'vendor-http': ['axios'],
        },
      },
    },
  },
  server: {
    port: 3000,
    allowedHosts: ['.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:5084',
        changeOrigin: true,
        secure: false,
      },
      '/hubs': {
        target: 'http://localhost:5084',
        ws: true,
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5084',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});