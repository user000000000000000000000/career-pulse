import { supabase, isSupabaseConfigured } from './supabase'

// Админ-панель. Backend: supabase/migrations/003_admin.sql + 004_admin_stats.sql
// (admins + is_admin() + RLS profiles_select_admin + public_user_count() + admin_dashboard_stats()).

/** Текущий пользователь — админ? */
export async function checkIsAdmin() {
  if (!isSupabaseConfigured) return false
  const { data, error } = await supabase.rpc('is_admin')
  if (error) return false
  return !!data
}

/** Полная сводка одним запросом: total, passed, new7, with_report, links, by_role. */
export async function adminDashboardStats() {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.rpc('admin_dashboard_stats')
  if (error || !data) return { total: 0, passed: 0, new7: 0, with_report: 0, links: 0, by_role: {} }
  return data
}

/** Список пользователей: пагинация, поиск, фильтр по роли + город/прогресс/ИИ из diagnostic_data. */
export async function adminListUsers({ search = '', role = '', limit = 40, offset = 0 } = {}) {
  if (!isSupabaseConfigured) return { users: [], total: 0 }
  let q = supabase.from('profiles')
    .select(
      'id, full_name, email, phone, role, has_passed_test, created_at, diagnostic_updated_at,' +
      'pct:diagnostic_data->progress->>pct,' +
      'city:diagnostic_data->profile->context->>city,' +
      'ai_src:diagnostic_data->profile->ai_report->>_source',
      { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (role) q = q.eq('role', role)
  if (search.trim()) {
    const s = search.trim().replace(/[%,()]/g, '')
    q = q.or(`full_name.ilike.%${s}%,email.ilike.%${s}%,phone.ilike.%${s}%`)
  }
  const { data, count, error } = await q
  if (error) throw new Error(error.message)
  return { users: data || [], total: count || 0 }
}

/** Публичный счётчик пользователей (для лендинга). */
export async function publicUserCount() {
  if (!isSupabaseConfigured) return 0
  const { data, error } = await supabase.rpc('public_user_count')
  if (error) return 0
  return data || 0
}
