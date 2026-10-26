import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true },
  build: { target: 'es2022', chunkSizeWarningLimit: 2000, outDir: '../../dist/app', emptyOutDir: true },
  define: { global: 'globalThis' },
});
