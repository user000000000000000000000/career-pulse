import IconText from '../../shared/ui/IconText.jsx'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { prepareDemo } from './bootstrap'
import './demo.css'
import { CP } from '../../shared/api'

const PAGES = [
  ['/', 'Главная'], ['/dashboard', 'Кабинет'], ['/profile', 'Профиль'],
  ['/diagnostic', 'Результаты'], ['/roadmap', 'Карьерный маршрут'], ['/atlas', 'Атлас'],
  ['/professions', 'Профессии'], ['/vuzy', 'Вузы'], ['/proba/result', 'Мини-тест'],
  ['/r/demo', 'Публичный результат'], ['/child/demo', 'Результат ребёнка'],
  ['/result', 'Прежний результат'], ['/admin', 'Администратор'],
  ['/login', 'Вход'], ['/register', 'Регистрация'], ['/reset-password', 'Новый пароль'],
  ['/vk-consent', 'Согласие VK'], ['/legal', 'Документы'],
]

export default function DemoControls() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  async function restore() {
    setBusy(true)
    await prepareDemo(true)
    window.location.assign(import.meta.env.BASE_URL + 'dashboard')
  }
  async function startFresh() {
    setBusy(true)
    await CP.clearAll()
    await CP.saveUser({ name: 'Соколова Анна', email: 'anna@example.test', role: 'student' })
    localStorage.setItem('cp_tour_seen', '1')
    window.location.assign(import.meta.env.BASE_URL + 'test/1')
  }
  return <aside className="demo-tools" aria-label="Управление демонстрацией">
    <button className="demo-toggle" aria-expanded={open} onClick={() => setOpen(!open)}><span aria-hidden="true"><IconText text={"◉"} /></span> Демо · Все страницы</button>
    {open && <div className="demo-panel">
      <div className="demo-panel-head"><strong>Демонстрация дизайна</strong><button aria-label="Закрыть панель демо" onClick={() => setOpen(false)}><IconText text={"×"} /></button></div>
      <p>Данные хранятся в этом браузере. Письма и запросы на рабочий сервер не отправляются.</p>
      <nav>{PAGES.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)}><IconText text={label} /></Link>)}</nav>
      <div className="demo-tests">Диагностика: {Array.from({ length: 10 }, (_, i) => <Link key={i} to={'/test/' + (i + 1)} onClick={() => setOpen(false)}>{i + 1}</Link>)}</div>
      <button className="demo-restore" onClick={restore} disabled={busy}>{busy ? 'Подготавливаем…' : 'Восстановить пример профиля'}</button>
      <button className="demo-fresh" onClick={startFresh} disabled={busy}>Начать новую диагностику</button>
      <small>VK, письма и внешние сервисы проверяются отдельно с тестовым сервером.</small>
    </div>}
  </aside>
}
