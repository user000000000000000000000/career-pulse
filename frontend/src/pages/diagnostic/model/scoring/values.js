// Скоринг Блока 3 (Ценности). Вынесено из Block3Values.jsx с тремя исправлениями:
//  1. Дихотомия переименована из "духовный/прагматичный" (оценочно нагружено, состав
//     групп был произвольным) в нейтральное "смысл/результат", AK перенесён в "смысл" —
//     активные контакты про вовлечённость с людьми, а не про материальную выгоду.
//  2. Тай-брейк архетипа: раньше побеждал первый в списке ARCHETYPES при равенстве
//     пересечений — теперь считаем явный overlap для всех и обрабатываем ничью честно.
//  3. Формат ответов (попарный выбор) — ипсативный: сумма шкал у каждого человека
//     константна, поэтому явно помечаем это, чтобы UI/ИИ не трактовали значения как
//     абсолютный уровень ("высокая креативность"), а только как относительный приоритет.

export const MEANING_ORIENTED = ['KR', 'RZ', 'DU', 'IN', 'AK']
export const RESULT_ORIENTED = ['PR', 'MB', 'DO']

export const ARCHETYPES = [
  { name: 'Исследователь роста', keys: ['RZ', 'IN', 'DU'] }, { name: 'Лидер достижений', keys: ['DO', 'PR', 'MB'] },
  { name: 'Создатель', keys: ['KR', 'IN', 'RZ'] }, { name: 'Наставник', keys: ['AK', 'DU', 'RZ'] },
  { name: 'Прагматик', keys: ['MB', 'DO', 'PR'] }, { name: 'Свободный художник', keys: ['KR', 'IN', 'DU'] },
  { name: 'Амбассадор', keys: ['AK', 'PR', 'DO'] }, { name: 'Философ', keys: ['DU', 'IN', 'RZ'] },
]

/**
 * @param {object} scales  сырые счётчики побед по 8 шкалам ценностей (макс. 7 каждая)
 * @param {string[]} antiSel 2 антиценности
 * @param {number} durationSec
 */
export function scoreValues({ scales, antiSel, durationSec }) {
  const norm = {}
  for (const [k, v] of Object.entries(scales)) norm[k] = Math.round(v / 7 * 1000) / 10
  const sorted = Object.entries(norm).sort((a, b) => b[1] - a[1])
  const top3 = sorted.slice(0, 3).map(s => s[0])
  const antiTop2 = sorted.slice(-2).map(s => s[0])

  const meaningAvg = MEANING_ORIENTED.reduce((s, k) => s + norm[k], 0) / MEANING_ORIENTED.length
  const resultAvg = RESULT_ORIENTED.reduce((s, k) => s + norm[k], 0) / RESULT_ORIENTED.length
  let motivation_type = 'mixed'
  if (meaningAvg > resultAvg + 15) motivation_type = 'meaning'
  else if (resultAvg > meaningAvg + 15) motivation_type = 'result'

  const matches = ARCHETYPES.map(a => ({ name: a.name, overlap: a.keys.filter(k => top3.includes(k)).length }))
    .filter(m => m.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap)
  let archetype = 'Смешанный профиль'
  if (matches.length) {
    const top = matches[0].overlap
    const tied = matches.filter(m => m.overlap === top)
    archetype = tied.length > 1 ? tied.slice(0, 2).map(m => m.name).join(' / ') : matches[0].name
  }

  const leadGroup = motivation_type === 'result' ? RESULT_ORIENTED : MEANING_ORIENTED
  const leadScores = leadGroup.map(k => norm[k])
  const consistency = Math.round(100 - (Math.max(...leadScores) - Math.min(...leadScores)))

  const flags = []
  if (Object.values(norm).every(v => v >= 35 && v <= 65)) flags.push({ code: 'values_flat_profile', level: 'warning' })
  if (consistency < 50) flags.push({ code: 'values_internal_conflict', level: 'warning' })
  if (durationSec < 180) flags.push({ code: 'values_too_fast', level: 'warning' })

  return {
    ...norm,
    values_top3: top3, values_antitop2: antiTop2, anti_values_chosen: antiSel,
    motivation_type, values_archetype: archetype, values_consistency: consistency,
    values_scale_type: 'ipsative', // относительные веса внутри профиля, не сравнивать между людьми
    flags,
  }
}
