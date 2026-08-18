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
  if (!appId) { 
    alertDialog({ title: 'ВКонтакте', message: 'Вход через ВКонтакте не настроен (нет VITE_VK_APP_ID).' }); 
    return 
  }
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

/** Обработка возврата от VK: обмен кода через Supabase Auth. */
export async function handleVkRedirect(navigate) {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code')
  if (!code) return false
  if (vkExchangeInFlight) return false
  vkExchangeInFlight = true

  const state = sp.get('state')
  const savedState = localStorage.getItem(STORAGE_KEYS.vkState)
  
  window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash)

  if (!savedState || state !== savedState) {
    localStorage.removeItem(STORAGE_KEYS.vkVerifier)
    localStorage.removeItem(STORAGE_KEYS.vkState)
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось подтвердить запрос входа — попробуй ещё раз.' })
    return false
  }

  const verifier = localStorage.getItem(STORAGE_KEYS.vkVerifier)
  localStorage.removeItem(STORAGE_KEYS.vkState)

  try {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase не настроен')
    }

    if (!verifier) {
      throw new Error('Не найден code_verifier для PKCE')
    }

    console.log('🔑 Код:', code)
    console.log('🔑 Верификатор:', verifier)

    // ─── ОБМЕН КОДА ЧЕРЕЗ SUPABASE AUTH (с client_secret) ───
    const response = await fetch('https://supabase.careerpulse.ru/auth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.supabaseAnonKey,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: config.supabaseAnonKey,
        client_secret: config.jwtSecret,
        code: code,
        redirect_uri: vkRedirectUri(),
      }),
    })

    const data = await response.json()
    console.log('[VK] Ответ Supabase:', data)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || JSON.stringify(data)}`)
    }

    if (data.access_token) {
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      })
    } else {
      throw new Error('Не удалось получить access_token')
    }

    localStorage.removeItem(STORAGE_KEYS.vkVerifier)

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (!profile) {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Пользователь'
        await supabase
          .from('profiles')
          .insert({ id: user.id, full_name: fullName, avatar_url: user.user_metadata?.avatar_url || null })
      }
      
      navigate(user.user_metadata?.consent_at ? '/dashboard' : '/vk-consent')
      return true
    }

    return false
  } catch (e) {
    console.error('[VK] auth error', e)
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось войти через ВКонтакте: ' + (e.message || e) })
    return false
  }
}
