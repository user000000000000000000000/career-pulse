// ════════════════════════════════════════════════════════════════
//  Supabase Edge Function: analyze-diagnostic
//  ────────────────────────────────────────────────────────────────
//  Принимает агрегированный профиль диагностики V3 (10 блоков) и
//  возвращает развёрнутый разбор от нейросети (full_report — ~10
//  предложений), сильные стороны, зоны роста и подходящие профессии.
//
//  Провайдер выбирается через AI_PROVIDER (по умолчанию yandex).
//  Секреты (supabase secrets set):
//    AI_PROVIDER=yandex
//    YANDEX_API_KEY=...        (или AI_API_KEY)
//    YANDEX_FOLDER_ID=...
//    (для deepseek/openai — AI_API_KEY)
// ════════════════════════════════════════════════════════════════

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const SYSTEM_PROMPT =
  'Ты — карьерный наставник и психолог, который по-человечески говорит с подростком о его профиле. ' +
  'Тон тёплый, прямой, без канцелярита — как умный старший друг, который разбирается в профессиях. ' +
  'КРИТИЧЕСКИ ВАЖНО: пиши ТОЛЬКО от второго лица — «ты», «твой», «тебе». ' +
  'ЗАПРЕЩЕНО: «он», «она», «этот человек», «пользователь», «испытуемый». ' +
  'ЗАПРЕЩЁННЫЕ ФРАЗЫ: «можно сделать вывод», «следует отметить», «на основании анализа», «выявлен высокий уровень». ' +
  'Поле full_report — это ГЛАВНОЕ: связный живой текст на 10–12 предложений (3–4 абзаца). ' +
  'Первый абзац — кто ты по сути (характер, что движет). ' +
  'Второй — конкретные сильные стороны и как они связаны (Holland, способности, мышление). ' +
  'Третий — куда тебе расти профессионально и почему именно туда. ' +
  'Четвёртый — короткое поддерживающее завершение, дающее уверенность и первый шаг. ' +
  'Ответь СТРОГО валидным JSON без markdown, по схеме: ' +
  '{"full_report":"10-12 предложений","strengths":["...","...","..."],"weaknesses":["...","..."],' +
  '"recommended_professions":[{"name":"...","match":94}, ...]}. ' +
  'В recommended_professions — 5–7 профессий по убыванию match (0–100), реалистичных для школьника/абитуриента.'

function buildUserPrompt(profile: Record<string, any> = {}) {
  const TYPE = { R: 'Реалистичный', I: 'Исследовательский', A: 'Артистичный', S: 'Социальный', E: 'Предпринимательский', C: 'Конвенциональный' } as Record<string, string>
  const lines: string[] = ['ПРОФИЛЬ ДИАГНОСТИКИ (CareerPulse, 10 блоков):', '']

  if (profile.career_archetype) lines.push(`Карьерный архетип (Holland): ${profile.career_archetype} (код ${profile.holland_code || '—'})`)
  if (Array.isArray(profile.holland_top2)) lines.push(`Ведущие типы: ${profile.holland_top2.map((t: string) => TYPE[t] || t).join(' + ')}`)
  if (profile.holland_scores) lines.push('Holland по шкалам: ' + Object.entries(profile.holland_scores).map(([k, v]) => `${TYPE[k] || k} ${v}%`).join(', '))
  if (profile.values_archetype) lines.push(`Ценностный архетип: ${profile.values_archetype} (мотивация: ${profile.motivation_type || '—'}, топ: ${(profile.values_top3 || []).join(', ')})`)
  if (profile.personality_archetype) lines.push(`Личностный архетип: ${profile.personality_archetype}`)
  if (profile.personality_scores) lines.push('Личность (Big Five+): ' + Object.entries(profile.personality_scores).map(([k, v]) => `${k} ${v}%`).join(', '))
  if (profile.cognitive_archetype) lines.push(`Когнитивный архетип: ${profile.cognitive_archetype} (стиль обучения: ${profile.vark_style || '—'}, топ: ${(profile.cognitive_top3 || []).join(', ')})`)
  if (Array.isArray(profile.readiness_top2)) lines.push(`Профессиональная готовность (топ-2 типа): ${profile.readiness_top2.join(', ')}; зрелость ${profile.career_maturity ?? '—'}/100`)
  if (profile.se_general != null) lines.push(`Самоэффективность: ${profile.se_general}/100, решительность ${profile.decisiveness ?? '—'}/100, стиль решений ${profile.decision_style || '—'}, индекс реализации ${profile.career_execution ?? '—'}/100`)
  if (profile.context) {
    const c = profile.context
    lines.push(`Контекст: возраст ${c.age || '—'}, класс ${c.grade || '—'}, город ${c.city || '—'}, планы ${c.plans_after_school || '—'}`)
  }

  lines.push('', 'Сформируй тёплый профориентационный разбор (full_report на 10–12 предложений) и список подходящих профессий на основе профиля выше.')
  return lines.join('\n')
}

async function callYandex(system: string, user: string) {
  const key = Deno.env.get('AI_API_KEY') || Deno.env.get('YANDEX_API_KEY')
  const folderId = Deno.env.get('YANDEX_FOLDER_ID')
  if (!key) throw new Error('Не задан YANDEX_API_KEY')
  if (!folderId) throw new Error('Не задан YANDEX_FOLDER_ID')
  const res = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Api-Key ${key}`, 'x-folder-id': folderId },
    body: JSON.stringify({
      modelUri: `gpt://${folderId}/yandexgpt/latest`,
      completionOptions: { stream: false, temperature: 0.6, maxTokens: 2500 },
      messages: [{ role: 'system', text: system }, { role: 'user', text: user }],
    }),
  })
  if (!res.ok) throw new Error(`YandexGPT ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.result?.alternatives?.[0]?.message?.text ?? '{}'
}

async function callDeepSeek(system: string, user: string) {
  const key = Deno.env.get('AI_API_KEY') || Deno.env.get('DEEPSEEK_API_KEY')
  if (!key) throw new Error('Не задан AI_API_KEY для DeepSeek')
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.6, response_format: { type: 'json_object' } }),
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

async function callOpenAI(system: string, user: string) {
  const key = Deno.env.get('AI_API_KEY')
  const baseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com'
  const model = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'
  if (!key) throw new Error('Не задан AI_API_KEY для OpenAI')
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.6, response_format: { type: 'json_object' } }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

async function callAI(system: string, user: string) {
  const provider = (Deno.env.get('AI_PROVIDER') || 'yandex').toLowerCase()
  if (provider === 'deepseek') return callDeepSeek(system, user)
  if (provider === 'openai') return callOpenAI(system, user)
  return callYandex(system, user)
}

function parseReport(raw: string) {
  try { return JSON.parse(raw) } catch { /* ignore */ }
  const m = raw.match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch { /* ignore */ } }
  return {}
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const { profile } = await req.json()
    const raw = await callAI(SYSTEM_PROMPT, buildUserPrompt(profile))
    const r = parseReport(raw)
    return json({
      full_report: r.full_report ?? '',
      strengths: r.strengths ?? [],
      weaknesses: r.weaknesses ?? [],
      recommended_professions: r.recommended_professions ?? [],
    })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
