import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api/v1/auth': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/users': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/security': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/v1/incidents': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/v1/resources': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/v1/dispatch': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/v1/audit': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
})
