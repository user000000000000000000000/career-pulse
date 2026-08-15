import { supabase, isSupabaseConfigured } from './supabase'
import { config } from '../config/config'

/**
 * Общий вызов AI Edge Function с локальным фолбэком при недоступности.
 * Раньше сборка URL/токена/заголовков и try/catch → fallback была
 * продублирована по отдельности в diagnosticAPI.js и roadmapAPI.js.
 *
 * @param {object} opts
 *  - explicitUrl : значение VITE_*_URL, если задано (тест функции в обход Supabase Auth)
 *  - path        : путь функции, напр. 'analyze-diagnostic'
 *  - body        : тело запроса (JSON)
 *  - fallback    : () => object — локальный разбор при недоступности функции
 *  - validate    : (data) => void — бросить, если успешный ответ всё равно негодный
 * @returns {Promise<object>} результат с полем _source: 'yandexgpt'|'local-fallback'|'local'
 */
export async function callAiEdgeFunction({ explicitUrl, path, body, fallback, validate }) {
  const baseUrl = config.supabaseUrl
  const useRemote = isSupabaseConfigured || (explicitUrl && baseUrl)

  if (!useRemote) return { ...fallback(), _source: 'local' }

  const fnUrl = explicitUrl || `${baseUrl}/functions/v1/${path}`
  try {
    let token = config.supabaseAnonKey
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      token = session?.access_token || token
    }
    const res = await fetch(fnUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`${path} ${res.status}: ${await res.text().catch(() => '')}`)
    const data = await res.json()
    if (data.error) throw new Error(data.error)
    if (validate) validate(data)
    return { ...data, _source: 'yandexgpt' }
  } catch (e) {
    return { ...fallback(), _source: 'local-fallback', _error: String(e) }
  }
}
