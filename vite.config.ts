import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/console',
  server: {
    proxy: {
      // 后端接口代理，解决 dev 环境跨域问题（axios 开启了 withCredentials）
      '/admin': {
        target: 'http://localhost:8098',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:8098',
        changeOrigin: true
      },
      '/upload': {
        target: 'http://localhost:8098',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:8098',
        changeOrigin: true
      }
    }
  }
});
