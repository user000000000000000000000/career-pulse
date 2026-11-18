import { useEffect, useRef, useState } from 'react'
import '../question-stage.css'

const CHOICES = '.opt-card, .mat-card, .chip, .pair-card:not(:has(button)), button.scale-btn, button.int-btn, button.ii-btn'
const IDENTITY = '.q-counter, .q-text, .q-prompt, .q-context, .step-title, .step-eyebrow'

/** Presentation boundary: owns no answers, question order, timers or scoring. */
export default function QuestionStage({ children, pct }) {
  const contentRef = useRef(null)
  const stageRef = useRef(null)
  const [counter, setCounter] = useState('')

  useEffect(() => {
    const content = contentRef.current, stage = stageRef.current
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let previousKey, previousSnapshot, animation, ghost, ghostTimer
    const clear = () => { animation?.cancel(); ghost?.remove(); ghost = null; clearTimeout(ghostTimer) }
    const snapshot = () => {
      const clone = content.cloneNode(true)
      clone.removeAttribute('id')
      clone.querySelectorAll('[id], [name], [autofocus], [for]').forEach(el => {
        for (const attr of ['id', 'name', 'autofocus', 'for']) el.removeAttribute(attr)
      })
      const fields = content.querySelectorAll('input, textarea, select')
      clone.querySelectorAll('input, textarea, select').forEach((el, index) => { el.value = fields[index].value })
      return clone
    }
    const update = () => {
      content.querySelectorAll(CHOICES).forEach(el => {
        if (el.tagName !== 'BUTTON') { el.setAttribute('role', 'button'); el.tabIndex = 0 }
        el.setAttribute('aria-pressed', String(el.classList.contains('sel') || el.classList.contains('selected')))
      })
      const key = [...content.querySelectorAll(IDENTITY)].map(el => el.textContent).join('|')
      setCounter(content.querySelector('.q-counter, .step-title')?.textContent || '')
      if (previousKey !== undefined && previousKey !== key) {
        clear()
        // Scroll only when the question actually changed and its beginning is
        // above the viewport. Typing, selecting and regular renders never reset it.
        const safeTop = Math.max(
          document.querySelector('.site-header nav')?.getBoundingClientRect().bottom || 0,
          stage.closest('.cp-diag').querySelector('.topbar')?.getBoundingClientRect().bottom || 0,
        ) + 16
        if (stage.getBoundingClientRect().top < safeTop) {
          window.scrollTo({ top: Math.max(0, window.scrollY + stage.getBoundingClientRect().top - safeTop), behavior: 'instant' })
        }
        if (!reduced.matches && Element.prototype.animate) {
          try {
            if (previousSnapshot) {
              ghost = previousSnapshot
              ghost.className = 'question-stage__content question-stage__ghost'
              Object.assign(ghost.style, { top: `${content.offsetTop}px`, left: `${content.offsetLeft}px`, width: `${content.offsetWidth}px` })
              ghost.setAttribute('aria-hidden', 'true')
              ghost.setAttribute('inert', '')
              stage.appendChild(ghost)
              ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 110, fill: 'forwards' })
              ghostTimer = setTimeout(() => { ghost?.remove(); ghost = null }, 130)
            }
            animation = content.animate([
              { opacity: 0, transform: 'translateY(7px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ], { duration: 220, delay: 80, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' })
          } catch { clear() /* Resting CSS is always visible. */ }
        }
      }
      previousKey = key
      previousSnapshot = reduced.matches ? null : snapshot()
    }
    const onKey = event => {
      const target = event.target.closest(CHOICES)
      if (!target || target.tagName === 'BUTTON' || event.target !== target) return
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); target.click() }
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(content, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    content.addEventListener('keydown', onKey)
    reduced.addEventListener('change', clear)
    return () => { observer.disconnect(); clear(); content.removeEventListener('keydown', onKey); reduced.removeEventListener('change', clear) }
  }, [])

  return <section className="question-stage" ref={stageRef} aria-label="Прохождение диагностики">
    <div className="question-stage__progress">
      <div><span aria-live="polite" aria-atomic="true">{counter || 'Прохождение блока'}</span><b>{pct}%</b></div>
      <div className="question-stage__track" role="progressbar" aria-label="Прогресс блока" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
    <div className="question-stage__content" ref={contentRef}>{children}</div>
  </section>
}
