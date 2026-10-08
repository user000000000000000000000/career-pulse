import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// GitHub Pages не умеет SPA-fallback (в отличие от .htaccess на reg.ru): прямой заход
// на /t/<...>, /r/<...>, /login и т.п. даёт 404. Копируем index.html → 404.html —
// Pages отдаёт его на любой несуществующий путь, а BrowserRouter разруливает маршрут.
function spaFallback() {
  let outDir = 'dist'
  return {
    name: 'spa-404-fallback',
    configResolved(c) { outDir = c.build.outDir },
    closeBundle() {
      const idx = path.resolve(outDir, 'index.html')
      if (fs.existsSync(idx)) fs.copyFileSync(idx, path.resolve(outDir, '404.html'))
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // base переключается переменной VITE_BASE:
  //   GitHub Pages (по умолчанию) → '/career-pulse/'
  //   свой домен careerpulse.ru   → собирать с VITE_BASE=/
  const base = process.env.VITE_BASE || env.VITE_BASE || '/career-pulse/'
  return {
    plugins: [react(), spaFallback()],
    base,
    server: { port: 5173, open: true },
    build: {
      outDir: 'dist',
      // Вендор в отдельных чанках: React/Router и Supabase меняются редко, поэтому
      // между релизами их хэш стабилен → браузер берёт их из кэша, качает только наш код.
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
          },
        },
      },
    }
  }
})
