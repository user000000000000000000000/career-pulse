import { supabase, isSupabaseConfigured } from './supabase'

// Семейная связка родитель↔ребёнок. Backend: supabase/migrations/002_family_links.sql
// (таблица family_links + RLS + RPC link_child_by_code).

// 4-значный цифровой код — короткий, легко продиктовать.
const ALPHABET = '0123456789'
const CODE_TTL_MIN = 30

function randomCode(len = 4) {
  const a = new Uint32Array(len)
  ;(crypto || window.crypto).getRandomValues(a)
  return Array.from(a, x => ALPHABET[x % ALPHABET.length]).join('')
}

/** Ребёнок: сгенерировать код привязки, записать себе в профиль. Возвращает код. */
export async function generateLinkCode() {
  if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Нужно войти')
  const code = randomCode()
  const expires = new Date(Date.now() + CODE_TTL_MIN * 60000).toISOString()
  const { error } = await supabase.from('profiles')
    .update({ link_code: code, link_code_expires: expires }).eq('id', user.id)
  if (error) throw new Error(error.message)
  return { code, ttlMin: CODE_TTL_MIN }
}

/** Родитель: обменять код на связь. Возвращает { ok, child_name } | { ok:false, error }. */
export async function redeemLinkCode(code) {
  if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
  const { data, error } = await supabase.rpc('link_child_by_code', { p_code: code })
  if (error) throw new Error(error.message)
  return data
}

/** Мои связи: { parents: [...profiles], children: [...profiles] }. */
export async function listFamily() {
  if (!isSupabaseConfigured) return { parents: [], children: [] }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { parents: [], children: [] }
  const { data: links } = await supabase.from('family_links')
    .select('parent_id, child_id').or(`parent_id.eq.${user.id},child_id.eq.${user.id}`)
  const childIds = (links || []).filter(l => l.parent_id === user.id).map(l => l.child_id)
  const parentIds = (links || []).filter(l => l.child_id === user.id).map(l => l.parent_id)
  const ids = [...new Set([...childIds, ...parentIds])]
  if (!ids.length) return { parents: [], children: [] }
  const { data: profs } = await supabase.from('profiles')
    .select('id, full_name, email, has_passed_test, diagnostic_updated_at').in('id', ids)
  const byId = Object.fromEntries((profs || []).map(p => [p.id, p]))
  return {
    parents: parentIds.map(id => byId[id]).filter(Boolean),
    children: childIds.map(id => byId[id]).filter(Boolean),
  }
}

/** Отвязать (любую сторону). */
export async function unlinkFamily(otherId) {
  if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase.from('family_links').delete()
    .or(`and(parent_id.eq.${user.id},child_id.eq.${otherId}),and(child_id.eq.${user.id},parent_id.eq.${otherId})`)
  if (error) throw new Error(error.message)
}

/** Полный профиль ребёнка (для просмотра результатов родителем). */
export async function getChildProfile(childId) {
  if (!isSupabaseConfigured) return null
  const { data, error } = await supabase.from('profiles').select('*').eq('id', childId).maybeSingle()
  if (error) throw new Error(error.message)
  return data
}
