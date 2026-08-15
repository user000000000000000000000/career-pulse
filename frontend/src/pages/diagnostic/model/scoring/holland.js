// Скоринг Блока 2 (Holland RIASEC). Вынесено из Block2Holland.jsx, чтобы формулу
// можно было прогнать тестами независимо от React-компонента.

export const ARCHETYPE_MAP = {
  RI: 'Инженер-исследователь', IR: 'Инженер-исследователь',
  RA: 'Мастер-создатель', AR: 'Мастер-создатель',
  RS: 'Практик-наставник', SR: 'Практик-наставник',
  RE: 'Технолидер', ER: 'Технолидер',
  RC: 'Техник-системщик', CR: 'Техник-системщик',
  IA: 'Аналитик-творец', AI: 'Аналитик-творец',
  IS: 'Наставник-исследователь', SI: 'Наставник-исследователь',
  IE: 'Стратег-аналитик', EI: 'Стратег-аналитик',
  IC: 'Системный аналитик', CI: 'Системный аналитик',
  AS: 'Творец-наставник', SA: 'Творец-наставник',
  AE: 'Творческий лидер', EA: 'Творческий лидер',
  AC: 'Дизайнер-системщик', CA: 'Дизайнер-системщик',
  SE: 'Лидер-наставник', ES: 'Лидер-наставник',
  SC: 'Организатор заботы', CS: 'Организатор заботы',
  EC: 'Управленец-системщик', CE: 'Управленец-системщик',
}

/**
 * @param {object} scales      сырые суммы по 6 типам R/I/A/S/E/C (макс. 30 каждая)
 * @param {object} matAnswers  зрелость интересов по типу (1-4)
 * @param {string[]} antiSel   3 антиинтереса
 * @param {string[]} energySel 2 источника энергии
 * @param {number} explorationVal 1-5
 * @param {number} durationSec
 */
export function scoreHolland({ scales, matAnswers, antiSel, energySel, explorationVal, durationSec }) {
  const norm = {}
  for (const [k, v] of Object.entries(scales)) norm[k] = Math.round(v / 30 * 100 * 10) / 10
  const sorted = Object.entries(norm).sort((a, b) => b[1] - a[1])
  const top2 = [sorted[0][0], sorted[1][0]]
  const code = top2.join('')
  const archetype = ARCHETYPE_MAP[code] || code

  // ИСПРАВЛЕНО: раньше "среднее по остальным" вычислялось отбрасыванием первого
  // элемента по порядку (R) вместо ведущего типа — clarity была занижена/искажена
  // почти всегда. Теперь явно берём "остальные 5" из отсортированного списка.
  const rest = sorted.slice(1).map(([, v]) => v)
  const mean_rest = rest.reduce((a, b) => a + b, 0) / rest.length
  const std = Math.sqrt(rest.reduce((s, v) => s + (v - mean_rest) ** 2, 0) / rest.length) || 1
  const clarity = Math.max(0, Math.min(100, Math.round((sorted[0][1] - mean_rest) / std * 100)))

  // ИСПРАВЛЕНО: sorted[i][1] — уже проценты (0-100), делить разницу нужно на 100,
  // а не на 30 (это было уместно только для сырых баллов).
  const flexibility = Math.round((1 - (sorted[0][1] - sorted[1][1]) / 100) * 100) / 100

  const matTop = Math.round(((matAnswers[top2[0]] || 2) + (matAnswers[top2[1]] || 2)) / 2 / 4 * 100)

  const vals = Object.values(norm)
  const flags = []
  if (vals.every(v => v < 20)) flags.push({ code: 'holland_flat_profile', level: 'warning' })
  if (Math.abs(sorted[0][1] - sorted[1][1]) < 5) flags.push({ code: 'holland_ambiguous', level: 'info' })
  if (durationSec < 180) flags.push({ code: 'holland_too_fast', level: 'warning' })
  if (antiSel.includes(top2[0])) flags.push({ code: 'holland_self_contradiction', level: 'warning' })
  if (!energySel.includes(top2[0]) && !energySel.includes(top2[1])) flags.push({ code: 'energy_mismatch', level: 'info' })
  if (explorationVal <= 2 && clarity > 80) flags.push({ code: 'uninformed_confidence', level: 'warning' })
  if (matTop < 40) flags.push({ code: 'untested_interests', level: 'info' })

  return {
    ...norm,
    holland_top2: top2, holland_code: code, career_archetype: archetype,
    profile_clarity: clarity, profile_flexibility: flexibility,
    interest_maturity: matTop, anti_interests: antiSel, energy_sources: energySel,
    exploration_index: explorationVal, maturity_raw: { ...matAnswers },
    flags,
  }
}
