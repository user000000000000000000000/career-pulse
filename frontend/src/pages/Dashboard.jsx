import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../services/auth'
import '../styles/dashboard.css'

const BLOCKS = [
  {
    num: '01', id: 'interests', axis: 'ХОЧУ', axisColor: 'var(--accent)',
    title: 'Интересы и склонности',
    desc: '50 вопросов о том, что тебя притягивает: техника, анализ, творчество, общение, лидерство или структура.',
    questions: 50, time: 17, required: true,
    weight: 35,
  },
  {
    num: '02', id: 'personality', axis: 'КТО Я', axisColor: 'var(--violet)',
    title: 'Личностный стиль',
    desc: '50 вопросов о твоём психотипе: экстраверсия, логика, структура, устойчивость, самостоятельность.',
    questions: 50, time: 15, required: false,
    weight: 15,
  },
  {
    num: '03', id: 'abilities', axis: 'МОГУ', axisColor: 'var(--ember)',
    title: 'Способности',
    desc: '50 вопросов о твоих сильных сторонах: аналитика, коммуникация, креативность, организация, практика.',
    questions: 50, time: 15, required: false,
    weight: 25,
  },
  {
    num: '04', id: 'behavior', axis: 'МОГУ', axisColor: 'var(--ember)',
    title: 'Поведенческие паттерны',
    desc: '50 вопросов о том, как ты действуешь: инициатива, дисциплина, стойкость, командность, ответственность.',
    questions: 50, time: 15, required: false,
    weight: 15,
  },
  {
    num: '05', id: 'values', axis: 'ХОЧУ', axisColor: 'var(--accent)',
    title: 'Ценности и мотивация',
    desc: '50 вопросов о том, что важно: доход, стабильность, свобода, признание, польза, самовыражение, рост.',
    questions: 50, time: 15, required: false,
    weight: 10,
  },
  {
    num: '06', id: 'letter', axis: 'РЕФЛЕКСИЯ', axisColor: 'var(--sub)',
    title: 'Письмо в будущее',
    desc: '19 открытых вопросов. Рефлексивная практика — кто ты сейчас, каким хочешь стать и что для этого нужно.',
    questions: 19, time: 40, required: false,
    weight: 0, special: true,
  },
]

const AXIS_INFO = [
  { key: 'ХОЧУ',     color: 'var(--accent)', icon: '💡', desc: 'Интересы, склонности, ценности и мотивация',    blocks: [1, 5] },
  { key: 'МОГУ',     color: 'var(--ember)',  icon: '⚡', desc: 'Способности, поведение, рабочие паттерны',      blocks: [3, 4] },
  { key: 'КТО Я',   color: 'var(--violet)', icon: '🧠', desc: 'Личностный стиль, психотип, стиль решений',     blocks: [2] },
  { key: 'РЕФЛЕКСИЯ',color: 'var(--sub)',    icon: '✍️', desc: 'Открытые вопросы, письмо в будущее',           blocks: [6] },
]

