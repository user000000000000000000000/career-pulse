// Данные для круговых мини-диаграмм блока (топ-3 ведущие шкалы).
// В shared-слое, чтобы использовать и в кабинете (dashboard), и на мини-тесте.
// Названия шкал вшиты здесь (shared не импортирует из pages/entities).

const HOLLAND = { R: 'Реалистичный', I: 'Исследоват.', A: 'Артистичный', S: 'Социальный', E: 'Предприимч.', C: 'Конвенц.' }
export const BIG5 = {
  agreeableness: 'Дружелюбие', conscientiousness: 'Добросовестность', extraversion: 'Экстраверсия',
  openness: 'Открытость', stress_resilience: 'Стрессоустойч.', anxiety: 'Тревожность',
  impulse_control: 'Самоконтроль', ambiguity_tolerance: 'Гибкость',
}
export const COG = {
  LANG: 'Языки', MATH: 'Логика', SPAT: 'Пространство', KINE: 'Моторика',
  MUSI: 'Музыка', SOC: 'Социальный', SYS: 'Системность',
}

// r — сохранённые scores блока (форма из cpStorage). Пусто → нечего рисовать.
export function blockRings(n, r = {}) {
  switch (Number(n)) {
    case 2:
      return ['R', 'I', 'A', 'S', 'E', 'C']
        .map(k => ({ label: HOLLAND[k] || k, value: r[k] || 0 }))
        .sort((a, b) => b.value - a.value).slice(0, 3)
    case 4:
      return (r.top3_strengths || []).map(k => ({ label: BIG5[k] || k, value: r[k] || 0 })).filter(d => d.value > 0)
    case 5:
      return (r.cognitive_top3 || []).map(k => ({ label: COG[k] || k, value: r.self_reported_pct?.[k] || 0 })).filter(d => d.value > 0)
    default:
      return []
  }
}
