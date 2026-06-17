import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../services/auth'
import CP from '../services/cpStorage'
import { DEV_PROFILES, applyDevProfile } from '../data/devProfiles'
import ContactLinks from '../components/ContactLinks.jsx'
import SocialIcon from '../components/SocialIcon.jsx'
import '../styles/dashboard.css'

const BLOCKS = [
  { num: '01', n: 1, axis: 'НАДО', axisColor: 'var(--sub)', title: 'Анкета-контекст',
    desc: 'Класс, ЕГЭ, планы, тревоги. Настраивает все остальные блоки под тебя. Проходится первой.',
    questions: 20, time: 7, required: true, weight: 8 },
  { num: '02', n: 2, axis: 'ХОЧУ', axisColor: 'var(--accent)', title: 'Склонности в деятельности',
    desc: 'Holland RIASEC: попарный выбор занятий с силой предпочтения. Даёт карьерный архетип.',
    questions: 30, time: 10, weight: 15 },
  { num: '03', n: 3, axis: 'ХОЧУ', axisColor: 'var(--accent)', title: 'Жизненные ценности',
    desc: 'Ситуационные дилеммы. Топ-3 ценности, мотивационный профиль и согласованность.',
    questions: 28, time: 10, weight: 10 },
  { num: '04', n: 4, axis: 'ВОЗМОЖНОСТИ', axisColor: 'var(--violet)', title: 'Личностные качества',
    desc: 'Big Five + стрессоустойчивость и толерантность к неопределённости. С контролем искренности.',
    questions: 44, time: 12, weight: 12 },
  { num: '05', n: 5, axis: 'МОГУ', axisColor: 'var(--ember)', title: 'Когнитивный профиль',
    desc: 'Самооценка мышления + практические задачи + стиль обучения VARK.',
    questions: 40, time: 12, weight: 10 },
  { num: '06', n: 6, axis: 'МОГУ', axisColor: 'var(--ember)', title: 'Профессиональная готовность',
    desc: 'Что реально получается: самооценка + реальный опыт по 5 типам деятельности.',
    questions: 32, time: 12, weight: 13 },
  { num: '07', n: 7, axis: 'ВОЗМОЖНОСТИ', axisColor: 'var(--violet)', title: 'Самоэффективность',
    desc: 'Уверенность в силах + стиль принятия решений (Бандура). Матрица Хочу–Могу–Верю.',
    questions: 39, time: 10, weight: 10 },
  { num: '08', n: 8, axis: 'ХОЧУ', axisColor: 'var(--accent)', title: 'Образ будущего',
    desc: 'Какой ты видишь работу и жизнь. Параметры-фильтры + смысловой вектор.',
    questions: 16, time: 8, weight: 7 },
  { num: '09', n: 9, axis: 'КТО Я', axisColor: 'var(--sub)', title: 'Социальный контекст',
    desc: 'Семья, окружение, опыт и поддержка. Полная картина для наставника.',
    questions: 25, time: 8, weight: 8 },
  { num: '10', n: 10, axis: 'КТО Я', axisColor: 'var(--gold)', title: 'Письмо в будущее',
    desc: '19 открытых вопросов. Рефлексивная практика — самый ценный источник данных для эксперта.',
    questions: 19, time: 25, weight: 7, special: true },
]

const AXIS_INFO = [
  { key: 'ХОЧУ',     color: 'var(--accent)', icon: '💡', desc: 'Склонности, ценности, образ будущего',          blocks: [2, 3, 8] },
  { key: 'МОГУ',     color: 'var(--ember)',  icon: '⚡', desc: 'Когнитивный профиль, проф. готовность',          blocks: [5, 6] },
  { key: 'ВОЗМОЖНОСТИ',   color: 'var(--violet)', icon: '🧠', desc: 'Личность, самоэффективность, стиль решений',     blocks: [4, 7] },
  { key: 'КТО Я', color: 'var(--sub)',    icon: '🌐', desc: 'Анкета, соц. контекст, письмо в будущее',        blocks: [1, 9, 10] },
]

