import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

const isAIStudio = process.env.AI_STUDIO === 'true';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: isAIStudio
    ? {
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      }
    : {
        hmr: true,
      },

  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV !== 'production',
  },

  base: '/',
});

