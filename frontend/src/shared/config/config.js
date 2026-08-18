/**
 * Конфигурация приложения.
 * Self-Hosted Supabase на ВМ в Яндекс.Облаке.
 */
export const config = {
  // === ЖЁСТКО ЗАДАННЫЕ ЗНАЧЕНИЯ ДЛЯ SELF-HOSTED SUPABASE ===
  supabaseUrl: 'https://supabase.careerpulse.ru',
  supabaseAnonKey: 'SqE93G9MQHC0Ou9Mt3MRnl3H3K94M/3bhjxlXl8ahAijRfKHvf68dQ==',

  // === ОСТАЛЬНЫЕ ПЕРЕМЕННЫЕ (если нужны) ===
  vkAppId: import.meta.env.VITE_VK_APP_ID || '',
  vkAuthUrl: 'https://careerpulse.ru/login',
  analyzeDiagnosticUrl: import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL || '',
  roadmapUrl: import.meta.env.VITE_ROADMAP_URL || '',
}
