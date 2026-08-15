// Скоринг Блока 4 (Личность / Big Five+). Вынесено из Block4Personality.jsx.
// Исправления:
//  1. Порог рассогласованности direct/reverse поднят с 2 до 3 (на 5-балльной шкале
//     обратные пункты сами по себе шумнее — с 2-3 пунктами на шкалу старый порог
//     слишком часто ложно триггерился на обычном шуме ответов).
//  2. Флаг рассогласования переименован и понижен до 'info' — это не обязательно
//     неискренность, чаще статистический шум малой выборки.
//  3. Индекс социальной желательности: флаг требует ВСЕ 4 крайних ответа (не 3 из 4) —
//     иначе слишком легко ложно сработать на подростке, который просто любит
//     крайние оценки по шкале.
//  4. anxiety убрана из условий архетипов — раньше "Чуткий творец" требовал высокой
//     тревожности, что читается как "тревога — пропуск к творческому типу".
//  5. У каждой шкалы теперь есть itemCount/lowReliability — 5 пунктов на шкалу
//     достаточно для скрининга, но не для клинической точности; это стоит явно
//     помечать для UI и промпта ИИ.

export const MAIN = ['agreeableness', 'conscientiousness', 'extraversion', 'openness', 'stress_resilience', 'anxiety', 'impulse_control', 'ambiguity_tolerance']

export const ARCHETYPES = [
  { name: 'Исследователь возможностей', needs: ['openness', 'ambiguity_tolerance', 'extraversion'] },
  { name: 'Устойчивый лидер', needs: ['stress_resilience', 'extraversion', 'ambiguity_tolerance'] },
  { name: 'Надёжный исполнитель', needs: ['conscientiousness', 'impulse_control'], anti: ['ambiguity_tolerance'] },
  { name: 'Чуткий творец', needs: ['openness', 'agreeableness'] },
  { name: 'Свободный деятель', needs: ['ambiguity_tolerance', 'openness'], anti: ['conscientiousness'] },
]

/**
 * @param {Array<{id:string,s:string,r?:boolean}>} QS  метаданные вопросов (шкала + признак реверса)
 * @param {Record<string, number>} answers  ответы 1-5 по id вопроса
 * @param {number} durationSec
 */
export function scorePersonality({ QS, answers, durationSec }) {
  const scaleItems = {}
  QS.forEach(q => { (scaleItems[q.s] = scaleItems[q.s] || []).push(q) })

  const scores = {}
  MAIN.forEach(scale => {
    let raw = 0
    scaleItems[scale].forEach(q => { let val = answers[q.id] || 3; if (q.r) val = 6 - val; raw += val })
    const p = Math.round((raw - 5) / 20 * 100 * 10) / 10
    scores[scale] = { raw, pct: Math.max(0, Math.min(100, p)), itemCount: scaleItems[scale].length, lowReliability: scaleItems[scale].length < 8 }
  })

  const sjItems = scaleItems['sj'] || []
  const sjScores = sjItems.map(q => answers[q.id] || 3)
  const sjFives = sjScores.filter(v => v === 5).length
  const sjFlag = sjItems.length > 0 && sjFives >= sjItems.length // раньше: >= 3 из 4
  const sjMean = sjScores.reduce((a, b) => a + b, 0) / sjScores.length
  const sincerity = Math.round(100 - (sjMean - 1) / 4 * 100)

  const consistency = {}
  MAIN.forEach(scale => {
    const items = scaleItems[scale]
    const direct = items.filter(q => !q.r).map(q => answers[q.id] || 3)
    const reverse = items.filter(q => q.r).map(q => 6 - (answers[q.id] || 3))
    const dAvg = direct.length ? direct.reduce((a, b) => a + b, 0) / direct.length : 3
    const rAvg = reverse.length ? reverse.reduce((a, b) => a + b, 0) / reverse.length : 3
    consistency[scale] = { delta: Math.round(Math.abs(dAvg - rAvg) * 10) / 10, ok: Math.abs(dAvg - rAvg) <= 3 }
  })

  const ranked = MAIN.filter(s => s !== 'anxiety').map(s => ({ s, pct: scores[s].pct })).sort((a, b) => b.pct - a.pct)
  const top3 = ranked.slice(0, 3).map(r => r.s)

  let archetype = 'Индивидуальный профиль'
  ARCHETYPES.forEach(a => {
    const needsMet = a.needs.every(n => scores[n].pct >= 60)
    const antiMet = !a.anti || a.anti.every(n => scores[n].pct < 40)
    if (needsMet && antiMet) archetype = a.name
  })

  const emotional_profile = {
    anxiety_pct: scores.anxiety.pct,
    resilience_pct: scores.stress_resilience.pct,
    note: scores.anxiety.pct > 65 && scores.stress_resilience.pct < 40 ? 'may_need_support' : null,
  }

  const flags = []
  if (scores.anxiety.pct > 70 && scores.stress_resilience.pct < 40) flags.push({ code: 'high_vulnerability', level: 'critical' })
  if (scores.impulse_control.pct < 30 && scores.conscientiousness.pct < 30) flags.push({ code: 'low_self_regulation', level: 'warning' })
  if (scores.openness.pct < 30) flags.push({ code: 'low_openness', level: 'info' })
  if (sjFlag) flags.push({ code: 'socially_desirable_responding', level: 'info' })
  Object.entries(consistency).forEach(([s, c]) => { if (!c.ok) flags.push({ code: 'possible_inconsistency_' + s, level: 'info' }) })
  if (scores.ambiguity_tolerance.pct > 70 && scores.conscientiousness.pct < 30) flags.push({ code: 'freedom_without_discipline', level: 'info' })

  const scoresFlat = {}
  MAIN.forEach(s => { scoresFlat[s] = scores[s].pct })

  return {
    scores, scoresFlat, archetype, top3, sincerity, sjFlag, consistency, emotional_profile, flags,
  }
}
