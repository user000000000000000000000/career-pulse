import { QUESTION_BANK } from '../data/questions'
import { ALL_SCALES, PAIRED_SCALES, BLOCK_SCALES, levelOf } from '../data/scoring'

// Быстрый доступ к вопросу по id
const BY_ID = Object.fromEntries(QUESTION_BANK.map(q => [q.id, q]))

/**
 * Подсчёт баллов по ответам.
 * @param {Array<{questionId: string, selectedOption: number}>} answers
 * @returns {{
 *   raw: Record<string, number>,        // сырые суммы по шкалам
 *   scores: Record<string, number>,     // нормировано 0..100
 *   levels: Record<string, string>,     // низкий|средний|высокий
 *   styles: Record<string, object>,     // итог по парным шкалам
 *   contradictions: string[],           // выявленные противоречия
 *   answeredCount: number
 * }}
 */
export function calculateScores(answers = []) {
  const raw = Object.fromEntries(ALL_SCALES.map(s => [s, 0]))

  for (const a of answers) {
    const q = BY_ID[a.questionId]
    if (!q) continue
    const opt = q.options[a.selectedOption]
    if (!opt || !opt.scores) continue
    for (const [scale, val] of Object.entries(opt.scores)) {
      raw[scale] = (raw[scale] || 0) + val
    }
  }

  // Нормировка 0..100 относительно максимума внутри каждого блока.
  const scores = {}
  for (const [blockId, scales] of Object.entries(BLOCK_SCALES)) {
    const max = Math.max(1, ...scales.map(s => raw[s] || 0))
    for (const s of scales) {
      scores[s] = Math.round(((raw[s] || 0) / max) * 100)
    }
  }

  const levels = Object.fromEntries(
    Object.entries(scores).map(([s, v]) => [s, levelOf(v)])
  )

  // Парные шкалы → доминирующий полюс + перевес в %.
  const styles = {}
  for (const [left, right, key] of PAIRED_SCALES) {
    const l = raw[left] || 0
    const r = raw[right] || 0
    const total = l + r
    styles[key] = {
      dominant: l >= r ? left : right,
      leftScale: left,
      rightScale: right,
      balance: total ? Math.round((Math.max(l, r) / total) * 100) : 50
    }
  }

  // Простейшая эвристика противоречий: обе стороны пары сильны.
  const contradictions = []
  for (const [left, right] of PAIRED_SCALES) {
    if ((raw[left] || 0) >= 4 && (raw[right] || 0) >= 4) {
      contradictions.push(`${left}/${right}`)
    }
  }

  return {
    raw,
    scores,
    levels,
    styles,
    contradictions,
    answeredCount: answers.length
  }
}
