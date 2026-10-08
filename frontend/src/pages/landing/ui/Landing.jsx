import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../../shared/auth'
import { publicUserCount } from '../../../shared/api'
import '../landing-v2.css'

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
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    let alive = true
    getCurrentUser().then((u) => { if (alive) setUser(u) })
    publicUserCount().then((n) => { if (alive && n) setUserCount(n) }).catch(() => {})
    return () => { alive = false }
  }, [])

  // Куда ведёт основной CTA: авторизованный — в кабинет, иначе — в бесплатный мини-тест (без регистрации).
  const startHref = user ? '/dashboard' : '/proba'

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanups = []

    // Появление при скролле
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    root.querySelectorAll('.reveal').forEach((el) => obs.observe(el))
    cleanups.push(() => obs.disconnect())

    // Перехват ссылок: SPA-навигация + плавный скролл к якорям
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

    return () => cleanups.forEach((fn) => fn())
  }, [navigate])

  return (
    <div ref={rootRef} className="cp-lv2">

      <nav className="lv-nav" id="nav">
        <div className="lv-nav-inner">
          <div className="lv-nav-pill">
            <a href="/" className="lv-logo">CareerPulse</a>
            <div className="lv-nav-links">
              <a href="#how">Диагностика</a>
              <a href="#professions">Профессии</a>
              <a href="#about">О нас</a>
            </div>
          </div>
          <div className="lv-nav-right">
            {user ? (
              <>
                <a href="/profile" className="lv-nav-avatar"
                   style={user.avatar_url ? { backgroundImage:`url(${user.avatar_url})` } : undefined}>
                  {user.avatar_url ? '' : initials(user.name)}
                </a>
                <a href="/dashboard" className="lv-cta-pill">В кабинет</a>
              </>
            ) : (
              <>
                <a href="/login" className="lv-nav-login">Войти</a>
                <a href={startHref} className="lv-cta-pill">Начать тест</a>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="lv-hero">
        <div className="dotgrid"></div>
        <div className="blob a-morphA" style={{width:'620px',height:'620px',top:'-260px',left:'-160px',background:'radial-gradient(circle,#C9A6F5,transparent 70%)',opacity:.7}}></div>
        <div className="blob a-morphB" style={{width:'560px',height:'560px',top:'-220px',left:'22%',background:'radial-gradient(circle,#8FB3F5,transparent 70%)',opacity:.65}}></div>
        <div className="blob a-morphC" style={{width:'420px',height:'420px',top:'120px',right:'-100px',background:'radial-gradient(circle,#F5B8E0,transparent 70%)',opacity:.5}}></div>
        <div className="ring a-spin" style={{width:'120px',height:'120px',top:'90px',right:'22%'}}></div>
        <div className="ring2 a-spinRev" style={{width:'64px',height:'64px',top:'260px',left:'6%'}}></div>
        <div className="plus" style={{top:'150px',left:'44%'}}></div>
        <div className="plus" style={{top:'420px',right:'8%'}}></div>
        <div className="grain"></div>

        <div className="lv-hero-inner">
          <div className="lv-hero-left">
            <div className="lv-badge glass">10 блоков диагностики · ИИ-разбор</div>
            <h1 className="lv-hero-title">Найди свой<br/><span className="accent">путь</span> в профессии</h1>
            <p className="lv-hero-sub">Профиль личности, сильные стороны и карьерный маршрут с живым наставником — за один тест.</p>
            <div className="lv-hero-actions">
              <a href={startHref} className="lv-btn-primary">Пройти диагностику →</a>
              <div className="lv-hero-note">
                {userCount > 0 ? `${userCount.toLocaleString('ru-RU')} уже прошли` : 'Бесплатно · ≈30 минут'}
              </div>
            </div>
          </div>
          <div className="lv-hero-right">
            <div className="lv-profile-card glass">
              <div className="lv-pc-head"><div className="lv-pc-title">Твой профиль готов</div><div className="lv-pc-dot"></div></div>
              <div className="lv-pc-rings">
                <div className="lv-ringstat"><div className="disc" style={{background:'conic-gradient(#5B93E8 0%,#5B93E8 88%,rgba(43,42,74,.1) 88%,rgba(43,42,74,.1) 100%)'}}><div>88%</div></div><div className="lbl">Личность</div></div>
                <div className="lv-ringstat"><div className="disc" style={{background:'conic-gradient(#5B93E8 0%,#5B93E8 92%,rgba(43,42,74,.1) 92%,rgba(43,42,74,.1) 100%)'}}><div>92%</div></div><div className="lbl">Способности</div></div>
                <div className="lv-ringstat"><div className="disc" style={{background:'conic-gradient(#5B93E8 0%,#5B93E8 85%,rgba(43,42,74,.1) 85%,rgba(43,42,74,.1) 100%)'}}><div>85%</div></div><div className="lbl">Интересы</div></div>
              </div>
              <div className="lv-pc-sep"></div>
              <div className="lv-pc-cap">Топ-профессия</div>
              <div className="lv-pc-prof"><b>Data-аналитик</b><span>92%</span></div>
            </div>
            <div className="lv-chip-float glass a-float">200 профессий</div>
          </div>
        </div>
      </div>

      <div className="lv-how" id="how">
        <div className="lv-how-inner">
          <div className="reveal" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div className="lv-eyebrow">Как это работает</div>
            <div className="lv-h2">Пять шагов к своей профессии</div>
            <p className="lv-lead">От первого вопроса до готового профиля и списка профессий — за один заход, без угадывания и общих фраз.</p>
          </div>
          <div className="lv-vsteps reveal">
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="M8.5 10h7M8.5 14h5"/></svg></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 01</div><b>Пройди диагностику</b><p>10 блоков и около 250 вопросов о характере, ценностях, способностях и интересах. Это основа, на которой строится весь дальнейший разбор.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><svg viewBox="0 0 24 24"><path d="M12 3l1.7 4.6L18.3 9.3 13.7 11 12 15.6 10.3 11 5.7 9.3 10.3 7.6z"/><path d="M18 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/></svg></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 02</div><b>Получи ИИ-разбор</b><p>Система читает ответы по всем блокам и собирает цельный профиль — не набор процентов, а объяснение: какой ты, что тобой движет и что в тебе неочевидно даже тебе.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><svg viewBox="0 0 24 24"><path d="M12 3l2.5 5.1 5.6.8-4.1 4 1 5.6L12 16l-5 2.6 1-5.6-4.1-4 5.6-.8z"/></svg></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 03</div><b>Узнай сильные стороны</b><p>Видно, что даётся тебе легко, а что требует усилий — и где эти качества ценятся в работе. Готовый язык, чтобы говорить о себе на собеседовании и в резюме.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/></svg></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 04</div><b>Посмотри профессии</b><p>Из атласа в 200 профессий подбираются подходящие тебе — с процентом совпадения и пояснением почему. Под каждое направление показываем вузы и специальности под твои предметы ЕГЭ.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><svg viewBox="0 0 24 24"><path d="M6 21V4"/><path d="M6 5c3-2 6 2 9.5 0v7c-3.5 2-6.5-2-9.5 0"/></svg></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 05</div><b>Построй маршрут</b><p>Живой наставник из подходящей сферы помогает превратить результат в план: с чего начать, какие навыки подтянуть и куда двигаться дальше.</p></div>
            </div>
          </div>
        </div>
      </div>

      <div className="lv-prof" id="professions">
        <div className="blob a-morphB" style={{width:'460px',height:'460px',top:'-180px',right:'-120px',background:'radial-gradient(circle,#8FB3F5,transparent 70%)',opacity:.4}}></div>
        <div className="ring a-spin" style={{width:'90px',height:'90px',bottom:'40px',left:'8%'}}></div>
        <div className="grain"></div>
        <div className="lv-prof-inner">
          <div className="reveal" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div className="lv-eyebrow">Атлас из 200 профессий</div>
            <div className="lv-h2">Подходящие профессии</div>
            <p className="lv-lead">Так выглядит часть результата на примере одного профиля: профессии, отсортированные по совпадению, с коротким описанием каждой.</p>
          </div>
          <div className="lv-prof-grid reveal">
            <div className="lv-prof-card glass"><div className="lv-prof-ic"><svg viewBox="0 0 24 24"><path d="M5 20V11M12 20V5M19 20v-6"/><path d="M3.5 20h17"/></svg></div><b>Data-аналитик</b><p>Превращает сырые данные в решения: ищет закономерности, строит отчёты и отвечает на вопросы бизнеса цифрами. Подходит тем, у кого аналитический склад ума и тяга к системности.</p><div className="lv-prof-match">Совпадение 92%</div></div>
            <div className="lv-prof-card glass"><div className="lv-prof-ic"><svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M19.5 19.5l-4.2-4.2"/></svg></div><b>UX-исследователь</b><p>Изучает, как люди пользуются продуктом: проводит интервью, проверяет гипотезы и находит, что мешает пользователям. Для тех, кто сочетает эмпатию с любовью к данным.</p><div className="lv-prof-match">Совпадение 88%</div></div>
            <div className="lv-prof-card glass"><div className="lv-prof-ic"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16M9.5 9v11"/></svg></div><b>Продуктовый менеджер</b><p>Решает, что команда делает и зачем: расставляет приоритеты и связывает бизнес, дизайн и разработку вокруг метрик. Для тех, кто любит ответственность и общую картину.</p><div className="lv-prof-match">Совпадение 85%</div></div>
          </div>
        </div>
      </div>

      <div className="lv-about" id="about">
        <div className="lv-about-inner">

          <div className="lv-about-head reveal">
            <div className="lv-eyebrow">О нас</div>
            <div className="lv-h2">Профориентация без угадывания</div>
            <p className="lv-lead">CareerPulse — это не развлекательный тест из интернета. За каждым вопросом стоит признанная методика, а за результатом — объяснение, а не ярлык из четырёх букв. Мы помогаем выбрать направление осознанно: школьникам, студентам и взрослым.</p>
            <div className="lv-stats">
              {userCount > 0 && (
                <div className="lv-stat glass"><div className="lv-stat-num">{userCount.toLocaleString('ru-RU')}</div><div className="lv-stat-lbl">прошли диагностику</div></div>
              )}
              <div className="lv-stat glass"><div className="lv-stat-num">10</div><div className="lv-stat-lbl">блоков диагностики</div></div>
              <div className="lv-stat glass"><div className="lv-stat-num">200</div><div className="lv-stat-lbl">профессий в атласе</div></div>
              <div className="lv-stat glass"><div className="lv-stat-num">6</div><div className="lv-stat-lbl">научных методик</div></div>
            </div>
          </div>

          <div className="reveal">
            <div className="lv-subhead">На чём построено</div>
            <div className="lv-mgrid">
              <div className="lv-mcard"><span className="tag">Интересы · Holland</span><b>Профессиональные типы</b><p>Модель RIASEC Джона Голланда: шесть типов интересов — какая деятельность тебя естественно притягивает.</p></div>
              <div className="lv-mcard"><span className="tag">Личность · Big Five</span><b>Большая пятёрка</b><p>Пять базовых черт характера — открытость, добросовестность, экстраверсия и другие. Без ярлыков вроде MBTI.</p></div>
              <div className="lv-mcard"><span className="tag">Ценности</span><b>Что тобой движет</b><p>Ценностный профиль: что для тебя важнее в работе — смысл или результат, рост или стабильность.</p></div>
              <div className="lv-mcard"><span className="tag">Способности</span><b>Когнитивный профиль</b><p>Сильные стороны мышления и предпочитаемые способы восприятия (VARK): где ты схватываешь быстрее.</p></div>
              <div className="lv-mcard"><span className="tag">Самоэффективность</span><b>Вера в свои силы</b><p>По Альберту Бандуре: насколько ты уверен в себе в разных сферах и как принимаешь решения.</p></div>
              <div className="lv-mcard"><span className="tag">Готовность</span><b>Профессиональная зрелость</b><p>Разрыв между самооценкой и реальным опытом — чтобы карьерный план был честным, а не на словах.</p></div>
            </div>
          </div>

          <div className="reveal">
            <div className="lv-subhead">Чем мы отличаемся</div>
            <div className="lv-diffs">
              <div className="lv-diff">
                <div className="lv-diff-ic"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg></div>
                <div><b>Объяснение, а не ярлык</b><p>ИИ-разбор пишет связный портрет: кто ты и что тобой движет, — а не выдаёт четыре буквы типа и голый график.</p></div>
              </div>
              <div className="lv-diff">
                <div className="lv-diff-ic"><svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v5l-5 10a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3"/><path d="M7.5 15h9"/></svg></div>
                <div><b>Методики, а не угадайка</b><p>Шесть признанных психометрических моделей вместо случайных вопросов «кто ты из персонажей».</p></div>
              </div>
              <div className="lv-diff">
                <div className="lv-diff-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg></div>
                <div><b>До конкретных шагов</b><p>Не только «кто ты», но и подходящие профессии, вузы под твои предметы ЕГЭ и живой наставник.</p></div>
              </div>
              <div className="lv-diff">
                <div className="lv-diff-ic"><svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.5"/><path d="M20.5 20a5.5 5.5 0 0 0-4.5-5.4"/></svg></div>
                <div><b>Для всей семьи</b><p>Связанные кабинеты родителя и ребёнка: результат виден обоим, решение выбора — общее.</p></div>
              </div>
            </div>
          </div>

          <div className="reveal">
            <div className="lv-subhead">Для кого</div>
            <div className="lv-roles">
              <div className="lv-role"><div className="emo">🎓</div><b>Школьник</b><span>Выбор профиля и вуза перед ЕГЭ</span></div>
              <div className="lv-role"><div className="emo">📚</div><b>Студент</b><span>Проверить направление или сменить его</span></div>
              <div className="lv-role"><div className="emo">💼</div><b>Специалист</b><span>Рост или переход в новую сферу</span></div>
              <div className="lv-role"><div className="emo">🚀</div><b>Предприниматель</b><span>Понять свои сильные стороны</span></div>
              <div className="lv-role"><div className="emo">👨‍👩‍👧</div><b>Родитель</b><span>Помочь ребёнку выбрать осознанно</span></div>
            </div>
          </div>

          <div className="lv-info2 reveal">
            <div className="lv-infocard glass">
              <div className="ic"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>
              <b>Твои данные — твои</b>
              <p>Ответы и профиль видишь только ты и те, кому ты открыл доступ. Мы не продаём данные третьим лицам, а сервис работает на собственных серверах, а не в чужом облаке.</p>
            </div>
            <div className="lv-infocard glass">
              <div className="ic"><svg viewBox="0 0 24 24"><path d="M3 12h4l2-6 4 13 2-7h6"/></svg></div>
              <b>О проекте</b>
              <p>CareerPulse начинался как дипломный проект и вырос в рабочую платформу карьерной диагностики. Мы развиваем методику и атлас профессий, опираясь на обратную связь пользователей.</p>
            </div>
          </div>

        </div>
      </div>

      <div className="lv-ctaband">
        <div className="blob a-morphC" style={{width:'460px',height:'460px',top:'-180px',left:'6%',background:'radial-gradient(circle,rgba(255,255,255,.55),transparent 70%)',opacity:.8}}></div>
        <div className="blob a-morphA" style={{width:'340px',height:'340px',bottom:'-180px',right:'10%',background:'radial-gradient(circle,rgba(255,255,255,.4),transparent 70%)',opacity:.7}}></div>
        <div className="ring a-spinRev" style={{width:'70px',height:'70px',top:'40px',right:'20%',borderColor:'rgba(255,255,255,.5)'}}></div>
        <div className="grain"></div>
        <div className="lv-ctaband-inner">
          <h2>Узнай, куда вести карьеру — за один тест</h2>
          <p>Бесплатно и без регистрации. Аккаунт понадобится, только если захочешь сохранить результат и пройти полный разбор.</p>
          <a href={startHref} className="lv-ctaband-btn glass-dark">Начать бесплатно →</a>
        </div>
      </div>

      <footer className="lv-foot">
        <div className="lv-foot-brand">
          <div className="b">CareerPulse</div>
          <p>Профориентация без угадывания.</p>
        </div>
        <div className="lv-foot-cols">
          <div className="lv-foot-col">
            <div className="h">Продукт</div>
            <a href="#how">Диагностика</a>
            <a href="#professions">Профессии</a>
            <a href="#about">О нас</a>
          </div>
          <div className="lv-foot-col">
            <div className="h">Документы</div>
            <a href="/legal/privacy">Конфиденциальность</a>
            <a href="/legal/terms">Соглашение</a>
            <a href="/legal">Все документы</a>
          </div>
          <div className="lv-foot-col">
            <div className="h">Контакты</div>
            <a href="https://t.me/SokolovNYU" target="_blank" rel="noreferrer">Telegram</a>
            <a href="https://vk.ru/sokolovnyu" target="_blank" rel="noreferrer">ВКонтакте</a>
          </div>
        </div>
        <div className="lv-foot-copy">© 2026 CareerPulse<br/>careerpulse.ru</div>
      </footer>

    </div>
  )
}
