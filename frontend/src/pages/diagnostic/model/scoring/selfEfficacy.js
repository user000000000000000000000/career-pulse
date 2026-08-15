// Скоринг Блока 7 (Самоэффективность). Вынесено из Block7SelfEfficacy.jsx.
// Исправления:
//  1. Всего 5 кейсов на 5 стилей принятия решений — почти гарантированные частые
//     ничьи при выборе "победителя". Теперь стиль считается явным "доминантным"
//     только при отрыве от второго места минимум на 2 кейса из 5; иначе показываем
//     профиль как проценты по всем стилям, а не гадаем победителя.
//  2. career_execution раньше включал бинарный множитель 1/0.3 в зависимости от
//     того, analytical/intuitive ли стиль — необоснованно занижал индекс людям с
//     другими (не менее рабочими) стилями принятия решений. Множитель убран.

export function scoreSelfEfficacy({ GEN, PROF, DEC, CASES, ans, caseAns }) {
  const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length
  const norm = arr => Math.round((mean(arr) - 1) / 4 * 100)

  const seGen = norm(GEN.map(q => ans[q.id] || 3))
  const seConf = {}, seAwar = {}
  ;['S', 'I', 'A', 'E', 'C'].forEach(d => {
    const items = PROF.filter(q => q.d === d)
    seConf[d] = norm(items.filter(q => q.sub === 'conf').map(q => ans[q.id] || 3))
    seAwar[d] = norm(items.filter(q => q.sub === 'awar').map(q => ans[q.id] || 3))
  })
  const decisiveness = norm(DEC.map(q => ans[q.id] || 3))

  const styleCounts = { analytical: 0, avoidant: 0, dependent: 0, intuitive: 0, impulsive: 0 }
  caseAns.forEach(s => styleCounts[s]++)
  const styleShare = {}
  Object.entries(styleCounts).forEach(([k, v]) => { styleShare[k] = Math.round(v / CASES.length * 1000) / 10 })

  const rankedStyles = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])
  const dominant = (rankedStyles[0][1] - rankedStyles[1][1] >= 2) ? rankedStyles[0][0] : 'mixed'

  const exec = [seGen / 100, mean(Object.values(seConf)) / 100, decisiveness / 100]
  const careerExec = Math.round(mean(exec) * 100)

  const flags = []
  if (seGen < 35) flags.push({ code: 'low_self_belief', level: 'warning' })
  if (dominant === 'avoidant') flags.push({ code: 'decision_avoidance', level: 'warning' })
  if (decisiveness < 30) flags.push({ code: 'low_decisiveness', level: 'warning' })
  if (dominant === 'dependent') flags.push({ code: 'dependent_decisions', level: 'info' })

  return {
    se_general: seGen, se_confidence: seConf, se_awareness: seAwar, decisiveness,
    dominant_style: dominant, style_scores: styleCounts, style_share: styleShare,
    career_execution: careerExec, flags,
  }
}
