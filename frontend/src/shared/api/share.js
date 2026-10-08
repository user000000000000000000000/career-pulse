import { supabase, isSupabaseConfigured } from './supabase'

// Публичный шаринг результатов. Backend: migration 007_share_results.sql
// (share_token + RPC enable/disable_result_sharing + public_shared_results).

/** Включить шаринг и получить токен для ссылки (генерит, если ещё нет). */
export async function enableResultSharing() {
  if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
  const { data, error } = await supabase.rpc('enable_result_sharing')
  if (error) throw new Error(error.message)
  return data // uuid
}

/** Отозвать ссылку шаринга. */
export async function disableResultSharing() {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.rpc('disable_result_sharing')
  if (error) throw new Error(error.message)
}

/** Прочитать расшаренные результаты по токену (без логина). → { full_name, diagnostic_data } | null */
export async function getSharedResults(token) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.rpc('public_shared_results', { p_token: token })
  if (error) throw new Error(error.message)
  return Array.isArray(data) ? (data[0] || null) : (data || null)
}
