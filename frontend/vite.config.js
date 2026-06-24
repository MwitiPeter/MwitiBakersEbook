import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-icons', 'react-helmet-async'],
        },
      },
    },
    // Enable minification (default is esbuild - fast and effective)
    minify: 'esbuild',
    // Generate source maps only in dev
    sourcemap: false,
    // Chunk size warning at default 500KB
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
