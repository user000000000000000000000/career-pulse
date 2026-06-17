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
    options: {
      data: { full_name: name, role },
      // Куда вернуть пользователя после клика по ссылке в письме.
      // Должен совпадать с одним из Redirect URLs в настройках Supabase Auth.
      emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
    }
  })
  if (error) throw new Error(translateAuthError(error.message))

  // ВАЖНО: при включённом подтверждении почты у signUp ещё НЕТ сессии,
  // поэтому запись в profiles здесь упёрлась бы в RLS (403). Профиль
  // создаётся лениво в getCurrentUser() — уже после входа, когда есть JWT.
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

  let { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, has_passed_test, email, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  // Профиля ещё нет (например, первый вход после подтверждения почты) —
  // создаём его здесь, уже с действующей сессией пользователя (без 403).
  if (!profile) {
    const seed = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || '',
      role: user.user_metadata?.role || 'specialist',
      has_passed_test: false,
    }
    const { data: created } = await supabase
      .from('profiles')
      .upsert(seed)
      .select('full_name, role, has_passed_test, email, phone, avatar_url')
      .maybeSingle()
    profile = created || seed
  }

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
