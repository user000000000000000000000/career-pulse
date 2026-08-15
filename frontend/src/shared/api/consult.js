import { supabase, isSupabaseConfigured } from './supabase'
import { STORAGE_KEYS } from '../lib/storageKeys'

/**
 * Отправка заявки на консультацию.
 * { name, contact, message } → таблица public.consultation_requests.
 * В демо-режиме (без Supabase) сохраняем локально.
 */
export async function submitConsultRequest({ name, contact, message }) {
  if (!isSupabaseConfigured) {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.consultRequests) || '[]')
    list.push({ name, contact, message, created_at: new Date().toISOString() })
    localStorage.setItem(STORAGE_KEYS.consultRequests, JSON.stringify(list))
    return
  }
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('consultation_requests').insert({
    user_id: user?.id || null,
    name,
    contact,
    message: message || null,
  })
  if (error) throw new Error(error.message)
}
