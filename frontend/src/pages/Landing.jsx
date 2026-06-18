import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register as doRegister, getCurrentUser, logout as doLogout } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'
import { startVkLogin } from '../services/vk'
import { confirmDialog } from '../components/Dialog.jsx'
import '../styles/landing.css'

// ФИО хранится как «Фамилия Имя Отчество» → показываем «Имя Ф.»
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

export default function Landing() {
  const rootRef = useRef(null)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    let alive = true
    getCurrentUser().then((u) => { if (alive) setUser(u) })
    return () => { alive = false }
  }, [])

  async function onLogout() {
    const ok = await confirmDialog({ title: 'Выход', message: 'Выйти из аккаунта?', confirmText: 'Выйти', danger: true })
    if (!ok) return
    await doLogout()
    setUser(null)
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = []

    // ── Появление при скролле
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    root.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    cleanups.push(() => obs.disconnect())

    // ── Сжатие навбара
    const nav = root.querySelector('#nav')
    const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    cleanups.push(() => window.removeEventListener('scroll', onScroll))

    // ── Выбор роли
    const roleOpts = Array.from(root.querySelectorAll('.role-opt'))
    roleOpts.forEach((opt) => {
      const h = () => {
        roleOpts.forEach((o) => o.classList.remove('active'))
        opt.classList.add('active')
        const inp = opt.querySelector('input'); if (inp) inp.checked = true
      }
      opt.addEventListener('click', h)
      cleanups.push(() => opt.removeEventListener('click', h))
    })

    // ── Формат телефона
    const phone = root.querySelector('#f-phone')
    const onPhone = () => {
      let v = phone.value.replace(/\D/g, '')
      if (v.startsWith('7') || v.startsWith('8')) v = v.slice(1)
      let f = '+7 '
      if (v.length > 0) f += '(' + v.slice(0, 3)
      if (v.length >= 3) f += ') ' + v.slice(3, 6)
      if (v.length >= 6) f += '-' + v.slice(6, 8)
      if (v.length >= 8) f += '-' + v.slice(8, 10)
      phone.value = f
    }
    if (phone) { phone.addEventListener('input', onPhone); cleanups.push(() => phone.removeEventListener('input', onPhone)) }

    // ── Перехват ссылок: SPA-навигация + плавный скролл к якорям
    const onClick = (e) => {
      const a = e.target.closest('a')
      if (!a) return
      const href = a.getAttribute('href')
      if (!href) return
      if (href.startsWith('#')) {
        e.preventDefault()
        const target = root.querySelector(href)
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
      if (href.startsWith('/')) { e.preventDefault(); navigate(href) }
    }
    root.addEventListener('click', onClick)
    cleanups.push(() => root.removeEventListener('click', onClick))

    // ── Отправка формы регистрации (С ЗАЩИТОЙ ОТ ПОВТОРНЫХ КЛИКОВ)
    const q = (id) => root.querySelector('#' + id)
    const shake = (id, msg) => {
      const el = q(id); if (!el) return
      el.style.borderColor = '#ff4d6d'
      el.style.boxShadow = '0 0 0 3px rgba(255,77,109,0.15)'
      el.placeholder = msg
      setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = '' }, 2000)
    }
    
    const btn = root.querySelector('.btn-form')
    let isSubmitting = false  // ФЛАГ БЛОКИРОВКИ ПОВТОРНЫХ ОТПРАВОК

    const onSubmit = async (e) => {
      e.preventDefault()
      
      // ЗАЩИТА ОТ ПОВТОРНЫХ КЛИКОВ
      if (isSubmitting) {
        console.log('Запрос уже отправляется, подождите...')
        return
      }
      
      const name = q('f-name').value.trim()
      const surname = q('f-surname').value.trim()
      const email = q('f-email').value.trim()
      const pass = q('f-pass').value
      const agree = q('f-agree').checked
      const adult = q('f-adult') ? q('f-adult').checked : true
      const parentName = q('f-parent-name') ? q('f-parent-name').value.trim() : ''
      const parentEmail = q('f-parent-email') ? q('f-parent-email').value.trim() : ''
      const roleEl = root.querySelector('.role-opt.active input')
      const role = roleEl ? roleEl.value : 'specialist'

      if (!name) return shake('f-name', 'Введите имя')
      if (!email || !email.includes('@')) return shake('f-email', 'Введите корректный email')
      if (pass.length < 8) return shake('f-pass', 'Пароль минимум 8 символов')
      if (!adult && (!parentName || !parentEmail.includes('@'))) return shake('f-parent-name', 'Укажите данные родителя')
      if (!agree) {
        const wrap = root.querySelector('.form-agree')
        if (wrap) {
          wrap.style.color = '#ff4d6d'
          wrap.style.outline = '2px solid rgba(255,77,109,0.6)'
          wrap.style.outlineOffset = '6px'
          wrap.style.borderRadius = '8px'
          setTimeout(() => { wrap.style.outline = ''; wrap.style.color = '' }, 2500)
        }
        return
      }

      // Храним в порядке «Фамилия Имя» (как и в остальном приложении),
      // чтобы отображение имени работало одинаково везде.
      const fullName = (surname ? surname + ' ' : '') + name
      
      try {
        isSubmitting = true  // БЛОКИРУЕМ
        btn.disabled = true
        btn.textContent = 'Отправка...'
        
        const { user: created } = await doRegister({ name: fullName, email, password: pass, role, isMinor: !adult, parentName: adult ? '' : parentName, parentEmail: adult ? '' : parentEmail })
        // Нужно ли подтверждение email (только при настроенном Supabase и неподтверждённом аккаунте)
        const needConfirm = isSupabaseConfigured && created && !created.confirmed_at && !created.email_confirmed_at

        const fc = q('form-content'); if (fc) fc.style.display = 'none'
        const sm = q('success-msg')
        if (sm) {
          sm.style.display = 'block'
          if (needConfirm) {
            sm.innerHTML = '<span class="s-icon">📬</span><h3>ПОДТВЕРДИТЕ EMAIL</h3>' +
              '<p>Мы отправили письмо на <b>' + email + '</b>. Перейди по ссылке в письме, чтобы активировать аккаунт и войти.</p>'
          }
        }
        // Без подтверждения (демо или confirm выключен) — просто обновляем лендинг авторизованными
        if (!needConfirm) setTimeout(() => window.location.reload(), 1600)
      } catch (err) {
        btn.disabled = false
        btn.textContent = 'Начать диагностику →'
        shake('f-email', (err && err.message) || 'Ошибка регистрации')
        isSubmitting = false  // РАЗБЛОКИРУЕМ ПРИ ОШИБКЕ
      }
    }
    
    if (btn) { 
      btn.addEventListener('click', onSubmit)
      cleanups.push(() => btn.removeEventListener('click', onSubmit))
    }

    // ── Вход через ВКонтакте (VK ID OAuth) ──
    const vkBtn = root.querySelector('#vk-login')
    const onVk = (e) => { e.preventDefault(); startVkLogin() }
    if (vkBtn) { vkBtn.addEventListener('click', onVk); cleanups.push(() => vkBtn.removeEventListener('click', onVk)) }

    return () => cleanups.forEach((fn) => fn())
  }, [navigate])

  return (
    <div ref={rootRef} className="cp-landing">
<nav id="nav">
  <a href="/" className="nav-logo" style={{textDecoration:'none'}}>
    <div className="nav-logo-icon">⚡</div>
    <div className="nav-logo-text">CAREER<span>PULSE</span></div>
  </a>
  <ul className="nav-links">
    <li><a href="#pain">Проблема</a></li>
    <li><a href="#product">Продукт</a></li>
    <li><a href="#audience">Для кого</a></li>
    <li><a href="#register">Записаться</a></li>
  </ul>
  <div className="nav-right">
    {user ? (
      <>
        <a href="/profile" className="nav-user" style={{display:'flex',alignItems:'center',gap:'8px',textDecoration:'none',color:'var(--text)',fontWeight:'700',fontSize:'13px',marginRight:'4px'}}>
          {user.avatar_url
            ? <span style={{width:'30px',height:'30px',borderRadius:'50%',backgroundImage:`url(${user.avatar_url})`,backgroundSize:'cover',backgroundPosition:'center',display:'block',flexShrink:0}} />
            : <span style={{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,var(--accent2),var(--accent))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:'800',color:'#08080f',flexShrink:0}}>{initials(user.name)}</span>}
          <span className="nav-hide-phone">{shortName(user.name)}</span>
        </a>
        <a href="/dashboard" className="btn-nav nav-hide-phone">Пройти диагностику</a>
        <a href="/dashboard" className="btn-nav nav-phone-only">К тестам</a>
        <button className="btn-ghost" style={{background:'transparent',cursor:'pointer',fontFamily:'inherit'}} onClick={onLogout}>Выйти</button>
      </>
    ) : (
      <>
        <a href="#register" className="btn-ghost nav-hide-phone">Зарегистрироваться</a>
        <a href="/login" className="btn-nav" style={{marginRight:'6px',background:'transparent',color:'var(--text)',border:'1px solid rgba(255,255,255,0.15)'}}>Войти</a><a href="#register" className="btn-nav">Начать бесплатно</a>
      </>
    )}
  </div>
