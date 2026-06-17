import LegalShell from './LegalShell.jsx'

export default function Recomm() {
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
      <h1>Уведомление об использовании рекомендательных технологий</h1>
      <div className="legal-meta">Платформа: <a href="https://careerpulse.ru">careerpulse.ru</a> &nbsp;·&nbsp; Редакция: 1 июня 2026 г</div>
    </div>
    <div className="legal-highlight"><p>Документ размещён в соответствии с требованиями Федерального закона от 01.07.2021 № 236-ФЗ и требованиями Роскомнадзора к информационным ресурсам, использующим рекомендательные алгоритмы.</p></div>
    <div className="legal-body">
<h2>1. Общие положения</h2>
      <p>На сайте <strong>careerpulse.ru</strong> применяются рекомендательные технологии — информационные технологии предоставления информации на основе сбора, систематизации и анализа сведений, относящихся к предпочтениям пользователей сети Интернет, находящихся на территории Российской Федерации.</p>

      <h2>2. Оператор</h2>
      <p>Соколов Никита Юрьевич, самозанятый (плательщик НПД), г. Санкт-Петербург<br />Email: <a href="mailto:SokolovNYu@mail.ru">SokolovNYu@mail.ru</a><br />Сайт: <a href="https://careerpulse.ru">careerpulse.ru</a></p>

      <h2>3. Цели использования рекомендательных технологий</h2>
      <ul>
        <li>Повышение релевантности контента для конкретного пользователя</li>
        <li>Улучшение пользовательского опыта на сайте</li>
        <li>Анализ поведения пользователей для развития функционала</li>
        <li>Формирование персонализированных предложений (при наличии согласия)</li>
      </ul>

      <h2>4. Используемые данные</h2>
      <ul>
        <li>Сведения о просмотрах страниц сайта и переходах по ссылкам</li>
        <li>Технические данные устройства и браузера пользователя</li>
        <li>Данные файлов cookie аналитических систем (Яндекс.Метрика)</li>
        <li>Информация о географическом регионе (без точного местоположения)</li>
      </ul>

      <h2>5. Правила применения рекомендательных технологий</h2>
      <p>Рекомендательные технологии на сайте careerpulse.ru:</p>
      <ul>
        <li>Не используются для распространения запрещённого контента</li>
        <li>Не направлены на манипулирование мнением пользователей</li>
        <li>Не предполагают сбор биометрических и специальных категорий данных</li>
        <li>Применяются исключительно для улучшения качества сервиса</li>
      </ul>

      <h2>6. Отказ от рекомендательных технологий</h2>
      <p>Пользователь вправе отказаться от применения рекомендательных технологий следующими способами:</p>
      <ul>
        <li>Отключить cookie в настройках браузера</li>
        <li>Установить расширение блокировки аналитики (uBlock Origin и др.)</li>
        <li>Направить обращение на <a href="mailto:SokolovNYu@mail.ru">SokolovNYu@mail.ru</a></li>
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
