import { useState } from 'react'
import LegalShell from './LegalShell.jsx'
import SocialIcon from '../../../shared/ui/SocialIcon.jsx'

export default function LegalHub() {
  const [showCookie, setShowCookie] = useState(false)
  return (
    <LegalShell>
      <>
<nav className="legal-nav">
  <a href="/" className="nav-logo-link">
    <div className="nav-logo-mark">⚡</div>
    <div className="nav-logo-txt">CAREER<span>PULSE</span></div>
  </a>
  <a href="/dashboard" className="nav-back-link">← Личный кабинет</a>
</nav>

<main className="legal-page">
  <div className="container">
    <div className="legal-header">
      <div className="legal-eyebrow">Юридическая информация</div>
      <h1>ПРАВОВЫЕ<br /><span style={{color:'var(--accent)'}}>ДОКУМЕНТЫ</span></h1>
      <div className="legal-meta">careerpulse.ru &nbsp;·&nbsp; Никита Соколов · Санкт-Петербург · 2026</div>
    </div>

    <div className="legal-highlight">
      <p>Все документы разработаны в соответствии с законодательством Российской Федерации, в том числе ФЗ-152 «О персональных данных», ФЗ-38 «О рекламе» и ФЗ-236 о рекомендательных технологиях. Оператор данных: Соколов Никита Юрьевич, самозанятый (плательщик НПД), г. Санкт-Петербург.</p>
    </div>

    <div className="docs-grid">
      <a href="/legal/privacy" className="doc-card dc1">
        <div className="dc-icon">🔒</div>
        <div className="dc-title">Политика конфиденциальности</div>
        <div className="dc-desc">Как мы собираем, используем и защищаем ваши персональные данные. Соответствует ФЗ-152.</div>
        <div className="dc-link">Читать документ →</div>
      </a>
      <a href="/legal/terms" className="doc-card dc2">
        <div className="dc-icon">📋</div>
        <div className="dc-title">Пользовательское соглашение</div>
        <div className="dc-desc">Правила использования платформы careerpulse.ru, права и обязанности сторон, оказание услуг.</div>
        <div className="dc-link">Читать документ →</div>
      </a>
      <a href="/legal/consent" className="doc-card dc3">
        <div className="dc-icon">✅</div>
        <div className="dc-title">Согласие на обработку ПД</div>
        <div className="dc-desc">Условия и объём согласия на обработку персональных данных в соответствии со ст. 9 ФЗ-152.</div>
        <div className="dc-link">Читать документ →</div>
      </a>
      <a href="/legal/adconsent" className="doc-card dc4">
        <div className="dc-icon">📣</div>
        <div className="dc-title">Согласие на рекламные рассылки</div>
        <div className="dc-desc">Условия получения информации рекламного характера. Основание: ФЗ-38 «О рекламе».</div>
        <div className="dc-link">Читать документ →</div>
      </a>
      <a href="/legal/recomm" className="doc-card dc5">
        <div className="dc-icon">🤖</div>
        <div className="dc-title">Рекомендательные технологии</div>
        <div className="dc-desc">Уведомление об использовании алгоритмов персонализации. Основание: ФЗ-236.</div>
        <div className="dc-link">Читать документ →</div>
      </a>
      <a
        href="#"
        className="doc-card dc6"
        onClick={(e) => { e.preventDefault(); setShowCookie(s => !s) }}
      >
        <div className="dc-icon">🍪</div>
        <div className="dc-title">Настройки Cookie</div>
        <div className="dc-desc">Управление файлами cookie. Можно отключить в настройках браузера или через расширение.</div>
        <div className="dc-link">{showCookie ? 'Скрыть ↑' : 'Подробнее ↓'}</div>
      </a>
    </div>

    {showCookie && (
      <div className="legal-highlight" style={{ marginBottom: 40 }}>
        <p><strong>Какие cookie мы используем.</strong> CareerPulse использует только технические cookie, необходимые для работы сайта и авторизации (хранение сессии входа). Аналитических и рекламных cookie нет, данные третьим лицам не передаются.</p>
        <p style={{ marginTop: 10 }}>Отключить технические cookie можно в настройках браузера (раздел «Конфиденциальность и безопасность») — но тогда вход в личный кабинет работать не будет. Подробнее об обработке данных — в <a href="/legal/privacy">Политике конфиденциальности</a>.</p>
      </div>
    )}

    <div className="section-title">КОНТАКТЫ</div>
    <div className="contacts-grid">
      <a href="https://t.me/SokolovNYU" target="_blank" className="contact-card">
        <div className="cc-icon"><SocialIcon name="telegram" size={24} /></div>
        <div><div className="cc-name">Telegram</div><div className="cc-handle">@SokolovNYU</div></div>
      </a>
      <a href="https://vk.ru/sokolovnyu" target="_blank" className="contact-card">
        <div className="cc-icon"><SocialIcon name="vk" size={24} /></div>
        <div><div className="cc-name">ВКонтакте</div><div className="cc-handle">vk.ru/sokolovnyu</div></div>
      </a>
      <a href="https://youtube.com/@SokolovNYU" target="_blank" className="contact-card">
        <div className="cc-icon"><SocialIcon name="youtube" size={24} /></div>
        <div><div className="cc-name">YouTube</div><div className="cc-handle">@SokolovNYU</div></div>
      </a>
      <a href="https://rutube.ru/channel/SokolovNYU" target="_blank" className="contact-card">
        <div className="cc-icon"><SocialIcon name="rutube" size={24} /></div>
        <div><div className="cc-name">Rutube</div><div className="cc-handle">SokolovNYU</div></div>
      </a>
      <a href="mailto:SokolovNYu@mail.ru" className="contact-card">
        <div className="cc-icon"><SocialIcon name="email" size={24} /></div>
        <div><div className="cc-name">Email</div><div className="cc-handle">SokolovNYu@mail.ru</div></div>
      </a>
      <a href="tel:+79531687580" className="contact-card">
        <div className="cc-icon">📞</div>
        <div><div className="cc-name">Телефон</div><div className="cc-handle">8-953-168-75-80</div></div>
      </a>
    </div>

  </div>
</main>

<footer className="legal-footer">
  <div className="lf-inner">
    <div className="lf-bottom">
      <div className="lf-copy">© 2026 CareerPulse · careerpulse.ru · Никита Соколов</div>
      <div className="lf-links">
        <a href="/legal/privacy">Конфиденциальность</a>
        <a href="/legal/terms">Соглашение</a>
        <a href="/">На главную</a>
        <a href="/dashboard">Кабинет</a>
      </div>
    </div>
  </div>
</footer>
      </>
    </LegalShell>
  )
}
