// Цикл проверки аналитики: прогоняет синтетические профили ответов через
// исправленные формулы скоринга (frontend/src/utils/scoring/*.js) и проверяет,
// что результаты логичны — границы значений, честный тай-брейк архетипов,
// отсутствие скрытых искажений между несвязанными сигналами.
//
// Запуск: node frontend/scripts/verify-scoring.mjs

import { scoreHolland } from '../src/utils/scoring/holland.js'
import { scoreValues } from '../src/utils/scoring/values.js'
import { scorePersonality } from '../src/utils/scoring/personality.js'
import { scoreCognitive } from '../src/utils/scoring/cognitive.js'
import { scoreReadiness } from '../src/utils/scoring/readiness.js'
import { scoreSelfEfficacy } from '../src/utils/scoring/selfEfficacy.js'

let pass = 0, fail = 0
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  OK   ${name}`) }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`) }
}

// ─────────────────────────────────────────────
console.log('\n[Block2 · Holland]')
{
  // Ведущий тип НЕ 'R' по порядку объекта — раньше баг всегда исключал R из
  // "среднего по остальным" вместо реального лидера. Тут лидер — C.
  const scales = { R: 15, I: 10, A: 5, S: 5, E: 5, C: 25 }
  const matAnswers = { R: 2, I: 2, A: 2, S: 2, E: 2, C: 3 }
  const r = scoreHolland({ scales, matAnswers, antiSel: [], energySel: [], explorationVal: 3, durationSec: 300 })

  check('топ-тип определён верно (C)', r.holland_top2[0] === 'C', r.holland_top2[0])
  check('clarity в границах 0..100', r.profile_clarity >= 0 && r.profile_clarity <= 100, r.profile_clarity)
  check('flexibility в границах 0..1', r.profile_flexibility >= 0 && r.profile_flexibility <= 1, r.profile_flexibility)

  // Ручной расчёт "правильного" clarity — исключаем именно топ (C), не R
  const norm = {}; for (const [k, v] of Object.entries(scales)) norm[k] = Math.round(v / 30 * 100 * 10) / 10
  const sorted = Object.entries(norm).sort((a, b) => b[1] - a[1])
  const rest = sorted.slice(1).map(([, v]) => v)
  const meanRest = rest.reduce((a, b) => a + b, 0) / rest.length
  const std = Math.sqrt(rest.reduce((s, v) => s + (v - meanRest) ** 2, 0) / rest.length) || 1
  const expectedClarity = Math.max(0, Math.min(100, Math.round((sorted[0][1] - meanRest) / std * 100)))
  check('clarity считается от топ-типа, а не от R по умолчанию', r.profile_clarity === expectedClarity, `${r.profile_clarity} vs ${expectedClarity}`)

  // Крайний случай: один тип на максимуме, остальные на нуле — не должно уходить за границы
  const extreme = scoreHolland({ scales: { R: 30, I: 0, A: 0, S: 0, E: 0, C: 0 }, matAnswers, antiSel: [], energySel: [], explorationVal: 3, durationSec: 300 })
  check('экстремальный профиль не ломает границы', extreme.profile_clarity <= 100 && extreme.profile_flexibility >= 0 && extreme.profile_flexibility <= 1)
}

// ─────────────────────────────────────────────
console.log('\n[Block3 · Values]')
{
  // top3 = RZ, IN, DU — ровно совпадает с ключами ДВУХ архетипов одновременно
  // ('Исследователь роста' и 'Философ' — {RZ,IN,DU} у обоих). Раньше побеждал
  // первый в списке молча; теперь должна быть явная ничья.
  const scales = { KR: 1, AK: 1, RZ: 7, DU: 5, PR: 1, MB: 1, DO: 1, IN: 6 }
  const r = scoreValues({ scales, antiSel: ['PR', 'MB'], durationSec: 300 })
  check('архетип показывает обе стороны ничьи', r.values_archetype.includes('/'), r.values_archetype)
  check('ipsative-флаг проставлен', r.values_scale_type === 'ipsative')

  // Смысловая ориентация: высокие KR/RZ/DU/IN/AK, низкие PR/MB/DO
  const meaningScales = { KR: 6, AK: 6, RZ: 6, DU: 6, PR: 0, MB: 0, DO: 0, IN: 6 }
  const rm = scoreValues({ scales: meaningScales, antiSel: ['PR', 'MB'], durationSec: 300 })
  check('AK учтён в "смысловой" группе (а не в результативной)', rm.motivation_type === 'meaning', rm.motivation_type)
}

