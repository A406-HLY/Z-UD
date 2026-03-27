import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          // 폴더 경로 자체만 지정하면 플러그인이 내부 파일들을 자동 인식합니다.
          src: normalizePath(path.resolve(__dirname, 'node_modules/pdfjs-dist/cmaps')),
          dest: 'cmaps',
          // 가장 중요한 부분: 상위 폴더 구조를 전부 날려버리고 파일만 복사합니다.
          rename: { stripBase: true } 
        },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://j14a406.p.ssafy.io',
        changeOrigin: true,
        secure: false, // SSL 인증서 문제 우회용 
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('pdfjs-dist')) {
              return 'vendor-pdfjs';
            }
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});