</nav>


<div className="hero">
  <div className="hero-bg"></div>
  <div className="hero-grid"></div>
  <div className="hero-scan"></div>
  <div className="hero-content">
    <div className="hero-badge"><span className="badge-dot"></span>Карьерная диагностика нового поколения</div>
    <h1 className="hero-title">
      <span className="t1">НАЙДИ СВОЙ</span>
      <span className="t2" style={{fontFamily:'\'Manrope\',sans-serif',fontWeight:'800',fontSize:'clamp(54px,8vw,114px)',letterSpacing:'2px'}}>КАРЬЕРНЫЙ</span>
      <span className="t3">пульс · вектор · путь</span>
    </h1>
    <p className="hero-sub">
      <strong>CareerPulse</strong> — платформа, которая соединяет глубокую диагностику личности, анализ рынка труда и живого карьерного наставника в один персональный маршрут.
    </p>
    <div className="hero-actions">
      <a href="#register" className="btn-primary">Пройти диагностику →</a>
      <a href="#product" className="btn-secondary">Как это работает</a>
    </div>
    <div className="hero-strip">
      <div className="strip-item">
        <div className="strip-num">30<sub>мин</sub></div>
        <div className="strip-label">Тест и результат</div>
      </div>
      <div className="strip-item">
        <div className="strip-num">105</div>
        <div className="strip-label">Профессий в атласе</div>
      </div>
      <div className="strip-item">
        <div className="strip-num">2</div>
        <div className="strip-label">Карьерных пути</div>
      </div>
      <div className="strip-item">
        <div className="strip-num">4.8<sub>★</sub></div>
        <div className="strip-label">Средний рейтинг</div>
      </div>
    </div>
  </div>
