import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charger les variables d'environnement selon le mode (development, production)
  const env = loadEnv(mode, process.cwd(), '')
  const isProd = mode === 'production'
  
  return {
    plugins: [react()],
    server: {
      host: true,
      port: parseInt(env.VITE_PORT || '5173'),
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false
        },
        '/ws': {
          target: (env.VITE_API_URL || 'http://localhost:3001').replace('http', 'ws'),
          ws: true,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/ws/, '')
        }
      },
      hmr: isProd ? false : {
        host: env.VITE_HOST || 'localhost',
        port: parseInt(env.VITE_PORT || '5173'),
        protocol: env.VITE_HMR_PROTOCOL || 'ws'
      },
      watch: {
        usePolling: true, // Utile pour certains systèmes de fichiers
        interval: 1000
      }
    }
  }
})