export default function Dashboard() {
  const rootRef = useRef(null)
  const navigate = useNavigate()
  const [completed, setCompleted] = useState([])
  const [pct, setPct] = useState(0)
  const [consultOpen, setConsultOpen] = useState(false)

  // Минимум для консультации: блоки 1, 2, 3, 4, 10
  const consultMissing = [1, 2, 3, 4, 10].filter(n => !completed.includes(n))
  const consultReady = consultMissing.length === 0

  // Фото наставника: положи файл в frontend/public/mentor-nikita.jpg.
  // Если файла нет — img не загрузится и останутся инициалы «НС».
  const mentorPhoto = import.meta.env.BASE_URL + 'mentor-nikita.jpg'

  useEffect(() => {
    let progAlive = true
    CP.getProgress().then((p) => {
      if (!progAlive) return
      setCompleted(p.completed || [])
      setPct(p.pct || 0)
    })
    return () => { progAlive = false }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = []
    const q = (id) => root.querySelector('#' + id)
    const setText = (id, txt) => { const el = q(id); if (el) el.textContent = txt }

    let alive = true
    getCurrentUser().then((u) => {
      if (!alive || !u) return
      // ФИО хранится как «Фамилия Имя [Отчество]» → имя = 2-е слово
      const parts = (u.name || '').trim().split(/\s+/).filter(Boolean)
      const family = parts[0] || ''
      const given = parts[1] || parts[0] || 'Пользователь'
      const initials = ((given[0] || '') + (family && family !== given ? family[0] : '')).toUpperCase() || 'ИИ'
      setText('welcome-name', given)
      setText('sb-username', given + (family && family !== given ? ' ' + family[0] + '.' : ''))
      const roleMap = { parent: 'Родитель школьника', student: 'Школьник / Студент', specialist: 'Специалист', entrepreneur: 'Предприниматель', hr: 'HR / Компания' }
      setText('sb-role', roleMap[u.role] || 'Пользователь')
      // Аватар: показываем фото, если загружено, иначе инициалы
      const avEl = q('sb-av-el')
      if (avEl) {
        if (u.avatar_url) {
          avEl.textContent = ''
          avEl.style.backgroundImage = `url(${u.avatar_url})`
          avEl.style.backgroundSize = 'cover'
          avEl.style.backgroundPosition = 'center'
        } else {
          avEl.textContent = initials
        }
      }
    })

    const userBtn = q('sb-user-btn')
    const menu = q('sb-user-menu')
    const chevron = q('sb-chevron')
    const toggleMenu = () => { const open = menu.classList.toggle('show'); if (chevron) chevron.style.transform = open ? 'rotate(180deg)' : '' }
    if (userBtn) { userBtn.addEventListener('click', toggleMenu); cleanups.push(() => userBtn.removeEventListener('click', toggleMenu)) }
    const onDocClick = (e) => {
      if (menu && userBtn && !userBtn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('show'); if (chevron) chevron.style.transform = ''
      }
    }
    document.addEventListener('click', onDocClick)
    cleanups.push(() => document.removeEventListener('click', onDocClick))

    const sidebar = q('sidebar')
    const tour = q('tour-modal')
    const openTour = () => tour && tour.classList.add('show')
    const closeTour = () => tour && tour.classList.remove('show')
    const onTourBg = (e) => { if (e.target === tour) closeTour() }
    if (tour) { tour.addEventListener('click', onTourBg); cleanups.push(() => tour.removeEventListener('click', onTourBg)) }

    const onClick = (e) => {
      const a = e.target.closest('a')
      const btn = e.target.closest('button')
      const danger = e.target.closest('.sum-danger')
      if (danger) {
        e.preventDefault()
        if (confirm('Выйти из личного кабинета?')) { doLogout().finally(() => navigate('/')) }
        return
      }
      if (a) {
        const href = a.getAttribute('href')
        if (href && href.startsWith('/')) { e.preventDefault(); navigate(href); closeTour(); return }
      }
      if (btn) {
        if (btn.classList.contains('mobile-menu-btn')) { sidebar && sidebar.classList.toggle('open'); return }
        if (btn.classList.contains('topbar-btn') || btn.classList.contains('btn-tour')) { openTour(); return }
        if (btn.classList.contains('modal-close')) { closeTour(); return }
        if (tour && tour.contains(btn) && btn.classList.contains('btn-start-test')) { closeTour(); navigate('/test/1'); return }
      }
      if (e.target.closest('#cookie-settings')) {
        e.preventDefault()
        alert('Для управления cookie отключите их в настройках браузера.')
      }
    }
    root.addEventListener('click', onClick)
    cleanups.push(() => root.removeEventListener('click', onClick))

    let tourTimer
    if (!localStorage.getItem('cp_tour_seen')) {
      tourTimer = setTimeout(() => { openTour(); localStorage.setItem('cp_tour_seen', '1') }, 1200)
    }

    return () => { alive = false; clearTimeout(tourTimer); cleanups.forEach((fn) => fn()) }
  }, [navigate])

  const totalQ = BLOCKS.reduce((s, b) => s + b.questions, 0)
  const totalTime = BLOCKS.reduce((s, b) => s + b.time, 0)

  return (
    <div ref={rootRef} className="cp-dashboard">

      {/* ── SIDEBAR ── */}
      <aside className="sidebar" id="sidebar">
        <a href="/" className="sb-logo" style={{textDecoration:'none'}}>
          <div className="sb-logo-mark">⚡</div>
          <div className="sb-logo-text">CAREER<span>PULSE</span></div>
        </a>

        <div className="sb-section">Главное</div>
        <a href="/dashboard" className="sb-item active"><span className="icon">📊</span> Дашборд</a>
        <a href="/diagnostic" className="sb-item"><span className="icon">🧠</span> Результаты диагностики</a>
        <a href="/roadmap" className="sb-item"><span className="icon">🗺️</span> Карьерный маршрут</a>
        <a href="/atlas" className="sb-item"><span className="icon">📚</span> Атлас профессий</a>

        <div className="sb-section">Работа</div>
        <a href="/dashboard" className="sb-item"><span className="icon">📅</span> Мои встречи <span className="sb-badge">2</span></a>
        <a href="/dashboard" className="sb-item"><span className="icon">🔔</span> Уведомления</a>
        <a href="/profile" className="sb-item"><span className="icon">⚙️</span> Профиль</a>

        <div className="sb-user" style={{position:'relative'}}>
          <div className="sb-user-btn" style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',flex:'1',padding:'4px',borderRadius:'8px',transition:'background .2s'}} id="sb-user-btn">
            <div className="sb-av" id="sb-av-el">ИИ</div>
            <div style={{flex:'1',minWidth:'0'}}>
              <div className="sb-name" id="sb-username">Пользователь</div>
              <div className="sb-role" id="sb-role">Специалист</div>
            </div>
            <div id="sb-chevron" style={{fontSize:'10px',color:'var(--ghost)',transition:'transform .2s'}}>▲</div>
          </div>
          <div className="sb-user-menu" id="sb-user-menu">
            <a href="/profile" className="sum-item"><span>⚙️</span> Настройки профиля</a>
            <a href="/legal/privacy" className="sum-item" target="_blank"><span>🔒</span> Конфиденциальность</a>
            <a href="/legal" className="sum-item" target="_blank"><span>📋</span> Правовые документы</a>
            <div className="sum-divider"></div>
            <a href="/" className="sum-item"><span>🏠</span> На главную сайта</a>
            <div className="sum-divider"></div>
            <a href="/" className="sum-item sum-danger"><span>🚪</span> Выйти из кабинета</a>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn">☰</button>
            <div className="page-crumb">CareerPulse / <span>Дашборд диагностики</span></div>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn btn-tour">🗺️ Как это работает</button>
            <a href="/" className="topbar-btn">← На главную</a>
            <button className="topbar-btn sum-danger topbar-logout-mobile">🚪 Выйти</button>
          </div>
        </div>

        <div className="content">

          {/* ── WELCOME ── */}
          <div className="welcome-banner">
            <div className="wb-text">
              <h2>Привет, <span id="welcome-name">Пользователь</span>! 👋</h2>
              <p>Твоя профориентационная диагностика — <strong>10 блоков</strong>, {totalQ} вопросов, ~{totalTime} минут. Можно проходить частями. Каждый блок сразу добавляет слой в твой профиль.</p>
            </div>
            <div className="wb-actions">
              <a href="/test/1" className="btn btn-accent">🧠 Начать диагностику</a>
              <button className="btn btn-outline btn-tour">🗺️ Как это работает</button>
            </div>
          </div>

          {/* ── PROGRESS ── */}
          <div className="progress-block">
            <div className="pb-header">
              <div className="pb-title">Прогресс профориентационной диагностики</div>
              <div className="pb-pct-wrap">
                <span className="pb-pct">{pct}%</span>
                <span className="pb-pct-sub">пройдено</span>
              </div>
            </div>
            <div className="pb-bar">
              <div className="pb-track"><div className="pb-fill" style={{ width: pct + '%' }}></div></div>
              {[
                { pos: 10, label: 'Блок 1' },
                { pos: 45, label: 'Блоки 2–4' },
                { pos: 65, label: '+ Письмо', key: true },
                { pos: 100, label: 'Всё' },
              ].map(m => {
                const reached = pct >= m.pos
                return (
                  <div
                    key={m.pos}
                    className={'pb-mark' + (reached ? ' reached' : '') + (m.key ? ' key' : '')}
                    style={{ left: m.pos + '%' }}
                  >
                    <span className="pb-mark-dot">{reached ? '✓' : ''}</span>
                    <span className="pb-mark-label">
                      <b>{m.pos}%</b>
                      <span>{m.label}</span>
                    </span>
                  </div>
                )
              })}
            </div>
            <div className="pb-hint">Минимум для первой консультации — блоки 1, 2, 3, 4 + Письмо в будущее (блок 10)</div>
          </div>

          {/* ── ОСИ ── */}
          <div className="axes-grid">
            {AXIS_INFO.map(ax => (
              <div key={ax.key} className="axis-card" style={{'--ax-color': ax.color}}>
                <div className="ax-icon">{ax.icon}</div>
                <div className="ax-key">{ax.key}</div>
                <div className="ax-desc">{ax.desc}</div>
                <div className="ax-blocks">блоки {ax.blocks.join(', ')}</div>
              </div>
            ))}
          </div>

          {/* ── 10 БЛОКОВ ── */}
          <div className="blocks-section">
            <div className="section-header">
              <div className="section-title">10 блоков диагностики</div>
              <div className="section-sub">{totalQ} вопросов · ~{totalTime} минут · можно проходить частями</div>
            </div>
            <div className="blocks-grid">
              {BLOCKS.map((blk) => {
                const done = completed.includes(blk.n)
                return (
                  <div key={blk.n} className={['block-card', done && 'block-card--done'].filter(Boolean).join(' ')}>
                    <div className="bc-top">
                      <div className="bc-num">{blk.num}</div>
                      {blk.special && <div className="bc-star" title="Ключевой блок">★</div>}
                    </div>
                    <div className="bc-title">{blk.title}</div>
                    <div className="bc-desc">{blk.desc}</div>
                    <div className="bc-meta">
                      <span>📝 {blk.questions} вопросов</span>
                      <span>⏱ ~{blk.time} мин</span>
                      <span style={{marginLeft:'auto',color:'var(--ghost)'}}>+{blk.weight}% профиля</span>
                    </div>
                    <a href={'/test/' + blk.n} className={'btn bc-btn ' + (done ? 'bc-btn--redo' : 'bc-btn--start')}>
                      {done ? '↻ Пройти заново' : 'Начать →'}
                    </a>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── НИЖНИЙ РЯД: НАСТАВНИК + ЧТО ДАЁТь ── */}
          <div className="two-col" style={{marginTop:'24px'}}>
            <div className="panel">
              <div className="panel-title">Мой наставник и эксперт</div>
              <div className="mentor-card">
                <div className="m-av" style={{background:'linear-gradient(135deg,var(--violet),var(--accent))'}}>НС<img src={mentorPhoto} alt="Никита Соколов" className="m-av-img" onError={(e) => { e.currentTarget.style.display = 'none' }} /></div>
                <div style={{flex:'1'}}>
                  <div className="m-name">Никита Соколов</div>
                  <div className="m-spec">Профориентолог-наставник</div>
                  <div className="m-stars">★★★★★ · 10+ лет · 2000+ консультаций</div>
                  <div style={{fontSize:'11px',color:'var(--ghost)',marginTop:'4px'}}>9 лет в вузах · Санкт-Петербург</div>
                </div>
                <button className="m-btn" onClick={() => setConsultOpen(true)}>Записаться</button>
              </div>
              <div style={{marginTop:'12px',fontSize:'12px',color:'var(--ghost)',lineHeight:'1.6'}}>
                После прохождения диагностики Никита разберёт твой полный профиль и поможет выстроить маршрут. Бесплатно получишь предварительные рекомендации после блоков 1–4.
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div className="panel" style={{padding:'16px'}}>
                <div className="panel-title">Что ты получишь по итогу</div>
                <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'8px'}}>
                  {[
                    ['💡','Профиль Holland RIASEC (ось ХОЧУ)'],
                    ['🧠','Личностный профиль Big Five (КТО Я)'],
                    ['⚡','Тип интеллекта и стиль обучения (МОГУ)'],
                    ['🎯','Карта ценностей и мотивации'],
                    ['📍','Карьерный архетип и топ профессий'],
                    ['🗺️','Персональный маршрут на 3–6 месяцев'],
                    ['📄','PDF-отчёт на 20+ страниц'],
                  ].map(([icon, text]) => (
                    <li key={text} style={{display:'flex',gap:'8px',fontSize:'12px',color:'var(--sub)'}}>
                      <span style={{fontSize:'14px'}}>{icon}</span><span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="panel" style={{padding:'16px'}}>
                <div className="panel-title">Активность</div>
                <div className="activity-item" style={{padding:'8px 0',borderBottom:'none'}}>
                  <div className="a-icon">🎉</div>
                  <div><div className="a-text">Аккаунт создан</div><div className="a-sub">Добро пожаловать в CareerPulse</div></div>
                  <div className="a-time">Сегодня</div>
                </div>
                <div className="activity-item" style={{padding:'8px 0',borderBottom:'none'}}>
                  <div className="a-icon">📚</div>
                  <div><div className="a-text">Диагностика готова</div><div className="a-sub">10 блоков · {totalQ} вопросов доступны</div></div>
                  <div className="a-time">Сегодня</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── FOOTER ── */}
        <footer className="site-footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="fb-logo">CAREER<span>PULSE</span></div>
              <p>Платформа профориентации и карьерного наставничества. Глубокая диагностика, профиль личности и живой эксперт — Никита Соколов — в одном маршруте.</p>
            </div>
            <div className="footer-col">
              <h4>Правовые документы</h4>
              <ul>
                <li><a href="/legal/privacy">Политика конфиденциальности</a></li>
                <li><a href="/legal/terms">Пользовательское соглашение</a></li>
                <li><a href="/legal">Правовые документы</a></li>
                <li><a href="/legal/consent">Согласие на обработку ПД</a></li>
                <li><a href="/legal/adconsent">Согласие на рекламу</a></li>
                <li><a href="/legal/recomm">Рекомендательные технологии</a></li>
                <li><a href="#" id="cookie-settings">Настройки cookie</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Контакты</h4>
              <ul>
                <ContactLinks emailLabel="SokolovNYu@mail.ru" />
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 CareerPulse · careerpulse.ru · Никита Соколов</div>
            <div className="footer-legal-links">
              <a href="/legal/privacy">Конфиденциальность</a>
              <a href="/legal/terms">Соглашение</a>
              <a href="/legal">Документы</a>
            </div>
          </div>
        </footer>
      </div>

      {/* ── DEV: быстрое заполнение тестов ── */}
      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(12,12,24,0.94)', border: '1px solid var(--violet)', borderRadius: 12, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--violet)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" }}>DEV · быстрый прогон</div>
          {Object.entries(DEV_PROFILES).map(([key, p]) => (
            <button key={key}
              onClick={async () => { await applyDevProfile(key); navigate('/diagnostic') }}
              style={{ background: 'var(--violet)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Manrope',sans-serif", textAlign: 'left' }}>
              ⚡ {p.label}
            </button>
          ))}
          <button onClick={() => {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i)
              if (k && k.startsWith('cp_') && k !== 'cp_user' && k !== 'cp_tour_seen') localStorage.removeItem(k)
            }
            window.location.reload()
          }}
            style={{ background: 'transparent', color: 'var(--sub)', border: '1px solid var(--line2)', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Manrope',sans-serif" }}>
            🗑 Сбросить диагностику
          </button>
        </div>
      )}

      {/* ── МОДАЛ ЗАПИСИ НА КОНСУЛЬТАЦИЮ ── */}
      {consultOpen && (
        <div className="modal-overlay show" onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setConsultOpen(false) }}>
          <div className="modal-box" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <h3>ЗАПИСЬ НА КОНСУЛЬТАЦИЮ</h3>
              <button className="modal-close" onClick={() => setConsultOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="mentor-card" style={{ marginBottom: 16 }}>
                <div className="m-av" style={{ background: 'linear-gradient(135deg,var(--violet),var(--accent))' }}>НС<img src={mentorPhoto} alt="Никита Соколов" className="m-av-img" onError={(e) => { e.currentTarget.style.display = 'none' }} /></div>
                <div style={{ flex: 1 }}>
                  <div className="m-name">Никита Соколов</div>
                  <div className="m-spec">Профориентолог-наставник</div>
                  <div className="m-stars">★★★★★ · 10+ лет · 2000+ консультаций</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.6, marginBottom: 14 }}>
                Первая ознакомительная консультация — <strong style={{ color: 'var(--text)' }}>бесплатно, 30 минут</strong>. Никита разберёт твой профиль и поможет наметить карьерный маршрут.
              </p>
              <div className={'consult-status ' + (consultReady ? 'ok' : 'wait')}>
                {consultReady
                  ? '✅ Профиль готов к разбору — все ключевые блоки пройдены.'
                  : `⏳ Для предварительных рекомендаций пройди ещё блоки: ${consultMissing.join(', ')} (нужны 1–4 и 10).`}
              </div>
              <div className="consult-actions">
                <a className="btn btn-accent" href="https://t.me/SokolovNYU" target="_blank" rel="noopener"><SocialIcon name="telegram" style={{ marginRight: 7, verticalAlign: '-4px' }} /> Написать в Telegram</a>
                <a className="btn btn-outline" href="https://vk.com/sokolovnyu" target="_blank" rel="noopener"><SocialIcon name="vk" style={{ marginRight: 7, verticalAlign: '-4px' }} /> ВКонтакте</a>
                <a className="btn btn-outline" href="mailto:SokolovNYU@mail.ru?subject=Запись%20на%20консультацию%20CareerPulse&body=Здравствуйте!%20Хочу%20записаться%20на%20профориентационную%20консультацию."><SocialIcon name="email" style={{ marginRight: 7, verticalAlign: '-4px' }} /> Email</a>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ghost)', marginTop: 14, lineHeight: 1.6 }}>
                Напиши удобным способом — Никита ответит и подберёт время. Telegram отвечает быстрее всего.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ТУР-МОДАЛ ── */}
      <div className="modal-overlay" id="tour-modal">
        <div className="modal-box">
          <div className="modal-head">
            <h3>🗺️ КАК РАБОТАЕТ ДИАГНОСТИКА</h3>
            <button className="modal-close">✕</button>
          </div>
          <div className="modal-body">
            <p style={{fontSize:'14px',color:'var(--sub)',marginBottom:'20px',lineHeight:'1.7'}}>
              Это не один тест, а 10 коротких блоков. Каждый блок делает твой портрет точнее. Уже после нескольких блоков появятся первые советы по профессиям.
            </p>
            <div className="tour-steps">
              <div className="tour-step">
                <div className="ts-icon">🎯</div>
                <div>
                  <div className="ts-title">Что мы про тебя узнаём</div>
                  <div className="ts-desc">Тест смотрит на тебя с четырёх сторон: что тебе <strong>интересно</strong>, что у тебя <strong>получается</strong>, какой ты <strong>по характеру</strong> и в какой ты сейчас <strong>ситуации</strong>. Из этого собирается полная картина.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">📝</div>
                <div>
                  <div className="ts-title">Начни с короткой анкеты</div>
                  <div className="ts-desc">Первый блок — анкета на 7 минут: класс, экзамены, планы, что волнует. Она подстроит все остальные блоки лично под тебя.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">💡</div>
                <div>
                  <div className="ts-title">Главные блоки</div>
                  <div className="ts-desc">Блоки про склонности, ценности и характер дают основу профиля и первые рекомендации. После них система уже понимает, к чему ты тянешься.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">✍️</div>
                <div>
                  <div className="ts-title">Письмо в будущее</div>
                  <div className="ts-desc">19 вопросов о себе сейчас и через 5 лет. Самый важный блок: ИИ читает твои ответы и видит то, что обычный тест не покажет.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">🤝</div>
                <div>
                  <div className="ts-title">Встреча с наставником</div>
                  <div className="ts-desc">Когда пройдёшь основные блоки и письмо — можно записаться к наставнику. Он разберёт твой профиль и поможет составить маршрут.</div>
                </div>
              </div>
            </div>
            <div style={{marginTop:'20px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
              <button className="btn btn-accent btn-start-test">Начать с Блока 1 →</button>
              <button className="btn btn-outline modal-close">Закрыть</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
