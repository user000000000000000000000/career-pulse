import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

/** Restore only on navigation, never on ordinary renders or content updates. */
export default function ScrollManager() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef(new Map())
  const activeKey = useRef(null)
  const firstVisit = useRef(true)

  useEffect(() => {
    const remember = () => {
      if (activeKey.current) positions.current.set(activeKey.current, window.scrollY)
    }
    window.addEventListener('scroll', remember, { passive: true })
    return () => window.removeEventListener('scroll', remember)
  }, [])

  useLayoutEffect(() => {
    const first = firstVisit.current
    firstVisit.current = false
    // Native hash changes can reuse history.state.key; distinguish their anchors.
    const positionKey = location.key + location.pathname + location.search + location.hash
    activeKey.current = positionKey
    const saved = !first && navigationType === 'POP' ? positions.current.get(positionKey) : undefined
    let anchor = null
    if (saved === undefined && location.hash) {
      try { anchor = decodeURIComponent(location.hash.slice(1)) } catch { /* malformed hash */ }
    }
    const top = saved ?? 0
    const restore = () => {
      if (anchor) {
        const target = document.getElementById(anchor)
        if (!target) return false
        target.scrollIntoView({ behavior: 'instant', block: 'start' })
        return true
      }
      // Lazy routes may temporarily render a short loading screen.
      if (top > document.documentElement.scrollHeight - window.innerHeight + 1) return false
      window.scrollTo({ top, left: 0, behavior: 'instant' })
      return true
    }
    if (restore()) return
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    const root = document.getElementById('root')
    const observer = new MutationObserver(() => { if (restore()) observer.disconnect() })
    observer.observe(root, { childList: true, subtree: true })
    const timeout = window.setTimeout(() => observer.disconnect(), 5000)
    return () => { observer.disconnect(); clearTimeout(timeout) }
  }, [location.key, location.pathname, location.search, location.hash, navigationType])

  return null
}
