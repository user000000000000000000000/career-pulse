// ════════════════════════════════════════════════════════════════
//  Supabase Edge Function: vk-auth
//  ────────────────────────────────────────────────────────────────
//  Принимает access_token от VK ID SDK (фронт уже обменял code → токен),
//  проверяет его через user_info, получает профиль и создаёт сессию
//  Supabase (через одноразовый token_hash).
//
//  Вход:  { access_token }   (или legacy: { code, device_id, code_verifier, redirect_uri })
//  Выход: { profile: { email, name, avatar }, token_hash? }
//
//  Секреты:
//    VK_APP_ID=54638224
//    (VK_CLIENT_SECRET нужен только для legacy code-обмена)
//    SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY — подставляются автоматически
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
    const body = await req.json()
    const appId = Deno.env.get('VK_APP_ID')
    if (!appId) return json({ error: 'VK_APP_ID не задан' }, 500)

    let accessToken = body.access_token

    // Legacy: если прислали code (без SDK) — обменяем сами
    if (!accessToken && body.code) {
      const secret = Deno.env.get('VK_CLIENT_SECRET')
      if (!secret) return json({ error: 'VK_CLIENT_SECRET не задан (нужен для обмена кода)' }, 500)
      const tokenRes = await fetch('https://id.vk.com/oauth2/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code', code: body.code, code_verifier: body.code_verifier || '',
          client_id: appId, client_secret: secret, device_id: body.device_id || '', redirect_uri: body.redirect_uri || '',
        }),
      })
      const td = await tokenRes.json()
      if (!tokenRes.ok || !td.access_token) return json({ error: 'VK token: ' + JSON.stringify(td) }, 400)
      accessToken = td.access_token
    }

    if (!accessToken) return json({ error: 'нет access_token' }, 400)

    // Профиль через user_info
    const infoRes = await fetch('https://id.vk.com/oauth2/user_info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: appId, access_token: accessToken }),
    })
    const info = await infoRes.json()
    if (!infoRes.ok || (!info.user && !info.email)) return json({ error: 'VK user_info: ' + JSON.stringify(info) }, 400)
    const u = info.user || info
    const email = u.email || `vk${u.user_id || u.id}@vk.local`
    const name = [u.last_name, u.first_name].filter(Boolean).join(' ') || 'Пользователь ВК'
    const avatar = u.avatar || ''
    const profile = { email, name, avatar }

    // Создание/вход пользователя в Supabase
    const supaUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (supaUrl && serviceKey) {
      const admin = createClient(supaUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
      await admin.auth.admin.createUser({
        email, email_confirm: true,
        user_metadata: { full_name: name, avatar_url: avatar, provider: 'vk', vk_id: u.user_id || u.id },
      }).catch(() => {})
      const { data: list } = await admin.auth.admin.listUsers()
      const found = list?.users?.find((x: any) => x.email === email)
      if (found) await admin.from('profiles').upsert({ id: found.id, email, full_name: name, avatar_url: avatar, role: 'student' }).catch(() => {})
      const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({ type: 'magiclink', email })
      if (linkErr) return json({ error: 'generateLink: ' + linkErr.message }, 500)
      return json({ profile, token_hash: linkData?.properties?.hashed_token })
    }

    return json({ profile })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
