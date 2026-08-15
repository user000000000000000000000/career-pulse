// ════════════════════════════════════════════════════════════════
//  Supabase Edge Function: analyze-test
//  ────────────────────────────────────────────────────────────────
//  Поддерживаемые провайдеры (AI_PROVIDER):
//    deepseek  — DeepSeek API (по умолчанию)
//    yandex    — YandexGPT (Yandex Cloud)
//    gigachat  — GigaChat (Сбер)
//    qwen      — Qwen (Alibaba)
//    openai    — OpenAI / совместимые API
//
//  Секреты (задаются через supabase secrets set):
//    AI_PROVIDER=yandex
//    AI_API_KEY=...          (для deepseek/qwen/openai/gigachat)
//    YANDEX_API_KEY=...      (для yandex — IAM или API-key)
//    YANDEX_FOLDER_ID=...    (для yandex)
//    DEEPSEEK_API_KEY=...    (обратная совместимость)
// ════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ALLOWED_ORIGIN — секрет (supabase secrets set ALLOWED_ORIGIN=https://ваш-домен).
// Пока не задан — '*' (как раньше), чтобы не сломать текущий деплой.
const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') || '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' }
  })

// ── Системный промпт (одинаковый для всех провайдеров) ────────
const SYSTEM_PROMPT =
  'Ты — наставник и карьерный консультант, который искренне заинтересован в человеке перед тобой. ' +
  'Твоя задача — не написать клиническое заключение, а поговорить с человеком честно и по-человечески: ' +
  'что в нём есть сильного, куда это может привести, и почему это круто. ' +
  'Тон: тёплый, прямой, без канцелярита. Как умный старший друг, который разбирается в профессиях. ' +
  'Не "рекомендуется рассмотреть", а "вам точно стоит попробовать". ' +
  'Не "у вас выявлен высокий уровень", а "вы явно умеете думать — это редкость". ' +
  'КРИТИЧЕСКИ ВАЖНО: пиши ТОЛЬКО от второго лица — "вы", "ваш", "вам". ' +
  'ЗАПРЕЩЕНО: "он", "она", "этот человек", "испытуемый", "пользователь", "у него", "у неё". ' +
  'В full_report — 3-4 абзаца живого текста. Первый абзац — про то, кто вы есть по сути. ' +
  'Второй — про сильные стороны конкретно. Третий — про профессиональный путь. ' +
  'Четвёртый — поддерживающее завершение, дающее уверенность. ' +
  'ПРИМЕР ПРАВИЛЬНОГО ТОНА full_report: ' +
  '"Вы — человек, которому важно видеть смысл в том, что делаете. Вам мало просто выполнить задачу — ' +
  'вы хотите, чтобы результат был настоящим, чтобы за ним стояло что-то ваше. ' +
  'Это редкое качество, и оно уже сейчас делает вас интереснее большинства. ' +
  'Ваша сила — в умении соединять идеи с людьми. Вы чувствуете, как что-то должно выглядеть и звучать, ' +
  'и можете объяснить это другим — не все на это способны. ' +
  'Вам стоит двигаться туда, где есть свобода для творчества и живой контакт с результатом: ' +
  'дизайн, медиа, коммуникации, продюсирование. Там ваши качества — не бонус, а основа профессии. ' +
  'Вы на правильном пути. Главное — не ждать, пока станете «готовы», а начать делать уже сейчас." ' +
  'ЗАПРЕЩЁННЫЕ ФРАЗЫ: "можно сделать вывод", "следует отметить", "на основании анализа", ' +
  '"рекомендуется рассмотреть", "выявлен высокий уровень", "вам стоит избегать". ' +
  'Ответь СТРОГО валидным JSON без markdown-блоков и лишних пояснений, по схеме: ' +
  '{"strengths": ["...", "...", "..."], "weaknesses": ["...", "..."], ' +
  '"recommended_professions": [{"name": "...", "match": 95}, ...], ' +
  '"full_report": "3-4 абзаца текста"}. ' +
  'В recommended_professions укажи 5-7 профессий по убыванию match (0-100), реалистичных для школьника/абитуриента.'

