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

// ALLOWED_ORIGIN — секрет (supabase secrets set ALLOWED_ORIGIN=https://ваш-домен).
// Пока не задан — '*' (как раньше), чтобы не сломать текущий деплой.
const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const SYSTEM_PROMPT =
  'Ты — карьерный наставник и психолог, который по-человечески говорит с подростком о его профиле. ' +
  'Тон тёплый, прямой, живой, без канцелярита — как умный старший друг, который разбирается в профессиях и искренне на твоей стороне. ' +
  'КРИТИЧЕСКИ ВАЖНО: пиши ТОЛЬКО от второго лица — «ты», «твой», «тебе». ' +
  'ЗАПРЕЩЕНО: «он», «она», «этот человек», «пользователь», «испытуемый». ' +
  'ЗАПРЕЩЁННЫЕ ФРАЗЫ: «можно сделать вывод», «следует отметить», «на основании анализа», «выявлен высокий уровень», «данные показывают». ' +
  'ПИШИ ВСЁ СТРОГО НА РУССКОМ ЯЗЫКЕ. Названия профессий — только по-русски (не «Data Scientist», а «специалист по анализу данных»; не «Product Manager», а «менеджер продукта»). Без английских слов и латиницы в тексте. ' +
  'ВАЖНО про данные профиля: ценностные шкалы (KR/AK/RZ/DU/PR/MB/DO/IN) получены попарным выбором и относительны ДРУГ К ДРУГУ внутри этого же профиля — не утверждай абсолютный уровень («у тебя очень высокая креативность»), а только сравнение важности для этого человека. Если у шкалы указан lowReliability/itemCount < 8 — формулируй помягче («есть признаки», а не категоричное утверждение). ' +
  'Если есть letter_text (письмо в будущее) или open_answers — это ГЛАВНЫЙ источник для тона и содержания: то, что подросток написал своими словами, важнее сухих цифр, опирайся прежде всего на это, передавай смысл его слов. ' +
  'Поле full_report — САМОЕ ГЛАВНОЕ. Это ПОДРОБНЫЙ, развёрнутый текст ОБЪЁМОМ НЕ МЕНЕЕ 3500 символов — 8 полноценных абзацев, по одному на каждую тему ниже. КАЖДУЮ мысль раскрывай на 3–4 полных предложения, с примерами и пояснениями. Краткость, общие фразы и «сжатые» абзацы недопустимы — это ошибка. Пиши тепло, подробно, по-человечески. Абзацы строго по темам: ' +
  '1) КТО ТЫ ПО СУТИ — характер, что тобой движет, как ты смотришь на мир (опираясь на письмо и открытые ответы). ' +
  '2) ТВОИ ИНТЕРЕСЫ И СКЛОННОСТИ — к какой деятельности тебя тянет (Holland-тип), в чём это проявляется в жизни. ' +
  '3) ТВОИ СПОСОБНОСТИ И МЫШЛЕНИЕ — в чём ты силён, как ты думаешь и как тебе легче всего учиться (когнитивный стиль / VARK). ' +
  '4) ТВОЙ ХАРАКТЕР — как ты проявляешься в работе и в команде, какие черты личности тебе помогают. ' +
  '5) ЧТО ТОБОЙ ДВИЖЕТ — ведущие ценности и мотивация (относительно, ипсативно), как это влияет на выбор дела. ' +
  '6) ЗОНЫ РОСТА — что тебе стоит мягко подтянуть, без осуждения, как точку развития. ' +
  '7) КУДА ТЕБЕ РАСТИ ПРОФЕССИОНАЛЬНО и ПОЧЕМУ ИМЕННО ТУДА — свяжи весь профиль с рекомендованными профессиями и подробно объясни логику. ' +
  '8) ПРАКТИЧЕСКИЕ ШАГИ И ЗАВЕРШЕНИЕ — 2–3 конкретных первых действия уже сейчас (проекты, стажировки, что попробовать) и тёплое поддерживающее завершение с уверенностью. ' +
  'Ответь СТРОГО валидным JSON без markdown, по схеме: ' +
  '{"full_report":"8 развёрнутых абзацев, не менее 3500 символов","strengths":["...","...","...","...","..."],"weaknesses":["...","...","..."],' +
  '"recommended_professions":[{"name":"...","match":94}, ...],' +
  '"agency_assessment":{"level":"высокая|средняя|низкая","reason":"1 предложение, на основе тона письма — активный голос и конкретные шаги vs общие/пассивные формулировки"}}. ' +
  'strengths — 5 пунктов, weaknesses — 3 (мягко, как зоны роста). ' +
  'Поле agency_assessment заполняй, только если есть letter_text — иначе оставь level:"unknown", reason:"". ' +
  'В recommended_professions — 6–8 профессий по убыванию match (0–100), реалистичных для школьника/абитуриента. ' +
  'ЕЩЁ РАЗ, САМОЕ ВАЖНОЕ: full_report обязан быть подробным и длинным — НЕ КОРОЧЕ 3500 символов, ВСЕ 8 разделов раскрыты по 3–4 предложения. Короткий разбор не принимается.'

