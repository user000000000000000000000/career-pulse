import { supabase, isSupabaseConfigured } from './supabase'
import { config } from '../config'

// Обратная связь. Backend: migration 006_feedback.sql (таблица) + edge-функция
// feedback (сохраняет + шлёт письмо владельцу). Если функция недоступна —
// падаем в прямой insert, чтобы отзыв не потерялся (без письма).

/** Отправить отзыв/сообщение о проблеме. */
export async function submitFeedback({ category = 'other', message, email = '' }) {
  if (!message || !message.trim()) throw new Error('Опишите проблему')
  if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
  let user = null
  try { ({ data: { user } } = await supabase.auth.getUser()) } catch { /* аноним */ }
  const payload = {
    user_id: user?.id || null,
    category,
    message: message.trim().slice(0, 4000),
    email: (email || user?.email || '').trim() || null,
    page_url: location.href.slice(0, 500),
    user_agent: (navigator.userAgent || '').slice(0, 300),
  }
  // 1) через edge-функцию (сохранит + отправит письмо)
  try {
    const res = await fetch(`${config.supabaseUrl}/functions/v1/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: config.supabaseAnonKey, Authorization: `Bearer ${config.supabaseAnonKey}` },
      body: JSON.stringify(payload),
    })
    if (res.ok) return
  } catch { /* функция недоступна — прямой insert ниже */ }
  // 2) запасной путь — прямой insert (письма не будет, но отзыв сохранится)
  const { error } = await supabase.from('feedback').insert(payload)
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