</div>


<div className="trust-strip reveal">
  <div className="trust-item"><span>🔒</span> Персональные данные защищены</div>
  <div className="trust-item"><span>🧠</span> Методология Кеттелла · MBTI · Векторная система</div>
  <div className="trust-item"><span>📊</span> Данные рынка hh.ru в реальном времени</div>
  <div className="trust-item"><span>👤</span> Живой наставник по вашему профилю</div>
</div>


<section className="sec" id="pain">
  <div className="reveal">
    <div className="eyebrow">Почему это важно</div>
    <h2 className="sec-title">РЫНОК ТРУДА <span className="acc">СЛЕП.</span><br />ЛЮДИ — ПОТЕРЯНЫ.</h2>
    <p className="sec-lead">Миллионы людей выбирают профессию вслепую, без анализа своих навыков и без понимания, что требуется на рынке сейчас и в ближайшей перспективе.</p>
  </div>
  <div className="pain-grid reveal">
    <div className="pain-card p1">
      <span className="pain-emoji">😵</span>
      <h3>Выпускники выбирают вслепую</h3>
      <p>11-классники выбирают специальность без системной диагностики, опираясь только на советы родителей и случайные тесты. 60% жалеют о выборе уже на 2-м курсе.</p>
    </div>
    <div className="pain-card p2">
      <span className="pain-emoji">🔄</span>
      <h3>Специалисты застревают</h3>
      <p>Сотрудники не понимают, как расти. HR-инструменты компаний не умеют работать с личностным профилем. Выгорание и стагнация — следствие отсутствия вектора.</p>
    </div>
    <div className="pain-card p3">
      <span className="pain-emoji">📊</span>
      <h3>Аналитика не связана с человеком</h3>
      <p>Данные о вакансиях, трендах профессий и резюме существуют отдельно от диагностики личности. Никто не объединял их в один персональный отчёт.</p>
    </div>
  </div>
