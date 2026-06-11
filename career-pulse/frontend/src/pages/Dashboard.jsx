import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout as doLogout } from '../services/auth'
import '../styles/dashboard.css'

export default function Dashboard() {
  const rootRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = []
    const q = (id) => root.querySelector('#' + id)
    const setText = (id, txt) => { const el = q(id); if (el) el.textContent = txt }

    // ── Профиль пользователя
    let alive = true
    getCurrentUser().then((u) => {
      if (!alive || !u) return
      const parts = (u.name || 'ИИ').split(' ')
      const initials = ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase()
      setText('welcome-name', u.name || 'Пользователь')
      setText('sb-av-el', initials)
      setText('sb-username', (u.name || 'Пользователь').split(' ')[0] + ' ' + ((u.name || '').split(' ')[1]?.[0] || '') + '.')
      const roleMap = { student: 'Выпускник', specialist: 'Специалист', entrepreneur: 'Предприниматель', hr: 'HR / Компания' }
      setText('sb-role', roleMap[u.role] || 'Пользователь')
      if (u.testDone) {
        const st = q('stat-test'); if (st) { st.textContent = '✓'; st.style.color = 'var(--ok)' }
        setText('stat-test-sub', 'Тест пройден')
        const pb = q('pb-fill'); if (pb) pb.style.width = '34%'
        setText('progress-pct', '34%')
        renderTraits()
      }
    })

    function renderTraits() {
      const block = q('traits-block')
      if (!block) return
      block.innerHTML = `
        <div class="t-row"><div class="t-lbl"><span>Лидерство</span><span>92%</span></div><div class="t-track"><div class="t-fill" style="width:92%;background:linear-gradient(90deg,#7b5cf0,#00e5c8)"></div></div></div>
        <div class="t-row"><div class="t-lbl"><span>Стратегия</span><span>90%</span></div><div class="t-track"><div class="t-fill" style="width:90%;background:linear-gradient(90deg,#00e5c8,#7b5cf0)"></div></div></div>
        <div class="t-row"><div class="t-lbl"><span>Аналитика</span><span>85%</span></div><div class="t-track"><div class="t-fill" style="width:85%;background:linear-gradient(90deg,#ff6b35,#7b5cf0)"></div></div></div>
        <div class="t-row"><div class="t-lbl"><span>Коммуникация</span><span>88%</span></div><div class="t-track"><div class="t-fill" style="width:88%;background:linear-gradient(90deg,#7b5cf0,#00e5c8)"></div></div></div>
        <div class="t-row"><div class="t-lbl"><span>Решительность</span><span>94%</span></div><div class="t-track"><div class="t-fill" style="width:94%;background:linear-gradient(90deg,#00e5c8,#ff6b35)"></div></div></div>`
    }

    // ── Меню пользователя
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

    // ── Тур по кабинету
    const tour = q('tour-modal')
    const openTour = () => tour && tour.classList.add('show')
    const closeTour = () => tour && tour.classList.remove('show')
    const onTourBg = (e) => { if (e.target === tour) closeTour() }
    if (tour) { tour.addEventListener('click', onTourBg); cleanups.push(() => tour.removeEventListener('click', onTourBg)) }

    // ── Мобильный сайдбар
    const sidebar = q('sidebar')

    // ── Делегирование кликов
    const onClick = (e) => {
      const a = e.target.closest('a')
      const btn = e.target.closest('button')

      // Логаут
      const danger = e.target.closest('.sum-danger')
      if (danger) {
        e.preventDefault()
        if (confirm('Выйти из личного кабинета?')) {
          doLogout().finally(() => navigate('/'))
        }
        return
      }
      // Внутренние ссылки → SPA
      if (a) {
        const href = a.getAttribute('href')
        if (href && href.startsWith('/')) { e.preventDefault(); navigate(href); closeTour(); return }
      }
      if (btn) {
        const txt = (btn.textContent || '').trim()
        if (btn.classList.contains('mobile-menu-btn')) { sidebar && sidebar.classList.toggle('open'); return }
        if (btn.classList.contains('topbar-btn') || txt.includes('Знакомство с кабинетом')) { openTour(); return }
        if (btn.classList.contains('modal-close')) { closeTour(); return }
        if (tour && tour.contains(btn)) {
          if (txt.includes('начать диагностику')) { closeTour(); navigate('/test'); return }
          closeTour(); return
        }
      }
      // Cookie-настройки
      if (e.target.closest('#cookie-settings')) {
        e.preventDefault()
        alert('Для управления cookie отключите их в настройках браузера или установите расширение uBlock Origin.')
      }
    }
    root.addEventListener('click', onClick)
    cleanups.push(() => root.removeEventListener('click', onClick))

    // ── Показ тура при первом визите
    let tourTimer
    if (!localStorage.getItem('cp_tour_seen')) {
      tourTimer = setTimeout(() => { openTour(); localStorage.setItem('cp_tour_seen', '1') }, 1200)
    }

    return () => { alive = false; clearTimeout(tourTimer); cleanups.forEach((fn) => fn()) }
  }, [navigate])

  return (
    <div ref={rootRef} className="cp-dashboard">
<aside className="sidebar" id="sidebar">
  <a href="/" className="sb-logo" style={{textDecoration:'none'}}>
    <div className="sb-logo-mark">⚡</div>
    <div className="sb-logo-text">CAREER<span>PULSE</span></div>
  </a>

  <div className="sb-section">Главное</div>
  <a href="/dashboard" className="sb-item active"><span className="icon">📊</span> Дашборд</a>
  <a href="/test" className="sb-item"><span className="icon">🧠</span> Моя диагностика</a>
  <a href="dashboard.html#plan" className="sb-item"><span className="icon">🗺️</span> Карьерный план</a>
  <a href="dashboard.html#atlas" className="sb-item"><span className="icon">📚</span> Атлас профессий</a>

  <div className="sb-section">Работа</div>
  <a href="dashboard.html#booking" className="sb-item"><span className="icon">📅</span> Мои встречи <span className="sb-badge">2</span></a>
  <a href="dashboard.html#notifications" className="sb-item"><span className="icon">🔔</span> Уведомления</a>
  <a href="dashboard.html#profile" className="sb-item"><span className="icon">⚙️</span> Профиль</a>

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
      <a href="dashboard.html#profile" className="sum-item"><span>⚙️</span> Настройки профиля</a>
      <a href="/legal/privacy" className="sum-item" target="_blank"><span>🔒</span> Конфиденциальность</a>
      <a href="/legal" className="sum-item" target="_blank"><span>📋</span> Правовые документы</a>
      <div className="sum-divider"></div>
      <a href="/" className="sum-item"><span>🏠</span> На главную сайта</a>
      <div className="sum-divider"></div>
      <a href="/" className="sum-item sum-danger"><span>🚪</span> Выйти из кабинета</a>
    </div>
  </div>
</aside>


<div className="main">

  
  <div className="topbar">
    <div className="topbar-left">
      <button className="mobile-menu-btn">☰</button>
      <div className="page-crumb">CareerPulse / <span id="topbar-page">Дашборд</span></div>
    </div>
    <div className="topbar-right">
      <button className="topbar-btn notif-dot">🔔</button>
      <button className="topbar-btn">🗺️ Знакомство с кабинетом</button>
      <a href="/" className="topbar-btn">← На главную</a>
    </div>
  </div>

  
  <div className="content">

    
    <div className="welcome-banner">
      <div className="wb-text">
        <h2>Привет, <span id="welcome-name">Пользователь</span>! 👋</h2>
        <p>Добро пожаловать в CareerPulse. Ты в 1 шаге от своего персонального карьерного маршрута. Начни с диагностики — это займёт 30 минут.</p>
      </div>
      <div className="wb-actions">
        <a href="/test" className="btn btn-accent">🧠 Начать диагностику</a>
        <button className="btn btn-outline">🗺️ Знакомство с кабинетом</button>
      </div>
    </div>

    
    <div className="progress-block">
      <div className="pb-header">
        <div className="pb-title">Готовность к карьерному переходу</div>
        <div className="pb-pct" id="progress-pct">0%</div>
      </div>
      <div className="pb-track"><div className="pb-fill" id="pb-fill" style={{width:'0%'}}></div></div>
      <div className="pb-hint">Пройди диагностику чтобы получить первый результат и активировать карьерный план</div>
    </div>

    
    <div className="stats-grid">
      <div className="stat-card">
        <div className="sc-val" style={{color:'var(--ghost)'}} id="stat-test">—</div>
        <div className="sc-label">Диагностика</div>
        <div className="sc-delta d-sub" id="stat-test-sub">Не пройдена</div>
      </div>
      <div className="stat-card">
        <div className="sc-val" style={{color:'var(--gold)'}} id="stat-meeting">—</div>
        <div className="sc-label">Встреча</div>
        <div className="sc-delta d-sub" id="stat-meeting-sub">Не запланирована</div>
      </div>
      <div className="stat-card">
        <div className="sc-val" style={{color:'var(--violet)'}} id="stat-tasks">0</div>
        <div className="sc-label">Задач в плане</div>
        <div className="sc-delta d-sub">Откроются после теста</div>
      </div>
      <div className="stat-card">
        <div className="sc-val" style={{color:'var(--accent)'}} id="stat-fav">0</div>
        <div className="sc-label">Профессий в избранном</div>
        <div className="sc-delta d-sub"><a href="dashboard.html#atlas" style={{color:'var(--accent)',textDecoration:'none'}}>Открыть Атлас →</a></div>
      </div>
    </div>

    
    <div className="two-col">
      <div className="panel">
        <div className="panel-title">Компетенции · по результатам диагностики</div>
        <div id="traits-block">
          <div style={{textAlign:'center',padding:'32px 0',color:'var(--ghost)'}}>
            <div style={{fontSize:'36px',marginBottom:'12px'}}>🧠</div>
            <div style={{fontSize:'14px',fontWeight:'700',marginBottom:'6px'}}>Диагностика не пройдена</div>
            <div style={{fontSize:'12px',marginBottom:'16px'}}>Пройди тест чтобы увидеть свой профиль компетенций</div>
            <a href="/test" className="btn btn-accent" style={{fontSize:'12px',padding:'9px 20px'}}>Начать тест →</a>
          </div>
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
        <div className="next-step-card">
          <div className="ns-eyebrow">Следующий шаг</div>
          <div className="ns-title" id="next-step-text">Пройти диагностику личности</div>
          <a href="/test" className="btn btn-accent" style={{fontSize:'12px',padding:'9px 20px'}}>Начать →</a>
        </div>
        <div className="panel" style={{padding:'16px'}}>
          <div className="panel-title">Мой наставник</div>
          <div className="mentor-card">
            <div className="m-av" style={{background:'linear-gradient(135deg,#e040fb,var(--violet))'}}>ОК</div>
            <div>
              <div className="m-name">Ольга Карпова</div>
              <div className="m-spec">Карьерный коуч</div>
              <div className="m-stars">★★★★★</div>
            </div>
            <button className="m-btn">Записаться</button>
          </div>
        </div>
      </div>
    </div>

    
    <div className="panel">
      <div className="panel-title">Активность</div>
      <div className="activity-list" id="activity-list">
        <div className="activity-item">
          <div className="a-icon">🎉</div>
          <div>
            <div className="a-text">Аккаунт создан</div>
            <div className="a-sub">Добро пожаловать в CareerPulse</div>
          </div>
          <div className="a-time">Только что</div>
        </div>
        <div className="activity-item">
          <div className="a-icon">📚</div>
          <div>
            <div className="a-text">Атлас профессий доступен</div>
            <div className="a-sub">105 профессий с совместимостью по профилю</div>
          </div>
          <div className="a-time">Сегодня</div>
        </div>
      </div>
    </div>

  </div>

  
  <footer className="site-footer">
    <div className="footer-grid">
      <div className="footer-brand">
        <div className="fb-logo">CAREER<span>PULSE</span></div>
        <p>Персональная платформа карьерной диагностики. Психодиагностика, анализ рынка труда и живой наставник в одном маршруте.</p>
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


<div className="modal-overlay" id="tour-modal">
  <div className="modal-box">
    <div className="modal-head">
      <h3>🗺️ ЗНАКОМСТВО С КАБИНЕТОМ</h3>
      <button className="modal-close">✕</button>
    </div>
    <div className="modal-body">
      <p style={{fontSize:'14px',color:'var(--sub)',marginBottom:'20px',lineHeight:'1.7'}}>Твой личный кабинет CareerPulse — это 6 разделов, каждый из которых помогает двигаться к карьерной цели. Вот с чего начать:</p>
      <div className="tour-steps">
        <div className="tour-step">
          <div className="ts-icon">🧠</div>
          <div>
            <div className="ts-title">Моя диагностика</div>
            <div className="ts-desc">Пройди тест за 30 минут — получи профиль личности по MBTI, Кеттеллу и Векторной системе. Сильные стороны, ценности, мотивационные драйверы.</div>
            <button className="ts-link">→ Перейти к диагностике</button>
          </div>
        </div>
        <div className="tour-step">
          <div className="ts-icon">🗺️</div>
          <div>
            <div className="ts-title">Карьерный план</div>
            <div className="ts-desc">После теста платформа строит два карьерных пути: Путь A — рост там где ты есть, Путь B — переход в новую сферу. Чеклист задач по 4 фазам.</div>
            <button className="ts-link">→ Открыть карьерный план</button>
          </div>
        </div>
        <div className="tour-step">
          <div className="ts-icon">📚</div>
          <div>
            <div className="ts-title">Атлас профессий</div>
            <div className="ts-desc">105 профессий с зарплатами, навыками и AI-прогнозом. После диагностики каждая профессия показывает % совместимости с твоим профилем.</div>
            <button className="ts-link">→ Открыть Атлас</button>
          </div>
        </div>
        <div className="tour-step">
          <div className="ts-icon">📅</div>
          <div>
            <div className="ts-title">Мои встречи</div>
            <div className="ts-desc">Запись к живому карьерному наставнику по твоей сфере. Выбор специалиста, бронирование слота, онлайн-встреча в Zoom.</div>
            <button className="ts-link">→ Записаться к наставнику</button>
          </div>
        </div>
        <div className="tour-step">
          <div className="ts-icon">📄</div>
          <div>
            <div className="ts-title">PDF-отчёт</div>
            <div className="ts-desc">По результатам диагностики формируется полный отчёт на 20+ страниц. Можно скачать, поделиться с наставником или прикрепить к резюме.</div>
            <button className="ts-link">→ После прохождения теста</button>
          </div>
        </div>
        <div className="tour-step">
          <div className="ts-icon">🌐</div>
          <div>
            <div className="ts-title">Также доступны</div>
            <div className="ts-desc">Обзорный лендинг кабинета с демонстрацией всех экранов. Полезно если хочешь показать платформу коллеге или руководителю.</div>
            <a href="/dashboard" className="ts-link" target="_blank">→ Смотреть демо-тур кабинета</a>
          </div>
        </div>
      </div>
      <div style={{marginTop:'20px',display:'flex',gap:'10px',flexWrap:'wrap'}}>
        <button className="btn btn-accent">Всё понял, начать диагностику →</button>
        <button className="btn btn-outline">Закрыть</button>
      </div>
    </div>
  </div>
</div>    </div>
  )
}
