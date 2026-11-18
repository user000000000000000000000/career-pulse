import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'
import BirdFlight from './BirdFlight.jsx'
import { takeBirdTip } from '../lib/birdTips'
import './bird-helper.css'

export default function BirdHelper() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [muted, setMuted] = useState(false)
  const [pastThreshold, setPastThreshold] = useState(false)
  const shown = useRef(0)
  const tipSession = useRef({})
  const closeTimer = useRef()
  const nextAutoAt = useRef(0)
  const openRef = useRef(false)
  const [tip, setTip] = useState('')
  const [greeting, setGreeting] = useState(0)
  const eligible = pastThreshold
  const showTip = useCallback(() => {
    clearTimeout(closeTimer.current)
    nextAutoAt.current = Date.now() + 90000
    setTip(takeBirdTip(pathname, tipSession.current))
    openRef.current = true
    setOpen(true)
  }, [pathname])

  useEffect(() => { openRef.current = open }, [open])

  useEffect(() => {
    const onScroll = () => setPastThreshold(window.scrollY >= 360)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    setOpen(false)
    if (!eligible || muted || hidden || window.matchMedia('(max-width: 640px), (prefers-reduced-motion: reduce)').matches) return
    const show = () => {
      if (Date.now() < nextAutoAt.current || openRef.current || document.hidden || shown.current >= 3 || window.matchMedia('(max-width: 640px), (prefers-reduced-motion: reduce)').matches || document.querySelector('[aria-modal="true"], .appnav-drawer.open, .demo-panel, .question-stage') || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return
      shown.current += 1
      showTip()
      closeTimer.current = window.setTimeout(() => setOpen(false), 7000)
    }
    const first = window.setTimeout(show, Math.max(18000, nextAutoAt.current - Date.now()))
    const repeat = window.setInterval(show, 90000)
    return () => { clearTimeout(first); clearInterval(repeat); clearTimeout(closeTimer.current) }
  }, [pathname, muted, hidden, eligible, showTip])

  useEffect(() => {
    if (!open) return
    const onKey = event => { if (event.key === 'Escape') { setOpen(false); setMuted(true) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (hidden) return null
  return <aside className={'bird-helper' + (eligible ? '' : ' bird-helper--inactive')} inert={eligible ? undefined : ''} aria-hidden={eligible ? undefined : true} aria-label="Птичка-помощник">
    {open && <div id="bird-helper-tip" className="bird-helper__tip" role="note" aria-live="polite">
      <button className="bird-helper__close" aria-label="Закрыть подсказку" onClick={() => { setOpen(false); setMuted(true) }}><Icon name="close" size={16} /></button>
      <span className="bird-helper__eyebrow">Давай разберёмся</span>
      <p>{tip}</p>
      <button className="bird-helper__mute" onClick={() => { setMuted(true); setOpen(false) }}>Показывать только по нажатию</button>
    </div>}
    <button className="bird-helper__toggle" aria-label="Подсказка птички — помахать и показать фразу" aria-expanded={open} aria-controls={open ? 'bird-helper-tip' : undefined} onClick={() => { setGreeting(value => value + 1); showTip() }}>
      <BirdFlight greeting={greeting} />
    </button>
    <button className="bird-helper__hide" aria-label="Скрыть птичку-помощника до перезагрузки" onClick={() => setHidden(true)}><Icon name="close" size={13} /></button>
  </aside>
}
