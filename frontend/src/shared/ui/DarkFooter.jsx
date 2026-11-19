import { Link } from 'react-router-dom'
import BrandMark from './BrandMark.jsx'
import SectionDecor from './SectionDecor.jsx'
import SectionWave from './SectionWave.jsx'
import ContactLinks from './ContactLinks.jsx'
import './dark-footer.css'

/** Landing-style footer with router-aware links for interior pages. */
export default function DarkFooter({ from = '#eaf4ff' }) {
  return <>
    <SectionWave from={from} to="#070529" flip />
    <footer className="product-footer">
      <SectionDecor />
      <div className="product-footer__inner">
        <div className="product-footer__brand">
          <Link to="/" className="product-footer__logo"><BrandMark size={32} variant="white" />Пульс Карьеры</Link>
          <p>Узнай себя. Представь своё будущее. Найди путь к профессии.</p>
        </div>
        <div className="product-footer__col"><h2>Продукт</h2>
          <Link to="/#how">Диагностика</Link><Link to="/professions">Профессии</Link>
          <Link to="/vuzy">Вузы России</Link><Link to="/#about">О нас</Link>
        </div>
        <div className="product-footer__col"><h2>Документы</h2>
          <Link to="/legal/privacy">Конфиденциальность</Link><Link to="/legal/terms">Соглашение</Link>
          <Link to="/legal">Все документы</Link>
          <Link to="/legal/consent">Согласие на обработку данных</Link>
          <Link to="/legal/adconsent">Согласие на рекламу</Link>
          <Link to="/legal/recomm">Рекомендательные технологии</Link>
        </div>
        <div className="product-footer__col"><h2>Контакты</h2>
          <ul className="product-footer__contacts"><ContactLinks /></ul>
        </div>
        <div className="product-footer__copy">© 2026 Пульс Карьеры<br />careerpulse.ru</div>
      </div>
    </footer>
  </>
}