</section>

<div className="divider"></div>


<section className="sec" id="product">
  <div className="reveal">
    <div className="eyebrow">Как мы решаем это</div>
    <h2 className="sec-title">ЧТО ТАКОЕ <span className="acc">CAREERPULSE</span></h2>
    <p className="sec-lead">Платформа объединяет психодиагностику, анализ рынка труда и живого карьерного наставника в одном персональном маршруте.</p>
  </div>
  <div className="product-layout">
    <div className="product-features">
      <div className="feat reveal d1">
        <div className="feat-icon">🧠</div>
        <div>
          <h4>Глубокая диагностика личности</h4>
          <p>Многоуровневое тестирование: тип личности (MBTI), ценностный профиль, когнитивные способности, мотивационные драйверы — по методологии Кеттелла, 16Personalities и авторской векторной системе профессиональных ориентаций.</p>
        </div>
      </div>
      <div className="feat reveal d2">
        <div className="feat-icon">📡</div>
        <div>
          <h4>AI-аналитика рынка труда</h4>
          <p>Парсинг вакансий и резюме в реальном времени. Система находит совпадения между вашим профилем и тем, что ищут работодатели — в вашем городе и удалённо.</p>
        </div>
      </div>
      <div className="feat reveal d3">
        <div className="feat-icon">🗺️</div>
        <div>
          <h4>Два пути развития</h4>
          <p><strong>Путь A:</strong> Как вырасти на текущем месте — конкретные шаги, навыки, сроки. <strong>Путь B:</strong> Переход в новую сферу — дорожная карта смены карьеры с анализом рисков.</p>
        </div>
      </div>
      <div className="feat reveal d4">
        <div className="feat-icon">🎯</div>
        <div>
          <h4>Карьерный консультант и наставник</h4>
          <p>После диагностики пользователь проходит сессии с живым экспертом, специализирующимся именно в той сфере, которая подошла по профилю.</p>
        </div>
      </div>
      <div className="feat reveal">
        <div className="feat-icon">📈</div>
        <div>
          <h4>Персональный карьерный трекер</h4>
          <p>Дашборд прогресса: выполненные шаги, навыки в развитии, изменения на рынке труда по вашей специализации, рекомендации в реальном времени.</p>
        </div>
      </div>
    </div>
    <div className="product-mock reveal d2">
      <div className="mock-bar">
        <div className="mock-dot" style={{background:'#ff5f57'}}></div>
        <div className="mock-dot" style={{background:'#febc2e'}}></div>
        <div className="mock-dot" style={{background:'#28c840'}}></div>
        <div className="mock-url">careerpulse.ru · dashboard</div>
      </div>
      <div className="mock-body">
        <div className="mock-profile-row">
          <div className="mock-av">НС</div>
          <div>
            <div className="mock-name">Никита Соколов</div>
            <div className="mock-type">ENTJ · Командир · Стратег</div>
          </div>
        </div>
        <div className="mock-bars-block">
          <div className="mock-bar-row">
            <div className="mock-bar-lbl">Лидерство</div>
            <div className="mock-bar-track"><div className="mock-bar-fill" style={{width:'92%',background:'linear-gradient(90deg,#7b5cf0,#00e5c8)'}}></div></div>
            <div className="mock-bar-val">92</div>
          </div>
          <div className="mock-bar-row">
            <div className="mock-bar-lbl">Коммуникация</div>
            <div className="mock-bar-track"><div className="mock-bar-fill" style={{width:'88%',background:'linear-gradient(90deg,#00e5c8,#7b5cf0)'}}></div></div>
            <div className="mock-bar-val">88</div>
          </div>
          <div className="mock-bar-row">
            <div className="mock-bar-lbl">Аналитика</div>
            <div className="mock-bar-track"><div className="mock-bar-fill" style={{width:'85%',background:'linear-gradient(90deg,#ff6b35,#7b5cf0)'}}></div></div>
            <div className="mock-bar-val">85</div>
          </div>
          <div className="mock-bar-row">
            <div className="mock-bar-lbl">Стратегия</div>
            <div className="mock-bar-track"><div className="mock-bar-fill" style={{width:'90%',background:'linear-gradient(90deg,#7b5cf0,#ff6b35)'}}></div></div>
            <div className="mock-bar-val">90</div>
          </div>
        </div>
        <div className="mock-tags-row">
          <span className="mock-tag">Предприниматель</span>
          <span className="mock-tag t2">Стратег</span>
          <span className="mock-tag t3">Продажи</span>
          <span className="mock-tag">EdTech</span>
        </div>
        <div style={{fontSize:'10px',color:'var(--muted2)',marginBottom:'10px',fontFamily:'\'JetBrains Mono\',monospace',letterSpacing:'1.5px',textTransform:'uppercase'}}>Карьерные пути</div>
        <div className="mock-paths-row">
          <div className="mock-path-card pa">
            <div className="mock-path-lbl">Путь A · Рост</div>
            <div className="mock-path-title">Product Director</div>
            <div className="mock-path-match" style={{color:'var(--accent)'}}>● 94% совпадение</div>
          </div>
          <div className="mock-path-card pb">
            <div className="mock-path-lbl">Путь B · Переход</div>
            <div className="mock-path-title">EdTech Founder</div>
            <div className="mock-path-match" style={{color:'#a488f8'}}>● 91% совпадение</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<div className="divider"></div>


