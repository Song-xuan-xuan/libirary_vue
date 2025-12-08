import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // 开发服务器配置
  server: {
    port: 5173,
    // API 代理配置：将 /api 请求代理到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
         // 后端服务器地址
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // 如果后端没有 /api 前缀，取消注释此行
      }
    }
  }
})
