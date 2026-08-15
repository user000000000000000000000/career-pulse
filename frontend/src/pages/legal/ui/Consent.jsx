import LegalShell from './LegalShell.jsx'
import ContactLinks from '../../../shared/ui/ContactLinks.jsx'

export default function Consent() {
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
      <h1>Согласие на обработку персональных данных</h1>
      <div className="legal-meta">Платформа: <a href="https://careerpulse.ru">careerpulse.ru</a> &nbsp;·&nbsp; Редакция: 1 июня 2026 г</div>
    </div>
    <div className="legal-highlight"><p>Настоящий документ определяет условия, на которых пользователь сайта careerpulse.ru даёт согласие на обработку персональных данных в соответствии со ст. 9 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных».</p></div>
    <div className="legal-body">
<h2>1. Оператор персональных данных</h2>
      <ul>
        <li><strong>Оператор:</strong> Соколов Никита Юрьевич</li>
        <li><strong>Город:</strong> Санкт-Петербург</li>
        <li><strong>Email:</strong> <a href="mailto:SokolovNYu@mail.ru">SokolovNYu@mail.ru</a></li>
        <li><strong>Телефон:</strong> <a href="tel:+79531687580">8-953-168-75-80</a></li>
        <li><strong>Сайт:</strong> <a href="https://careerpulse.ru">careerpulse.ru</a></li>
      </ul>

      <h2>2. Предмет согласия</h2>
      <p>Пользователь даёт согласие на обработку персональных данных, добровольно предоставленных при использовании сайта careerpulse.ru — заполнении форм обратной связи, записи на консультацию и иных формах взаимодействия. Согласие выражается путём заполнения формы, нажатия кнопки или иного активного действия на сайте.</p>

      <h2>3. Состав персональных данных</h2>
      <ul>
        <li>Имя, фамилия, отчество</li>
        <li>Адрес электронной почты</li>
        <li>Номер телефона</li>
        <li>Иные сведения, добровольно указанные в формах</li>
      </ul>

      <h2>4. Цели обработки персональных данных</h2>
      <ul>
        <li>Идентификация и связь с пользователем</li>
        <li>Запись на консультацию и организация услуг</li>
        <li>Направление информации об услугах (при наличии отдельного согласия)</li>
        <li>Исполнение требований законодательства РФ</li>
      </ul>

      <h2>5. Действия с персональными данными</h2>
      <p>Сбор, запись, систематизация, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передача при необходимости, обезличивание, блокирование, удаление, уничтожение — в пределах, необходимых для достижения указанных целей.</p>

      <h2>6. Срок действия согласия</h2>
      <p>Согласие действует с момента его выражения до момента отзыва. Пользователь вправе отозвать согласие в любое время, направив письмо на <a href="mailto:SokolovNYu@mail.ru">SokolovNYu@mail.ru</a>. Отзыв согласия не влияет на законность обработки, осуществлённой до его получения.</p>

      <h2>7. Права субъекта персональных данных</h2>
      <ul>
        <li>Получить информацию об обрабатываемых данных</li>
        <li>Потребовать уточнения, блокирования или уничтожения данных</li>
        <li>Отозвать согласие в любое время</li>
        <li>Обжаловать действия оператора в Роскомнадзор</li>
      </ul>
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
