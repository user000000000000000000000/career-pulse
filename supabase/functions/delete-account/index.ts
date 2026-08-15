// Удаление аккаунта пользователя по его собственному запросу (право на удаление ПД, ст. 14 152-ФЗ).
// Клиент шлёт POST с Authorization: Bearer <access_token> своей сессии.
// Функция определяет пользователя по токену и удаляет его профиль + учётную запись.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ALLOWED_ORIGIN — секрет (supabase secrets set ALLOWED_ORIGIN=https://ваш-домен).
// Пока не задан — '*' (как раньше), чтобы не сломать текущий деплой.
const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '')
    if (!token) return new Response(JSON.stringify({ error: 'no token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    // кто это — по его же токену
    const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') || serviceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'invalid token' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    // удаляем профиль и саму учётную запись админ-клиентом
    const admin = createClient(url, serviceKey)
    try { await admin.from('profiles').delete().eq('id', user.id) } catch (_) { /* ignore */ }
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) throw error

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
