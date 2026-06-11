import { Link } from 'react-router-dom'
import '../../styles/legal.css'

/** Подвал в стиле правовых страниц (бренд + документы + контакты). */
export default function Footer() {
  return (
    <footer className="legal-footer">
      <div className="lf-inner">
        <div className="lf-grid">
          <div className="lf-brand">
            <div className="lf-logo">CAREER<span>PULSE</span></div>
            <p>Персональная платформа карьерной диагностики. Психодиагностика, анализ рынка и живой наставник.</p>
          </div>
          <div className="lf-col">
            <h4>Правовые документы</h4>
            <ul>
              <li><Link to="/legal/privacy">Политика конфиденциальности</Link></li>
              <li><Link to="/legal/terms">Пользовательское соглашение</Link></li>
              <li><Link to="/legal">Все документы</Link></li>
              <li><Link to="/legal/consent">Согласие на обработку ПД</Link></li>
              <li><Link to="/legal/adconsent">Согласие на рекламу</Link></li>
              <li><Link to="/legal/recomm">Рекомендательные технологии</Link></li>
            </ul>
          </div>
          <div className="lf-col">
            <h4>Контакты</h4>
            <ul>
              <li><a href="https://t.me/SokolovNYU" target="_blank" rel="noreferrer">✈️ Telegram</a></li>
              <li><a href="https://vk.ru/sokolovnyu" target="_blank" rel="noreferrer">🔵 ВКонтакте</a></li>
              <li><a href="https://youtube.com/@SokolovNYU" target="_blank" rel="noreferrer">▶️ YouTube</a></li>
              <li><a href="https://rutube.ru/channel/SokolovNYU" target="_blank" rel="noreferrer">📺 Rutube</a></li>
              <li><a href="mailto:SokolovNYu@mail.ru">✉️ Email</a></li>
            </ul>
          </div>
        </div>
        <div className="lf-bottom">
          <div className="lf-copy">© 2026 CareerPulse · careerpulse.ru · Никита Соколов</div>
          <div className="lf-links">
            <Link to="/legal/privacy">Конфиденциальность</Link>
            <Link to="/legal/terms">Соглашение</Link>
            <Link to="/legal">Документы</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
