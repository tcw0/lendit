import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `${process.env.VITE_PROXY_API_URL || 'http://localhost:8080'}`,
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@api': path.resolve(__dirname, 'src/../../api/generated'),
      src: path.resolve(__dirname, 'src'),
    },
  },
})
