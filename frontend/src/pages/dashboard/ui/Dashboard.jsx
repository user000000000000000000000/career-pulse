import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../../../shared/auth'
import { CP } from '../../../shared/api'
import { BLOCKS } from '../../../shared/config'
import { STORAGE_KEYS } from '../../../shared/lib/storageKeys'
import { DEV_PROFILES, applyDevProfile } from '../devProfiles'
import { submitConsultRequest } from '../../../shared/api'
import ContactLinks from '../../../shared/ui/ContactLinks.jsx'
import SocialIcon from '../../../shared/ui/SocialIcon.jsx'
import { confirmDialog, alertDialog } from '../../../shared/ui/Dialog.jsx'
import '../dashboard.css'

// BLOCKS — единый реестр блоков из shared/config/blocks.js (импортируется выше).

const AXIS_INFO = [
  { key: 'ХОЧУ',     color: 'var(--accent)', icon: '💡', desc: 'Склонности, ценности, образ будущего',          blocks: [2, 3, 8] },
  { key: 'МОГУ',     color: 'var(--ember)',  icon: '⚡', desc: 'Когнитивный профиль, проф. готовность',          blocks: [5, 6] },
  { key: 'ВОЗМОЖНОСТИ',   color: 'var(--violet)', icon: '🧠', desc: 'Личность, самоэффективность, стиль решений',     blocks: [4, 7] },
  { key: 'КТО Я', color: 'var(--sub)',    icon: '🌐', desc: 'Анкета, соц. контекст, письмо в будущее',        blocks: [1, 9, 10] },
]

const ROLE_LABELS = { parent: 'Родитель школьника', student: 'Школьник / Студент', specialist: 'Специалист', entrepreneur: 'Предприниматель', hr: 'HR / Компания' }

