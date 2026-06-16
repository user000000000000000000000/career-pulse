import { supabase, isSupabaseConfigured } from './supabase'

/** Redirect URI = базовый адрес сайта (совпадает с настройкой VK ID). */
export function vkRedirectUri() {
  return window.location.origin + import.meta.env.BASE_URL
}

let vkidReady = false
function initVKID() {
  const VKID = window.VKIDSDK
  if (!VKID) return null
  if (!vkidReady) {
    VKID.Config.init({
      app: Number(import.meta.env.VITE_VK_APP_ID),
      redirectUrl: vkRedirectUri(),
      responseMode: VKID.ConfigResponseMode.Redirect,
      source: VKID.ConfigSource.LOWCODE,
      scope: 'email',
    })
    vkidReady = true
  }
  return VKID
}

/** Старт входа через VK ID (официальный SDK сам строит запрос и PKCE). */
export function startVkLogin() {
  const VKID = initVKID()
  if (!VKID) { alert('VK ID ещё загружается — попробуй ещё раз через секунду.'); return }
  VKID.Auth.login()
}

/**
 * Обработка возврата от VK (на старте приложения).
 * SDK меняет code на токены, токен отдаём в функцию vk-auth, та создаёт сессию Supabase.
 */
export async function handleVkRedirect(navigate) {
  const sp = new URLSearchParams(window.location.search)
  const code = sp.get('code')
  const deviceId = sp.get('device_id')
  if (!code) return false

  const VKID = initVKID()
  if (!VKID) { console.warn('[VK] SDK не загружен'); return false }

  // ВАЖНО: URL с ?code&state НЕ трогаем до exchangeCode — SDK ищет verifier по state из адреса
  const cleanUrl = () => window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash)

  try {
    const tokens = await VKID.Auth.exchangeCode(code, deviceId)
    cleanUrl()
    const accessToken = tokens.access_token
    if (!accessToken) throw new Error('VK не вернул access_token')

    const fnUrl = import.meta.env.VITE_VK_AUTH_URL ||
      (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/vk-auth` : '')

    if (fnUrl) {
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anon, Authorization: `Bearer ${anon}` },
        body: JSON.stringify({ access_token: accessToken }),
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
      // демо-режим
      const prof = out.profile || {}
      localStorage.setItem('cp_user', JSON.stringify({ name: prof.name, email: prof.email, role: 'student', avatar_url: prof.avatar, testDone: false }))
      navigate('/dashboard')
      return true
    }

    // Без функции (чистый клиент): берём профиль прямо из ответа SDK
    const u = tokens.user || {}
    const name = [u.last_name, u.first_name].filter(Boolean).join(' ') || 'Пользователь ВК'
    localStorage.setItem('cp_user', JSON.stringify({ name, email: u.email || tokens.email, role: 'student', avatar_url: u.avatar, testDone: false }))
    navigate('/dashboard')
    return true
  } catch (e) {
    cleanUrl()
    console.error('[VK] auth error', e)
    alert('Не удалось войти через ВКонтакте: ' + (e.message || e))
    return false
  }
}
