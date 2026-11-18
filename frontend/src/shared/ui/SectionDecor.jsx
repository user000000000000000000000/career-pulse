import Icon from './Icon.jsx'

export default function SectionDecor() {
  return <div className="section-decor" aria-hidden="true">
    <Icon name="sparkles" className="section-decor__star section-decor__star--a" size={24} />
    <Icon name="sparkles" className="section-decor__star section-decor__star--b" size={16} />
    <span className="section-decor__dots" />
    <span className="section-decor__orb" />
    <span className="section-decor__circle" />
    <svg className="section-decor__line" width="100" height="70" viewBox="0 0 100 70" fill="none" focusable="false"><path d="M5 55C25 65 40 5 60 15S70 55 95 30" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6" /></svg>
  </div>
}
