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
        // (Why) SSE(Server-Sent Events) 스트리밍을 위해 프록시의 응답 버퍼링을 해제합니다.
        // 기본 http-proxy는 응답을 버퍼링하여 SSE 이벤트가 즉시 전달되지 않고 연결이 끊기는 문제가 발생합니다.
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes, req, res) => {
            if (proxyRes.headers['content-type']?.includes('text/event-stream')) {
              // SSE 응답에 대해 버퍼링을 비활성화합니다.
              res.setHeader('X-Accel-Buffering', 'no');
              res.setHeader('Cache-Control', 'no-cache, no-transform');
              res.setHeader('Connection', 'keep-alive');
            }
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // (Why) pdfjs-dist는 용량이 매우 크므로 별도 청크로 분리하여 초기 로딩 속도를 최적화합니다.
            if (id.includes('pdfjs-dist')) {
              return 'vendor-pdfjs';
            }
            // (Why) 일반 라이브러리들과 React 관련 라이브러리 간의 상호 참조로 인한 
            // 'Circular chunk' 경고를 방지하기 위해 하나의 vendor 청크로 통합합니다.
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});