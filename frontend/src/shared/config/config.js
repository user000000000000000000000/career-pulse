/**
 * Конфигурация приложения.
 * Self-Hosted Supabase на ВМ в Яндекс.Облаке.
 */
export const config = {
  // === ЖЁСТКО ЗАДАННЫЕ ЗНАЧЕНИЯ ДЛЯ SELF-HOSTED SUPABASE ===
  supabaseUrl: 'https://supabase.careerpulse.ru',
  supabaseAnonKey: 'SqE93G9MQHC0Ou9Mt3MRnl3H3K94M/3bhjxlXl8ahAijRfKHvf68dQ==',

  // === VK OAuth ===
  // vkAppId — публичный ID приложения (можно в коде). client_secret и обмен
  // кода живут ТОЛЬКО на сервере (edge-функция vk-auth) — во фронте их нет.
  vkAppId: '54638224',
  vkAuthUrl: 'https://supabase.careerpulse.ru/functions/v1/vk-auth',

  analyzeDiagnosticUrl: import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL || '',
  roadmapUrl: import.meta.env.VITE_ROADMAP_URL || '',
}
