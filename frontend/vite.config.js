import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // base переключается переменной VITE_BASE:
  //   GitHub Pages (по умолчанию) → '/career-pulse/'
  //   свой домен careerpulse.ru   → собирать с VITE_BASE=/
  const base = process.env.VITE_BASE || env.VITE_BASE || '/career-pulse/'
  return {
    plugins: [react()],
    base,
    server: { port: 5173, open: true },
    build: { outDir: 'dist' }
  }
})
