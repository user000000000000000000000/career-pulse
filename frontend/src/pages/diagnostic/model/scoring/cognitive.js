// Скоринг Блока 5 (Когнитивный профиль + VARK). Вынесено из Block5Cognitive.jsx.
// Главное исправление: раньше самооценка (Likert) и результат объективных задач
// смешивались в одно число через фиксированный бонус (+10 за верную задачу). При
// 1-2 задачах на домен это (а) статистически ненадёжно, и (б) создавало скрытое
// смещение — домены, для которых вообще есть задача, получали бонус и оттого
// ранжировались выше доменов без задач, независимо от реальной выраженности.
// Теперь показываем self_reported_pct и tested_pct раздельно (как уже сделано в
// Блоке 6 для ability/experience) и ранжируем top3/архетип только по самооценке —
// задачи используются исключительно для флагов расхождения самооценки с фактом.

export const SCALE_NORM = { LANG: { min: 4, range: 12 }, MATH: { min: 4, range: 12 }, SPAT: { min: 4, range: 12 }, KINE: { min: 3, range: 9 }, MUSI: { min: 2, range: 6 }, SOC: { min: 3, range: 9 }, SYS: { min: 4, range: 12 } }
export const ARCHETYPES = [
  { name: 'Аналитик', keys: ['MATH', 'SYS'] }, { name: 'Коммуникатор', keys: ['LANG', 'SOC'] }, { name: 'Визуал-создатель', keys: ['SPAT', 'KINE'] },
  { name: 'Стратег', keys: ['SYS', 'MATH'] }, { name: 'Практик', keys: ['KINE', 'SPAT'] }, { name: 'Исследователь слов', keys: ['LANG', 'SYS'] },
]
const VARK_MAP = ['V', 'A', 'R', 'K']

/**
 * @param {Array<{id:string,s:string}>} SELF_QS
 * @param {Array<{id:string,type:string,correct:number}>} TASKS
 * @param {Record<string,number>} selfAns
 * @param {Record<string,number>} taskAns
 * @param {string[]} varkAns
 */
export function scoreCognitive({ SELF_QS, TASKS, selfAns, taskAns, varkAns }) {
  const scaleItems = {}
  SELF_QS.forEach(q => { (scaleItems[q.s] = scaleItems[q.s] || []).push(selfAns[q.id] || 2) })
  const selfPct = {}
  Object.entries(scaleItems).forEach(([s, vals]) => {
    const raw = vals.reduce((a, b) => a + b, 0); const n = SCALE_NORM[s]
    selfPct[s] = Math.max(0, Math.min(100, Math.round((raw - n.min) / n.range * 1000) / 10))
  })

  const taskCorrect = {}
  TASKS.forEach(t => {
    const c = taskAns[t.id] === t.correct
    ;(taskCorrect[t.type] = taskCorrect[t.type] || { correct: 0, total: 0 }).total++
    if (c) taskCorrect[t.type].correct++
  })
  const testedPct = {}
  Object.entries(taskCorrect).forEach(([s, t]) => { testedPct[s] = Math.round(t.correct / t.total * 1000) / 10 })

  const discrepancies = []
  ;['LANG', 'MATH', 'SPAT', 'SYS', 'SOC'].forEach(s => {
    if (!taskCorrect[s]) return
    const tc = taskCorrect[s]
    if (selfPct[s] > 70 && tc.correct / tc.total < 0.5) discrepancies.push({ type: s, direction: 'overestimate' })
    else if (selfPct[s] < 40 && tc.correct / tc.total > 0.5) discrepancies.push({ type: s, direction: 'underestimate' })
  })

  const sorted = Object.entries(selfPct).sort((a, b) => b[1] - a[1])
  const top3 = sorted.slice(0, 3).map(s => s[0])
  const vark = { V: 0, A: 0, R: 0, K: 0 }
  varkAns.forEach(v => vark[v]++)
  const varkSorted = Object.entries(vark).sort((a, b) => b[1] - a[1])
  let domVark = varkSorted[0][0]
  if (varkSorted[0][1] - varkSorted[1][1] <= 1) domVark = 'multimodal'

  let archetype = 'Мультимодальный мыслитель'
  ARCHETYPES.forEach(a => { if (a.keys.every(k => top3.includes(k))) archetype = a.name })

  const flags = []
  if (Object.values(selfPct).every(v => v < 40)) flags.push({ code: 'cognitive_low_self_image', level: 'warning' })
  const totalCorrect = Object.values(taskCorrect).reduce((s, t) => s + t.correct, 0)
  if (totalCorrect >= 6 && Object.values(selfPct).every(v => v < 40)) flags.push({ code: 'strong_underestimate', level: 'info' })
  discrepancies.forEach(d => flags.push({ code: (d.direction === 'overestimate' ? 'overestimate_' : 'underestimate_') + d.type, level: d.direction === 'overestimate' ? 'warning' : 'info' }))

  return {
    self_reported_pct: selfPct, tested_pct: testedPct,
    cognitive_top3: top3, cognitive_archetype: archetype,
    vark_profile: vark, vark_dominant: domVark, discrepancies, flags,
  }
}