// ─────────────────────────────────────────────
console.log('\n[Block4 · Personality]')
{
  const MAIN = ['agreeableness', 'conscientiousness', 'extraversion', 'openness', 'stress_resilience', 'anxiety', 'impulse_control', 'ambiguity_tolerance']
  function makeQS() {
    const qs = []
    MAIN.forEach(s => {
      qs.push({ id: s + '_d1', s }, { id: s + '_d2', s }, { id: s + '_d3', s })
      qs.push({ id: s + '_r1', s, r: true }, { id: s + '_r2', s, r: true })
    })
    ;['sj1', 'sj2', 'sj3', 'sj4'].forEach(id => qs.push({ id, s: 'sj' }))
    return qs
  }
  const QS = makeQS()

  // Базовые нейтральные ответы (3) для всех, кроме сценариев ниже
  function baseAnswers() {
    const a = {}
    QS.forEach(q => { a[q.id] = 3 })
    return a
  }

  // Сценарий 1: рассинхрон direct/reverse ровно на границе нового порога (delta=3) — не должен флагаться
  {
    const a = baseAnswers()
    a.agreeableness_d1 = 5; a.agreeableness_d2 = 5; a.agreeableness_d3 = 5 // direct avg 5
    a.agreeableness_r1 = 3; a.agreeableness_r2 = 3 // reverse-recoded: 6-3=3 avg → delta |5-3|=2... подберём точнее ниже
    // Подбираем так, чтобы |dAvg - rRecodedAvg| было ровно 3
    a.agreeableness_r1 = 4; a.agreeableness_r2 = 4 // recoded = 6-4=2 avg=2 → delta=|5-2|=3
    const { flags } = scorePersonality({ QS, answers: a, durationSec: 300 })
    check('delta=3 (новый порог) не флагуется как рассинхрон', !flags.some(f => f.code === 'possible_inconsistency_agreeableness'))
  }
  // Сценарий 2: рассинхрон делта=4 — должен флагаться (мягко, level info)
  {
    const a = baseAnswers()
    a.conscientiousness_d1 = 5; a.conscientiousness_d2 = 5; a.conscientiousness_d3 = 5
    a.conscientiousness_r1 = 5; a.conscientiousness_r2 = 5 // recoded = 6-5=1 → delta=|5-1|=4
    const { flags } = scorePersonality({ QS, answers: a, durationSec: 300 })
    const f = flags.find(f => f.code === 'possible_inconsistency_conscientiousness')
    check('delta=4 флагуется, но уровень info (не критично)', !!f && f.level === 'info', JSON.stringify(f))
  }
  // Сценарий 3: соц. желательность — 3 из 4 "пятёрок" НЕ флагуется (новый порог: все 4)
  {
    const a = baseAnswers()
    a.sj1 = 5; a.sj2 = 5; a.sj3 = 5; a.sj4 = 4
    const { sjFlag } = scorePersonality({ QS, answers: a, durationSec: 300 })
    check('3 из 4 крайних ответов SJ — не флаг (старый порог был бы флагом)', sjFlag === false)
  }
  {
    const a = baseAnswers()
    a.sj1 = 5; a.sj2 = 5; a.sj3 = 5; a.sj4 = 5
    const { sjFlag } = scorePersonality({ QS, answers: a, durationSec: 300 })
    check('4 из 4 крайних ответов SJ — флаг срабатывает', sjFlag === true)
  }
  // Сценарий 4: anxiety отвязана от архетипа "Чуткий творец"
  {
    const a = baseAnswers()
    // openness и agreeableness высокие (нужны для архетипа), anxiety низкая
    ;['openness', 'agreeableness'].forEach(s => { a[s + '_d1'] = 5; a[s + '_d2'] = 5; a[s + '_d3'] = 5; a[s + '_r1'] = 1; a[s + '_r2'] = 1 })
    a.anxiety_d1 = 1; a.anxiety_d2 = 1; a.anxiety_d3 = 1; a.anxiety_r1 = 5; a.anxiety_r2 = 5 // низкая тревожность
    const { archetype, scores } = scorePersonality({ QS, answers: a, durationSec: 300 })
    check('архетип "Чуткий творец" доступен и при низкой тревожности', archetype === 'Чуткий творец', `${archetype}, anxiety=${scores.anxiety.pct}`)
  }
}

