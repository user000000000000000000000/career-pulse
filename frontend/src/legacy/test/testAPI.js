import { supabase, isSupabaseConfigured } from '../../shared/api/supabase'

/**
 * Отправляет результаты теста на анализ.
 *
 * В проде вызывается Supabase Edge Function `analyze-test`, которая
 * обращается к DeepSeek API серверным ключом (ключ НЕ хранится во фронтенде)
 * и сохраняет результат в таблицу test_results.
 *
 * Если Supabase не настроен — возвращается локальная заглушка-отчёт,
 * чтобы можно было пройти весь сценарий без бэкенда.
 *
 * @param {{ scores: object, answers: array, userId?: string }} payload
 * @returns {Promise<{strengths, weaknesses, recommended_professions, full_report}>}
 */
export async function analyzeTest({ scores, answers, userId }) {
  if (!isSupabaseConfigured) {
    return mockReport(scores)
  }

  const fnUrl =
    import.meta.env.VITE_ANALYZE_FUNCTION_URL ||
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-test`

  const { data: { session } } = await supabase.auth.getSession()

  const res = await fetch(fnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({ scores, answers, userId })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Сервис анализа недоступен (${res.status}). ${text}`)
  }
  return res.json()
}

/* Локальная заглушка отчёта — на основе самых сильных шкал. */
function mockReport(scores = {}) {
  const top = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k)

  const map = {
    L: 'лидерство и организация людей',
    A: 'аналитическое мышление',
    AN: 'работа с данными и аналитика',
    C: 'творческий подход',
    CR: 'креативность',
    S: 'коммуникация и помощь людям',
    VC: 'вербально-коммуникативные навыки',
    T: 'технические задачи',
    O: 'систематизация и порядок',
    OR: 'организаторские способности'
  }
  const strengths = top.map(k => map[k] || k).slice(0, 3)

  return {
    strengths: strengths.length ? strengths : ['целеустремлённость', 'обучаемость', 'ответственность'],
    weaknesses: ['делегирование задач', 'работа в условиях неопределённости'],
    recommended_professions: ['Продакт-менеджер', 'Бизнес-аналитик', 'Карьерный консультант'],
    full_report:
      'Демо-отчёт (Supabase/DeepSeek не подключены). По результатам теста выделяются сильные ' +
      `стороны: ${strengths.join(', ') || '—'}. ` +
      'Подключите Supabase и DeepSeek API, чтобы получать полноценный персонализированный анализ ' +
      'на 3–4 абзаца с разбором личности, зон роста и подходящих карьерных траекторий.'
  }
}
