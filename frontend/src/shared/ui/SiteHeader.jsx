import IconText from './IconText.jsx'
import { useLayoutEffect, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getCurrentUser } from '../auth'
import './site-header.css'
import BrandMark from './BrandMark.jsx'
import Icon from './Icon.jsx'
import { useModalState } from './ModalProvider.jsx'

function initials(name = '') {
  const p = name.trim().split(/\s+/).filter(Boolean)
  const family = p[0] || ''
  const given = p[1] || p[0] || ''
  return ((given[0] || '') + (family && family !== given ? family[0] : '')).toUpperCase() || 'И'
}

export default function SiteHeader() {
  const { pathname } = useLocation()
  const [user, setUser] = useState(null)
  const navRef = useRef(null)
  const { hasModal } = useModalState()


  useEffect(() => {
    let active = true
    getCurrentUser().then(u => { if (active) setUser(u) }).catch(() => {})
    return () => { active = false }
  }, [pathname])

  useLayoutEffect(() => {
    const measure = () => {
      const bottom = navRef.current.getBoundingClientRect().bottom
      document.documentElement.style.setProperty('--site-header-clearance', `${Math.ceil(bottom + 16)}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(navRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      document.documentElement.style.removeProperty('--site-header-clearance')
    }
  }, [])

  return <>
    <header className={'site-header' + (pathname === '/diagnostic' ? ' site-header--results' : '') + (hasModal ? ' site-header--modal-hidden' : '')} aria-hidden={hasModal || undefined} inert={hasModal ? '' : undefined}>
      <nav ref={navRef} className="lv-nav" aria-label="Основная навигация">
        <div className="lv-nav-inner">
          <span id="site-header-status-slot" className="site-header-status-slot" />
          <div className="lv-nav-pill">
            <Link to="/" className="lv-logo"><BrandMark />Пульс Карьеры</Link>
            <div className="lv-nav-links">
              <Link to={pathname === '/' ? '/#how' : '/dashboard'}>{pathname === '/' ? 'Диагностика' : 'Моя диагностика'}</Link>
              <Link to={pathname === '/' ? '/#professions' : '/atlas'}>Профессии</Link>
              <Link to="/#about">О проекте</Link>
              <Link to="/professions">Материалы</Link>
            </div>
          </div>
          <div className="lv-nav-right">
            {user ? (
              <>
                <Link to="/profile" className="lv-nav-avatar"
                   style={user.avatar_url ? { backgroundImage:`url(${user.avatar_url})` } : undefined}>
                  {user.avatar_url ? '' : initials(user.name)}
                </Link>
                <Link to="/dashboard" className="lv-cta-pill">В кабинет</Link>
              </>
            ) : (
              <>
                <Link to="/login" className="lv-nav-login"><Icon name="user" size={21} /> Войти</Link>
                <Link to={user ? '/dashboard' : '/proba'} className="lv-cta-pill"><IconText text={"Пройти тест →"} /></Link>
              </>
            )}
            <span id="site-menu-slot" className="site-header-menu-slot" />
          </div>
        </div>
      </nav>
    </header>
    {pathname !== '/' && pathname !== '/dashboard' && <div className="site-header-space" aria-hidden="true" />}
  </>
}
