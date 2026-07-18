import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Fast JS and CSS minification
    minify: 'esbuild',
    // Disable sourcemaps in production
    sourcemap: false,
    // Don't report compressed sizes (faster build)
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core framework
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI library
          ui: ['react-icons', 'react-helmet-async'],
        },
        // Better caching with content hashes
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // Split CSS into separate files per chunk
    cssCodeSplit: true,
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
