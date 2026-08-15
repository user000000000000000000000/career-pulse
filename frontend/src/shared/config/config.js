/**
 * Единая точка чтения переменных окружения (VITE_*). Раньше каждый сервис
 * читал import.meta.env.VITE_* напрямую в 7 разных местах — опечатку в
 * имени переменной было видно только в рантайме на конкретной странице.
 *
 * import.meta.env.BASE_URL и import.meta.env.DEV сюда не включены — это
 * встроенные переменные Vite, а не секреты/конфигурация приложения.
 */
export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  vkAppId: import.meta.env.VITE_VK_APP_ID,
  vkAuthUrl: import.meta.env.VITE_VK_AUTH_URL,
  analyzeDiagnosticUrl: import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL,
  roadmapUrl: import.meta.env.VITE_ROADMAP_URL,
}
