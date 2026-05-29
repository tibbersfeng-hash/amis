/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'monaco-editor': path.resolve(__dirname, 'src/__mocks__/monaco-editor.js'),
    },
  },
  css: {
    lightningcss: {
      errorRecovery: true,
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/test.ts', 'src/**/test.tsx'],
    server: {
      deps: {
        inline: ['amis', 'amis-core', 'amis-ui'],
      },
    },
  },
});