const SCALE_INFO = {
  // Интересы (вес 35%)
  tech: { block: 'Интересы', name: 'Техника и практика',     desc: 'тяготение к работе с предметным миром, механизмами, технологиями' },
  anal: { block: 'Интересы', name: 'Анализ и исследование',  desc: 'склонность к научному мышлению, поиску закономерностей, работе с данными' },
  crea: { block: 'Интересы', name: 'Творчество',             desc: 'интерес к созданию образов, идей, художественных форм' },
  soc:  { block: 'Интересы', name: 'Коммуникация и помощь',  desc: 'ориентация на людей, общение, поддержку и взаимодействие' },
  lead: { block: 'Интересы', name: 'Лидерство',              desc: 'стремление влиять, убеждать, организовывать других' },
  ord:  { block: 'Интересы', name: 'Порядок и структура',    desc: 'тяготение к системности, планированию, чёткому следованию правилам' },
  // Личностный стиль (вес 15%)
  extro:  { block: 'Личность', name: 'Экстраверсия',          desc: 'восстанавливает энергию через общение, активность' },
  intro:  { block: 'Личность', name: 'Интроверсия',           desc: 'восстанавливает энергию через уединение и рефлексию' },
  logic:  { block: 'Личность', name: 'Логический стиль',      desc: 'решает через факты, анализ, объективные критерии' },
  feel:   { block: 'Личность', name: 'Ценностный стиль',      desc: 'решает с опорой на чувства, отношения, влияние на людей' },
  struct: { block: 'Личность', name: 'Структурированность',   desc: 'предпочитает план, порядок, предсказуемость' },
  flex:   { block: 'Личность', name: 'Гибкость',              desc: 'предпочитает свободу, открытые варианты, адаптацию' },
  stable: { block: 'Личность', name: 'Эмоциональная устойчивость', desc: 'сохраняет спокойствие и продуктивность при стрессе' },
  anxio:  { block: 'Личность', name: 'Тревожность',           desc: 'склонен(а) к переживаниям, прокрутке рисков, потребности в безопасности' },
  selfr:  { block: 'Личность', name: 'Самостоятельность',     desc: 'опирается на себя, берёт личную ответственность' },
  suppo:  { block: 'Личность', name: 'Потребность в поддержке', desc: 'ищет внешнюю обратную связь, совет, опору' },
  // Способности (вес 25%)
  AN: { block: 'Способности', name: 'Аналитические',               desc: 'работа с данными, поиск закономерностей, логические выводы' },
  VC: { block: 'Способности', name: 'Вербально-коммуникативные',   desc: 'объяснение, письмо, убеждение, переговоры' },
  CR: { block: 'Способности', name: 'Креативные',                  desc: 'генерация нестандартных идей, образов, решений' },
  OR: { block: 'Способности', name: 'Организационные',             desc: 'планирование, координация, управление процессами' },
  PT: { block: 'Способности', name: 'Практико-технические',        desc: 'создание, сборка, настройка, ручная работа с результатом' },
  // Поведение (вес 15%)
  IN: { block: 'Поведение', name: 'Инициативность', desc: 'берёт действие на себя, не ждёт команды' },
  SD: { block: 'Поведение', name: 'Самодисциплина', desc: 'следует плану, соблюдает сроки, организован(а)' },
  RS: { block: 'Поведение', name: 'Устойчивость',   desc: 'настойчив(а) при неудачах, ищет обходные пути' },
  CO: { block: 'Поведение', name: 'Командность',    desc: 'сотрудничает, конструктивно просит помощь' },
  RE: { block: 'Поведение', name: 'Ответственность', desc: 'доводит до результата, принимает ответственность за качество' },
  // Ценности (вес 10%)
  M:  { block: 'Ценности', name: 'Доход',           desc: 'финансовая независимость и материальный результат важны' },
  ST: { block: 'Ценности', name: 'Стабильность',    desc: 'ценит надёжность, понятный путь, безопасность' },
  FR: { block: 'Ценности', name: 'Свобода',         desc: 'хочет гибкость, самостоятельность, независимость' },
  PR: { block: 'Ценности', name: 'Признание',       desc: 'важен статус, влияние, заметный результат' },
  HL: { block: 'Ценности', name: 'Польза людям',    desc: 'хочет социального смысла и помощи другим' },
  SR: { block: 'Ценности', name: 'Самовыражение',   desc: 'ценит интерес, внутренний отклик, любимое дело' },
  DV: { block: 'Ценности', name: 'Развитие',        desc: 'хочет учиться, расти, брать сложные задачи' },
}

function levelLabel(pct) {
  if (pct >= 70) return 'высокий'
  if (pct >= 40) return 'средний'
  return 'низкий'
}

function buildUserPrompt(scores, answers, letterAnswers) {
  const blocks = {}
  for (const [key, val] of Object.entries(scores || {})) {
    const info = SCALE_INFO[key]
    if (!info) continue
    if (!blocks[info.block]) blocks[info.block] = []
    blocks[info.block].push(`  ${info.name} (${key}): ${val}% — уровень: ${levelLabel(val)} — ${info.desc}`)
  }

  let prompt = 'РЕЗУЛЬТАТЫ ПСИХОЛОГИЧЕСКОЙ ДИАГНОСТИКИ:\n\n'
  for (const [blockName, lines] of Object.entries(blocks)) {
    prompt += `【${blockName}】\n${lines.join('\n')}\n\n`
  }

  if (Array.isArray(letterAnswers) && letterAnswers.length > 0) {
    prompt += '────────────────────────────────\n'
    prompt += 'ПИСЬМО В БУДУЩЕЕ (ответы на открытые вопросы):\n\n'
    for (const item of letterAnswers) {
      if (item.text && item.text.trim()) {
        prompt += `Вопрос: ${item.question}\nОтвет: ${item.text.trim()}\n\n`
      }
    }
  }

  prompt += '────────────────────────────────\n'
  prompt += 'Сформируй профориентационный разбор и список подходящих профессий на основе всех данных выше.'
  return prompt
}

