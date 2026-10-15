import { TERM_DEFS } from '../lib/termDefs'
import './infohint.css'

// Иконка «?» с подсказкой по наведению/фокусу. term — ключ из termDefs, либо явный text.
export default function InfoHint({ term, text }) {
  const content = text || TERM_DEFS[term]
  if (!content) return null
  return (
    <span className="info-hint" tabIndex={0} role="button" aria-label="Пояснение">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 11.2v4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="7.9" r="1.15" fill="currentColor" />
      </svg>
      <span className="info-hint-pop" role="tooltip">{content}</span>
    </span>
  )
}
