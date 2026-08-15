import { callAiEdgeFunction } from './edgeFunction'
import { config } from '../config/config'

/**
 * Генерация карьерного маршрута к выбранным профессиям.
 * Боевой путь — Edge Function `career-roadmap` (YandexGPT), иначе локальный fallback.
 *
 * @param {object} profile      агрегированный профиль из CP
 * @param {string[]} professions 2 выбранные профессии
 * @returns {Promise<{goal, intro, steps:[{n,horizon,title,desc}], skills:[], _source}>}
 */
export async function generateRoadmap(profile, professions) {
  const age = profile?.context?.age
  return callAiEdgeFunction({
    explicitUrl: config.roadmapUrl,
    path: 'career-roadmap',
    body: { profile, professions, age },
    validate: (data) => { if (!data.steps?.length) throw new Error('пустой маршрут') },
    fallback: () => localRoadmap(profile, professions),
  })
}

// ── Локальный fallback (учитывает возраст) ────────────────────
function localRoadmap(profile = {}, professions = []) {
  const age = parseInt(profile?.context?.age, 10) || 16
  const young = age < 15
  const profStr = professions.join(' / ') || 'выбранную сферу'
  const skill1 = (profile.cognitive_top3 || [])[0]
  const COG = { LANG: 'тексты и коммуникацию', MATH: 'логику и математику', SPAT: 'визуальное мышление', KINE: 'практику руками', SOC: 'понимание людей', SYS: 'системное мышление', MUSI: 'чувство ритма' }

  const steps = young ? [
    { n: 1, horizon: 'Сейчас', title: 'Изучи профессии вблизи', desc: `Найди в интернете 3–4 рассказа людей из сфер «${profStr}»: чем они реально занимаются каждый день.` },
    { n: 2, horizon: 'Этот месяц', title: 'Попробуй на практике', desc: 'Запишись на бесплатный мини-курс или кружок по интересной теме — попробовать важнее, чем читать.' },
    { n: 3, horizon: 'Этот год', title: 'Подтяни ключевые предметы', desc: `Сделай упор на школьные предметы, которые ведут в «${profStr}». Регулярность важнее рывков.` },
    { n: 4, horizon: '8–9 класс', title: 'Участвуй в олимпиадах и проектах', desc: 'Возьми один конкурс или проект в год — это и опыт, и строчка в портфолио.' },
    { n: 5, horizon: '8–9 класс', title: 'Собери первое портфолио', desc: 'Сохраняй всё, что делаешь: работы, проекты, сертификаты. Через пару лет это будет твоим козырем.' },
    { n: 6, horizon: '10–11 класс', title: 'Определись с ЕГЭ и вузом', desc: `Подбери 2–3 вуза/колледжа под «${profStr}» и посмотри, какие экзамены нужны.` },
    { n: 7, horizon: 'После школы', title: 'Поступай и пробуй стажировки', desc: 'Поступи на профильное направление и параллельно ищи первые стажировки — опыт решает.' },
  ] : [
    { n: 1, horizon: 'Сейчас', title: 'Разбери профессии изнутри', desc: `Изучи, что реально делают специалисты в «${profStr}», какие навыки и инструменты нужны.` },
    { n: 2, horizon: 'Этот месяц', title: 'Закрой базовый навык', desc: `Начни прокачивать ${skill1 ? COG[skill1] || 'ключевой навык' : 'ключевой навык'} — это твоя сильная сторона по тесту.` },
    { n: 3, horizon: 'Этот год', title: 'Сделай учебный проект', desc: 'Сделай 1–2 реальных проекта по теме и выложи их — это сильнее любого диплома на старте.' },
    { n: 4, horizon: '10–11 класс', title: 'Спланируй ЕГЭ и поступление', desc: `Выбери экзамены и 3 вуза/колледжа под «${profStr}», составь план подготовки.` },
    { n: 5, horizon: 'После школы', title: 'Поступи на профиль', desc: 'Поступи на направление, максимально близкое к выбранной профессии.' },
    { n: 6, horizon: 'Вуз/колледж', title: 'Стажировки и нетворкинг', desc: 'С 1–2 курса бери стажировки и знакомься с людьми из индустрии.' },
    { n: 7, horizon: 'Первая работа', title: 'Входи в профессию', desc: 'Бери junior-позицию или фриланс-заказы — реальная практика ускоряет рост в разы.' },
  ]

  const skills = (profile.cognitive_top3 || []).map(c => COG[c]).filter(Boolean).slice(0, 3)
  if (skills.length < 3) skills.push('самоорганизация', 'коммуникация')

  return {
    goal: `Дойти до профессии в сфере «${profStr}», опираясь на свои сильные стороны.`,
    intro: `Это твой ориентир, а не жёсткий план — шаги можно проходить в своём темпе. Главное — двигаться: каждый пункт приближает тебя к «${profStr}». Не жди идеального момента, начни с первого шага уже сейчас.`,
    steps,
    skills: skills.slice(0, 4),
  }
}
