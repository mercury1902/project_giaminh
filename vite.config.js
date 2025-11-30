import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        // Proxy to Vercel dev server (run: vercel dev --listen 3001)
        // For production, Vercel handles routing automatically
        target: process.env.VITE_API_URL || 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})



