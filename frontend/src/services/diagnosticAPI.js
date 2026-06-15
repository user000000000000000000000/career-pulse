import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Анализ агрегированного профиля диагностики V3.
 *
 * Если Supabase настроен → вызывает Edge Function `analyze-diagnostic`,
 * которая обращается к YandexGPT (ключ серверный) и возвращает
 * развёрнутый разбор (full_report ~10 предложений).
 *
 * Если Supabase не настроен → возвращает локально сгенерированный
 * разбор того же формата, чтобы результаты не были пустыми.
 *
 * @param {object} profile  агрегированный профиль из CP
 * @returns {Promise<{full_report, strengths, weaknesses, recommended_professions, _source}>}
 */
export async function analyzeDiagnostic(profile) {
  // Боевой путь включается, если настроен Supabase ИЛИ явно задан URL функции
  // (последнее позволяет тестировать YandexGPT, не переключая сайт на Supabase-авторизацию).
  const explicitUrl = import.meta.env.VITE_ANALYZE_DIAGNOSTIC_URL
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const useRemote = isSupabaseConfigured || (explicitUrl && baseUrl)

  if (useRemote) {
    const fnUrl = explicitUrl || `${baseUrl}/functions/v1/analyze-diagnostic`
    try {
      let token = import.meta.env.VITE_SUPABASE_ANON_KEY
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession()
        token = session?.access_token || token
      }
      const res = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) throw new Error(`analyze-diagnostic ${res.status}: ${await res.text().catch(() => '')}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      return { ...data, _source: 'yandexgpt' }
    } catch (e) {
      // Падаем в локальный разбор, но помечаем источник, чтобы было видно.
      return { ...localReport(profile), _source: 'local-fallback', _error: String(e) }
    }
  }
  return { ...localReport(profile), _source: 'local' }
}

// ── Локальная генерация (~10 предложений) ─────────────────────
const TYPE = { R: 'практик', I: 'исследователь', A: 'творец', S: 'коммуникатор', E: 'лидер', C: 'систематизатор' }
const TYPE_FULL = { R: 'Реалистичный', I: 'Исследовательский', A: 'Артистичный', S: 'Социальный', E: 'Предпринимательский', C: 'Конвенциональный' }
const COG = { LANG: 'вербальное мышление', MATH: 'логику и работу с числами', SPAT: 'пространственное мышление', KINE: 'обучение через практику', MUSI: 'чувство ритма', SOC: 'понимание людей', SYS: 'системное мышление' }
const PERS = { agreeableness: 'умение ладить с людьми', conscientiousness: 'дисциплину и доведение до конца', extraversion: 'энергию в общении', openness: 'открытость новому', stress_resilience: 'стрессоустойчивость', impulse_control: 'самоконтроль', ambiguity_tolerance: 'спокойствие в неопределённости' }
const PROFS = {
  I: ['Аналитик данных', 'Учёный-исследователь', 'Программист'],
  C: ['Финансовый аналитик', 'Системный администратор', 'Аудитор'],
  A: ['Дизайнер', 'Режиссёр', 'Копирайтер'],
  R: ['Инженер', 'Архитектор', 'Технолог'],
  S: ['Психолог', 'Педагог', 'HR-специалист'],
  E: ['Продакт-менеджер', 'Предприниматель', 'Маркетолог'],
}

function localReport(profile = {}) {
  const top2 = profile.holland_top2 || []
  const t1 = top2[0], t2 = top2[1]
  const cogTop = (profile.cognitive_top3 || []).slice(0, 2)
  const strengthsScales = (profile.top3_strengths || []).map(s => PERS[s]).filter(Boolean)
  const name = profile.context?.name ? profile.context.name.split(' ')[0] : null

  const s = []
  s.push(`${name ? name + ', т' : 'Т'}вой профиль складывается в образ человека, в котором сочетаются ${t1 ? TYPE[t1] : 'разные грани'}${t2 ? ' и ' + TYPE[t2] : ''}.`)
  if (profile.career_archetype) s.push(`По методике Holland ты — «${profile.career_archetype}», и это не ярлык, а описание того, как ты естественно подходишь к делу.`)
  if (profile.values_archetype) s.push(`В ценностях у тебя ведущий мотив — «${profile.values_archetype}»: тебе важно не просто что-то делать, а делать это со смыслом.`)
  if (cogTop.length) s.push(`Сильнее всего у тебя развиты ${cogTop.map(c => COG[c] || c).join(' и ')} — именно на это стоит опираться в учёбе и работе.`)
  if (strengthsScales.length) s.push(`Из личных качеств выделяются ${strengthsScales.join(', ')} — это то, что замечают в тебе окружающие.`)
  if (profile.personality_archetype) s.push(`Как личность ты ближе всего к типу «${profile.personality_archetype}», и в подходящей среде это становится твоей суперсилой.`)
  if (profile.career_execution != null) s.push(`Твой индекс карьерной реализации — ${profile.career_execution} из 100: ты ${profile.career_execution >= 60 ? 'уже умеешь превращать намерения в действия' : 'пока набираешь уверенность, и это нормально для твоего возраста'}.`)
  const profs = (PROFS[t1] || []).concat(PROFS[t2] || []).slice(0, 3)
  if (profs.length) s.push(`Тебе стоит присмотреться к направлениям, где твои сильные стороны — основа профессии: ${profs.join(', ')}.`)
  s.push('Не жди, пока почувствуешь себя «полностью готовым» — пробуй уже сейчас: проекты, стажировки, маленькие шаги дают больше, чем размышления.')
  s.push('Это твой стартовый профиль, и с каждым пройденным блоком он становится точнее — впереди разбор с наставником, который соберёт всё это в конкретный маршрут.')

  const strengths = strengthsScales.length ? strengthsScales.slice(0, 3) : ['целеустремлённость', 'обучаемость', 'ответственность']
  const weaknesses = []
  const ps = profile.personality_scores || {}
  if (ps.conscientiousness != null && ps.conscientiousness < 45) weaknesses.push('доведение задач до конца без внешней структуры')
  if (ps.ambiguity_tolerance != null && ps.ambiguity_tolerance < 45) weaknesses.push('работа в условиях неопределённости')
  if (ps.extraversion != null && ps.extraversion < 40) weaknesses.push('инициатива в новых социальных ситуациях')
  if (!weaknesses.length) weaknesses.push('баланс между глубиной и сроками', 'делегирование')

  const recommended_professions = []
  const matchSeed = profile.profile_clarity || 88
  ;(PROFS[t1] || []).concat(PROFS[t2] || []).slice(0, 6).forEach((p, i) => {
    recommended_professions.push({ name: p, match: Math.max(60, Math.round(matchSeed - i * 4)) })
  })
  if (!recommended_professions.length) recommended_professions.push({ name: 'Карьерный консультант', match: 80 })

  return { full_report: s.join(' '), strengths, weaknesses, recommended_professions }
}

export const HOLLAND_FULL = TYPE_FULL
