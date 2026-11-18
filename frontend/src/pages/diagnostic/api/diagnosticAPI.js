import { callAiEdgeFunction } from '../../../shared/api'
import { config } from '../../../shared/config'
import { HOLLAND_NOUN, HOLLAND_FULL } from '../model/hollandTypes'

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
  return callAiEdgeFunction({
    explicitUrl: config.analyzeDiagnosticUrl,
    path: 'analyze-diagnostic',
    body: { profile },
    fallback: () => localReport(profile),
  })
}

// ── Локальная генерация (~10 предложений) ─────────────────────
const TYPE = HOLLAND_NOUN
const COG ={ LANG: 'работу со словами', MATH: 'логику и работу с числами', SPAT: 'умение представлять предметы в объёме', KINE: 'обучение через практику', MUSI: 'чувство ритма', SOC: 'понимание людей', SYS: 'умение видеть связи между частями' }
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
  if (profile.career_archetype) s.push(`Твой профиль интересов называется «${profile.career_archetype}». Он объединяет занятия, которые ты чаще выбирал(а) в блоке 2.`)
  if (profile.values_archetype) s.push(`По ответам о ценностях получился профиль «${profile.values_archetype}». Посмотри ниже, что для тебя важнее в будущей работе.`)
  if (cogTop.length) s.push(`В самооценке мышления ты выше остальных отметил(а) ${cogTop.map(c => COG[c] || c).join(' и ')}. Вспомни, в каких школьных заданиях или проектах ты это замечал(а).`)
  if (strengthsScales.length) s.push(`В ответах о характере выделяются ${strengthsScales.join(', ')}. Сравни эти наблюдения с тем, как ты действуешь в жизни.`)
  if (profile.personality_archetype) s.push(`Краткое название твоего профиля характера — «${profile.personality_archetype}». Подробности есть в шкалах ниже.`)
  if (profile.career_execution != null) s.push(`Уверенность действовать — ${profile.career_execution} из 100. Показатель объединяет твою уверенность в своих силах и решительность из блока 7.`)
  const profs = (PROFS[t1] || []).concat(PROFS[t2] || []).slice(0, 3)
  if (profs.length) s.push(`Тебе стоит присмотреться к направлениям, где твои сильные стороны — основа профессии: ${profs.join(', ')}.`)
  s.push('Для начала изучи задачи интересных профессий в атласе. Затем выбери две профессии и построй маршрут: небольшой проект поможет проверить интерес на практике.')
  s.push('Результат можно обсудить с родителем или наставником. Он помогает исследовать варианты, а решение о будущем остаётся за тобой.')

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

  return { full_report: s.join('\n\n'), strengths, weaknesses, recommended_professions }
}

export { HOLLAND_FULL }
