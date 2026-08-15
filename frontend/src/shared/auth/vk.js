import { supabase, isSupabaseConfigured } from '../api/supabase'
import { alertDialog } from '../ui/Dialog.jsx'
import { STORAGE_KEYS } from '../lib/storageKeys'
import { config } from '../config/config'

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
  const appId = config.vkAppId
  if (!appId) { alertDialog({ title: 'ВКонтакте', message: 'Вход через ВКонтакте не настроен (нет VITE_VK_APP_ID).' }); return }
  const verifier = rand(64)
  const challenge = b64url(await sha256(verifier))
  const state = rand(24)
  localStorage.setItem(STORAGE_KEYS.vkVerifier, verifier)
  localStorage.setItem(STORAGE_KEYS.vkState, state)
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

let vkExchangeInFlight = false

/** Обработка возврата от VK: обмен кода через функцию vk-auth (наш verifier). */
export async function handleVkRedirect(navigate) {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code')
  if (!code) return false
  if (vkExchangeInFlight) return false   // защита от двойного обмена (код одноразовый)
  vkExchangeInFlight = true
  const state = sp.get('state')
  const deviceId = sp.get('device_id')
  const verifier = localStorage.getItem(STORAGE_KEYS.vkVerifier)
  const savedState = localStorage.getItem(STORAGE_KEYS.vkState)

  // Чистим URL (verifier берём из localStorage, не из адреса)
  window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash)

  if (!verifier) { alertDialog({ title: 'ВКонтакте', message: 'Сессия входа через ВК потеряна — попробуй ещё раз.' }); return false }
  // state — защита от login CSRF: код мог прийти не из того запроса, который мы сами инициировали.
  // Раньше несовпадение только логировалось в консоль и вход продолжался — это и есть уязвимость.
  if (!savedState || state !== savedState) {
    localStorage.removeItem(STORAGE_KEYS.vkVerifier)
    localStorage.removeItem(STORAGE_KEYS.vkState)
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось подтвердить запрос входа — попробуй ещё раз.' })
    return false
  }
  localStorage.removeItem(STORAGE_KEYS.vkVerifier)
  localStorage.removeItem(STORAGE_KEYS.vkState)

  const fnUrl = config.vkAuthUrl ||
    (config.supabaseUrl ? `${config.supabaseUrl}/functions/v1/vk-auth` : '')
  if (!fnUrl) { alertDialog({ title: 'ВКонтакте', message: 'Вход через ВК требует функцию vk-auth (нет URL).' }); return false }

  try {
    const anon = config.supabaseAnonKey || ''
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
      const { data: { user } } = await supabase.auth.getUser()
      if (out.profile && user) {
        await supabase.from('profiles').upsert({ id: user.id, full_name: out.profile.name, avatar_url: out.profile.avatar, email: out.profile.email })
      }
      // Вход через VK не проходит через форму регистрации — там нет проверки
      // возраста/согласия на обработку ПД. Если ещё не подтверждено — сначала туда.
      navigate(user?.user_metadata?.consent_at ? '/dashboard' : '/vk-consent')
      return true
    }
    const prof = out.profile || {}
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ name: prof.name, email: prof.email, role: 'student', avatar_url: prof.avatar, testDone: false }))
    navigate('/dashboard')
    return true
  } catch (e) {
    console.error('[VK] auth error', e)
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось войти через ВКонтакте: ' + (e.message || e) })
    return false
  }
}
