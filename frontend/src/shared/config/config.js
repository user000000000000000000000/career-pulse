/**
 * Конфигурация приложения.
 * Self-Hosted Supabase на ВМ в Яндекс.Облаке.
 */
export const config = {
  // === ЖЁСТКО ЗАДАННЫЕ ЗНАЧЕНИЯ ДЛЯ SELF-HOSTED SUPABASE ===
  supabaseUrl: 'http://158.160.195.69:8000',
  supabaseAnonKey: 'SqE93G9MQHC0Ou9Mt3MRnl3H3K94M/3bhjxlXl8ahAijRfKHvf68dQ==',

  // === ОСТАЛЬНЫЕ ПЕРЕМЕННЫЕ (если нужны) ===
  vkAppId: import.meta.env.VITE_VK_APP_ID || '',
  vkAuthUrl: import.meta.env.VITE_VK_AUTH_URL || '',
  analyzeDiagnosticUrl: import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL || '',
  roadmapUrl: import.meta.env.VITE_ROADMAP_URL || '',
}