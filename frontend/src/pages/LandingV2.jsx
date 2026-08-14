import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../services/auth'
import { confirmDialog } from '../components/Dialog.jsx'
import '../styles/landing-v2.css'

/**
 * Landing V2 — по дизайн-макету (Vic), с функционалом старой Landing:
 * кнопка «Войти», состояние авторизации (имя/кабинет/выход), якоря-ссылки на секции.
 * Форма регистрации живёт на /register.
 */
function shortName(name = '') {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (!p.length) return 'Профиль'
  const family = p[0]
  const given = p[1] || p[0]
  return (p[1] && family !== given) ? `${given} ${family[0].toUpperCase()}.` : given
}
function initials(name = '') {
  const p = name.trim().split(/\s+/).filter(Boolean)
  const family = p[0] || ''
  const given = p[1] || p[0] || ''
  return ((given[0] || '') + (family && family !== given ? family[0] : '')).toUpperCase() || 'И'
}

export default function LandingV2() {
  const rootRef = useRef(null)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let alive = true
    getCurrentUser().then((u) => { if (alive) setUser(u) })
    return () => { alive = false }
  }, [])

  // появление секций при скролле
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    root.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const start = () => navigate(user ? '/dashboard' : '/register')
  const scrollTo = (id) => {
    const el = rootRef.current?.querySelector(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  async function onLogout() {
    const ok = await confirmDialog({ title: 'Выход', message: 'Выйти из аккаунта?', confirmText: 'Выйти', danger: true })
    if (!ok) return
    await doLogout()
    setUser(null)
  }

  const STEPS = [
    ['01', 'Пройди диагностику', '10 блоков вопросов о личности, интересах и сильных сторонах.'],
    ['02', 'Получи ИИ-разбор', 'Алгоритм собирает профиль по нескольким критериям.'],
    ['03', 'Узнай сильные стороны', 'Что тебе даётся легко и почему.'],
    ['04', 'Посмотри профессии', 'Список с процентом совпадения под твой профиль.'],
    ['05', 'Построй маршрут', 'Карьерный план с живым наставником.'],
  ]
  const RINGS = [['88%', 'Личность', 88], ['92%', 'Способности', 92], ['85%', 'Интересы', 85]]
  const PROFS = [
    ['Data-аналитик', 'Работа с данными, поиск закономерностей, визуализация.', '92%'],
    ['UX-исследователь', 'Изучение поведения пользователей, гипотезы, интервью.', '88%'],
    ['Продуктовый менеджер', 'Приоритизация задач, работа с командой и метриками.', '85%'],
  ]

  return (
    <div ref={rootRef} className="cp-lv2">

      {/* ── HERO ── */}
      <div className="lv-hero">
        <div className="dotgrid" />
        <div className="blob a-morphA" style={{ width: 620, height: 620, top: -260, left: -160, background: 'radial-gradient(circle, #C9A6F5, transparent 70%)', opacity: .7 }} />
        <div className="blob a-morphB" style={{ width: 560, height: 560, top: -220, left: '22%', background: 'radial-gradient(circle, #8FB3F5, transparent 70%)', opacity: .65 }} />
        <div className="blob a-morphC" style={{ width: 420, height: 420, top: 120, right: -100, background: 'radial-gradient(circle, #F5B8E0, transparent 70%)', opacity: .5 }} />
        <div className="ring a-spin" style={{ width: 120, height: 120, top: 90, right: '22%' }} />
        <div className="ring2 a-spinRev" style={{ width: 64, height: 64, top: 260, left: '6%' }} />
        <div className="plus" style={{ top: 150, left: '44%' }} />
        <div className="plus" style={{ top: 420, right: '8%' }} />
        <div className="grain" />

        {/* навбар */}
        <nav className="lv-nav">
          <div className="lv-nav-pill glass">
            <div className="lv-logo clickable" onClick={() => navigate('/')}>CareerPulse</div>
            <div className="lv-nav-links">
              <span onClick={() => scrollTo('#how')}>Диагностика</span>
              <span onClick={() => scrollTo('#professions')}>Профессии</span>
              <span onClick={() => scrollTo('#cta')}>О нас</span>
            </div>
          </div>

          {user ? (
            <div className="lv-nav-auth">
              <div className="lv-nav-user clickable" onClick={() => navigate('/profile')}>
                {user.avatar_url
                  ? <span className="lv-nav-ava" style={{ backgroundImage: `url(${user.avatar_url})` }} />
                  : <span className="lv-nav-ava lv-nav-ava-init">{initials(user.name)}</span>}
                <span className="lv-nav-uname">{shortName(user.name)}</span>
              </div>
              <button className="lv-nav-login" onClick={onLogout}>Выйти</button>
              <button className="lv-cta-pill" onClick={() => navigate('/dashboard')}>В кабинет</button>
            </div>
          ) : (
            <div className="lv-nav-auth">
              <button className="lv-nav-login" onClick={() => navigate('/login')}>Войти</button>
              <button className="lv-cta-pill" onClick={() => navigate('/register')}>Начать тест</button>
            </div>
          )}
        </nav>

        <div className="lv-hero-inner">
          <div className="lv-hero-left">
            <div className="lv-badge glass">10 блоков диагностики · ИИ-разбор</div>
            <h1 className="lv-hero-title">Найди свой<br /><span className="accent">путь</span> в профессии</h1>
            <p className="lv-hero-sub">Профиль личности, сильные стороны и карьерный маршрут с живым наставником — за один тест.</p>
            <div className="lv-hero-actions">
              <button className="lv-btn-primary" onClick={start}>{user ? 'Продолжить диагностику' : 'Пройти диагностику'}</button>
              <div className="lv-hero-note">42 000+ прошли тест</div>
            </div>
          </div>

          <div className="lv-hero-right">
            <div className="lv-profile-card glass">
              <div className="lv-pc-head">
                <div className="lv-pc-title">Твой профиль готов</div>
                <div className="lv-pc-dot" />
              </div>
              <div className="lv-pc-rings">
                {RINGS.map(([val, lbl, pct]) => (
                  <div className="lv-ringstat" key={lbl}>
                    <div className="disc" style={{ background: `conic-gradient(#5B93E8 0%, #5B93E8 ${pct}%, rgba(43,42,74,.1) ${pct}%, rgba(43,42,74,.1) 100%)` }}>
                      <div>{val}</div>
                    </div>
                    <div className="lbl">{lbl}</div>
                  </div>
                ))}
              </div>
              <div className="lv-pc-sep" />
              <div className="lv-pc-cap">Топ-профессия</div>
              <div className="lv-pc-prof">
                <b>Data-аналитик</b><span>92%</span>
              </div>
            </div>
            <div className="lv-chip-float glass a-float">96% точность</div>
          </div>
        </div>
      </div>

      {/* ── КАК ЭТО РАБОТАЕТ ── */}
      <div className="lv-how" id="how">
        <div className="lv-how-inner">
          <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="lv-eyebrow">Как это работает</div>
            <div className="lv-h2">Пять шагов к своей профессии</div>
          </div>
          <div className="lv-steps reveal">
            <div className="lv-steps-line" />
            {STEPS.map(([n, title, desc], i) => (
              <div className={`lv-step${i % 2 ? ' up' : ''}`} key={n}>
                <div className="lv-step-num">{n}</div>
                <div className="lv-step-card">
                  <b>{title}</b>
                  <p>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ПРОФЕССИИ ── */}
      <div className="lv-prof" id="professions">
        <div className="blob a-morphB" style={{ width: 460, height: 460, top: -180, right: -120, background: 'radial-gradient(circle, #8FB3F5, transparent 70%)', opacity: .4 }} />
        <div className="ring a-spin" style={{ width: 90, height: 90, bottom: 40, left: '8%' }} />
        <div className="grain" />
        <div className="lv-prof-inner">
          <div className="lv-h2 reveal">Подходящие профессии</div>
          <div className="lv-prof-grid reveal">
            {PROFS.map(([name, desc, match]) => (
              <div className="lv-prof-card glass" key={name}>
                <div className="lv-prof-ic" />
                <b>{name}</b>
                <p>{desc}</p>
                <div className="lv-prof-match">Совпадение {match}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="lv-ctaband" id="cta">
        <div className="blob a-morphC" style={{ width: 460, height: 460, top: -180, left: '6%', background: 'radial-gradient(circle, rgba(255,255,255,.55), transparent 70%)', opacity: .8 }} />
        <div className="blob a-morphA" style={{ width: 340, height: 340, bottom: -180, right: '10%', background: 'radial-gradient(circle, rgba(255,255,255,.4), transparent 70%)', opacity: .7 }} />
        <div className="ring a-spinRev" style={{ width: 70, height: 70, top: 40, right: '20%', borderColor: 'rgba(255,255,255,.5)' }} />
        <div className="grain" />
        <div className="lv-ctaband-inner">
          <h2>Пройди диагностику и узнай, куда вести карьеру</h2>
          <button className="lv-ctaband-btn glass-dark" onClick={start}>{user ? 'В кабинет' : 'Начать бесплатно'}</button>
        </div>
      </div>

      {/* ── ФУТЕР ── */}
      <div className="lv-foot">
        <div className="lv-foot-brand">
          <div className="b">CareerPulse</div>
          <p>Профориентация без угадывания.</p>
        </div>
        <div className="lv-foot-cols">
          <div className="lv-foot-col">
            <div className="h">Продукт</div>
            <span onClick={() => scrollTo('#how')}>Диагностика</span>
            <span onClick={() => scrollTo('#professions')}>Профессии</span>
            {!user && <span onClick={() => navigate('/login')}>Войти</span>}
          </div>
          <div className="lv-foot-col">
            <div className="h">Документы</div>
            <span onClick={() => navigate('/legal/privacy')}>Конфиденциальность</span>
            <span onClick={() => navigate('/legal/terms')}>Соглашение</span>
            <span onClick={() => navigate('/legal')}>Все документы</span>
          </div>
        </div>
        <div>© 2026 CareerPulse</div>
      </div>
    </div>
  )
}
