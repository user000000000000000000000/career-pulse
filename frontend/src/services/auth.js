import { supabase, isSupabaseConfigured } from './supabase'

const LS_KEY = 'cp_user'

/* ─────────────────────────────────────────────
   Локальная (демо) сессия — используется, пока
   Supabase не сконфигурирован. Повторяет поведение
   исходных HTML-страниц (localStorage 'cp_user').
   ───────────────────────────────────────────── */
function lsGet() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) } catch { return null }
}
function lsSet(u) { localStorage.setItem(LS_KEY, JSON.stringify(u)) }
function lsClear() {
  localStorage.removeItem(LS_KEY)
  localStorage.removeItem('cp_tour_seen')
}

/**
 * Регистрация. { name, email, password, role }
 * Возвращает { user } или бросает Error с .message на русском.
 */
export async function register({ name, email, password, role }) {
  if (!isSupabaseConfigured) {
    const user = { name, email, role, testDone: false }
    lsSet(user)
    return { user }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role } }
  })
  if (error) throw new Error(translateAuthError(error.message))

  // Профиль (таблица public.profiles). Может создаваться и триггером в БД —
  // upsert безопасен в обоих случаях.
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: name,
      role,
      has_passed_test: false
    })
  }
  return { user: data.user }
}

/** Вход. { email, password } */
export async function login({ email, password }) {
  if (!isSupabaseConfigured) {
    const u = lsGet()
    if (!u || u.email !== email) {
      // В демо-режиме пароль не проверяется — создаём/обновляем сессию.
      const user = { name: email.split('@')[0], email, role: 'specialist', testDone: false }
      lsSet(user)
      return { user }
    }
    return { user: u }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(translateAuthError(error.message))
  return { user: data.user }
}

/** Выход. */
export async function logout() {
  if (isSupabaseConfigured) await supabase.auth.signOut()
  lsClear()
}

/**
 * Текущий пользователь в нормализованном виде:
 * { id, name, email, role, testDone } | null
 */
export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    const u = lsGet()
    return u ? { id: 'demo', ...u } : null
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, has_passed_test, email, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    name: profile?.full_name || user.user_metadata?.full_name || 'Пользователь',
    email: profile?.email || user.email,
    role: profile?.role || user.user_metadata?.role || 'specialist',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || '',
    testDone: Boolean(profile?.has_passed_test)
  }
}

/** Отметить тест как пройденный. */
export async function markTestDone() {
  if (!isSupabaseConfigured) {
    const u = lsGet(); if (u) { u.testDone = true; lsSet(u) }
    return
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').update({ has_passed_test: true }).eq('id', user.id)
  }
}

function translateAuthError(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('already registered')) return 'Этот email уже зарегистрирован'
  if (m.includes('invalid login')) return 'Неверный email или пароль'
  if (m.includes('password')) return 'Пароль не соответствует требованиям (минимум 8 символов)'
  if (m.includes('email')) return 'Введите корректный email'
  return msg || 'Ошибка авторизации'
}
