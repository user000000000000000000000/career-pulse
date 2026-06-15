import { supabase, isSupabaseConfigured } from './supabase'
import CP from './cpStorage'

// ── PKCE-хелперы ──
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function sha256(str) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
}
function rand(n = 64) {
  const a = new Uint8Array(n)
  crypto.getRandomValues(a)
  return Array.from(a, b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('').slice(0, n)
}

/** Redirect URI должен ТОЧНО совпадать с указанным в настройках VK-приложения. */
export function vkRedirectUri() {
  return window.location.origin + import.meta.env.BASE_URL
}

/** Старт входа через VK ID (OAuth 2.1, PKCE). */
export async function startVkLogin() {
  const appId = import.meta.env.VITE_VK_APP_ID
  if (!appId) { alert('Вход через ВКонтакте не настроен: добавь VITE_VK_APP_ID в .env'); return }
  const verifier = rand(64)
  const challenge = b64url(await sha256(verifier))
  const state = rand(24)
  sessionStorage.setItem('vk_verifier', verifier)
  sessionStorage.setItem('vk_state', state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: appId,
    redirect_uri: vkRedirectUri(),
    code_challenge: challenge,
    code_challenge_method: 's256',
    state,
    scope: 'email',
  })
  window.location.href = 'https://id.vk.com/authorize?' + params.toString()
}

/**
 * Обработка возврата от VK (вызывается на старте приложения).
 * Если в URL есть ?code&state — обменивает код через edge-функцию vk-auth
 * и логинит пользователя (Supabase-сессия или демо-профиль).
 * @returns {Promise<boolean>} true, если был обработан VK-редирект
 */
export async function handleVkRedirect(navigate) {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code')
  if (!code) return false
  const state = sp.get('state')
  const deviceId = sp.get('device_id')
  const savedState = sessionStorage.getItem('vk_state')
  const verifier = sessionStorage.getItem('vk_verifier')

  // Чистим URL от query, чтобы код не остался в адресной строке
  window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash)

  if (!state || state !== savedState || !verifier) { console.warn('[VK] state/verifier mismatch'); return false }
  sessionStorage.removeItem('vk_state')
  sessionStorage.removeItem('vk_verifier')

  const fnUrl = import.meta.env.VITE_VK_AUTH_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vk-auth` : '')
  if (!fnUrl) { alert('Вход через ВК требует развёрнутую функцию vk-auth (нет URL).'); return false }

  try {
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
      body: JSON.stringify({ code, device_id: deviceId, code_verifier: verifier, redirect_uri: vkRedirectUri() }),
    })
    const data = await res.json()
    if (!res.ok || data.error) throw new Error(data.error || ('HTTP ' + res.status))

    // Боевой путь: одноразовый токен → сессия Supabase
    if (isSupabaseConfigured && data.token_hash) {
      const { error } = await supabase.auth.verifyOtp({ type: 'email', token_hash: data.token_hash })
      if (error) throw error
      if (data.profile && supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await supabase.from('profiles').upsert({ id: user.id, full_name: data.profile.name, avatar_url: data.profile.avatar, email: data.profile.email })
      }
      navigate('/dashboard')
      return true
    }

    // Демо-режим: сохраняем профиль локально
    const prof = data.profile || {}
    localStorage.setItem('cp_user', JSON.stringify({ name: prof.name, email: prof.email, role: 'student', avatar_url: prof.avatar, testDone: false }))
    await CP.saveUser({ name: prof.name, avatar_url: prof.avatar, role: 'student' })
    navigate('/dashboard')
    return true
  } catch (e) {
    console.error('[VK] auth error', e)
    alert('Не удалось войти через ВКонтакте: ' + e.message)
    return false
  }
}
