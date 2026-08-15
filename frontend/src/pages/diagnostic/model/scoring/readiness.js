// Скоринг Блока 6 (Проф. готовность). Вынесено из Block6Readiness.jsx.
// Исправление: длина открытого текста убрана из числовой формулы career_maturity —
// многословность не равна зрелости, и её не стоило усреднять наравне с реальными
// поведенческими сигналами (опыт, разрыв самооценка/опыт). Теперь это отдельный
// качественный флаг для наставника/ИИ, а не множитель в среднем.

export function scoreReadiness({ TYPES, QS, ans, openTexts, durationSec }) {
  const readiness = {}
  TYPES.forEach(tp => {
    const items = QS.filter(q => q.type === tp.code)
    const selfItems = items.filter(q => q.tag === 'self').map(q => ans[q.id] || 3)
    const behavItems = items.filter(q => q.tag === 'behav').map(q => ans[q.id] || 3)
    const selfAvg = selfItems.reduce((a, b) => a + b, 0) / selfItems.length
    const behavAvg = behavItems.reduce((a, b) => a + b, 0) / behavItems.length
    const abilityPct = Math.round((selfAvg - 1) / 4 * 1000) / 10
    const expPct = Math.round((behavAvg - 1) / 4 * 1000) / 10
    const combined = Math.round((abilityPct * 0.4 + expPct * 0.6) * 10) / 10
    const gap = abilityPct - expPct
    const gapType = gap > 30 ? 'overconfident' : gap < -30 ? 'underconfident' : 'aligned'
    readiness[tp.code] = { ability_pct: abilityPct, experience_pct: expPct, combined, gap: gapType }
  })

  const sorted = Object.entries(readiness).sort((a, b) => b[1].combined - a[1].combined)
  const top2 = sorted.slice(0, 2).map(s => s[0])
  const avgExp = Object.values(readiness).reduce((s, r) => s + r.experience_pct, 0) / 5
  const hasStrong = Object.values(readiness).some(r => r.experience_pct > 60)
  const avgGap = Object.values(readiness).reduce((s, r) => s + Math.abs(r.ability_pct - r.experience_pct), 0) / 5
  const maturitySignals = [Math.min(avgExp / 100, 1), hasStrong ? 1 : 0.3, Math.max(1 - avgGap / 100, 0)]
  const careerMaturity = Math.round(maturitySignals.reduce((a, b) => a + b, 0) / maturitySignals.length * 100)

  const openLen = openTexts.reduce((s, t) => s + t.length, 0)
  const hasDetailedAnswer = openLen > 200 // качественная заметка, не влияет на число

  const flags = []
  Object.entries(readiness).forEach(([code, r]) => {
    if (r.gap === 'overconfident') flags.push({ code: 'overconfident_' + code, level: 'info' })
    if (r.gap === 'underconfident') flags.push({ code: 'underconfident_' + code, level: 'info' })
  })
  if (durationSec < 180) flags.push({ code: 'readiness_too_fast', level: 'warning' })

  return { readiness_scores: readiness, readiness_top2: top2, career_maturity: careerMaturity, hasDetailedAnswer, flags }
}
