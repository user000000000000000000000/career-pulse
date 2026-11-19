import Icon, { ICON_ALIASES } from './Icon.jsx'

const symbols = Object.keys(ICON_ALIASES).sort((a, b) => b.length - a.length)
const pattern = new RegExp('(' + symbols.map(symbol => symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gu')

/** Keeps data labels as strings while presenting their icons in the shared style. */
export default function IconText({ text }) {
  if (typeof text !== 'string') return text ?? null
  if (!symbols.some(symbol => text.includes(symbol))) return text
  return <span className="icon-text">{text.split(pattern).filter(Boolean).map((part, i) => ICON_ALIASES[part]
    ? <Icon key={i} name={ICON_ALIASES[part]} size="1.15em" />
    : <span className="icon-text__copy" key={i}>{part}</span>)}</span>
}