function buildUserPrompt(profile: Record<string, any> = {}) {
  const TYPE = { R: 'Реалистичный', I: 'Исследовательский', A: 'Артистичный', S: 'Социальный', E: 'Предпринимательский', C: 'Конвенциональный' } as Record<string, string>
  const lines: string[] = ['ПРОФИЛЬ ДИАГНОСТИКИ (CareerPulse, 10 блоков):', '']

  if (profile.career_archetype) lines.push(`Карьерный архетип (Holland): ${profile.career_archetype} (код ${profile.holland_code || '—'}, ясность профиля ${profile.profile_clarity ?? '—'}/100)`)
  if (Array.isArray(profile.holland_top2)) lines.push(`Ведущие типы: ${profile.holland_top2.map((t: string) => TYPE[t] || t).join(' + ')}`)
  if (profile.holland_scores) lines.push('Holland по шкалам: ' + Object.entries(profile.holland_scores).map(([k, v]) => `${TYPE[k] || k} ${v}%`).join(', '))
  if (profile.values_archetype) lines.push(`Ценностный архетип: ${profile.values_archetype} (мотивация: ${profile.motivation_type || '—'}, топ: ${(profile.values_top3 || []).join(', ')}, шкала ипсативная — см. инструкцию)`)
  if (profile.personality_archetype) lines.push(`Личностный архетип: ${profile.personality_archetype}`)
  if (profile.personality_scores) lines.push('Личность (Big Five+): ' + Object.entries(profile.personality_scores).map(([k, v]) => `${k} ${v}%`).join(', '))
  if (profile.emotional_profile) lines.push(`Эмоциональный профиль: тревожность ${profile.emotional_profile.anxiety_pct ?? '—'}%, устойчивость ${profile.emotional_profile.resilience_pct ?? '—'}%`)
  if (profile.cognitive_archetype) lines.push(`Когнитивный архетип: ${profile.cognitive_archetype} (стиль обучения: ${profile.vark_style || '—'}, топ по самооценке: ${(profile.cognitive_top3 || []).join(', ')})`)
  if (Array.isArray(profile.readiness_top2)) lines.push(`Профессиональная готовность (топ-2 типа): ${profile.readiness_top2.join(', ')}; зрелость ${profile.career_maturity ?? '—'}/100`)
  if (profile.se_general != null) lines.push(`Самоэффективность: ${profile.se_general}/100, решительность ${profile.decisiveness ?? '—'}/100, стиль решений ${profile.decision_style || '—'}, индекс реализации ${profile.career_execution ?? '—'}/100`)
  if (profile.context) {
    const c = profile.context
    lines.push(`Контекст: возраст ${c.age || '—'}, класс ${c.grade || '—'}, город ${c.city || '—'}, планы ${c.plans_after_school || '—'}`)
  }

  if (Array.isArray(profile.open_answers) && profile.open_answers.length) {
    lines.push('', 'ОТКРЫТЫЕ ОТВЕТЫ (своими словами, из разных блоков):')
    profile.open_answers.forEach((a: { questionId: string; text: string }) => {
      if (a.text && a.text.trim()) lines.push(`— [${a.questionId}] ${a.text.trim()}`)
    })
  }

  if (profile.letter_text) {
    lines.push('', 'ПИСЬМО В БУДУЩЕЕ (полный текст, самое важное для тона разбора):', profile.letter_text)
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
      completionOptions: { stream: false, temperature: 0.7, maxTokens: 5000 },
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
      agency_assessment: r.agency_assessment ?? { level: 'unknown', reason: '' },
    })
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
