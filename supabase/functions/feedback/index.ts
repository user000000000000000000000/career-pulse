// Приём обратной связи: сохраняет отзыв в БД (service role) и шлёт письмо
// на адреса из FEEDBACK_TO (по умолчанию — почты владельца). Письмо — best-effort:
// если SMTP не сработал, отзыв всё равно сохранён, функция вернёт ok.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts'

const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const CAT_META: Record<string, { ru: string; emoji: string; color: string }> = {
  bug: { ru: 'Ошибка', emoji: '🐞', color: '#d63456' },
  idea: { ru: 'Идея / пожелание', emoji: '💡', color: '#b57e1f' },
  other: { ru: 'Другое', emoji: '💬', color: '#4079d3' },
}
const esc = (s: string) => String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!))

async function sendMail(rec: Record<string, string>) {
  const host = Deno.env.get('SMTP_HOST'); const user = Deno.env.get('SMTP_USER'); const pass = Deno.env.get('SMTP_PASS')
  if (!host || !user || !pass) { console.warn('[feedback] SMTP не настроен — письмо не отправлено'); return }
  const to = (Deno.env.get('FEEDBACK_TO') || 'Careerpulse@ya.ru,li0bi0.mamy@gmail.com')
    .split(',').map((s) => s.trim()).filter(Boolean)
  const port = Number(Deno.env.get('SMTP_PORT') || 465)
  const client = new SMTPClient({
    connection: { hostname: host, port, tls: port === 465, auth: { username: user, password: pass } },
  })
  const withTimeout = <T>(p: Promise<T>, ms = 12000) =>
    Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error('SMTP timeout')), ms))])
  const m = CAT_META[rec.category] || CAT_META.other
  const cat = m.ru
  const html = `<div style="margin:0;padding:0;background:#eef0fb;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef0fb;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 6px 24px rgba(37,32,92,.10);">
        <tr><td style="background:#25205c;padding:18px 26px;">
          <span style="font-size:19px;font-weight:800;letter-spacing:2px;color:#ffffff;">CAREER<span style="color:#8fb4f2;">PULSE</span></span>
          <span style="color:#b7b5d8;font-size:12px;"> &nbsp;·&nbsp; Обратная связь</span>
        </td></tr>
        <tr><td style="padding:24px 26px 8px;">
          <span style="display:inline-block;font-size:12px;font-weight:700;color:${m.color};background:${m.color}1f;padding:5px 13px;border-radius:20px;">${m.emoji} ${esc(m.ru)}</span>
          <div style="font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#a6a4c0;margin:16px 0 6px;">Сообщение</div>
          <div style="font-size:15px;line-height:1.65;color:#25205c;background:#f4f5fb;border-radius:10px;padding:14px 16px;white-space:pre-wrap;">${esc(rec.message)}</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0 4px;font-size:13px;color:#4a4a68;">
            <tr><td style="padding:5px 0;width:96px;color:#a6a4c0;vertical-align:top;">Контакт</td><td style="padding:5px 0;">${esc(rec.email) || '—'}</td></tr>
            <tr><td style="padding:5px 0;color:#a6a4c0;vertical-align:top;">Страница</td><td style="padding:5px 0;word-break:break-all;">${esc(rec.page_url) || '—'}</td></tr>
            <tr><td style="padding:5px 0;color:#a6a4c0;vertical-align:top;">Устройство</td><td style="padding:5px 0;font-size:11px;color:#8583a3;">${esc(rec.user_agent) || '—'}</td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f7f8fc;padding:14px 26px;text-align:center;font-size:11px;color:#a6a4c0;">
          Открыть в админке: <a href="https://careerpulse.ru/#/admin" style="color:#4079d3;text-decoration:none;">careerpulse.ru/#/admin</a>
        </td></tr>
      </table>
    </td></tr>
  </table></div>`
  try {
    await withTimeout(client.send({
      from: `${Deno.env.get('SMTP_SENDER_NAME') || 'CareerPulse'} <${user}>`,
      to,
      replyTo: rec.email || undefined,
      subject: `CareerPulse feedback: ${rec.category}`,
      content: `${cat}\n\n${rec.message}\n\nКонтакт: ${rec.email || '—'}\nСтраница: ${rec.page_url || '—'}`,
      html,
    }))
  } finally {
    try { await client.close() } catch { /* noop */ }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const b = await req.json().catch(() => ({}))
    const message = String(b.message || '').trim()
    if (!message) return json({ error: 'empty' }, 400)
    const rec = {
      user_id: b.user_id || null,
      category: String(b.category || 'other').slice(0, 20),
      message: message.slice(0, 4000),
      email: String(b.email || '').slice(0, 200) || null,
      page_url: String(b.page_url || '').slice(0, 500),
      user_agent: String(b.user_agent || '').slice(0, 300),
    }

    // 1) сохраняем (надёжно) — без этого не считаем успехом
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { error } = await admin.from('feedback').insert(rec)
    if (error) throw error

    // 2) письмо — в фоне (не задерживаем ответ и не упираемся в лимит isolate)
    const mail = sendMail(rec).catch((e) => console.error('[feedback] mail error', e?.message || e))
    try { (globalThis as any).EdgeRuntime?.waitUntil?.(mail) } catch { /* нет waitUntil — письмо всё равно уйдёт best-effort */ }

    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500)
  }
})
