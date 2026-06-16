import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../services/auth'
import '../styles/appnav.css'

// Публичные страницы — там своя навигация, глобальное меню не нужно.
// На /dashboard тоже не показываем: у кабинета есть собственный сайдбар.
const HIDDEN_EXACT = ['/', '/login', '/register', '/dashboard']
function isHidden(path) {
  return HIDDEN_EXACT.includes(path) || path.startsWith('/legal')
}

const LINKS = [
  { to: '/dashboard',  icon: '📊', label: 'Дашборд' },
  { to: '/test',       icon: '🧪', label: 'Пройти диагностику' },
  { to: '/diagnostic', icon: '🧠', label: 'Результаты диагностики' },
  { to: '/roadmap',    icon: '🗺️', label: 'Карьерный маршрут' },
  { to: '/atlas',      icon: '🧭', label: 'Атлас профессий' },
  { to: '/profile',    icon: '⚙️', label: 'Профиль' },
]

export default function AppNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    let alive = true
    getCurrentUser().then(u => { if (alive) setAuthed(!!u) }).catch(() => {})
    return () => { alive = false }
  }, [location.pathname])

  // при переходе на другую страницу закрываем меню
  useEffect(() => { setOpen(false) }, [location.pathname])

  if (isHidden(location.pathname) || !authed) return null

  const go = (to) => { setOpen(false); navigate(to) }
  const onLogout = async () => {
    setOpen(false)
    if (window.confirm('Выйти из аккаунта?')) { try { await doLogout() } finally { navigate('/') } }
  }
  const isActive = (to) =>
    location.pathname === to || (to === '/test' && location.pathname.startsWith('/test'))

  return (
    <>
      <button
        className={'appnav-burger' + (open ? ' is-open' : '')}
        aria-label="Меню навигации"
        onClick={() => setOpen(o => !o)}
      >
        <span></span><span></span><span></span>
      </button>

      {open && <div className="appnav-overlay" onClick={() => setOpen(false)} />}

      <nav className={'appnav-drawer' + (open ? ' open' : '')} aria-hidden={!open}>
        <div className="appnav-head">
          <div className="appnav-logo">CAREER<span>PULSE</span></div>
          <button className="appnav-close" aria-label="Закрыть" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="appnav-links">
          {LINKS.map(l => (
            <button
              key={l.to}
              className={'appnav-item' + (isActive(l.to) ? ' active' : '')}
              onClick={() => go(l.to)}
            >
              <span className="appnav-ic">{l.icon}</span>{l.label}
            </button>
          ))}
          <div className="appnav-div" />
          <button className="appnav-item" onClick={() => go('/')}>
            <span className="appnav-ic">🏠</span>На главную сайта
          </button>
          <button className="appnav-item appnav-danger" onClick={onLogout}>
            <span className="appnav-ic">🚪</span>Выйти
          </button>
        </div>
      </nav>
    </>
  )
}
