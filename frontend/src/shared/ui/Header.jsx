import { Link } from 'react-router-dom'
import './legal.css'

/** Шапка для правовых и служебных страниц. backTo — куда ведёт «Назад». */
export default function Header({ backTo = '/', backLabel = '← Назад', reserveRight = false }) {
  return (
    <nav className={'legal-nav' + (reserveRight ? ' nav-reserve-right' : '')}>
      <Link to="/" className="nav-logo-link">
        <div className="nav-logo-mark">
          <svg viewBox="0 0 32 32" width="15" height="15" aria-hidden="true"><path d="M17.8 4.5 8.5 18.2h6.1L13 27.5 23.5 13.4h-6.1z" fill="#fff"/></svg>
        </div>
        <div className="nav-logo-txt">CAREER<span>PULSE</span></div>
      </Link>
      <Link to={backTo} className="nav-back-link">{backLabel}</Link>
    </nav>
  )
}
