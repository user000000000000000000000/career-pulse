import { supabase, isSupabaseConfigured } from './supabase'

// ── PKCE (управляем сами — SDK теряет verifier, issue VKCOM/vkid-web-sdk#24) ──
function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
async function sha256(str) { return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)) }
function rand(n = 64) {
  const a = new Uint8Array(n); crypto.getRandomValues(a)
  return Array.from(a, b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('').slice(0, n)
}

/** Redirect URI = базовый адрес сайта (должен совпадать с настройкой VK). */
export function vkRedirectUri() {
  return window.location.origin + import.meta.env.BASE_URL
}

/** Старт входа через VK ID (ручной OAuth 2.1 + PKCE). */
export async function startVkLogin() {
  const appId = import.meta.env.VITE_VK_APP_ID
  if (!appId) { alert('Вход через ВКонтакте не настроен (нет VITE_VK_APP_ID).'); return }
  const verifier = rand(64)
  const challenge = b64url(await sha256(verifier))
  const state = rand(24)
  localStorage.setItem('vk_verifier', verifier)
  localStorage.setItem('vk_state', state)
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: appId,
    redirect_uri: vkRedirectUri(),
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
    scope: 'email',
  })
  window.location.href = 'https://id.vk.com/authorize?' + params.toString()
}

/** Обработка возврата от VK: обмен кода через функцию vk-auth (наш verifier). */
export async function handleVkRedirect(navigate) {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code')
  if (!code) return false
  const state = sp.get('state')
  const deviceId = sp.get('device_id')
  const verifier = localStorage.getItem('vk_verifier')
  const savedState = localStorage.getItem('vk_state')

  // Чистим URL (verifier берём из localStorage, не из адреса)
  window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash)

  if (!verifier) { alert('Сессия входа через ВК потеряна — попробуй ещё раз.'); return false }
  if (state && savedState && state !== savedState) { console.warn('[VK] state mismatch') }
  localStorage.removeItem('vk_verifier')
  localStorage.removeItem('vk_state')

  const fnUrl = import.meta.env.VITE_VK_AUTH_URL ||
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vk-auth` : '')
  if (!fnUrl) { alert('Вход через ВК требует функцию vk-auth (нет URL).'); return false }

  try {
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
      body: JSON.stringify({ code, device_id: deviceId, code_verifier: verifier, redirect_uri: vkRedirectUri() }),
    })
    const out = await res.json()
    if (!res.ok || out.error) throw new Error(out.error || ('HTTP ' + res.status))

    if (isSupabaseConfigured && out.token_hash) {
      const { error } = await supabase.auth.verifyOtp({ type: 'email', token_hash: out.token_hash })
      if (error) throw error
      if (out.profile && supabase) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) await supabase.from('profiles').upsert({ id: user.id, full_name: out.profile.name, avatar_url: out.profile.avatar, email: out.profile.email })
      }
      navigate('/dashboard')
      return true
    }
    const prof = out.profile || {}
    localStorage.setItem('cp_user', JSON.stringify({ name: prof.name, email: prof.email, role: 'student', avatar_url: prof.avatar, testDone: false }))
    navigate('/dashboard')
    return true
  } catch (e) {
    console.error('[VK] auth error', e)
    alert('Не удалось войти через ВКонтакте: ' + (e.message || e))
    return false
  }
}
