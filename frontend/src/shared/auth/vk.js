import { supabase, isSupabaseConfigured } from '../api/supabase'
import { alertDialog } from '../ui/Dialog.jsx'
import { friendlyError } from '../lib/errors'
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

// verifier/state держим и в cookie на .careerpulse.ru — чтобы пережить возврат от VK
// в другом контексте (www↔без-www, in-app браузер), где localStorage не виден.
const VK_COOKIE_DOMAIN = /(^|\.)careerpulse\.ru$/i.test(location.hostname) ? '; domain=.careerpulse.ru' : ''
function setCookie(name, val) {
  try { document.cookie = `${name}=${encodeURIComponent(val)}; path=/; max-age=600; SameSite=Lax; Secure${VK_COOKIE_DOMAIN}` } catch { /* приватный режим */ }
}
function getCookie(name) {
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}
function delCookie(name) {
  try { document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax; Secure${VK_COOKIE_DOMAIN}` } catch { /* noop */ }
}
const C_VERIFIER = 'cp_vk_verifier', C_STATE = 'cp_vk_state'

function saveVk(verifier, state) {
  try { localStorage.setItem(STORAGE_KEYS.vkVerifier, verifier); localStorage.setItem(STORAGE_KEYS.vkState, state) } catch { /* noop */ }
  setCookie(C_VERIFIER, verifier); setCookie(C_STATE, state)
}
function readVk() {
  let verifier = getCookie(C_VERIFIER), state = getCookie(C_STATE)
  try { verifier = verifier || localStorage.getItem(STORAGE_KEYS.vkVerifier); state = state || localStorage.getItem(STORAGE_KEYS.vkState) } catch { /* noop */ }
  return { verifier, state }
}
function clearVk() {
  try { localStorage.removeItem(STORAGE_KEYS.vkVerifier); localStorage.removeItem(STORAGE_KEYS.vkState) } catch { /* noop */ }
  delCookie(C_VERIFIER); delCookie(C_STATE)
}

/** Redirect URI = базовый адрес сайта (должен совпадать с настройкой VK). */
export function vkRedirectUri() {
  return window.location.origin + import.meta.env.BASE_URL
}

/** Старт входа через VK ID (ручной OAuth 2.1 + PKCE). */
export async function startVkLogin() {
  const appId = config.vkAppId
  if (!appId) {
    alertDialog({ title: 'ВКонтакте', message: 'Вход через ВКонтакте не настроен (нет VK_APP_ID).' })
    return
  }
  // crypto.subtle доступен только в защищённом контексте (https). В некоторых
  // встроенных браузерах (внутри приложений) его нет — честно об этом говорим.
  if (!window.crypto?.subtle) {
    alertDialog({ title: 'ВКонтакте', message: 'Похоже, сайт открыт во встроенном браузере приложения. Открой careerpulse.ru в Chrome или Safari и попробуй войти через VK там.' })
    return
  }
  try {
    const verifier = rand(64)
    const challenge = b64url(await sha256(verifier))
    const state = rand(24)
    saveVk(verifier, state)
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
  } catch (e) {
    console.error('[VK] start error', e)
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось начать вход через VK: ' + (e.message || e) })
  }
}

let vkExchangeInFlight = false

/** Обработка возврата от VK: обмен кода делает edge-функция vk-auth (СЕРВЕР),
 *  фронт лишь ставит сессию Supabase по одноразовому token_hash. */
export async function handleVkRedirect(navigate) {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code')
  if (!code) return false
  if (vkExchangeInFlight) return false
  vkExchangeInFlight = true

  const state = sp.get('state')
  const deviceId = sp.get('device_id') || ''
  const { verifier, state: savedState } = readVk()

  window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash)

  if (!savedState || state !== savedState) {
    clearVk()
    vkExchangeInFlight = false
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось подтвердить запрос входа (потерялась сессия входа). Открой careerpulse.ru в обычном браузере и попробуй ещё раз.' })
    return false
  }

  try {
    if (!isSupabaseConfigured) throw new Error('Supabase не настроен')
    if (!verifier) throw new Error('Не найден code_verifier для PKCE')

    const fnUrl = config.vkAuthUrl || `${config.supabaseUrl}/functions/v1/vk-auth`
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${config.supabaseAnonKey}`,
      },
      body: JSON.stringify({ code, code_verifier: verifier, device_id: deviceId, redirect_uri: vkRedirectUri(), state }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) throw new Error(data.error || `vk-auth ${res.status}`)
    if (!data.token_hash) throw new Error('Сервер не вернул сессию')

    const { error } = await supabase.auth.verifyOtp({ token_hash: data.token_hash, type: 'magiclink' })
    if (error) throw error

    clearVk()
    navigate('/dashboard')
    return true
  } catch (e) {
    console.error('[VK] auth error', e)
    alertDialog({ title: 'ВКонтакте', message: friendlyError(e, 'Не удалось войти через ВКонтакте. Попробуйте ещё раз или войдите по почте.') })
    return false
  } finally {
    vkExchangeInFlight = false
  }
}