export default function Dashboard() {
  const rootRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = []
    const q = (id) => root.querySelector('#' + id)
    const setText = (id, txt) => { const el = q(id); if (el) el.textContent = txt }

    let alive = true
    getCurrentUser().then((u) => {
      if (!alive || !u) return
      const parts = (u.name || 'ИИ').split(' ')
      const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase()
      setText('welcome-name', u.name ? u.name.split(' ')[0] : 'Пользователь')
      setText('sb-av-el', initials)
      setText('sb-username', (u.name || 'Пользователь').split(' ')[0] + ' ' + ((u.name || '').split(' ')[1]?.[0] || '') + '.')
      const roleMap = { parent: 'Родитель школьника', student: 'Школьник / Студент', specialist: 'Специалист', entrepreneur: 'Предприниматель', hr: 'HR / Компания' }
      setText('sb-role', roleMap[u.role] || 'Пользователь')

      // Прогресс: пока нет поблочного трекинга — если тест пройден, ставим 100%
      const pct = u.testDone ? 100 : 0
      setText('progress-pct', pct + '%')
      const fill = root.querySelector('#pb-fill')
      if (fill) fill.style.width = pct + '%'
      // Подсветить достигнутые milestone-dots
      if (pct >= 100) {
        root.querySelectorAll('.pm-dot').forEach(d => {
          d.style.background = 'var(--accent)'
        })
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
        if (tour && tour.contains(btn) && btn.classList.contains('btn-start-test')) { closeTour(); navigate('/test'); return }
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
        <a href="/result" className="sb-item"><span className="icon">🧠</span> Диагностика</a>
        <a href="/dashboard" className="sb-item"><span className="icon">🗺️</span> Карьерный маршрут</a>
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
            <button className="topbar-btn notif-dot">🔔</button>
            <button className="topbar-btn btn-tour">🗺️ Как это работает</button>
            <a href="/" className="topbar-btn">← На главную</a>
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
              <a href="/test" className="btn btn-accent">🧠 Начать диагностику</a>
              <button className="btn btn-outline btn-tour">🗺️ Как это работает</button>
            </div>
          </div>

          {/* ── PROGRESS ── */}
          <div className="progress-block">
            <div className="pb-header">
              <div className="pb-title">Прогресс профориентационной диагностики</div>
              <div className="pb-pct" id="progress-pct">0%</div>
            </div>
            <div className="pb-milestones">
              <div className="pb-milestone" style={{left:'10%'}}><div className="pm-dot"></div><div className="pm-label">Блок 1<br/>10%</div></div>
              <div className="pb-milestone" style={{left:'45%'}}><div className="pm-dot"></div><div className="pm-label">Блоки 2–4<br/>45%</div></div>
              <div className="pb-milestone" style={{left:'65%'}}><div className="pm-dot pm-key"></div><div className="pm-label">+ Письмо<br/>65%</div></div>
              <div className="pb-milestone" style={{left:'100%'}}><div className="pm-dot"></div><div className="pm-label">Всё<br/>100%</div></div>
            </div>
            <div className="pb-track"><div className="pb-fill" id="pb-fill" style={{width:'0%'}}></div></div>
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
              {BLOCKS.map((blk, i) => (
                <div key={blk.id} className={['block-card', blk.special && 'block-card--special', i === 0 && 'block-card--available'].filter(Boolean).join(' ')}>
                  <div className="bc-top">
                    <div className="bc-num">{blk.num}</div>
                    <div className="bc-axis" style={{color: blk.axisColor, borderColor: blk.axisColor + '44', background: blk.axisColor + '11'}}>{blk.axis}</div>
                    {blk.required && <div className="bc-badge bc-badge--req">Первым</div>}
                    {blk.special && <div className="bc-badge bc-badge--special">★ Ключевой</div>}
                  </div>
                  <div className="bc-title">{blk.title}</div>
                  <div className="bc-desc">{blk.desc}</div>
                  <div className="bc-meta">
                    <span>📝 {blk.questions} вопросов</span>
                    <span>⏱ ~{blk.time} мин</span>
                    <span style={{marginLeft:'auto',color:'var(--ghost)'}}>+{blk.weight}% профиля</span>
                  </div>
                  <a href="/test" className="btn btn-outline bc-btn">
                    {i === 0 ? 'Начать →' : 'Перейти →'}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* ── НИЖНИЙ РЯД: НАСТАВНИК + ЧТО ДАЁТь ── */}
          <div className="two-col" style={{marginTop:'24px'}}>
            <div className="panel">
              <div className="panel-title">Мой наставник и эксперт</div>
              <div className="mentor-card">
                <div className="m-av" style={{background:'linear-gradient(135deg,var(--violet),var(--accent))'}}>НС</div>
                <div style={{flex:'1'}}>
                  <div className="m-name">Никита Соколов</div>
                  <div className="m-spec">Профориентолог-наставник</div>
                  <div className="m-stars">★★★★★ · 10+ лет · 2000+ консультаций</div>
                  <div style={{fontSize:'11px',color:'var(--ghost)',marginTop:'4px'}}>9 лет в вузах · Санкт-Петербург</div>
                </div>
                <a href="https://t.me/SokolovNYU" target="_blank" className="m-btn" style={{textDecoration:'none'}}>Записаться</a>
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
                <li><a href="https://t.me/SokolovNYU" target="_blank">✈️ Telegram</a></li>
                <li><a href="https://vk.ru/sokolovnyu" target="_blank">🔵 ВКонтакте</a></li>
                <li><a href="https://youtube.com/@SokolovNYU" target="_blank">▶️ YouTube</a></li>
                <li><a href="https://rutube.ru/channel/SokolovNYU" target="_blank">📺 Rutube</a></li>
                <li><a href="mailto:SokolovNYu@mail.ru">✉️ SokolovNYu@mail.ru</a></li>
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

      {/* ── ТУР-МОДАЛ ── */}
      <div className="modal-overlay" id="tour-modal">
        <div className="modal-box">
          <div className="modal-head">
            <h3>🗺️ КАК РАБОТАЕТ ДИАГНОСТИКА</h3>
            <button className="modal-close">✕</button>
          </div>
          <div className="modal-body">
            <p style={{fontSize:'14px',color:'var(--sub)',marginBottom:'20px',lineHeight:'1.7'}}>
              CareerPulse — это не один тест, а система из 10 блоков. Каждый пройденный блок сразу добавляет слой в твой профиль. После 3–4 блоков уже видны первые рекомендации.
            </p>
            <div className="tour-steps">
              <div className="tour-step">
                <div className="ts-icon">🎯</div>
                <div>
                  <div className="ts-title">Три оси профиля</div>
                  <div className="ts-desc">Система строит профиль по трём осям: <strong>ХОЧУ</strong> (интересы и ценности), <strong>МОГУ</strong> (интеллект и навыки), <strong>КТО Я</strong> (личность и самоэффективность). Плюс ось <strong>НАДО</strong> — контекст жизни.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">📝</div>
                <div>
                  <div className="ts-title">Блок 1 — обязательно первым</div>
                  <div className="ts-desc">Анкета-контекст (20 вопросов, 7 минут) собирает базу: класс, ЕГЭ, планы, тревоги. Она настраивает все остальные блоки под тебя лично.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">💡</div>
                <div>
                  <div className="ts-title">Блоки 2–4 — основа профиля</div>
                  <div className="ts-desc">Склонности (Holland), Ценности и Личность дают 45% профиля и первые рекомендации. После них система уже знает, к чему ты тянешься и кто ты по характеру.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">✍️</div>
                <div>
                  <div className="ts-title">Блок 10 — Письмо в будущее ★</div>
                  <div className="ts-desc">19 открытых вопросов о себе сейчас и через 5 лет. Самый ценный блок — ИИ анализирует твой нарратив и добавляет то, что тест никогда не покажет. После него профиль достигает 65%.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon">🤝</div>
                <div>
                  <div className="ts-title">Консультация с Никитой Соколовым</div>
                  <div className="ts-desc">После блоков 1, 2, 3, 4 + Письма — достаточно для первой глубокой консультации. Никита разберёт твой профиль, выявит противоречия и построит маршрут.</div>
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