<div className="sec-full">
  <div className="sec-inner" id="audience">
    <div className="reveal">
      <div className="eyebrow">Для кого</div>
      <h2 className="sec-title">ЧЕТЫРЕ <span className="acc">АУДИТОРИИ</span></h2>
      <p className="sec-lead">Четыре ключевых сегмента, боль которых мы закрываем.</p>
    </div>
    <div className="aud-grid reveal">
      <div className="aud-card c1">
        <span className="aud-emoji">🎓</span>
        <h3>Обучающиеся и родители</h3>
        <div className="aud-sub">B2C · 16–18 лет</div>
        <p>Стоят перед выбором профессии без инструментов и системы. Первый серьёзный выбор в жизни. Высокая тревога — родители готовы платить за определённость.</p>
        <span className="aud-size">~700 000 выпускников в год</span>
      </div>
      <div className="aud-card c2">
        <span className="aud-emoji">💼</span>
        <h3>Специалисты & Менеджеры</h3>
        <div className="aud-sub">B2C · 25–45 лет</div>
        <p>Ощущают стагнацию, думают о смене работы или сферы. Готовы инвестировать в карьеру. Ищут чёткий план, а не общие слова о «личностном росте».</p>
        <span className="aud-size">~18 млн активных специалистов</span>
      </div>
      <div className="aud-card c3">
        <span className="aud-emoji">🚀</span>
        <h3>Предприниматели</h3>
        <div className="aud-sub">B2C Premium</div>
        <p>Ищут подтверждение своих сильных сторон, хотят понять — куда развивать бизнес в связке с личным профилем. Готовы платить за Premium-сессии.</p>
        <span className="aud-size">~6 млн предпринимателей</span>
      </div>
      <div className="aud-card c4">
        <span className="aud-emoji">🏢</span>
        <h3>Компании & HR-отделы</h3>
        <div className="aud-sub">B2B · корпоративный</div>
        <p>Оценка персонала, построение карьерных треков, снижение текучести. Покупают пакеты на команду. Главный канал масштабирования выручки.</p>
        <span className="aud-size">~2782 HR-компании в РФ</span>
      </div>
    </div>
  </div>
