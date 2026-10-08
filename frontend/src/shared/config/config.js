/**
 * Конфигурация приложения.
 * Self-Hosted Supabase на ВМ в Яндекс.Облаке.
 */
export const config = {
  // === ЖЁСТКО ЗАДАННЫЕ ЗНАЧЕНИЯ ДЛЯ SELF-HOSTED SUPABASE ===
  supabaseUrl: 'https://supabase.careerpulse.ru',
  // Публичный anon-ключ (JWT role=anon) — так и задумано, лежит во фронте.
  // ВАЖНО: это НЕ JWT_SECRET и НЕ service_role — их во фронте быть не должно.
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzkxNDIwMzE4LCJleHAiOjIxMDY3ODAzMTh9.BI-lTufrTqmuux5S-z35gOnI7jNp_NYmqrDUeB_yt-c',

  // === VK OAuth ===
  // vkAppId — публичный ID приложения (можно в коде). client_secret и обмен
  // кода живут ТОЛЬКО на сервере (edge-функция vk-auth) — во фронте их нет.
  vkAppId: '54638224',
  vkAuthUrl: 'https://supabase.careerpulse.ru/functions/v1/vk-auth',

  analyzeDiagnosticUrl: import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL || '',
  roadmapUrl: import.meta.env.VITE_ROADMAP_URL || '',
}
