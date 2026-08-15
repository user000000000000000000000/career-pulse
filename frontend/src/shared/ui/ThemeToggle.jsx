import { useEffect, useState } from 'react'
import { STORAGE_KEYS } from '../lib/storageKeys'

const STORAGE_KEY = STORAGE_KEYS.theme

function getInitialTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved === 'dark' ? 'dark' : 'light' // светлая — дефолт, независимо от ОС (решение с Grill Me)
}

/** Переключатель светлой/тёмной темы. Персистит выбор, ничего не делает при первом заходе кроме чтения localStorage. */
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
        width: 36, height: 36, borderRadius: '50%',
        border: '1px solid var(--line)', background: 'var(--card2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', fontSize: 16, flexShrink: 0,
        transition: 'border-color .2s ease, background .2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
