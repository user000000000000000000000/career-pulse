export const BLOCKS = [
  { id: 'interests',   title: 'Интересы и склонности',    icon: '💡', weight: 35 },
  { id: 'personality', title: 'Личностный стиль',          icon: '🧠', weight: 15 },
  { id: 'abilities',   title: 'Способности',               icon: '⚡', weight: 25 },
  { id: 'behavior',    title: 'Поведенческие паттерны',    icon: '🎯', weight: 15 },
  { id: 'values',      title: 'Ценности и мотивация',      icon: '💎', weight: 10 },
  { id: 'letter',      title: 'Письмо в будущее',          icon: '✍️', weight: 0, special: true },
]

export const ALL_SCALES = [
  'tech','anal','crea','soc','lead','ord',
  'extro','intro','logic','feel','struct','flex','stable','anxio','selfr','suppo',
  'AN','VC','CR','OR','PT',
  'IN','SD','RS','CO','RE',
  'M','ST','FR','PR','HL','SR','DV',
]

export const BLOCK_SCALES = {
  interests:   ['tech','anal','crea','soc','lead','ord'],
  personality: ['extro','intro','logic','feel','struct','flex','stable','anxio','selfr','suppo'],
  abilities:   ['AN','VC','CR','OR','PT'],
  behavior:    ['IN','SD','RS','CO','RE'],
  values:      ['M','ST','FR','PR','HL','SR','DV'],
  letter:      [],
}

export function levelOf(pct) {
  if (pct >= 70) return 'высокий'
  if (pct >= 40) return 'средний'
  return 'низкий'
}

export const ARCHETYPES = [
  { key: 'analyst',   label: 'Аналитик-исследователь', scales: ['anal','AN'],    directions: ['IT', 'аналитика', 'data-science', 'инженерные роли'] },
  { key: 'helper',    label: 'Коммуникатор-помощник',  scales: ['soc','VC','HL'], directions: ['педагогика', 'психология', 'HR', 'социальные проекты'] },
  { key: 'leader',    label: 'Лидер-организатор',      scales: ['lead','OR','PR','M'], directions: ['предпринимательство', 'маркетинг', 'управление'] },
  { key: 'creative',  label: 'Творец',                 scales: ['crea','CR','FR','SR'], directions: ['дизайн', 'медиа', 'контент', 'креативные индустрии'] },
  { key: 'organizer', label: 'Администратор-системщик', scales: ['ord','OR','ST'], directions: ['экономика', 'логистика', 'администрирование'] },
  { key: 'engineer',  label: 'Инженер-практик',        scales: ['tech','PT','SD'], directions: ['инженерия', 'технические специальности', 'производство'] },
]

export const PAIRED_SCALES = [
  ['extro', 'intro', 'energy'],
  ['logic', 'feel', 'decisions'],
  ['struct', 'flex', 'structure'],
  ['stable', 'anxio', 'resilience'],
  ['selfr', 'suppo', 'autonomy'],
]
