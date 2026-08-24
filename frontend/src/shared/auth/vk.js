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

/** Обработка возврата от VK: обмен кода через VK API + ручная сессия. */
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

    // ─── 1️⃣ ОБМЕН КОДА ЧЕРЕЗ VK API ───
    const vkTokenResponse = await fetch('https://oauth.vk.com/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.vkAppId,
        client_secret: config.vkSecret,
        code: code,
        redirect_uri: vkRedirectUri(),
      }),
    })

    const vkData = await vkTokenResponse.json()
    console.log('[VK] Токен получен:', vkData)

    if (!vkData.access_token) {
      throw new Error('Не удалось получить access_token от VK')
    }

    // ─── 2️⃣ ПОЛУЧАЕМ EMAIL ПОЛЬЗОВАТЕЛЯ ───
    const userInfoResponse = await fetch(
      `https://api.vk.com/method/users.get?user_ids=${vkData.user_id}&fields=email&access_token=${vkData.access_token}&v=5.131`
    )
    const userInfo = await userInfoResponse.json()
    console.log('[VK] Данные пользователя:', userInfo)

    const userData = userInfo.response?.[0]
    if (!userData) {
      throw new Error('Не удалось получить данные пользователя')
    }

    // ─── 3️⃣ СОЗДАЁМ ИЛИ НАХОДИМ ПОЛЬЗОВАТЕЛЯ ───
    const email = userData.email || `${vkData.user_id}@vk.com`
    const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Пользователь VK'

    let { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    let userId

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabase
        .from('profiles')
        .insert({
          email: email,
          full_name: fullName,
          avatar_url: userData.photo_200 || null,
          role: 'student',
        })
        .select('id')
        .single()

      if (createError) {
        console.error('[VK] Ошибка создания пользователя:', createError)
        throw new Error('Не удалось создать пользователя')
      }
      userId = newUser.id
    }

    // ─── 4️⃣ ГЕНЕРИРУЕМ JWT ТОКЕН ───
    const jwtPayload = {
      sub: userId,
      email: email,
      role: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    }

    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify(jwtPayload))
    const signature = btoa(
      String.fromCharCode(
        ...new Uint8Array(
          await crypto.subtle.sign(
            'HMAC',
            await crypto.subtle.importKey(
              'raw',
              new TextEncoder().encode(config.jwtSecret),
              { name: 'HMAC', hash: 'SHA-256' },
              false,
              ['sign']
            ),
            new TextEncoder().encode(`${header}.${payload}`)
          )
        )
      )
    )
    const token = `${header}.${payload}.${signature}`

    // ─── 5️⃣ СОХРАНЯЕМ СЕССИЮ ───
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: token,
      refresh_token: token,
      expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
    }))

    localStorage.removeItem(STORAGE_KEYS.vkVerifier)

    navigate('/dashboard')
    return true
  } catch (e) {
    console.error('[VK] auth error', e)
    alertDialog({ title: 'ВКонтакте', message: 'Не удалось войти через ВКонтакте: ' + (e.message || e) })
    return false
  }
}
