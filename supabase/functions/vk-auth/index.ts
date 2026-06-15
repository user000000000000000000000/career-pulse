// ════════════════════════════════════════════════════════════════
//  Supabase Edge Function: vk-auth
//  ────────────────────────────────────────────────────────────────
//  Обмен кода VK ID (OAuth 2.1 / PKCE) на профиль пользователя и
//  создание сессии Supabase (через одноразовый token_hash).
//
//  Вход:  { code, device_id, code_verifier, redirect_uri }
//  Выход: { profile: { email, name, avatar }, token_hash? }
//
//  Секреты (supabase secrets set):
//    VK_APP_ID=...                    (ID приложения VK ID)
//    VK_CLIENT_SECRET=...             (защищённый ключ приложения)
//    SUPABASE_URL=...                 (есть по умолчанию)
//    SUPABASE_SERVICE_ROLE_KEY=...    (для создания пользователя/сессии)
// ════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const { code, device_id, code_verifier, redirect_uri } = await req.json()
    const appId = Deno.env.get('VK_APP_ID')
    const secret = Deno.env.get('VK_CLIENT_SECRET')
    if (!appId || !secret) return json({ error: 'VK_APP_ID / VK_CLIENT_SECRET не заданы' }, 500)

    // 1) Обмен кода на access_token (VK ID 2.1)
    const tokenBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: code_verifier || '',
      client_id: appId,
      client_secret: secret,
      device_id: device_id || '',
      redirect_uri: redirect_uri || '',
    })
    const tokenRes = await fetch('https://id.vk.com/oauth2/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenBody,
    })
    const tokenData = await tokenRes.json()
    if (!tokenRes.ok || !tokenData.access_token) {
      return json({ error: 'VK token: ' + JSON.stringify(tokenData) }, 400)
    }

    // 2) Профиль пользователя
    const infoRes = await fetch('https://id.vk.com/oauth2/user_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: appId, access_token: tokenData.access_token }),
    })
    const infoData = await infoRes.json()
    const u = infoData.user || {}
    const email = u.email || tokenData.email || `vk${tokenData.user_id || u.user_id}@vk.local`
    const name = [u.last_name, u.first_name].filter(Boolean).join(' ') || 'Пользователь ВК'
    const avatar = u.avatar || ''
    const profile = { email, name, avatar }

    // 3) Создание/вход пользователя в Supabase (если задан service role)
    const supaUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (supaUrl && serviceKey) {
      const admin = createClient(supaUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

      // Создаём пользователя (если уже есть — игнорируем ошибку)
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: name, avatar_url: avatar, provider: 'vk', vk_id: tokenData.user_id || u.user_id },
      }).catch(() => {})

      // Профиль в таблице profiles
      const { data: list } = await admin.auth.admin.listUsers()
      const found = list?.users?.find((x: any) => x.email === email)
      if (found) {
        await admin.from('profiles').upsert({ id: found.id, email, full_name: name, avatar_url: avatar, role: 'student' }).catch(() => {})
      }

      // Одноразовая ссылка → token_hash для verifyOtp на фронте
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
      if (linkErr) return json({ error: 'generateLink: ' + linkErr.message }, 500)
      const token_hash = linkData?.properties?.hashed_token
      return json({ profile, token_hash })
    }

    // Без service role — только профиль (демо-режим на фронте)
    return json({ profile })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
