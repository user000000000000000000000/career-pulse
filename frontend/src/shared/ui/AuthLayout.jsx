import BirdFlight from './BirdFlight.jsx'
import Icon from './Icon.jsx'
import './bird-helper.css'
import './auth-layout.css'

export default function AuthLayout({ children, registration = false }) {
  return <div className={`cp-legal auth-scene${registration ? ' auth-scene--register' : ''}`}>
    <div className="auth-scene__waves" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="none" focusable="false">
        <path d="M0 340C280 130 410 640 780 400S1270 140 1600 300V900H0Z" fill="#d8ecff" opacity=".55" />
        <path d="M0 460C350 240 500 750 850 490S1350 380 1600 430V900H0Z" fill="#e8f4ff" />
        <path d="M0 650C280 480 570 860 970 640S1360 600 1600 620V900H0Z" fill="#f7fbff" />
      </svg>
    </div>
    <div className="auth-wrap auth-scene__layout">
      <aside className="auth-scene__story" aria-label="Твой карьерный путь">
        <span className="auth-scene__eyebrow"><Icon name="sparkles" size={16} />ТВОЁ БУДУЩЕЕ НАЧИНАЕТСЯ ЗДЕСЬ</span>
        <h2>{registration ? <>Большое будущее<br />начинается <em>с тебя</em></> : <>Твой путь<br />продолжается <em>здесь</em></>}</h2>
        <p>Узнай свои сильные стороны, найди интересные профессии и собери собственный маршрут.</p>
        <div className="auth-scene__illustration" aria-hidden="true">
          <div className="auth-scene__halo" />
          <svg className="auth-scene__route" viewBox="0 0 500 360" fill="none" focusable="false"><path d="M38 268C106 346 239 310 214 249S108 162 178 97 329 68 371 131 481 210 457 74" stroke="#7eb8ef" strokeWidth="1.5" strokeDasharray="4 8" /><circle cx="39" cy="269" r="7" fill="#087cff" /><circle cx="457" cy="74" r="5" fill="#8ac9ff" /></svg>
          <div className="auth-scene__mascot"><BirdFlight greeting={1} /></div>
          <span className="auth-scene__tag auth-scene__tag--interests"><Icon name="compass" size={20} />Твои интересы</span>
          <span className="auth-scene__tag auth-scene__tag--strengths"><Icon name="sparkles" size={20} />Сильные стороны</span>
          <span className="auth-scene__tag auth-scene__tag--route"><Icon name="route" size={20} />Свой маршрут</span>
          <Icon className="auth-scene__star auth-scene__star--one" name="sparkles" size={26} />
          <Icon className="auth-scene__star auth-scene__star--two" name="sparkles" size={18} />
        </div>
        <div className="auth-scene__caption"><span>10 блоков</span><i /><span>В своём темпе</span><i /><span>Только твой путь</span></div>
      </aside>
      {children}
    </div>
  </div>
}
