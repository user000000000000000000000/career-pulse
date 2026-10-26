import BoltIcon from '../../../shared/ui/BoltIcon.jsx'

/**
 * Шапка правовых страниц (внутри LegalShell, который перехватывает клики по ссылкам).
 * back="history" → кнопка «назад» через data-back (navigate(-1));
 * back="/путь" → обычный переход по ссылке.
 */
export default function LegalNav({ back = 'history', backLabel = '← Назад' }) {
  const backProps = back === 'history' ? { 'data-back': '1', href: '/' } : { href: back }
  return (
    <nav className="legal-nav">
      <a href="/" className="nav-logo-link">
        <div className="nav-logo-mark"><BoltIcon /></div>
        <div className="nav-logo-txt">CAREER<span>PULSE</span></div>
      </a>
      <a {...backProps} className="nav-back-link">{backLabel}</a>
    </nav>
  )
}
