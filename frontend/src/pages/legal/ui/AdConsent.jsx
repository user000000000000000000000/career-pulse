import Header from '../../../shared/ui/Header.jsx'
import IconText from '../../../shared/ui/IconText.jsx'
import DarkFooter from '../../../shared/ui/DarkFooter.jsx'
import LegalShell from './LegalShell.jsx'
import ContactLinks from '../../../shared/ui/ContactLinks.jsx'
import LegalNav from './LegalNav.jsx'

export default function AdConsent() {
  return (
    <LegalShell title="Согласие на рекламную рассылку" description="Согласие на получение рекламных и информационных сообщений от Пульс Карьеры.">
      <>
<LegalNav />

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

<DarkFooter from="#f7fbff" />
      </>
    </LegalShell>
  )
}
