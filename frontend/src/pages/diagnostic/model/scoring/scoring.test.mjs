// Самопроверка скоринга — запуск: `npm test` (node, без фреймворка).
// Ловит тихие ошибки в весах/формулах: выход за диапазон, NaN, деление на ноль,
// неразличимые top-типы. Снапшоты — для известных входов. Расширяется на остальные
// scoring/*.js по тому же шаблону (holland и values — агрегатные, тестируются без QS).
import assert from 'node:assert/strict'
import { scoreHolland } from './holland.js'
import { scoreValues } from './values.js'

let passed = 0
const t = (name, fn) => { fn(); passed++; console.log('  ok —', name) }
const isNum = (x) => typeof x === 'number' && Number.isFinite(x)
const inRange = (x, lo, hi) => isNum(x) && x >= lo && x <= hi

console.log('scoreHolland:')
t('ведущий тип определяется, top2 различны и из RIASEC', () => {
  const r = scoreHolland({ scales: { R: 2, I: 25, A: 18, S: 5, E: 3, C: 1 }, matAnswers: {}, antiSel: [], energySel: [], explorationVal: 3, durationSec: 600 })
  assert.deepEqual(r.holland_top2, ['I', 'A'])          // I максимум, A второй
  assert.equal(r.holland_code, 'IA')
  assert.equal(r.holland_top2[0] !== r.holland_top2[1], true)
  assert.equal(typeof r.career_archetype, 'string')
})
t('метрики в диапазоне и не NaN', () => {
  const r = scoreHolland({ scales: { R: 10, I: 10, A: 10, S: 10, E: 10, C: 10 }, matAnswers: { I: 4 }, antiSel: [], energySel: [], explorationVal: 3, durationSec: 600 })
  assert.equal(inRange(r.profile_clarity, 0, 100), true)
  assert.equal(isNum(r.profile_flexibility), true)
  assert.equal(inRange(r.interest_maturity, 0, 100), true)
  for (const k of ['R', 'I', 'A', 'S', 'E', 'C']) assert.equal(isNum(r[k]), true)
})
t('пустой профиль (все нули) не роняет и не даёт NaN', () => {
  const r = scoreHolland({ scales: { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, matAnswers: {}, antiSel: [], energySel: [], explorationVal: 1, durationSec: 600 })
  assert.equal(inRange(r.profile_clarity, 0, 100), true)
  assert.equal(r.holland_top2.length, 2)
  assert.equal(Array.isArray(r.flags), true)
})

console.log('scoreValues:')
t('top3/antitop2 корректны, ведущая ценность попадает в top3', () => {
  const r = scoreValues({ scales: { KR: 6, AK: 1, RZ: 5, DU: 4, PR: 0, MB: 1, DO: 3, IN: 2 }, antiSel: ['PR', 'MB'], durationSec: 600 })
  assert.equal(r.values_top3.length, 3)
  assert.equal(r.values_top3.includes('KR'), true)      // KR максимум
  assert.equal(r.values_antitop2.length, 2)
  assert.ok(['meaning', 'result', 'mixed'].includes(r.motivation_type))
  assert.equal(typeof r.values_archetype, 'string')
  assert.equal(isNum(r.values_consistency), true)
})
t('пустой профиль ценностей не роняет и не даёт NaN', () => {
  const r = scoreValues({ scales: { KR: 0, AK: 0, RZ: 0, DU: 0, PR: 0, MB: 0, DO: 0, IN: 0 }, antiSel: [], durationSec: 600 })
  assert.equal(isNum(r.values_consistency), true)
  assert.equal(r.values_top3.length, 3)
})

console.log(`\n✔ scoring: ${passed} проверок прошло`)
