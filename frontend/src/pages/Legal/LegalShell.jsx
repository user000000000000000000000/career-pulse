import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/legal.css'

/** Обёртка правовых страниц: скоуп .cp-legal + SPA-навигация по ссылкам. */
export default function LegalShell({ children }) {
  const rootRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onClick = (e) => {
      const a = e.target.closest('a')
      if (!a) return
      if (a.dataset.back) { e.preventDefault(); navigate(-1); return }
      const href = a.getAttribute('href')
      if (href && href.startsWith('/')) { e.preventDefault(); navigate(href) }
    }
    root.addEventListener('click', onClick)
    return () => root.removeEventListener('click', onClick)
  }, [navigate])

  return <div ref={rootRef} className="cp-legal">{children}</div>
}