</div>


<div className="reg-section" id="register">
  <div className="reg-inner">
    <div className="reg-left reveal">
      <div className="eyebrow">Записаться</div>
      <h2>НАЧНИ <span className="acc">ПРЯМО</span><br />СЕЙЧАС</h2>
      <p>Пройди диагностику за 30 минут и получи персональный карьерный маршрут с двумя путями развития.</p>
      <div className="reg-benefits">
        <div className="reg-benefit">Полный отчёт по личности — 10+ методик</div>
        <div className="reg-benefit">AI-анализ рынка труда по твоему профилю</div>
        <div className="reg-benefit">Два карьерных пути: рост и переход</div>
        <div className="reg-benefit">Первая сессия с наставником — бесплатно</div>
        <div className="reg-benefit">Атлас из 105 профессий с совместимостью</div>
        <div className="reg-benefit">Персональный трекер прогресса</div>
      </div>
    </div>
    <div className="reg-form reveal d2" id="reg-form-wrap">
      <div id="form-content">
        <div className="reg-form-title">Создать аккаунт</div>
        <div className="reg-form-sub">Уже есть аккаунт? <a href="/login" style={{color:'var(--accent)'}}>Войти</a></div>

        
        <div style={{marginBottom:'18px'}}>
          <div style={{fontSize:'12px',fontWeight:'700',color:'var(--muted2)',marginBottom:'10px'}}>Кто вы?</div>
          <div className="roles-grid">
            <label className="role-opt active">
              <input type="radio" name="role" value="student" defaultChecked />
              <span className="role-icon">🎓</span>Выпускник
            </label>
            <label className="role-opt">
              <input type="radio" name="role" value="specialist" />
              <span className="role-icon">💼</span>Специалист
            </label>
            <label className="role-opt">
              <input type="radio" name="role" value="entrepreneur" />
              <span className="role-icon">🚀</span>Предприниматель
            </label>
            <label className="role-opt">
              <input type="radio" name="role" value="hr" />
              <span className="role-icon">🏢</span>HR / Компания
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Имя</label>
            <input className="form-input" id="f-name" type="text" placeholder="Иван" />
          </div>
          <div className="form-group">
            <label>Фамилия</label>
            <input className="form-input" id="f-surname" type="text" placeholder="Иванов" />
          </div>
        </div>
        <div className="form-group">
          <label>Email</label>
          <input className="form-input" id="f-email" type="email" placeholder="ivan@email.com" />
        </div>
        <div className="form-group">
          <label>Телефон</label>
          <input className="form-input" id="f-phone" type="tel" placeholder="+7 (___) ___-__-__" />
        </div>
        <div className="form-group">
          <label>Пароль</label>
          <input className="form-input" id="f-pass" type="password" placeholder="Минимум 8 символов" />
        </div>

        <div className="form-agree" style={{marginBottom:'10px'}}>
          <input type="checkbox" id="f-adult" onChange={(e)=>{ const b=document.getElementById('f-parent-block'); if(b) b.style.display=e.target.checked?'none':'block' }} />
          <label htmlFor="f-adult">Мне есть 18 лет</label>
        </div>
        <div id="f-parent-block">
          <div className="form-group">
            <label>ФИО родителя / представителя (если младше 18)</label>
            <input className="form-input" id="f-parent-name" type="text" placeholder="Иванов Иван Иванович" />
          </div>
          <div className="form-group">
            <label>Email родителя</label>
            <input className="form-input" id="f-parent-email" type="email" placeholder="parent@email.com" />
          </div>
        </div>

        <div className="form-agree">
          <input type="checkbox" id="f-agree" />
          <label htmlFor="f-agree">Я принимаю <a href="/legal/terms" target="_blank" style={{color:'var(--accent)'}}>Условия использования</a> и <a href="/legal/privacy" target="_blank" style={{color:'var(--accent)'}}>Политику конфиденциальности</a>, а также даю <a href="/legal/consent" target="_blank" style={{color:'var(--accent)'}}>согласие на обработку персональных данных</a></label>
        </div>

        <button className="btn-form">Начать диагностику →</button>

        <div className="form-divider">или</div>
        <button id="vk-login" className="btn-secondary" style={{width:'100%',padding:'13px',fontSize:'14px',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'#fff',background:'#0077FF',border:'none'}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93v6.14C2 20.67 3.33 22 8.93 22h6.14C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2zm3.08 13.5h-1.64c-.62 0-.81-.49-1.92-1.61-1-.95-1.44-.95-1.68-.95-.34 0-.44.1-.44.59v1.47c0 .42-.13.67-1.24.67-1.82 0-3.84-1.1-5.26-3.16C4.8 9.88 4.25 8.24 4.25 7.84c0-.24.1-.46.59-.46h1.64c.44 0 .61.2.78.67.86 2.49 2.3 4.67 2.89 4.67.22 0 .32-.1.32-.66V9.84c-.07-1.18-.69-1.28-.69-1.7 0-.2.17-.4.44-.4h2.58c.37 0 .5.2.5.62v3.34c0 .37.17.5.27.5.22 0 .41-.13.82-.54 1.27-1.42 2.17-3.6 2.17-3.6.12-.24.32-.46.76-.46h1.64c.49 0 .6.25.49.59-.2 1-.2.95-1.87 3.17l-.73.98c-.12.17-.17.27 0 .47.12.17.54.53.81.85.75.83 1.32 1.52 1.47 2 .15.46-.07.7-.54.7z"/></svg>
          Войти через ВКонтакте
        </button>
      </div>

      <div className="success-msg" id="success-msg">
        <span className="s-icon">🎉</span>
        <h3>АККАУНТ СОЗДАН!</h3>
        <p>Аккаунт создан. Переходим в ваш личный кабинет CareerPulse.</p>
        <div style={{marginTop:'24px',fontFamily:'\'JetBrains Mono\',monospace',fontSize:'12px',color:'var(--accent)'}}>Перенаправление через 2 сек...</div>
      </div>
    </div>
  </div>
</div>


<div className="trust-strip reveal">
  <div className="trust-item"><span>🏆</span> 247+ пользователей в 2026</div>
  <div className="trust-item"><span>⭐</span> Рейтинг 4.8 из 5</div>
  <div className="trust-item"><span>🤝</span> Партнёр: Общество «Знание»</div>
  <div className="trust-item"><span>📍</span> Санкт-Петербург · Работаем по всей России</div>
</div>


<footer>
  <div className="foot-logo">CAREER<span>PULSE</span></div>
  <div className="foot-links" style={{flexWrap:'wrap',gap:'16px'}}>
    <a href="#pain">Проблема</a>
    <a href="#product">Продукт</a>
    <a href="#audience">Для кого</a>
    <a href="#register">Регистрация</a>
    <a href="/legal/privacy">Конфиденциальность</a>
    <a href="/legal/terms">Соглашение</a>
    <a href="/legal">Документы</a>
  </div>
  <div className="foot-copy">© 2026 CareerPulse · careerpulse.ru · <a href="https://t.me/SokolovNYU" style={{color:'var(--sub)',textDecoration:'none'}}>Telegram</a> · <a href="https://vk.ru/sokolovnyu" style={{color:'var(--sub)',textDecoration:'none'}}>VK</a></div>
</footer>    </div>
  )
}