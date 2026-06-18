import { Link } from 'react-router-dom'
import '../../styles/legal.css'

/** Шапка для правовых и служебных страниц. backTo — куда ведёт «Назад». */
export default function Header({ backTo = '/', backLabel = '← Назад', reserveRight = false }) {
  return (
    <nav className={'legal-nav' + (reserveRight ? ' nav-reserve-right' : '')}>
      <Link to="/" className="nav-logo-link">
        <div className="nav-logo-mark">⚡</div>
        <div className="nav-logo-txt">CAREER<span>PULSE</span></div>
      </Link>
      <Link to={backTo} className="nav-back-link">{backLabel}</Link>
    </nav>
  )
}
