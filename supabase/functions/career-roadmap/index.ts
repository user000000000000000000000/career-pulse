// ════════════════════════════════════════════════════════════════
//  Supabase Edge Function: career-roadmap
//  ────────────────────────────────────────────────────────────────
//  Вход: { profile, professions: [a, b], age }
//  Выход: { goal, intro, steps: [{n, horizon, title, desc}], skills: [] }
//  Строит пошаговый карьерный маршрут к выбранным профессиям с учётом
//  возраста. Провайдер: AI_PROVIDER (по умолчанию yandex).
// ════════════════════════════════════════════════════════════════

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } })

const SYSTEM_PROMPT =
  'Ты — карьерный наставник для подростков. Тебе дают профиль ученика и 2 профессии, которые он выбрал. ' +
  'Построй понятный пошаговый маршрут «из точки сейчас» к этим профессиям. ' +
  'УЧИТЫВАЙ ВОЗРАСТ: если ученику 12–14 — горизонт длиннее, язык простой, акцент на школу, кружки, пробы, олимпиады; ' +
  'если 15–18 — добавляй ЕГЭ, выбор вуза/колледжа, первые стажировки и проекты. ' +
  'Пиши ТОЛЬКО от второго лица — «ты», «твой», «тебе». Тон тёплый, конкретный, без канцелярита. ' +
  'ПИШИ ВСЁ СТРОГО НА РУССКОМ ЯЗЫКЕ. Названия профессий и навыков — по-русски, без английских слов и латиницы. ' +
  'Шаги должны быть РЕАЛЬНЫМИ действиями (что сделать), а не абстракциями. 6–9 шагов. ' +
  'У каждого шага — короткий горизонт времени (например: «Сейчас», «Этот год», «8–9 класс», «10–11 класс», «После школы», «Вуз/колледж», «Первая работа»). ' +
  'Ответь СТРОГО валидным JSON без markdown по схеме: ' +
  '{"goal":"1 предложение — куда ведёт маршрут",' +
  '"intro":"2-3 предложения вступления по-человечески",' +
  '"steps":[{"n":1,"horizon":"Сейчас","title":"короткий заголовок (3-5 слов)","desc":"1-2 предложения что конкретно сделать"}],' +
  '"skills":["навык1","навык2","навык3","навык4"]}'

function buildUserPrompt({ profile = {}, professions = [], age }: { profile?: Record<string, any>; professions?: string[]; age?: any }) {
  const L: string[] = []
  L.push(`ВЫБРАННЫЕ ПРОФЕССИИ: ${professions.join(' и ')}`)
  L.push(`ВОЗРАСТ: ${age || profile.context?.age || 'не указан'}`)
  if (profile.career_archetype) L.push(`Карьерный архетип: ${profile.career_archetype} (Holland ${profile.holland_code || ''})`)
  if (profile.values_archetype) L.push(`Ценности: ${profile.values_archetype}`)
  if (profile.cognitive_archetype) L.push(`Когнитивный тип: ${profile.cognitive_archetype}, стиль обучения ${profile.vark_style || '—'}`)
  if (profile.personality_archetype) L.push(`Личность: ${profile.personality_archetype}`)
  if (Array.isArray(profile.readiness_top2)) L.push(`Сильнее всего получается: ${profile.readiness_top2.join(', ')}`)
  if (profile.context) L.push(`Класс: ${profile.context.grade || '—'}, город: ${profile.context.city || '—'}, планы: ${profile.context.plans_after_school || '—'}`)
  L.push('', 'Построй маршрут к выбранным профессиям с учётом профиля и возраста.')
  return L.join('\n')
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
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.6, response_format: { type: 'json_object' } }),
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`)
  return (await res.json()).choices?.[0]?.message?.content ?? '{}'
}
async function callOpenAI(system: string, user: string) {
  const key = Deno.env.get('AI_API_KEY')
  const baseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com'
  const model = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'
  if (!key) throw new Error('Не задан AI_API_KEY для OpenAI')
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, { role: 'user', content: user }], temperature: 0.6, response_format: { type: 'json_object' } }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  return (await res.json()).choices?.[0]?.message?.content ?? '{}'
}
async function callAI(s: string, u: string) {
  const p = (Deno.env.get('AI_PROVIDER') || 'yandex').toLowerCase()
  if (p === 'deepseek') return callDeepSeek(s, u)
  if (p === 'openai') return callOpenAI(s, u)
  return callYandex(s, u)
}
function parse(raw: string) {
  try { return JSON.parse(raw) } catch { /* */ }
  const m = raw.match(/\{[\s\S]*\}/)
  if (m) { try { return JSON.parse(m[0]) } catch { /* */ } }
  return {}
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const body = await req.json()
    const raw = await callAI(SYSTEM_PROMPT, buildUserPrompt(body))
    const r = parse(raw)
    return json({
      goal: r.goal ?? '',
      intro: r.intro ?? '',
      steps: Array.isArray(r.steps) ? r.steps.map((s: any, i: number) => ({ n: s.n ?? i + 1, horizon: s.horizon ?? '', title: s.title ?? '', desc: s.desc ?? '' })) : [],
      skills: r.skills ?? [],
    })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
