/* ───────────────────────────────────────────────
   Блоки теста — 10-блочная система (CareerPulse v2)
   ─────────────────────────────────────────────── */

export const BLOCKS = [
  { id: 'context',       title: 'Анкета-контекст',              icon: '📋' },
  { id: 'holland',       title: 'Склонности (Holland)',          icon: '🧭' },
  { id: 'values',        title: 'Жизненные ценности',           icon: '💎' },
  { id: 'personality',   title: 'Личностные качества',          icon: '🧠' },
  { id: 'intelligence',  title: 'Тип интеллекта',               icon: '⚡' },
  { id: 'readiness',     title: 'Профессиональная готовность',  icon: '🎯' },
  { id: 'self_efficacy', title: 'Самоэффективность',            icon: '💪' },
  { id: 'future',        title: 'Образ будущего',               icon: '🔭' },
  { id: 'social',        title: 'Социальный контекст',          icon: '👥' },
  { id: 'letter',        title: 'Письмо в будущее',             icon: '✍️' },
]

/** Все шкалы — плоский список для инициализации raw */
export const ALL_SCALES = [
  // context
  'grade','plan','career_clarity','anxiety','parent_pressure',
  // holland
  'R','I','A','S','E','C',
  // values
  'KR','AK','RZ','DU','PR','MB','DO','IN',
  // personality
  'AG','CO','EX','OP','ES','AN','SC',
  // intelligence
  'VB','LM','SP','BK','MS','IP','IA',
  // readiness
  'HH','HT','HZ','HO','HP',
  // self_efficacy
  'SE','DEC_A','DEC_I','DEC_AV','DEC_D',
  // future
  'future_clarity','future_type','uncertainty','team_pref',
  // social
  'family_support','social_ease','work_exp','competition',
]

/**
 * Парные шкалы [шкала_A, шкала_B, ключ_стиля]
 * Используются для определения доминирующего полюса.
 */
export const PAIRED_SCALES = [
  ['R', 'S', 'hands_vs_people'],
  ['I', 'E', 'research_vs_lead'],
  ['A', 'C', 'creative_vs_order'],
  ['EX', 'OP', 'social_vs_ideas'],
  ['AG', 'IN', 'cooperation_vs_autonomy'],
  ['SE', 'AN', 'confidence_vs_anxiety'],
  ['DEC_A', 'DEC_I', 'analytical_vs_intuitive'],
]

/** Уровень по процентному значению */
export function levelOf(pct) {
  if (pct >= 70) return 'высокий'
  if (pct >= 40) return 'средний'
  return 'низкий'
}

/** Какие шкалы относятся к какому блоку */
export const BLOCK_SCALES = {
  context:       ['grade', 'plan', 'career_clarity', 'anxiety', 'parent_pressure'],
  holland:       ['R', 'I', 'A', 'S', 'E', 'C'],
  values:        ['KR', 'AK', 'RZ', 'DU', 'PR', 'MB', 'DO', 'IN'],
  personality:   ['AG', 'CO', 'EX', 'OP', 'ES', 'AN', 'SC'],
  intelligence:  ['VB', 'LM', 'SP', 'BK', 'MS', 'IP', 'IA'],
  readiness:     ['HH', 'HT', 'HZ', 'HO', 'HP'],
  self_efficacy: ['SE', 'DEC_A', 'DEC_I', 'DEC_AV', 'DEC_D'],
  future:        ['future_clarity', 'future_type', 'uncertainty', 'team_pref'],
  social:        ['family_support', 'social_ease', 'work_exp', 'competition'],
  letter:        [], // открытые вопросы, анализируются ИИ
}
