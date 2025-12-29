
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuração otimizada para React 19 no Vite
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  }
});
