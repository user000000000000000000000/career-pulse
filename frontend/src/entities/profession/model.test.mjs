// Самопроверка подбора профессий — запуск: `npm test`.
// Защищает косинус-фит от регрессии: для «узкого» профиля не должны всплывать
// профессии с одним Holland-кодом, а форма профиля должна решать ранжирование.
import assert from 'node:assert/strict'
import { matchProfessions } from './model.js'

let passed = 0
const t = (name, fn) => { fn(); passed++; console.log('  ok —', name) }

console.log('matchProfessions:')
t('tech-профиль (R/I/C) → в топе tech/инженерия, не «узкий» Бухгалтер', () => {
  const top = matchProfessions({ holland_scores: { R: 90, I: 78, C: 82, A: 30, S: 40, E: 45 } }, 8)
  const names = top.map(p => p.name)
  assert.ok(top.every(p => Number.isFinite(p.match) && p.match >= 0 && p.match <= 100))
  assert.ok(names.includes('Backend-разработчик'), 'Backend в топ-8')
  const buh = names.indexOf('Бухгалтер')
  assert.ok(buh === -1 || names.indexOf('Backend-разработчик') < buh, 'Backend выше Бухгалтера')
})
t('социальный профиль (S высокий) → Бухгалтер не в топе', () => {
  const top = matchProfessions({ holland_scores: { R: 20, I: 25, A: 30, S: 90, E: 60, C: 15 } }, 8)
  assert.ok(!top.map(p => p.name).includes('Бухгалтер'))
})
t('пустой holland → пустой список', () => {
  assert.deepEqual(matchProfessions({ holland_scores: {} }, 8), [])
})

console.log(`\n✔ professions: ${passed} проверок прошло`)
