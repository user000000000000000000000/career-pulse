import LegalShell from './LegalShell.jsx'
import ContactLinks from '../../components/ContactLinks.jsx'

export default function AdConsent() {
  return (
    <LegalShell>
      <>
<nav className="legal-nav">
  <a href="/" className="nav-logo-link">
    <div className="nav-logo-mark">⚡</div>
    <div className="nav-logo-txt">CAREER<span>PULSE</span></div>
  </a>
  <a data-back="1" href="/" className="nav-back-link">← Назад</a>
</nav>

<main className="legal-page">
  <div className="container">
    <div className="legal-header">
      <div className="legal-eyebrow">Правовой документ</div>
      <h1>Согласие на получение информации рекламного характера</h1>
      <div className="legal-meta">Платформа: <a href="https://careerpulse.ru">careerpulse.ru</a> &nbsp;·&nbsp; Редакция: 1 июня 2026 г</div>
    </div>
    <div className="legal-highlight"><p>Согласие является добровольным. Предоставляется отдельно от согласия на обработку персональных данных. Основание: Федеральный закон от 13.03.2006 № 38-ФЗ «О рекламе».</p></div>
    <div className="legal-body">
<h2>1. Оператор</h2>
      <p>Соколов Никита Юрьевич, самозанятый (плательщик НПД), г. Санкт-Петербург<br />Email: <a href="mailto:SokolovNYu@mail.ru">SokolovNYu@mail.ru</a></p>

      <h2>2. Способы получения рекламной информации</h2>
      <ul>
        <li>Электронные письма на указанный адрес</li>
        <li>Сообщения в мессенджерах (Telegram и др.)</li>
        <li>SMS-сообщения и телефонные звонки (при указании номера)</li>
      </ul>

      <h2>3. Характер рекламной информации</h2>
      <p>Сведения об услугах Никиты Соколова: наставничестве, профориентации, лекциях и тренингах; информация о мероприятиях, акциях, новых продуктах и образовательных материалах.</p>

      <h2>4. Срок действия</h2>
      <p>Согласие действует с момента его выражения до момента отзыва. Отозвать можно в любое время через функцию «Отписаться» в письме или на email <a href="mailto:SokolovNYu@mail.ru">SokolovNYu@mail.ru</a>. Прекращение рассылки — в течение 5 рабочих дней.</p>
    </div>
  </div>
</main>

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
          <li><a href="/legal/privacy">Политика конфиденциальности</a></li>
          <li><a href="/legal/terms">Пользовательское соглашение</a></li>
          <li><a href="/legal">Все документы</a></li>
          <li><a href="/legal/consent">Согласие на обработку ПД</a></li>
          <li><a href="/legal/adconsent">Согласие на рекламу</a></li>
          <li><a href="/legal/recomm">Рекомендательные технологии</a></li>
        </ul>
      </div>
      <div className="lf-col">
        <h4>Контакты</h4>
        <ul>
          <ContactLinks />
        </ul>
      </div>
    </div>
    <div className="lf-bottom">
      <div className="lf-copy">© 2026 CareerPulse · careerpulse.ru · Никита Соколов</div>
      <div className="lf-links">
        <a href="/legal/privacy">Конфиденциальность</a>
        <a href="/legal/terms">Соглашение</a>
        <a href="/legal">Документы</a>
      </div>
    </div>
  </div>
</footer>
      </>
    </LegalShell>
  )
}
