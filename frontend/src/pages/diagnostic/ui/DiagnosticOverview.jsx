import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { BLOCKS } from '../../../shared/config'
import Icon from '../../../shared/ui/Icon.jsx'
import DiagnosticMascot from './DiagnosticMascot.jsx'
import { JOURNEY_THEMES } from '../../../shared/config'
import { useScrollReveal } from '../../../shared/lib/useScrollReveal'
import '../diagnostic-overview.css'

const THEMES = ['clipboard', 'compass', 'heart', 'user', 'brain', 'briefcase', 'zap', 'rocket', 'users', 'mail']

// Presentation only: retain each block's own metadata instead of replacing it
// with registry estimates, which do not always describe the same question units.
function metaPresentation(text, index) {
  const value = text.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u, '')
  if (index === 0) return { value, icon: 'clock', label: 'Время прохождения' }
  if (index === 1) return { value, icon: 'clipboard', label: 'Объём блока' }
  if (/конфиденциально/i.test(value)) return { value, icon: 'shield', label: 'Твои данные' }
  if (/ИИ/.test(value)) return { value, icon: 'sparkles', label: 'Особенности' }
  return { value, icon: 'compass', label: 'Методика' }
}

export default function DiagnosticOverview({ num, label, title, desc, meta, mascotVariant, chapter }) {
  const rootRef = useRef(null)
  useScrollReveal(rootRef, '.diagnostic-info-card', '', 'interior')
  const block = BLOCKS.find(block => block.n === num)
  const heading = block?.title || title
  // A discretionary hyphen keeps this long word readable on narrow phones.
  const displayHeading = num === 7 ? heading.replace('Само', 'Само\u00ad') : heading
  return <section ref={rootRef} className="diagnostic-overview" data-block={num} aria-labelledby={`diagnostic-title-${num}`}>
    <div className="diagnostic-overview__hero">
      <div className="diagnostic-overview__copy">
        <div className="block-num diagnostic-overview__eyebrow"><Icon name="sparkles" size={16} />{label}</div>
        <h1 id={`diagnostic-title-${num}`} className="block-title diagnostic-overview__heading">{displayHeading}</h1>
        {desc && <p className="block-desc diagnostic-overview__desc">{desc}</p>}
        {chapter && <p className="diagnostic-overview__chapter" aria-live="polite">{chapter}</p>}
      </div>
      <div className="diagnostic-overview__art" aria-hidden="true">
        <span className="diagnostic-overview__orbit" />
        <DiagnosticMascot num={num} variant={mascotVariant || JOURNEY_THEMES[num]?.variant} />
        <span className="diagnostic-overview__badge"><Icon name={THEMES[num - 1]} size={24} /><b>{String(num).padStart(2, '0')}</b></span>
        <Icon name="sparkles" className="diagnostic-overview__star" size={23} />
        <svg className="diagnostic-overview__line" width="125" height="50" viewBox="0 0 125 50" fill="none" focusable="false"><path d="M3 36C24 50 25 3 58 18S90 48 122 9" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 6" /></svg>
      </div>
    </div>
    <dl className="diagnostic-info-grid">
      {meta.map((text, index) => {
        const item = metaPresentation(text, index)
        return <div className="diagnostic-info-card" key={index}>
          <span className="diagnostic-info-card__icon"><Icon name={item.icon} size={22} /></span>
          <div><dt>{item.label}</dt><dd className="diagnostic-info-card__value">{item.value}</dd></div>
        </div>
      })}
    </dl>
    <Link className="diagnostic-overview__privacy" to="/legal/privacy">
      <span className="diagnostic-overview__privacy-icon"><Icon name="lock" size={18} /></span>
      <span className="diagnostic-overview__privacy-copy"><strong>Как обрабатываются данные</strong><span>Политика конфиденциальности</span></span>
      <Icon name="arrow-right" size={17} className="diagnostic-overview__privacy-arrow" />
    </Link>
  </section>
}
