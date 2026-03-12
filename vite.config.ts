import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    // 프로덕션 빌드에서 sourcemap 비활성화 (시스템 내부 소스코드 노출 방지)
    sourcemap: mode !== 'production',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-xlsx': ['xlsx'],
          'vendor-editor': ['tinymce', '@tinymce/tinymce-react'],
        },
      },
    },
  },
}));
