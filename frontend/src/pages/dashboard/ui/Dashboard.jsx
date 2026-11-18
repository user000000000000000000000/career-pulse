import BrandMark from '../../../shared/ui/BrandMark.jsx'
import Icon from '../../../shared/ui/Icon.jsx'
import DrawerJourney from '../../../shared/ui/DrawerJourney.jsx'
import BirdFlight from '../../../shared/ui/BirdFlight.jsx'
import DashboardProgress from './DashboardProgress.jsx'
import '../../../shared/ui/feedback-widget.css'
import '../consultation.css'
import DashboardArtwork from './DashboardArtwork.jsx'
import IconText from '../../../shared/ui/IconText.jsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, Link } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../../../shared/auth'
import { CP, checkIsAdmin } from '../../../shared/api'
import { BLOCKS, config } from '../../../shared/config'
import { STORAGE_KEYS } from '../../../shared/lib/storageKeys'
import { DEV_PROFILES, applyDevProfile } from '../devProfiles'
import { submitConsultRequest } from '../../../shared/api'
import ContactLinks from '../../../shared/ui/ContactLinks.jsx'
import SocialIcon from '../../../shared/ui/SocialIcon.jsx'
import BlockResultModal from './BlockResultModal.jsx'
import { confirmDialog, alertDialog } from '../../../shared/ui/Dialog.jsx'
import { useModal } from '../../../shared/ui/ModalProvider.jsx'
import FamilyCard from './FamilyCard.jsx'
import RolePlaceholder from './RolePlaceholder.jsx'
import { friendlyError } from '../../../shared/lib/errors'
import { greetingName } from '../../../shared/lib/personName'
import '../dashboard.css'
import '../workspace.css'
import '../dashboard-mobile.css'
import '../dashboard-journey.css'
import '../dashboard-landing.css'
import '../dashboard-progress.css'
import '../dashboard-drawer.css'

// BLOCKS — единый реестр блоков из shared/config/blocks.js (импортируется выше).

const AXIS_INFO = [
  { key: 'ХОЧУ',     color: 'var(--brand-blue)', icon: '💡', desc: 'Склонности, ценности, образ будущего',          blocks: [2, 3, 8] },
  { key: 'МОГУ',     color: 'var(--brand-blue)',  icon: '⚡', desc: 'Как ты учишься и что уже умеешь',          blocks: [5, 6] },
  { key: 'ВОЗМОЖНОСТИ',   color: 'var(--brand-blue)', icon: '🧠', desc: 'Твой характер, уверенность и выбор решений',     blocks: [4, 7] },
  { key: 'КТО Я', color: 'var(--brand-blue)',    icon: '🌐', desc: 'Твои планы, окружение и письмо в будущее',        blocks: [1, 9, 10] },
]

