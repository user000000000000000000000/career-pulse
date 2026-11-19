import assert from 'node:assert/strict'
import { professionMatchSignals, matchProfessions } from '../src/entities/profession/model.js'
import { buildPersonalityPortrait, buildCognitivePortrait } from '../src/pages/diagnostic/model/resultsPlain.js'
import { blockSummary } from '../src/shared/lib/blockSummary.js'

// Explanations must preserve zero scores and the exact readiness input used by ranking.
const profile = { holland_scores: { I: 80, R: 0 }, readiness_scores: { HT: { combined: 0 } } }
const profession = { holland: ['I', 'R'], category: 'IT' }
assert.deepEqual(professionMatchSignals(profile, profession), {
  interests: [{ code: 'I', value: 80 }, { code: 'R', value: 0 }], readiness: 0,
})
assert.equal(professionMatchSignals({ holland_scores: {} }, profession).readiness, null)
const before = JSON.stringify(profile)
const ranking = matchProfessions(profile)
professionMatchSignals(profile, profession)
assert.equal(JSON.stringify(profile), before)
assert.deepEqual(matchProfessions(profile), ranking)

// Low results must not become categorical claims about high abilities or character.
const personality = buildPersonalityPortrait({ openness: 12, anxiety: 5 }, ['openness', 'anxiety'])
assert.ok(personality.includes('12/100'))
assert.ok(!personality.includes('Обычно ты'))
assert.ok(buildCognitivePortrait([['MATH', 0]]).includes('0/100'))
assert.ok(blockSummary(6, { career_maturity: 0 }).includes('0/100'))
console.log('Result explanations: zero/missing data, unchanged ranking, relative portraits and saved block fields passed.')
