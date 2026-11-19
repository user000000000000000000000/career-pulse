/**
 * Конфигурация приложения.
 * Self-Hosted Supabase на ВМ в Яндекс.Облаке.
 */
const demoMode = import.meta.env.MODE === 'demo'

export const config = {
  demoMode,
  // === ЖЁСТКО ЗАДАННЫЕ ЗНАЧЕНИЯ ДЛЯ SELF-HOSTED SUPABASE ===
  supabaseUrl: demoMode ? '' : 'https://supabase.careerpulse.ru',
  // Публичный anon-ключ (JWT role=anon) — так и задумано, лежит во фронте.
  // ВАЖНО: это НЕ JWT_SECRET и НЕ service_role — их во фронте быть не должно.
  supabaseAnonKey: demoMode ? '' : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzkxNDIwMzE4LCJleHAiOjIxMDY3ODAzMTh9.BI-lTufrTqmuux5S-z35gOnI7jNp_NYmqrDUeB_yt-c',

  // === VK OAuth ===
  // vkAppId — публичный ID приложения (можно в коде). client_secret и обмен
  // кода живут ТОЛЬКО на сервере (edge-функция vk-auth) — во фронте их нет.
  vkAppId: demoMode ? '' : '54638224',
  vkAuthUrl: demoMode ? '' : 'https://supabase.careerpulse.ru/functions/v1/vk-auth',

  analyzeDiagnosticUrl: demoMode ? '' : (import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL || ''),
  roadmapUrl: demoMode ? '' : (import.meta.env.VITE_ROADMAP_URL || ''),
}
