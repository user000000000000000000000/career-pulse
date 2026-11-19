// Данные для круговых мини-диаграмм блока (топ-3 ведущие шкалы).
// В shared-слое, чтобы использовать и в кабинете (dashboard), и на мини-тесте.
// Названия шкал вшиты здесь (shared не импортирует из pages/entities).

export const HOLLAND = { R: 'Практика и техника', I: 'Исследования', A: 'Творчество', S: 'Помощь людям', E: 'Лидерство', C: 'Порядок и точность' }
export const BIG5 = {
  agreeableness: 'Дружелюбие', conscientiousness: 'Организованность', extraversion: 'Общительность',
  openness: 'Любопытство', stress_resilience: 'Спокойствие при стрессе', anxiety: 'Тревожность',
  impulse_control: 'Самоконтроль', ambiguity_tolerance: 'Гибкость',
}
export const COG = {
  LANG: 'Работа со словом', MATH: 'Логика и числа', SPAT: 'Воображение в объёме', KINE: 'Учёба через действие',
  MUSI: 'Музыкальный слух', SOC: 'Понимание людей', SYS: 'Связи между частями',
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