// ─────────────────────────────────────────────
console.log('\n[Block5 · Cognitive]')
{
  const SELF_QS = [
    { id: 'l1', s: 'LANG' }, { id: 'l2', s: 'LANG' }, { id: 'l3', s: 'LANG' }, { id: 'l4', s: 'LANG' },
    { id: 'm1', s: 'MUSI' }, { id: 'm2', s: 'MUSI' },
    { id: 'y1', s: 'SYS' }, { id: 'y2', s: 'SYS' }, { id: 'y3', s: 'SYS' }, { id: 'y4', s: 'SYS' },
  ]
  const TASKS = [{ id: 't1', type: 'SYS', correct: 0 }]
  // MUSI выше по самооценке (максимум шкалы), SYS ниже, но у SYS есть верно решённая задача
  const selfAns = { l1: 3, l2: 3, l3: 3, l4: 3, m1: 4, m2: 4, y1: 3, y2: 3, y3: 3, y4: 3 }
  const taskAns = { t1: 0 } // верно
  const r = scoreCognitive({ SELF_QS, TASKS, selfAns, taskAns, varkAns: ['V', 'V', 'A'] })
  check('self_reported_pct и tested_pct разделены', 'self_reported_pct' in r && 'tested_pct' in r)
  check('MUSI не обгоняется SYS из-за бонуса за задачу (ранжирование по самооценке)', r.self_reported_pct.MUSI >= r.self_reported_pct.SYS, `MUSI=${r.self_reported_pct.MUSI} SYS=${r.self_reported_pct.SYS}`)
  check('tested_pct посчитан только для доменов с задачами', r.tested_pct.SYS === 100 && r.tested_pct.MUSI === undefined)
}

// ─────────────────────────────────────────────
console.log('\n[Block6 · Readiness]')
{
  const TYPES = [{ code: 'HH' }, { code: 'HT' }, { code: 'HZ' }, { code: 'HX' }, { code: 'HP' }]
  const QS = []
  TYPES.forEach(t => { QS.push({ id: t.code + '_s1', type: t.code, tag: 'self' }, { id: t.code + '_b1', type: t.code, tag: 'behav' }) })
  const ans = {}
  TYPES.forEach(t => { ans[t.code + '_s1'] = 4; ans[t.code + '_b1'] = 3 })

  const rShort = scoreReadiness({ TYPES, QS, ans, openTexts: ['короткий ответ'], durationSec: 300 })
  const rLong = scoreReadiness({ TYPES, QS, ans, openTexts: ['очень ' + 'длинный '.repeat(60) + 'ответ'], durationSec: 300 })
  check('career_maturity не зависит от длины открытого текста', rShort.career_maturity === rLong.career_maturity, `${rShort.career_maturity} vs ${rLong.career_maturity}`)
  check('hasDetailedAnswer отражает длину текста отдельно от числа', rShort.hasDetailedAnswer === false && rLong.hasDetailedAnswer === true)
}

// ─────────────────────────────────────────────
console.log('\n[Block7 · SelfEfficacy]')
{
  const GEN = [{ id: 'g1' }, { id: 'g2' }]
  const PROF = [
    { id: 'ps1', d: 'S', sub: 'conf' }, { id: 'ps2', d: 'S', sub: 'awar' },
    { id: 'pi1', d: 'I', sub: 'conf' }, { id: 'pi2', d: 'I', sub: 'awar' },
    { id: 'pa1', d: 'A', sub: 'conf' }, { id: 'pa2', d: 'A', sub: 'awar' },
    { id: 'pe1', d: 'E', sub: 'conf' }, { id: 'pe2', d: 'E', sub: 'awar' },
    { id: 'pc1', d: 'C', sub: 'conf' }, { id: 'pc2', d: 'C', sub: 'awar' },
  ]
  const DEC = [{ id: 'r1' }, { id: 'r2' }]
  const CASES = new Array(5)
  const ans = {}
  ;[...GEN, ...PROF, ...DEC].forEach(q => { ans[q.id] = 4 })

  // Слабый перевес (diff=1) — раньше выбрало бы единственного "победителя", теперь должно быть 'mixed'
  const weakLead = scoreSelfEfficacy({ GEN, PROF, DEC, CASES, ans, caseAns: ['analytical', 'analytical', 'intuitive', 'dependent', 'avoidant'] })
  check('слабый перевес (diff=1) → dominant = mixed', weakLead.dominant_style === 'mixed', weakLead.dominant_style)

  // Явный перевес (diff=2+)
  const clearLead = scoreSelfEfficacy({ GEN, PROF, DEC, CASES, ans, caseAns: ['analytical', 'analytical', 'analytical', 'intuitive', 'dependent'] })
  check('явный перевес (diff>=2) → dominant style определён', clearLead.dominant_style === 'analytical', clearLead.dominant_style)

  // career_execution не должен зависеть от того, какой стиль доминирует
  const execA = scoreSelfEfficacy({ GEN, PROF, DEC, CASES, ans, caseAns: ['analytical', 'analytical', 'analytical', 'intuitive', 'dependent'] })
  const execB = scoreSelfEfficacy({ GEN, PROF, DEC, CASES, ans, caseAns: ['dependent', 'dependent', 'dependent', 'impulsive', 'avoidant'] })
  check('career_execution не зависит от стиля решений (убран необоснованный бонус)', execA.career_execution === execB.career_execution, `${execA.career_execution} vs ${execB.career_execution}`)
}

// ─────────────────────────────────────────────
console.log(`\n${pass} OK, ${fail} FAIL\n`)
process.exit(fail > 0 ? 1 : 0)
