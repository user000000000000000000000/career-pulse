import IconText from '../shared/ui/IconText.jsx'
import Icon from '../shared/ui/Icon.jsx'
import DrawerJourney from '../shared/ui/DrawerJourney.jsx'
import BrandMark from '../shared/ui/BrandMark.jsx'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../shared/auth'
import { checkIsAdmin } from '../shared/api'
import { confirmDialog } from '../shared/ui/Dialog.jsx'
import './appnav.css'

// Публичные страницы — там своя навигация, глобальное меню не нужно.
const HIDDEN_EXACT = ['/', '/login', '/register']
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const drawerRef = useRef(null)
  const triggerRef = useRef(null)
  const [menuHost, setMenuHost] = useState(null)

  useEffect(() => {
    setMenuHost(document.getElementById('site-menu-slot'))
  }, [location.pathname])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const root = document.getElementById('root')
    const previousInert = root?.inert
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    if (root) root.inert = true
    const onKey = (event) => {
      if (event.key === 'Escape') { setOpen(false); return }
      if (event.key !== 'Tab') return
      const buttons = drawerRef.current?.querySelectorAll('a[href], button:not(:disabled)')
      if (!buttons?.length) return
      const first = buttons[0], last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      if (root) root.inert = previousInert
      document.removeEventListener('keydown', onKey)
      triggerRef.current?.focus()
    }
  }, [open])

  useEffect(() => {
    let alive = true
    getCurrentUser().then(u => { if (alive) { setAuthed(!!u); setUserRole(u?.role || '') } }).catch(() => {})
    checkIsAdmin().then(a => { if (alive) setIsAdmin(a) }).catch(() => {})
    return () => { alive = false }
  }, [location.pathname])

  // при переходе на другую страницу закрываем меню
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Закрытую панель делаем inert: убираем из фокуса и от скринридеров без
  // конфликта aria-hidden с сфокусированным элементом внутри.
  useEffect(() => {
    const el = drawerRef.current
    if (!el) return
    if (open) { el.removeAttribute('inert'); el.querySelector('button')?.focus() }
    else {
      if (el.contains(document.activeElement)) document.activeElement.blur()
      el.setAttribute('inert', '')
    }
  }, [open])

  if (isHidden(location.pathname) || !authed) return null
  // The full dashboard owns its existing sidebar; other routes and the role
  // placeholder screens keep this global drawer. Never show both systems.
  if (location.pathname === '/dashboard' && userRole !== null && !['hr', 'entrepreneur'].includes(userRole)) return null

  const go = (to) => { setOpen(false); navigate(to) }
  const onLogout = async () => {
    setOpen(false)
    if (await confirmDialog({ title: 'Выход', message: 'Выйти из аккаунта?', confirmText: 'Выйти', danger: true })) {
      try { await doLogout() } finally { navigate('/') }
    }
  }
  const isActive = (to) =>
    location.pathname === to || (to === '/test' && location.pathname.startsWith('/test'))

  const trigger = <button
        ref={triggerRef}
        className="dashboard-menu-toggle"
        aria-label="Меню навигации"
        aria-expanded={open}
        aria-controls="appnav-menu"
        onClick={() => setOpen(o => !o)}
      >
        <Icon name={open ? 'close' : 'menu'} size={20}/>
      </button>
  const drawer = <>
      {open && <div className="appnav-overlay" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div id="appnav-menu" role="dialog" aria-modal={open ? 'true' : undefined} aria-label="Личный кабинет" ref={drawerRef} className={'appnav-drawer navigation-panel' + (open ? ' open' : '')}>
        <div className="appnav-head">
          <div className="appnav-logo"><BrandMark /><span>Пульс <b>Карьеры</b></span></div>
          <button className="appnav-close" aria-label="Закрыть" onClick={() => setOpen(false)}><Icon name="close" /></button>
        </div>
        <nav className="appnav-links" aria-label="Навигация по кабинету">
          {open && <DrawerJourney onNavigate={() => setOpen(false)} />}
          <div className="appnav-section-label">МОЯ КАРЬЕРА</div>
          {LINKS.map((l, index) => (
            <div key={l.to}>
            {index === 5 && <div className="appnav-section-label appnav-section-label--account">АККАУНТ</div>}
            <button
              className={'appnav-item nav-panel-item' + (isActive(l.to) ? ' active' : '')}
              aria-current={isActive(l.to) ? 'page' : undefined}
              onClick={() => go(l.to)}
            >
              <span className="appnav-ic nav-panel-icon"><IconText text={l.icon} /></span><span className="appnav-label">{l.label}</span><span className="appnav-arrow" aria-hidden="true"><IconText text={"›"} /></span>
            </button>
            </div>
          ))}
          {isAdmin && (
            <button
              className={'appnav-item nav-panel-item' + (location.pathname === '/admin' ? ' active' : '')}
              aria-current={location.pathname === '/admin' ? 'page' : undefined}
              onClick={() => go('/admin')}
            >
              <span className="appnav-ic nav-panel-icon"><IconText text={"🛡️"} /></span>Админ-панель
            </button>
          )}
        </nav>
        <div className="appnav-footer">
          <button className="appnav-item nav-panel-item" onClick={() => go('/')}>
            <span className="appnav-ic nav-panel-icon"><IconText text={"🏠"} /></span>На главную сайта
          </button>
          <button className="appnav-item appnav-danger nav-panel-item" onClick={onLogout}>
            <span className="appnav-ic nav-panel-icon"><IconText text={"🚪"} /></span>Выйти
          </button>
        </div>
      </div>
    </>
  return <>
    {menuHost && createPortal(trigger, menuHost)}
    {createPortal(<div className="appnav-results-layer">{drawer}</div>, document.body)}
  </>
}
