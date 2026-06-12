import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Признак того, что Supabase сконфигурирован.
 * Пока не заданы переменные окружения, приложение работает
 * в демо-режиме (localStorage), чтобы его можно было запустить
 * сразу после `npm install && npm run dev`.
 */
export const isSupabaseConfigured = Boolean(
  url && anonKey && !url.includes('ваш-проект')
)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null

if (!isSupabaseConfigured) {
  // Подсказка разработчику в консоли — не ошибка.
  console.info(
    '[CareerPulse] Supabase не настроен — работает демо-режим на localStorage. ' +
    'Заполните .env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY), чтобы включить БД и Auth.'
  )
}
