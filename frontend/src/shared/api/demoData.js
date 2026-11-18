// Synthetic fixtures, used only by the explicitly selected Vite demo mode.
export const demoUsers = [
  { id: 'demo', full_name: 'Соколова Анна', email: 'anna@example.test', role: 'student', city: 'Москва', pct: 100, has_passed_test: true },
  { id: 'demo-2', full_name: 'Петров Максим', email: 'maxim@example.test', role: 'student', city: 'Санкт-Петербург', pct: 60, has_passed_test: false },
  { id: 'demo-3', full_name: 'Соколова Елена', email: 'elena@example.test', role: 'parent', city: 'Москва', pct: 0, has_passed_test: false },
  { id: 'demo-4', full_name: 'Иванова Мария', email: 'maria@example.test', role: 'specialist', city: 'Казань', pct: 80, has_passed_test: false },
].map(u => ({ ...u, phone: '', created_at: '2026-10-20T10:00:00Z', diagnostic_updated_at: '2026-10-24T12:00:00Z', ai_src: 'demo' }))

export const demoInstitutions = [
  { name: 'Демо · Технологический университет', full_name: 'Демонстрационный технологический университет', type: 'university', city: 'Москва', region: 'Москва' },
  { name: 'Демо · Университет дизайна', full_name: 'Демонстрационный университет дизайна и коммуникаций', type: 'university', city: 'Санкт-Петербург', region: 'Санкт-Петербург' },
  { name: 'Демо · Колледж цифровых профессий', full_name: 'Демонстрационный колледж цифровых профессий', type: 'college', city: 'Казань', region: 'Татарстан' },
  { name: 'Демо · Гуманитарный университет', full_name: 'Демонстрационный гуманитарный университет', type: 'university', city: 'Казань', region: 'Татарстан' },
  { name: 'Демо · Колледж технологий', full_name: 'Демонстрационный колледж технологий', type: 'college', city: 'Москва', region: 'Москва' },
]

export function demoProfileRow() {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback } }
  const user = read('cp_user', {})
  return {
    id: 'demo', full_name: user.name || 'Соколова Анна', email: user.email || 'anna@example.test',
    diagnostic_data: { profile: read('cp_profile', {}), progress: read('cp_progress', { completed: [], pct: 0 }) },
  }
}

export function readDemoFeedback() {
  try { return JSON.parse(localStorage.getItem('demo_feedback')) || [] } catch { return [] }
}
export function saveDemoFeedback(items) { localStorage.setItem('demo_feedback', JSON.stringify(items)) }