const ROLE_LABELS = { parent: 'Родитель школьника', student: 'Школьник / Студент', specialist: 'Специалист', entrepreneur: 'Предприниматель', hr: 'HR / Компания' }
const AXIS_TITLES = { 'ХОЧУ': 'Хочу', 'МОГУ': 'Могу', 'ВОЗМОЖНОСТИ': 'Возможности', 'КТО Я': 'Кто я' }
const BLOCK_ICONS = ['clipboard', 'compass', 'heart', 'user', 'brain', 'briefcase', 'zap', 'rocket', 'users', 'mail']
const OUTCOMES = [
  { icon: 'bulb', title: 'Твои интересы', desc: 'Что тебе интересно. Какие занятия и сферы тебе по душе.' },
  { icon: 'user', title: 'Твой характер', desc: 'Какой ты человек. Твои сильные стороны и особенности характера.' },
  { icon: 'book', title: 'Твоя учёба', desc: 'Как ты лучше учишься. Какие у тебя способности и как тебе проще усваивать новое.' },
  { icon: 'heart', title: 'Твои ценности', desc: 'Что для тебя важно. Что тебя мотивирует и чего ты хочешь от работы.' },
  { icon: 'briefcase', title: 'Подходящие профессии', desc: 'Твой профессиональный образ и подходящие профессии. Кто ты в работе и какие профессии тебе подойдут больше всего.' },
  { icon: 'route', title: 'План действий', desc: 'План на 3–6 месяцев. Конкретные шаги: что изучить, что попробовать и куда двигаться.' },
  { icon: 'document', title: 'Подробный отчёт', desc: 'Все результаты в одном отчёте. Его можно сохранить в PDF через печать браузера и вернуться к нему позже.' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const sidebarRef = useRef(null)
  const sidebarToggleRef = useRef(null)
  const [completed, setCompleted] = useState([])
  const [profile, setProfile] = useState({})
  const [results, setResults] = useState({})
  const [blockModal, setBlockModal] = useState(null)
  const pct = Math.round(completed.length / BLOCKS.length * 100)
  const [me, setMe] = useState({ name: '', phone: '', role: '', avatar_url: '' })
  const [userLoaded, setUserLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuHost, setMenuHost] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)
  const [consultOpen, setConsultOpen] = useState(false)
  const [consultForm, setConsultForm] = useState({ name: '', contact: '', message: '' })
  const [consultBusy, setConsultBusy] = useState(false)
  const [consultErr, setConsultErr] = useState('')
  const [consultSent, setConsultSent] = useState(false)
  const consultDialogRef = useRef(null)
  const tourDialogRef = useRef(null)
  useModal({ open: consultOpen, dialogRef: consultDialogRef, onClose: () => setConsultOpen(false) })
  useModal({ open: tourOpen, dialogRef: tourDialogRef, onClose: () => setTourOpen(false) })

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
      setConsultErr(friendlyError(e, 'Не удалось отправить заявку. Попробуйте написать напрямую ниже.'))
    } finally {
      setConsultBusy(false)
    }
  }

  async function handleLogout(e) {
    e.preventDefault()
    setSidebarOpen(false)
    const ok = await confirmDialog({ title: 'Выход', message: 'Выйти из личного кабинета?', confirmText: 'Выйти', danger: true })
    if (ok) doLogout().finally(() => navigate('/'))
  }

  function handleCookieSettings(e) {
    e.preventDefault()
    alertDialog({ title: 'Cookie', message: 'Пульс Карьеры использует только технические cookie для работы сайта и входа. Отключить их можно в настройках браузера (раздел «Конфиденциальность»), но тогда вход в кабинет работать не будет.' })
  }

  // Минимум для консультации: блоки 1, 2, 3, 4, 10
  const consultMissing = [1, 2, 3, 4, 10].filter(n => !completed.includes(n))
  const nextBlock = BLOCKS.find(block => !completed.includes(block.n))?.n || 1
  const consultReady = consultMissing.length === 0

  // Фото наставника: положи файл в frontend/public/mentor-nikita.jpg.
  // Если файла нет — img не загрузится и останутся инициалы «НС».
  const mentorPhoto = import.meta.env.BASE_URL + 'mentor-nikita.jpg'

  const fallbackName = !me.name || me.name === 'Пользователь' ? profile.context?.name : ''
  const { given, family } = greetingName(me, fallbackName)
  const initials = ((given[0] || '') + (family && family !== given ? family[0] : '')).toUpperCase() || 'ИИ'
  const sbUsername = given + (family && family !== given ? ' ' + family[0] + '.' : '')
  // Пока профиль грузится — нейтральное «…», а не захардкоженная роль (иначе родитель на миг видит «Специалист»)
  const roleLabel = !userLoaded ? '…' : (ROLE_LABELS[me.role] || 'Пользователь')

  useEffect(() => {
    let progAlive = true
    CP.getProfile().then((p) => { if (progAlive) setProfile(p || {}) })
    CP.getAllResults().then((r) => { if (progAlive) setResults(r || {}) })
    CP.getProgress().then((p) => {
      if (!progAlive) return
      const saved = new Set((p.completed || []).map(Number))
      setCompleted(BLOCKS.filter(block => saved.has(block.n)).map(block => block.n))
    })
    return () => { progAlive = false }
  }, [])

  useEffect(() => {
    let alive = true
    checkIsAdmin().then(value => { if (alive) setIsAdmin(value) }).catch(() => {})
    getCurrentUser().then((u) => {
      if (!alive || !u) return
      setMe({ name: u.name || '', first_name: u.first_name || '', given_name: u.given_name || '', phone: u.phone || '', role: u.role || '', avatar_url: u.avatar_url || '' })
      setUserLoaded(true)
    })
    return () => { alive = false }
  }, [])

  useEffect(() => {
    setMenuHost(document.getElementById('site-menu-slot'))
  }, [])

  useEffect(() => { if (!sidebarOpen) setMenuOpen(false) }, [sidebarOpen])

  useEffect(() => {
    if (!sidebarOpen) return
    const sidebar = sidebarRef.current
    if (!sidebar) return
    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    const appRoot = document.getElementById('root')
    const wasInert = appRoot?.inert
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    if (appRoot) appRoot.inert = true
    const focusables = () => [...sidebar.querySelectorAll('a[href], button:not(:disabled)')].filter(el => el.getClientRects().length)
    sidebar.querySelector('.dashboard-nav-close')?.focus({ preventScroll: true })
    const onKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setSidebarOpen(false); return }
      if (event.key !== 'Tab') return
      const items = focusables(), first = items[0], last = items.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      if (appRoot) appRoot.inert = wasInert
      window.removeEventListener('keydown', onKey)
      sidebarToggleRef.current?.focus({ preventScroll: true })
    }
  }, [sidebarOpen])

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

  // Короткий итог пройденного блока: берём из агрегированного профиля, а если там
  // поля нет — из сохранённого результата блока (scores). Блок 10 (письмо) без
  // сводки намеренно — его разбирает ИИ. Нигде не показываем голое «Готово».
  function blockResult(n) {
    const p = profile || {}
    const s = results[n]?.scores || {}
    switch (n) {
      case 1: {
        const c = p.context || {}
        // grade показываем только если это номер класса (не «other» и т.п.)
        const grade = /\d/.test(String(c.grade || '')) ? `${c.grade} класс` : ''
        const label = [grade, c.city].filter(Boolean).join(', ')
        return label || 'Контекст собран'
      }
      case 2: return p.career_archetype || s.career_archetype || (s.profile_clarity != null ? `Ясность профиля ${s.profile_clarity}%` : 'Склонности определены')
      case 3: return p.values_archetype || s.values_archetype || 'Ценностный профиль собран'
      case 4: return p.personality_archetype || s.personality_archetype || s.archetype || 'Тип личности определён'
      case 5: return p.cognitive_archetype || s.cognitive_archetype || s.archetype || 'Результат о мышлении готов'
      case 6: {
        const m = p.career_maturity ?? s.careerMaturity
        return m != null ? `Готовность к выбору ${m}/100` : 'Готовность оценена'
      }
      case 7: {
        const se = p.se_general ?? s.se_general
        return se != null ? `Уверенность ${se}/100` : 'Уверенность оценена'
      }
      case 8: {
        const c = p.career_clarity ?? s.career_clarity
        return c != null ? `Ясность будущего ${c}/5` : 'Образ будущего собран'
      }
      case 9: return 'Соц. ресурсы учтены'
      case 10: return 'Письмо сохранено'
      default: return 'Пройдено'
    }
  }

  // Роли-заглушки: кабинеты HR и предпринимателя ещё в разработке.
  if (userLoaded && (me.role === 'hr' || me.role === 'entrepreneur')) {
    return <RolePlaceholder role={me.role} />
  }

  return (
    <div className="cp-dashboard dashboard-workspace dashboard-workspace--nav-closed">

      {/* ── SIDEBAR ── */}
      {menuHost && createPortal(<button ref={sidebarToggleRef} className="dashboard-menu-toggle" aria-label="Меню кабинета" aria-controls={sidebarOpen ? 'dashboard-sidebar' : undefined} aria-expanded={sidebarOpen} onClick={() => setSidebarOpen(o => !o)}><Icon name="menu" size={20}/></button>, menuHost)}
      {sidebarOpen && createPortal(<div className="cp-dashboard dashboard-drawer">
      <div className="dashboard-drawer__backdrop" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <aside ref={sidebarRef} className="sidebar open navigation-panel" id="dashboard-sidebar" aria-label="Навигация личного кабинета" role="dialog" aria-modal="true" tabIndex={-1} onClick={event => { if (event.target.closest('a')) setSidebarOpen(false) }}>
        <div className="dashboard-drawer__header">
        <Link to="/" className="sb-logo" style={{textDecoration:'none'}}>
          <div className="sb-logo-mark"><BrandMark size={24} /></div>
          <div className="sb-logo-text">Пульс<span> Карьеры</span></div>
        </Link>

        <button className="dashboard-nav-close" aria-label="Закрыть меню кабинета" onClick={() => setSidebarOpen(false)}><Icon name="close" size={20} /></button>
        </div>
        <nav className="dashboard-drawer__links" aria-label="Разделы кабинета">
        <DrawerJourney completed={completed} />
        <div className="sb-section">Главное</div>
        <Link to="/dashboard" className="sb-item active nav-panel-item" aria-current="page"><span className="icon nav-panel-icon"><IconText text={"📊"} /></span> Мой кабинет</Link>
        <Link to="/test" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><Icon name="clipboard" size={20} /></span> Пройти диагностику</Link>
        <Link to="/diagnostic" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><IconText text={"🧠"} /></span> Результаты диагностики</Link>
        <Link to="/roadmap" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><IconText text={"🗺️"} /></span> Карьерный маршрут</Link>
        <Link to="/atlas" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><IconText text={"📚"} /></span> Атлас профессий</Link>

        <div className="sb-section">Работа</div>
        <Link to="/dashboard" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><IconText text={"📅"} /></span> Мои встречи</Link>
        <Link to="/dashboard" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><IconText text={"🔔"} /></span> Уведомления</Link>
        <Link to="/profile" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><IconText text={"⚙️"} /></span> Профиль</Link>
        {isAdmin && <Link to="/admin" className="sb-item nav-panel-item"><span className="icon nav-panel-icon"><Icon name="shield" size={20} /></span> Админ-панель</Link>}

        </nav>
        <div className="sb-user" style={{position:'relative'}} ref={menuRef}>
          <button type="button" className="sb-user-btn" aria-label="Меню пользователя" aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}>
            <div className="sb-av" style={me.avatar_url ? { backgroundImage: `url(${me.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {me.avatar_url ? '' : initials}
            </div>
            <div style={{flex:'1',minWidth:'0'}}>
              <div className="sb-name">{sbUsername}</div>
              <div className="sb-role">{roleLabel}</div>
            </div>
            <div style={{fontSize:'10px',color:'var(--ghost)',transition:'transform .2s', transform: menuOpen ? 'rotate(180deg)' : ''}}><IconText text={"▲"} /></div>
          </button>
          <div className={'sb-user-menu' + (menuOpen ? ' show' : '')}>
            <Link to="/profile" className="sum-item"><span><IconText text={"⚙️"} /></span> Настройки профиля</Link>
            <Link to="/legal/privacy" className="sum-item" target="_blank"><span><IconText text={"🔒"} /></span> Конфиденциальность</Link>
            <Link to="/legal" className="sum-item" target="_blank"><span><IconText text={"📋"} /></span> Правовые документы</Link>
            <div className="sum-divider"></div>
            <Link to="/" className="sum-item"><span><IconText text={"🏠"} /></span> На главную сайта</Link>
            <div className="sum-divider"></div>
            <a href="#" className="sum-item sum-danger" onClick={handleLogout}><span><IconText text={"🚪"} /></span> Выйти из кабинета</a>
          </div>
        </div>
      </aside>
      </div>, document.body)}

      {/* ── MAIN ── */}
      <div className="main">
        <div className="content">

          {/* ── WELCOME ── */}
          <div className="dashboard-welcome-row">
          <div className="welcome-banner">
            <DashboardArtwork />
            <div className="wb-text">
              <div className="dashboard-eyebrow"><Icon name="sparkles" size={16} />Твой личный маршрут</div>
              <h1>Привет, <span className="heading-accent">{given}</span>!</h1>
              <p>Здесь ты узнаешь свои интересы и сильные стороны, изучишь профессии и составишь план, как их попробовать. Начни с вопросов о себе: <strong>10 блоков</strong>, {totalQ} вопросов, ~{totalTime} минут. Можно проходить частями и возвращаться к сохранённым ответам.</p>
              <p className="dashboard-mobile-summary">{pct >= 100
                ? 'Диагностика пройдена. Посмотри результаты и выбери, что попробовать дальше.'
                : completed.length
                  ? `Продолжи с блока ${nextBlock}. Ответы в пройденных блоках сохранены.`
                  : 'Начни с вопросов о себе. Можно проходить по одному блоку.'}</p>
            </div>
            <div className="wb-actions">
              {pct >= 100
                ? <Link to="/diagnostic" className="btn btn-accent"><IconText text={"📊 Результаты диагностики"} /></Link>
                : <Link to={`/test/${nextBlock}`} className="btn btn-accent"><IconText text={"🧠 "} />{completed.length ? 'Продолжить диагностику' : 'Начать диагностику'}</Link>}
              <button className="btn btn-outline btn-tour" onClick={() => setTourOpen(true)}><IconText text={"🗺️ Как это работает"} /></button>
            </div>
          </div>
          </div>

          <nav className="dashboard-mobile-nav" aria-label="Быстрые переходы кабинета">
            <a href="#dashboard-tests"><Icon name="clipboard" size={19} /><span>Мои тесты</span></a>
            <Link to="/diagnostic"><Icon name="chart" size={19} /><span>Результаты</span></Link>
            <Link to="/roadmap"><Icon name="compass" size={19} /><span>Маршрут</span></Link>
            <Link to="/profile"><Icon name="user" size={19} /><span>Профиль</span></Link>
          </nav>

          {/* ── PROGRESS ── */}
          <DashboardProgress completed={completed} onConsult={openConsult} />

          {/* ── ОСИ ── */}
          <div className="axes-grid">
            {AXIS_INFO.map(ax => (
              <div key={ax.key} className="axis-card" style={{'--ax-color': ax.color}}>
                <div className="ax-icon"><IconText text={ax.icon} /></div>
                <h2 className="ax-key"><span className="heading-accent">{AXIS_TITLES[ax.key]}</span></h2>
                <div className="ax-desc">{ax.desc}</div>
                <div className="ax-blocks">блоки {ax.blocks.join(', ')}</div>
              </div>
            ))}
          </div>

          {/* ── 10 БЛОКОВ ── */}
          <div className="blocks-section" id="dashboard-tests">
            <div className="section-header">
              <h2 className="section-title">10 блоков диагностики</h2>
              <div className="section-sub">{totalQ} вопросов · ~{totalTime} минут · можно проходить частями</div>
            </div>
            <div className="blocks-grid">
              {BLOCKS.map((blk) => {
                const done = completed.includes(blk.n)
                return (
                  <div key={blk.n} className={['block-card', done && 'block-card--done'].filter(Boolean).join(' ')}>
                    <div className="bc-top">
                      <span className="dashboard-block-icon"><Icon name={BLOCK_ICONS[blk.n - 1]} size={24} /></span>
                      <div className="bc-num">{blk.num}</div>
                      {blk.special && <div className="bc-star" title="Ключевой блок"><Icon name="star" size={17}/></div>}
                    </div>
                    <h3 className="bc-title"><IconText text={blk.title} /></h3>
                    {done
                      ? <div className="bc-result"><span className="bc-result-ico"><IconText text={"✓"} /></span>{blockResult(blk.n)}</div>
                      : <div className="bc-desc">{blk.desc}</div>}
                    <div className="bc-meta">
                      <span><IconText text={"📝 "} />{blk.questions} вопросов</span>
                      <span><IconText text={"⏱ ~"} />{blk.time} мин</span>
                      <span style={{marginLeft:'auto',color:'var(--ghost)'}}>+{blk.weight}% профиля</span>
                    </div>
                    {done ? (
                      <div className="bc-actions">
                        <button className="btn bc-btn bc-btn--result" onClick={() => setBlockModal(blk.n)}><IconText text={"📊 Результаты"} /></button>
                        <Link to={'/test/' + blk.n} className="btn bc-btn bc-btn--redo"><IconText text={"↻ Заново"} /></Link>
                      </div>
                    ) : (
                      <Link to={'/test/' + blk.n} className="btn bc-btn bc-btn--start"><IconText text={"Начать →"} /></Link>
                    )}
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
                <div className="m-av" style={{background:'linear-gradient(135deg,var(--violet),var(--accent))'}}>НС<img src={mentorPhoto} alt="Никита Соколов" className="m-av-img" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none' }} /></div>
                <div style={{flex:'1'}}>
                  <div className="m-name">Никита Соколов</div>
                  <div className="m-spec">Профориентолог-наставник</div>
                  <div className="m-stars"><span className="ui-rating" aria-label="5 звёзд">{Array.from({length:5},(_,i)=><Icon key={i} name="star" size={11}/>)}</span> · 10+ лет · 2000+ консультаций</div>
                  <div style={{fontSize:'11px',color:'var(--ghost)',marginTop:'4px'}}>9 лет в вузах · Санкт-Петербург</div>
                </div>
                <button className="m-btn" onClick={openConsult}>Записаться</button>
              </div>
              <div style={{marginTop:'12px',fontSize:'12px',color:'var(--ghost)',lineHeight:'1.6'}}>
                После прохождения диагностики Никита разберёт твой полный профиль и поможет выстроить маршрут. Бесплатно получишь предварительные рекомендации после блоков 1–4.
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div className="panel dashboard-outcomes">
                <h2 className="panel-title">Что ты получишь по итогу</h2>
                <ul className="dashboard-outcomes__list">
                  {OUTCOMES.map(({ icon, title, desc }) => (
                    <li key={title} className="dashboard-outcomes__item">
                      <span className="dashboard-outcomes__icon"><Icon name={icon} size={20} /></span>
                      <div><h3>{title}</h3><p>{desc}</p></div>
                    </li>
                  ))}
                </ul>
              </div>
              {/* ── Блок «Активность» временно отключён по просьбе — вернуть позже ── */}
              {false && (
              <div className="panel" style={{padding:'16px'}}>
                <div className="panel-title">Активность</div>
                <div className="activity-item" style={{padding:'8px 0',borderBottom:'none'}}>
                  <div className="a-icon"><IconText text={"🎉"} /></div>
                  <div><div className="a-text">Аккаунт создан</div><div className="a-sub">Добро пожаловать в Пульс Карьеры</div></div>
                  <div className="a-time">Сегодня</div>
                </div>
                <div className="activity-item" style={{padding:'8px 0',borderBottom:'none'}}>
                  <div className="a-icon"><IconText text={"📚"} /></div>
                  <div><div className="a-text">Диагностика готова</div><div className="a-sub">10 блоков · {totalQ} вопросов доступны</div></div>
                  <div className="a-time">Сегодня</div>
                </div>
              </div>
              )}
            </div>
          </div>

          {(me.role === 'parent' || me.role === 'student') && userLoaded && (
            <FamilyCard role={me.role} />
          )}

        </div>

        {/* ── FOOTER ── */}
      </div>
      <div className="dashboard-footer">
        <svg className="dashboard-footer__wave" viewBox="0 0 1600 150" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 68C220 140 390 10 650 66S1040 135 1280 62 1480 22 1600 56V150H0Z" fill="#070529" /></svg>
        <footer className="site-footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="fb-logo"><BrandMark size={32} variant="white" />Пульс Карьеры</div>
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
            <div className="footer-copy">© 2026 Пульс Карьеры · careerpulse.ru · Никита Соколов</div>
            <div className="footer-legal-links">
              <Link to="/legal/privacy">Конфиденциальность</Link>
              <Link to="/legal/terms">Соглашение</Link>
              <Link to="/legal">Документы</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* ── DEV: быстрое заполнение тестов ── */}
      {import.meta.env.DEV && !config.demoMode && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(12,12,24,0.94)', border: '1px solid var(--violet)', borderRadius: 12, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--violet)', textTransform: 'uppercase', fontFamily: "'JetBrains Mono',monospace" }}>DEV · быстрый прогон</div>
          {Object.entries(DEV_PROFILES).map(([key, p]) => (
            <button key={key}
              onClick={async () => { await applyDevProfile(key); navigate('/diagnostic') }}
              style={{ background: 'var(--violet)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Golos Text',sans-serif", textAlign: 'left' }}><IconText text={"\n              ⚡ "} /><IconText text={p.label} />
            </button>
          ))}
          <button onClick={() => {
            for (let i = localStorage.length - 1; i >= 0; i--) {
              const k = localStorage.key(i)
              if (k && k.startsWith(STORAGE_KEYS.prefix) && k !== STORAGE_KEYS.user && k !== STORAGE_KEYS.tourSeen) localStorage.removeItem(k)
            }
            window.location.reload()
          }}
            style={{ background: 'transparent', color: 'var(--sub)', border: '1px solid var(--line2)', borderRadius: 8, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: "'Golos Text',sans-serif" }}><IconText text={"\n            🗑 Сбросить диагностику\n          "} /></button>
        </div>
      )}

      {/* ── МОДАЛ ЗАПИСИ НА КОНСУЛЬТАЦИЮ ── */}
      {consultOpen && (
        <div className="feedback-overlay consultation-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConsultOpen(false) }}>
          <div ref={consultDialogRef} className="feedback-chat consultation-chat" role="dialog" aria-modal="true" aria-labelledby="consult-dialog-title" tabIndex={-1}>
            <div className="feedback-chat__header">
              <div className="feedback-chat__mascot" aria-hidden="true"><BirdFlight greeting={1} /></div>
              <div className="feedback-chat__eyebrow"><Icon name="message" size={15} />Личный разговор о будущем</div>
              <h2 id="consult-dialog-title">Запись на <span>консультацию</span></h2>
              <button className="feedback-chat__close" aria-label="Закрыть запись на консультацию" onClick={() => setConsultOpen(false)}><Icon name="close" size={20} /></button>
            </div>
            <div className="feedback-chat__body consultation-chat__body">
              <div className="consultation-mentor">
                <div className="m-av" style={{ background: 'linear-gradient(135deg,var(--violet),var(--accent))' }}>НС<img src={mentorPhoto} alt="Никита Соколов" className="m-av-img" loading="lazy" decoding="async" onError={(e) => { e.currentTarget.style.display = 'none' }} /></div>
                <div style={{ flex: 1 }}>
                  <div className="m-name">Никита Соколов</div>
                  <div className="m-spec">Профориентолог-наставник</div>
                  <div className="m-stars"><span className="ui-rating" aria-label="5 звёзд">{Array.from({length:5},(_,i)=><Icon key={i} name="star" size={11}/>)}</span> · 10+ лет · 2000+ консультаций</div>
                </div>
              </div>
              <p className="consultation-chat__intro">
                Первая ознакомительная консультация — <strong style={{ color: 'var(--text)' }}>бесплатно, 30 минут</strong>. Никита разберёт твой профиль и поможет наметить карьерный маршрут.
              </p>
              <div className={'consult-status ' + (consultReady ? 'ok' : 'wait')}>
                <IconText text={consultReady
                  ? '✅ Профиль готов к разбору — все ключевые блоки пройдены.'
                  : `⏳ Для предварительных рекомендаций пройди ещё блоки: ${consultMissing.join(', ')} (нужны 1–4 и 10).`} />
              </div>

              {consultSent ? (
                <div className="consult-status ok" style={{ textAlign: 'center', padding: '18px 14px' }}><IconText text={"\n                  ✅ Заявка отправлена! Никита свяжется с тобой по указанному контакту. Если хочешь быстрее — напиши сам в Telegram ниже.\n                "} /></div>
              ) : (
                <>
                  <div className="consult-field">
                    <label htmlFor="consult-name">Имя</label>
                    <input id="consult-name" autoComplete="name" className="consult-input" value={consultForm.name}
                      onChange={e => setConsultForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Как к тебе обращаться" />
                  </div>
                  <div className="consult-field">
                    <label htmlFor="consult-contact">Контакт для связи</label>
                    <input id="consult-contact" className="consult-input" value={consultForm.contact}
                      onChange={e => setConsultForm(f => ({ ...f, contact: e.target.value }))}
                      placeholder="Телефон, @telegram или email" />
                  </div>
                  <div className="consult-field">
                    <label htmlFor="consult-message">Сообщение <span style={{ color: 'var(--ghost)' }}>(необязательно)</span></label>
                    <textarea id="consult-message" className="consult-textarea" rows={2} value={consultForm.message}
                      onChange={e => setConsultForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Удобное время, вопросы…" />
                  </div>
                  {consultErr && <div className="consult-status wait" role="alert" style={{ marginBottom: 12 }}>{consultErr}</div>}
                  <button className="feedback-chat__submit"
                    onClick={sendConsult} disabled={consultBusy}>
                    <Icon name="send" size={18} />{consultBusy ? 'Отправляем…' : 'Отправить заявку'}
                  </button>
                </>
              )}

              <div className="consult-divider"><span>или напиши напрямую</span></div>
              <div className="consult-actions">
                <a className="btn btn-outline" href="https://t.me/SokolovNYU" target="_blank" rel="noopener"><SocialIcon name="telegram" style={{ marginRight: 7, verticalAlign: '-4px' }} /> Telegram</a>
                <a className="btn btn-outline" href="https://vk.com/sokolovnyu" target="_blank" rel="noopener"><SocialIcon name="vk" style={{ marginRight: 7, verticalAlign: '-4px' }} /> ВКонтакте</a>
                <a className="btn btn-outline" href="mailto:SokolovNYU@mail.ru?subject=Запись%20на%20консультацию%20Пульс%20Карьеры"><SocialIcon name="email" style={{ marginRight: 7, verticalAlign: '-4px' }} /> Email</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ТУР-МОДАЛ ── */}
      <div className={'modal-overlay' + (tourOpen ? ' show' : '')} aria-hidden={!tourOpen || undefined} onClick={(e) => { if (e.target === e.currentTarget) setTourOpen(false) }}>
        <div ref={tourDialogRef} className="modal-box" role="dialog" aria-modal={tourOpen || undefined} aria-labelledby="tour-dialog-title">
          <div className="modal-head">
            <h3 id="tour-dialog-title"><IconText text={"🗺️ КАК РАБОТАЕТ ДИАГНОСТИКА"} /></h3>
            <button className="modal-close" aria-label="Закрыть" onClick={() => setTourOpen(false)}><IconText text={"✕"} /></button>
          </div>
          <div className="modal-body">
            <p style={{fontSize:'14px',color:'var(--sub)',marginBottom:'20px',lineHeight:'1.7'}}>
              Это не один тест, а 10 коротких блоков. Каждый блок делает твой портрет точнее. Уже после нескольких блоков появятся первые советы по профессиям.
            </p>
            <div className="tour-steps">
              <div className="tour-step">
                <div className="ts-icon"><IconText text={"🎯"} /></div>
                <div>
                  <div className="ts-title">Что мы про тебя узнаём</div>
                  <div className="ts-desc">Тест смотрит на тебя с четырёх сторон: что тебе <strong>интересно</strong>, что у тебя <strong>получается</strong>, какой ты <strong>по характеру</strong> и в какой ты сейчас <strong>ситуации</strong>. Из этого собирается полная картина.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon"><IconText text={"📝"} /></div>
                <div>
                  <div className="ts-title">Начни с короткой анкеты</div>
                  <div className="ts-desc">Первый блок — анкета на 7 минут: класс, экзамены, планы, что волнует. Она подстроит все остальные блоки лично под тебя.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon"><IconText text={"💡"} /></div>
                <div>
                  <div className="ts-title">Главные блоки</div>
                  <div className="ts-desc">Блоки про склонности, ценности и характер дают основу профиля и первые рекомендации. После них система уже понимает, к чему ты тянешься.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon"><IconText text={"✍️"} /></div>
                <div>
                  <div className="ts-title">Письмо в будущее</div>
                  <div className="ts-desc">19 вопросов о себе сейчас и через 5 лет. Расскажи своими словами о мечтах, переживаниях и планах — это дополнит твои результаты.</div>
                </div>
              </div>
              <div className="tour-step">
                <div className="ts-icon"><IconText text={"🤝"} /></div>
                <div>
                  <div className="ts-title">Встреча с наставником</div>
                  <div className="ts-desc">Когда пройдёшь основные блоки и письмо — можно записаться к наставнику. Он разберёт твой профиль и поможет составить маршрут.</div>
                </div>
              </div>
            </div>
            <div style={{marginTop:'20px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
              <button className="btn btn-accent" onClick={() => { setTourOpen(false); navigate('/test/1') }}><IconText text={"Начать с Блока 1 →"} /></button>
              <button className="btn btn-outline" onClick={() => setTourOpen(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      </div>

      {blockModal != null && (
        <BlockResultModal
          blockNum={blockModal}
          title={(BLOCKS.find(b => b.n === blockModal) || {}).title || `Блок ${blockModal}`}
          scores={results[blockModal]?.scores}
          onClose={() => setBlockModal(null)}
        />
      )}

    </div>
  )
}
