import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../lib/storageKeys'

const STORAGE_KEY = STORAGE_KEYS.theme

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' ? 'dark' : 'light' // светлая — дефолт, независимо от ОС (решение с Grill Me)
}

const MoonIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)
const SunIcon = (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
)

/** Переключатель светлой/тёмной темы. Иконка-морф (луна/солнце), поворот на hover.
 *  Цвета через currentColor + color-mix — работает и на navy-шапке, и на светлом фоне. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
    else delete document.documentElement.dataset.theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  return (
    <button
      type="button"
      onClick={() => setTheme(t => (t === 'dark' ? 'light' : 'dark'))}
      aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
      style={{
        width: 38, height: 38, borderRadius: 12,
        border: '1px solid color-mix(in srgb, currentColor 18%, transparent)',
        background: 'color-mix(in srgb, currentColor 7%, transparent)',
        color: 'inherit',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        transition: 'background .18s ease, border-color .18s ease, transform .18s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'color-mix(in srgb, currentColor 14%, transparent)'
        e.currentTarget.style.borderColor = 'color-mix(in srgb, currentColor 30%, transparent)'
        e.currentTarget.style.transform = 'rotate(-12deg)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'color-mix(in srgb, currentColor 7%, transparent)'
        e.currentTarget.style.borderColor = 'color-mix(in srgb, currentColor 18%, transparent)'
        e.currentTarget.style.transform = 'none'
      }}
    >
      {theme === 'dark' ? SunIcon : MoonIcon}
    </button>
  )
}