// ════════════════════════════════════════════════════════════════
//  Провайдеры
// ════════════════════════════════════════════════════════════════

async function callDeepSeek(systemPrompt, userPrompt) {
  const key = Deno.env.get('AI_API_KEY') || Deno.env.get('DEEPSEEK_API_KEY')
  if (!key) throw new Error('Не задан AI_API_KEY для DeepSeek')

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  })
  if (!res.ok) throw new Error(`DeepSeek ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

async function callYandex(systemPrompt, userPrompt) {
  const key      = Deno.env.get('AI_API_KEY') || Deno.env.get('YANDEX_API_KEY')
  const folderId = Deno.env.get('YANDEX_FOLDER_ID')
  if (!key)      throw new Error('Не задан AI_API_KEY для YandexGPT')
  if (!folderId) throw new Error('Не задан YANDEX_FOLDER_ID')

  const res = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Api-Key ${key}`,
      'x-folder-id': folderId
    },
    body: JSON.stringify({
      modelUri: `gpt://${folderId}/yandexgpt/latest`,
      completionOptions: { stream: false, temperature: 0.7, maxTokens: 2000 },
      messages: [
        { role: 'system', text: systemPrompt },
        { role: 'user',   text: userPrompt }
      ]
    })
  })
  if (!res.ok) throw new Error(`YandexGPT ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.result?.alternatives?.[0]?.message?.text ?? '{}'
}

async function callGigaChat(systemPrompt, userPrompt) {
  const clientId     = Deno.env.get('AI_API_KEY')
  const clientSecret = Deno.env.get('GIGACHAT_SECRET')
  if (!clientId || !clientSecret) throw new Error('Не задан AI_API_KEY / GIGACHAT_SECRET для GigaChat')

  // Получаем токен
  const authRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
      RqUID: crypto.randomUUID()
    },
    body: 'scope=GIGACHAT_API_PERS'
  })
  if (!authRes.ok) throw new Error(`GigaChat auth ${authRes.status}: ${await authRes.text()}`)
  const { access_token } = await authRes.json()

  const res = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
    body: JSON.stringify({
      model: 'GigaChat',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7
    })
  })
  if (!res.ok) throw new Error(`GigaChat ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

async function callQwen(systemPrompt, userPrompt) {
  const key = Deno.env.get('AI_API_KEY')
  if (!key) throw new Error('Не задан AI_API_KEY для Qwen')

  const res = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  })
  if (!res.ok) throw new Error(`Qwen ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

async function callOpenAI(systemPrompt, userPrompt) {
  const key     = Deno.env.get('AI_API_KEY')
  const baseUrl = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com'
  const model   = Deno.env.get('AI_MODEL') || 'gpt-4o-mini'
  if (!key) throw new Error('Не задан AI_API_KEY для OpenAI')

  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? '{}'
}

// ── Роутер провайдеров ────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
  const provider = (Deno.env.get('AI_PROVIDER') || 'deepseek').toLowerCase()
  switch (provider) {
    case 'yandex':   return callYandex(systemPrompt, userPrompt)
    case 'gigachat': return callGigaChat(systemPrompt, userPrompt)
    case 'qwen':     return callQwen(systemPrompt, userPrompt)
    case 'openai':   return callOpenAI(systemPrompt, userPrompt)
    default:         return callDeepSeek(systemPrompt, userPrompt)
  }
}

// ── Парсинг ответа (одинаков для всех) ───────────────────────
function parseReport(raw) {
  try { return JSON.parse(raw) } catch {}
  const m = raw.match(/\{[\s\S]*\}/)
  if (m) try { return JSON.parse(m[0]) } catch {}
  return {}
}

// ════════════════════════════════════════════════════════════════
//  Обработчик запросов
// ════════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  try {
    const { scores, answers, letterAnswers, userId } = await req.json()

    const raw    = await callAI(SYSTEM_PROMPT, buildUserPrompt(scores, answers, letterAnswers))
    const report = parseReport(raw)

    const normalized = {
      strengths:               report.strengths               ?? [],
      weaknesses:              report.weaknesses              ?? [],
      recommended_professions: report.recommended_professions ?? [],
      full_report:             report.full_report             ?? ''
    }

    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL'),
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      )
      await supabase.from('test_results').insert({
        user_id: userId,
        scores:  scores ?? {},
        ...normalized
      })
      await supabase.from('profiles').update({ has_passed_test: true }).eq('id', userId)
    }

    return json(normalized)
  } catch (err) {
    return json({ error: String(err) }, 500)
  }
})
