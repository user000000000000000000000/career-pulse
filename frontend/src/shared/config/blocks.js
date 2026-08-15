/**
 * Единый реестр 10 диагностических блоков — ЕДИНСТВЕННЫЙ источник правды.
 * Раньше данные дублировались в cpStorage.js (BLOCKS_META) и Dashboard.jsx (BLOCKS)
 * и расходились: ось блоков 4/6/7/9/10 и время блока 6. Сведено к одной таблице.
 *
 * Оси (утверждено владельцем): НАДО / ХОЧУ / МОГУ / ВОЗМОЖНОСТИ / КТО Я.
 * cpStorage и Dashboard теперь импортируют отсюда — расхождение невозможно.
 */

// Цвет оси — консистентно по всей таблице (один цвет на одну ось).
export const AXIS_COLOR = {
  'НАДО':        'var(--sub)',
  'ХОЧУ':        'var(--accent)',
  'МОГУ':        'var(--ember)',
  'ВОЗМОЖНОСТИ': 'var(--violet)',
  'КТО Я':       'var(--gold)',
}

const RAW = [
  { n: 1,  axis: 'НАДО',        title: 'Анкета-контекст',            questions: 20, time: 7,  method: 'Synergystart + собств.',     hasAI: false, weight: 8,  required: true,
    desc: 'Класс, ЕГЭ, планы, тревоги. Настраивает все остальные блоки под тебя. Проходится первой.' },
  { n: 2,  axis: 'ХОЧУ',        title: 'Склонности в деятельности',  questions: 30, time: 10, method: 'Holland RIASEC + Голомшток', hasAI: false, weight: 15,
    desc: 'Holland RIASEC: попарный выбор занятий с силой предпочтения. Даёт карьерный архетип.' },
  { n: 3,  axis: 'ХОЧУ',        title: 'Жизненные ценности',         questions: 28, time: 10, method: 'Мотив. карта (адапт.)',      hasAI: false, weight: 10,
    desc: 'Ситуационные дилеммы. Топ-3 ценности, мотивационный профиль и согласованность.' },
  { n: 4,  axis: 'КТО Я',       title: 'Личностные качества',        questions: 44, time: 12, method: 'Big Five + EPI + Кеттелл',   hasAI: false, weight: 12,
    desc: 'Big Five + стрессоустойчивость и толерантность к неопределённости. С контролем искренности.' },
  { n: 5,  axis: 'МОГУ',        title: 'Когнитивный профиль',        questions: 40, time: 12, method: 'Гарднер + VARK + задачи',    hasAI: false, weight: 10,
    desc: 'Самооценка мышления + практические задачи + стиль обучения VARK.' },
  { n: 6,  axis: 'ВОЗМОЖНОСТИ', title: 'Профессиональная готовность', questions: 32, time: 12, method: 'Вектор + JamSkills',        hasAI: true,  weight: 13,
    desc: 'Что реально получается: самооценка + реальный опыт по 5 типам деятельности.' },
  { n: 7,  axis: 'ВОЗМОЖНОСТИ', title: 'Самоэффективность',          questions: 39, time: 10, method: 'Бандура + JamSkills',        hasAI: false, weight: 10,
    desc: 'Уверенность в силах + стиль принятия решений (Бандура). Матрица Хочу–Могу–Верю.' },
  { n: 8,  axis: 'ХОЧУ',        title: 'Образ будущего',             questions: 16, time: 8,  method: 'Собственная',               hasAI: true,  weight: 7,
    desc: 'Какой ты видишь работу и жизнь. Параметры-фильтры + смысловой вектор.' },
  { n: 9,  axis: 'КТО Я',       title: 'Социальный контекст',        questions: 25, time: 8,  method: 'Собственная',               hasAI: true,  weight: 8,
    desc: 'Семья, окружение, опыт и поддержка. Полная картина для наставника.' },
  { n: 10, axis: 'КТО Я',       title: 'Письмо в будущее',           questions: 19, time: 25, method: 'Нарративная психология',    hasAI: true,  weight: 7,  special: true,
    desc: '19 открытых вопросов. Рефлексивная практика — самый ценный источник данных для эксперта.' },
]

// Обогащённый список для UI (Dashboard): + num (строкой) и axisColor из оси.
export const BLOCKS = RAW.map((b) => ({
  ...b,
  num: String(b.n).padStart(2, '0'),
  axisColor: AXIS_COLOR[b.axis],
}))

// Форма для cpStorage (ключ = номер блока).
export const BLOCKS_META = Object.fromEntries(
  RAW.map((b) => [b.n, { name: b.title, questions: b.questions, time: b.time, method: b.method, hasAI: b.hasAI, axis: b.axis }])
)

export const BLOCK_ORDER = RAW.map((b) => b.n)          // 1 → 10
export const TOTAL_BLOCKS = RAW.length                  // 10
export const CONSULTATION_REQUIRED = [1, 2, 3, 4, 10]   // минимум для консультации
