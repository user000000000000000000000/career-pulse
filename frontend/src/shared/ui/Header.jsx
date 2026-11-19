import { Link, useNavigate } from 'react-router-dom'
import './legal.css'
import IconText from './IconText.jsx'
import HeaderContext from './HeaderContext.jsx'

/** Переход страницы в левой части общей шапки. */
export default function Header({ backTo = '/', backLabel = '← Назад', historyBack = false }) {
  const navigate = useNavigate()
  return <HeaderContext>
    {historyBack
      ? <button className="site-header-context-pill" onClick={() => navigate(-1)}><IconText text={backLabel}/></button>
      : <Link to={backTo} className="site-header-context-pill"><IconText text={backLabel}/></Link>}
  </HeaderContext>
}
