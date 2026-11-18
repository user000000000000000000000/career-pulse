import { useEffect, useId, useRef, useState } from 'react'
import { BLOCKS } from '../config/blocks'
import { JOURNEY_THEMES } from '../config/journey'
import JourneyMascot from './JourneyMascot.jsx'
import Icon from './Icon.jsx'
import './journey-progress.css'

/** A view of saved block completion, independent of all per-question percentages. */
export default function JourneyProgress({ completed = [], current = null }) {
  const tooltipId = useId().replace(/:/g, '')
  const previous = useRef(completed)
  const [celebrate, setCelebrate] = useState([])
  useEffect(() => {
    const added = completed.filter(n => !previous.current.includes(n))
    previous.current = completed
    if (!added.length) return
    setCelebrate(added)
    const timer = setTimeout(() => setCelebrate([]), 850)
    return () => clearTimeout(timer)
  }, [completed])

  return <section className="journey-progress" aria-label="10 тематических блоков диагностики">
    <div className="journey-progress__caption"><span>Твоё путешествие</span><span aria-live="polite"><b>{completed.length}</b> из {BLOCKS.length} блоков пройдено</span></div>
    <ol className="journey-progress__list">
      {BLOCKS.map(block => {
        const theme = JOURNEY_THEMES[block.n]
        const done = completed.includes(block.n)
        const active = current === block.n
        const state = done ? 'Пройден' : active ? 'Сейчас' : 'Впереди'
        return <li key={block.n} className={`journey-progress__item${done ? ' is-complete' : ''}${active ? ' is-current' : ''}${celebrate.includes(block.n) ? ' is-celebrating' : ''}`} aria-current={active ? 'step' : undefined} aria-describedby={`${tooltipId}-${block.n}`} tabIndex={0}>
          <span className="journey-progress__portrait"><JourneyMascot num={block.n} still />
            {done && <span className="journey-progress__check"><Icon name="check" size={10} /></span>}
          </span>
          <span className="journey-progress__label">{theme.label.replace('Уверенность', 'Уверен\u00adность')}</span>
          <span className="journey-progress__tooltip" id={`${tooltipId}-${block.n}`} role="tooltip"><span className="journey-progress__tooltip-title">{block.n}. {block.title}</span><span className="journey-progress__tooltip-state">{state}</span></span>
        </li>
      })}
    </ol>
    <div className="journey-progress__legend" aria-hidden="true">
      <span><i className="journey-key journey-key--done"><Icon name="check" size={10} /></i>Пройдено</span>
      <span><i className="journey-key journey-key--current" />Сейчас</span>
      <span><i className="journey-key" />Впереди</span>
    </div>
  </section>
}
