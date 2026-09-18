import { supabase, isSupabaseConfigured } from './supabase'

// Обратная связь. Backend: supabase/migrations/006_feedback.sql (таблица feedback + RLS).

/** Отправить отзыв/сообщение о проблеме. */
export async function submitFeedback({ category = 'other', message, email = '' }) {
  if (!message || !message.trim()) throw new Error('Опишите проблему')
  if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
  let user = null
  try { ({ data: { user } } = await supabase.auth.getUser()) } catch { /* аноним */ }
  const { error } = await supabase.from('feedback').insert({
    user_id: user?.id || null,
    email: (email || user?.email || '').trim() || null,
    category,
    message: message.trim().slice(0, 4000),
    page_url: location.href.slice(0, 500),
    user_agent: (navigator.userAgent || '').slice(0, 300),
  })
  if (error) throw new Error(error.message)
}

/** Админ: список отзывов. */
export async function adminListFeedback({ limit = 100, offset = 0 } = {}) {
  if (!isSupabaseConfigured) return { items: [], total: 0 }
  const { data, count, error } = await supabase.from('feedback')
    .select('id, user_id, email, category, message, page_url, status, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  if (error) throw new Error(error.message)
  return { items: data || [], total: count || 0 }
}

/** Админ: сменить статус отзыва (new/read/done). */
export async function adminSetFeedbackStatus(id, status) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.from('feedback').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}
