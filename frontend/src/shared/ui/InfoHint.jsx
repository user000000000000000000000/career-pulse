import { TERM_DEFS } from '../lib/termDefs'
import './infohint.css'
import Icon from './Icon.jsx'

// Иконка «?» с подсказкой по наведению/фокусу. term — ключ из termDefs, либо явный text.
export default function InfoHint({ term, text }) {
  const content = text || TERM_DEFS[term]
  if (!content) return null
  return (
    <span className="info-hint" tabIndex={0} role="button" aria-label="Пояснение">
      <Icon name="info" size={15}/>
      <span className="info-hint-pop" role="tooltip">{content}</span>
    </span>
  )
}