export default function Dashboard() {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [completed, setCompleted] = useState([])
  const [pct, setPct] = useState(0)
  const [me, setMe] = useState({ name: '', phone: '', role: '', avatar_url: '' })
  const [userLoaded, setUserLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [consultOpen, setConsultOpen] = useState(false)
  const [consultForm, setConsultForm] = useState({ name: '', contact: '', message: '' })
  const [consultBusy, setConsultBusy] = useState(false)
  const [consultErr, setConsultErr] = useState('')
  const [consultSent, setConsultSent] = useState(false)

  function openConsult() {
    setConsultForm({ name: me.name || '', contact: me.phone || '', message: '' })
    setConsultErr(''); setConsultSent(false); setConsultOpen(true)
  }
  async function sendConsult() {
    setConsultErr('')
    if (!consultForm.name.trim()) return setConsultErr('Укажите имя')
    if (!consultForm.contact.trim()) return setConsultErr('Укажите контакт для связи (телефон, Telegram или email)')
    try {
      setConsultBusy(true)
      await submitConsultRequest(consultForm)
      setConsultSent(true)
    } catch (e) {
      setConsultErr(e.message || 'Не удалось отправить заявку. Попробуйте написать напрямую ниже.')
    } finally {
      setConsultBusy(false)
    }
  }

  async function handleLogout(e) {
    e.preventDefault()
    const ok = await confirmDialog({ title: 'Выход', message: 'Выйти из личного кабинета?', confirmText: 'Выйти', danger: true })
    if (ok) doLogout().finally(() => navigate('/'))
  }

  function handleCookieSettings(e) {
    e.preventDefault()
    alertDialog({ title: 'Cookie', message: 'CareerPulse использует только технические cookie для работы сайта и входа. Отключить их можно в настройках браузера (раздел «Конфиденциальность»), но тогда вход в кабинет работать не будет.' })
  }

  // Минимум для консультации: блоки 1, 2, 3, 4, 10
  const consultMissing = [1, 2, 3, 4, 10].filter(n => !completed.includes(n))
  const consultReady = consultMissing.length === 0

  // Фото наставника: положи файл в frontend/public/mentor-nikita.jpg.
  // Если файла нет — img не загрузится и останутся инициалы «НС».
  const mentorPhoto = import.meta.env.BASE_URL + 'mentor-nikita.jpg'

  // ФИО хранится как «Фамилия Имя [Отчество]» → имя = 2-е слово
  const parts = (me.name || '').trim().split(/\s+/).filter(Boolean)
  const family = parts[0] || ''
  const given = parts[1] || parts[0] || 'Пользователь'
  const initials = ((given[0] || '') + (family && family !== given ? family[0] : '')).toUpperCase() || 'ИИ'
  const sbUsername = given + (family && family !== given ? ' ' + family[0] + '.' : '')
  const roleLabel = !userLoaded ? 'Специалист' : (ROLE_LABELS[me.role] || 'Пользователь')

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
    let alive = true
    getCurrentUser().then((u) => {
      if (!alive || !u) return
      setMe({ name: u.name || '', phone: u.phone || '', role: u.role || '', avatar_url: u.avatar_url || '' })
      setUserLoaded(true)
    })
    return () => { alive = false }
  }, [])

  // Закрыть выпадающее меню пользователя по клику вне его
  useEffect(() => {
    if (!menuOpen) return
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [menuOpen])

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEYS.tourSeen)) return
    const tourTimer = setTimeout(() => { setTourOpen(true); localStorage.setItem(STORAGE_KEYS.tourSeen, '1') }, 1200)
    return () => clearTimeout(tourTimer)
  }, [])

  const totalQ = BLOCKS.reduce((s, b) => s + b.questions, 0)
  const totalTime = BLOCKS.reduce((s, b) => s + b.time, 0)

  return (
    <div className="cp-dashboard">

      {/* ── SIDEBAR ── */}
      <aside className={'sidebar' + (sidebarOpen ? ' open' : '')} id="sidebar">
        <Link to="/" className="sb-logo" style={{textDecoration:'none'}}>
          <div className="sb-logo-mark">⚡</div>
          <div className="sb-logo-text">CAREER<span>PULSE</span></div>
        </Link>

        <div className="sb-section">Главное</div>
        <Link to="/dashboard" className="sb-item active"><span className="icon">📊</span> Дашборд</Link>
        <Link to="/diagnostic" className="sb-item"><span className="icon">🧠</span> Результаты диагностики</Link>
        <Link to="/roadmap" className="sb-item"><span className="icon">🗺️</span> Карьерный маршрут</Link>
        <Link to="/atlas" className="sb-item"><span className="icon">📚</span> Атлас профессий</Link>

        <div className="sb-section">Работа</div>
        <Link to="/dashboard" className="sb-item"><span className="icon">📅</span> Мои встречи <span className="sb-badge">2</span></Link>
        <Link to="/dashboard" className="sb-item"><span className="icon">🔔</span> Уведомления</Link>
        <Link to="/profile" className="sb-item"><span className="icon">⚙️</span> Профиль</Link>

        <div className="sb-user" style={{position:'relative'}} ref={menuRef}>
          <div className="sb-user-btn" style={{display:'flex',alignItems:'center',gap:'10px',cursor:'pointer',flex:'1',padding:'4px',borderRadius:'8px',transition:'background .2s'}}
            onClick={() => setMenuOpen(o => !o)}>
            <div className="sb-av" style={me.avatar_url ? { backgroundImage: `url(${me.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {me.avatar_url ? '' : initials}
            </div>
            <div style={{flex:'1',minWidth:'0'}}>
              <div className="sb-name">{sbUsername}</div>
              <div className="sb-role">{roleLabel}</div>
            </div>
            <div style={{fontSize:'10px',color:'var(--ghost)',transition:'transform .2s', transform: menuOpen ? 'rotate(180deg)' : ''}}>▲</div>
          </div>
          <div className={'sb-user-menu' + (menuOpen ? ' show' : '')}>
            <Link to="/profile" className="sum-item"><span>⚙️</span> Настройки профиля</Link>
            <Link to="/legal/privacy" className="sum-item" target="_blank"><span>🔒</span> Конфиденциальность</Link>
            <Link to="/legal" className="sum-item" target="_blank"><span>📋</span> Правовые документы</Link>
            <div className="sum-divider"></div>
            <Link to="/" className="sum-item"><span>🏠</span> На главную сайта</Link>
            <div className="sum-divider"></div>
            <a href="#" className="sum-item sum-danger" onClick={handleLogout}><span>🚪</span> Выйти из кабинета</a>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <div className="page-crumb">CareerPulse / <span>Дашборд диагностики</span></div>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn btn-tour" onClick={() => setTourOpen(true)}>🗺️ Как это работает</button>
            <Link to="/" className="topbar-btn">← На главную</Link>
            <button className="topbar-btn sum-danger topbar-logout-mobile" onClick={handleLogout}>🚪 Выйти</button>
          </div>
        </div>

        <div className="content">

          {/* ── WELCOME ── */}
          <div className="welcome-banner">
            <div className="wb-text">
              <h2>Привет, <span>{given}</span>! 👋</h2>
              <p>Твоя профориентационная диагностика — <strong>10 блоков</strong>, {totalQ} вопросов, ~{totalTime} минут. Можно проходить частями. Каждый блок сразу добавляет слой в твой профиль.</p>
            </div>
            <div className="wb-actions">
              <Link to="/test/1" className="btn btn-accent">🧠 Начать диагностику</Link>
              <button className="btn btn-outline btn-tour" onClick={() => setTourOpen(true)}>🗺️ Как это работает</button>
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
                    <Link to={'/test/' + blk.n} className={'btn bc-btn ' + (done ? 'bc-btn--redo' : 'bc-btn--start')}>
                      {done ? '↻ Пройти заново' : 'Начать →'}
                    </Link>
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
                <button className="m-btn" onClick={openConsult}>Записаться</button>
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
                <li><Link to="/legal/privacy">Политика конфиденциальности</Link></li>
                <li><Link to="/legal/terms">Пользовательское соглашение</Link></li>
                <li><Link to="/legal">Правовые документы</Link></li>
                <li><Link to="/legal/consent">Согласие на обработку ПД</Link></li>
                <li><Link to="/legal/adconsent">Согласие на рекламу</Link></li>
                <li><Link to="/legal/recomm">Рекомендательные технологии</Link></li>
                <li><a href="#" id="cookie-settings" onClick={handleCookieSettings}>Настройки cookie</a></li>
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
              <Link to="/legal/privacy">Конфиденциальность</Link>
              <Link to="/legal/terms">Соглашение</Link>
              <Link to="/legal">Документы</Link>
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
              if (k && k.startsWith(STORAGE_KEYS.prefix) && k !== STORAGE_KEYS.user && k !== STORAGE_KEYS.tourSeen) localStorage.removeItem(k)
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
        <div className="modal-overlay show" onClick={(e) => { if (e.target === e.currentTarget) setConsultOpen(false) }}>
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

              {consultSent ? (
                <div className="consult-status ok" style={{ textAlign: 'center', padding: '18px 14px' }}>
                  ✅ Заявка отправлена! Никита свяжется с тобой по указанному контакту. Если хочешь быстрее — напиши сам в Telegram ниже.
                </div>
              ) : (
                <>
                  <div className="consult-field">
                    <label>Имя</label>
                    <input className="consult-input" value={consultForm.name}
                      onChange={e => setConsultForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Как к тебе обращаться" />
                  </div>
                  <div className="consult-field">
                    <label>Контакт для связи</label>
                    <input className="consult-input" value={consultForm.contact}
                      onChange={e => setConsultForm(f => ({ ...f, contact: e.target.value }))}
                      placeholder="Телефон, @telegram или email" />
                  </div>
                  <div className="consult-field">
                    <label>Сообщение <span style={{ color: 'var(--ghost)' }}>(необязательно)</span></label>
                    <textarea className="consult-textarea" rows={2} value={consultForm.message}
                      onChange={e => setConsultForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Удобное время, вопросы…" />
                  </div>
                  {consultErr && <div className="consult-status wait" style={{ marginBottom: 12 }}>{consultErr}</div>}
                  <button className="btn btn-accent" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={sendConsult} disabled={consultBusy}>
                    {consultBusy ? 'Отправляем…' : 'Отправить заявку'}
                  </button>
                </>
              )}

              <div className="consult-divider"><span>или напиши напрямую</span></div>
              <div className="consult-actions">
                <a className="btn btn-outline" href="https://t.me/SokolovNYU" target="_blank" rel="noopener"><SocialIcon name="telegram" style={{ marginRight: 7, verticalAlign: '-4px' }} /> Telegram</a>
                <a className="btn btn-outline" href="https://vk.com/sokolovnyu" target="_blank" rel="noopener"><SocialIcon name="vk" style={{ marginRight: 7, verticalAlign: '-4px' }} /> ВКонтакте</a>
                <a className="btn btn-outline" href="mailto:SokolovNYU@mail.ru?subject=Запись%20на%20консультацию%20CareerPulse"><SocialIcon name="email" style={{ marginRight: 7, verticalAlign: '-4px' }} /> Email</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ТУР-МОДАЛ ── */}
      <div className={'modal-overlay' + (tourOpen ? ' show' : '')} onClick={(e) => { if (e.target === e.currentTarget) setTourOpen(false) }}>
        <div className="modal-box">
          <div className="modal-head">
            <h3>🗺️ КАК РАБОТАЕТ ДИАГНОСТИКА</h3>
            <button className="modal-close" onClick={() => setTourOpen(false)}>✕</button>
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
              <button className="btn btn-accent" onClick={() => { setTourOpen(false); navigate('/test/1') }}>Начать с Блока 1 →</button>
              <button className="btn btn-outline" onClick={() => setTourOpen(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
