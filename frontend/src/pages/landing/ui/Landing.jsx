import Icon from '../../../shared/ui/Icon.jsx'
import IconText from '../../../shared/ui/IconText.jsx'
import SectionWave from '../../../shared/ui/SectionWave.jsx'
import SectionDecor from '../../../shared/ui/SectionDecor.jsx'
import BrandMark from '../../../shared/ui/BrandMark.jsx'
import LandingAccents from './LandingAccents.jsx'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser } from '../../../shared/auth'
import { publicUserCount } from '../../../shared/api'
import '../landing-v2.css'
import '../landing-polish.css'
import { useScrollReveal } from '../../../shared/lib/useScrollReveal'

export default function Landing() {
  const rootRef = useRef(null)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [userCount, setUserCount] = useState(0)
  useScrollReveal(rootRef)

  useEffect(() => {
    const root = rootRef.current
    const scene = root?.querySelector('.lv-scene')
    if (!scene) return
    let inView = true
    const update = () => { root.dataset.sceneAwake = String(inView && !document.hidden) }
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      update()
    }) : null
    observer?.observe(scene)
    document.addEventListener('visibilitychange', update)
    update()
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

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

    // Перехват ссылок: SPA-навигация + плавный скролл к якорям
    const onClick = (e) => {
      const a = e.target.closest('a')
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || a.hasAttribute('download')) return
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

      <div className="lv-hero">
        <div className="lv-scene"><div className="lv-scene__float"><picture><source media="(min-width: 621px) and (max-width: 1100px)" srcSet={`${import.meta.env.BASE_URL}career-bird-hero-balanced-tablet.png`} /><img src={`${import.meta.env.BASE_URL}career-bird-hero-balanced.png`} width="1536" height="1024" alt="Голубая птица размышляет о будущей профессии за ноутбуком в светлой комнате" fetchpriority="high" /></picture></div></div>
        <LandingAccents placement="hero" />
        <span className="lv-spark lv-spark-one" aria-hidden="true">✦</span>
        <span className="lv-spark lv-spark-two" aria-hidden="true">✦</span>
        <span className="hero-orbit" aria-hidden="true" />
        <svg className="hero-fine-line" viewBox="0 0 160 90" fill="none" aria-hidden="true" focusable="false"><path d="M3 72C50 95 20 10 75 28S110 80 155 10" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 7" /><circle cx="153" cy="10" r="4" fill="currentColor" /></svg>
        <div className="dotgrid"></div>
        <div className="blob a-morphA" style={{width:'620px',height:'620px',top:'-260px',left:'-160px',background:'radial-gradient(circle,#c9e3fc,transparent 70%)',opacity:.7}}></div>
        <div className="blob a-morphB" style={{width:'560px',height:'560px',top:'-220px',left:'22%',background:'radial-gradient(circle,#8FB3F5,transparent 70%)',opacity:.65}}></div>
        <div className="blob a-morphC" style={{width:'420px',height:'420px',top:'120px',right:'-100px',background:'radial-gradient(circle,#c9e3fc,transparent 70%)',opacity:.5}}></div>
        <div className="ring a-spin" style={{width:'120px',height:'120px',top:'90px',right:'22%'}}></div>
        <div className="ring2 a-spinRev" style={{width:'64px',height:'64px',top:'260px',left:'6%'}}></div>
        <div className="plus" style={{top:'150px',left:'44%'}}></div>
        <div className="plus" style={{top:'420px',right:'8%'}}></div>
        <div className="grain"></div>

        <div className="lv-hero-inner">
          <div className="lv-hero-left">
            <div className="lv-badge glass"><span aria-hidden="true">✦</span> 10 блоков диагностики · ИИ-разбор результатов</div>
            <h1 className="lv-hero-title">Найди свой<br/><span className="accent heading-accent">путь</span> в<br/>профессии</h1>
            <p className="lv-hero-sub">Не знаешь, кем стать после школы? Узнай свои интересы и сильные стороны, изучи профессии и составь план, как их попробовать.</p>
            <div className="lv-hero-actions">
              <a href={startHref} className="lv-btn-primary"><IconText text={user ? 'В мою диагностику →' : 'Начать с мини-теста →'} /></a>
              <div className="lv-hero-note">
                <span className="lv-people" aria-hidden="true"><span>✦</span><span>✧</span><span>✦</span></span>
                <span>{userCount > 0 ? <>{userCount.toLocaleString('ru-RU')} уже нашли<br/>свои направления</> : <>Бесплатно<br/>≈30 минут</>}</span>
              </div>
            </div>
          </div>
        </div>
        <svg className="lv-waves" viewBox="0 0 1600 180" preserveAspectRatio="none" aria-hidden="true"><path fill="#b8dbff" fillOpacity=".7" d="M0 20C180-50 210 160 490 90S800 190 1080 95 1440 50 1600 0V180H0Z"/><path fill="#e1f0ff" stroke="#fff" d="M0 65C180-40 270 170 540 100S790 150 1030 130 1400 190 1600 65V180H0Z"/><path fill="#f7fbff" d="M0 105C180 30 250 170 520 145S850 90 1110 155 1430 120 1600 95V180H0Z"/></svg>
      </div>

      <div className="lv-how" id="how">
        <SectionDecor />
        <LandingAccents placement="steps" />
        <div className="lv-how-inner">
          <div className="reveal" style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div className="lv-eyebrow">Как это работает</div>
            <div className="lv-h2">Пять шагов к своей профессии</div>
            <p className="lv-lead">Начни с мини-теста из 3 блоков. Для подробного профиля продолжи диагностику в кабинете: её можно проходить частями.</p>
          </div>
          <div className="lv-vsteps reveal">
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><Icon name="clipboard" size={24}/></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 01</div><b>Пройди диагностику</b><p>10 блоков и 293 вопроса о характере, ценностях, способностях и интересах. Это основа, на которой строится весь дальнейший разбор.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><Icon name="sparkles" size={24}/></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 02</div><b>Получи ИИ-разбор</b><p>Система читает ответы по всем блокам и собирает цельный профиль — не набор процентов, а объяснение: какой ты, что тобой движет и что в тебе неочевидно даже тебе.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><Icon name="star" size={24}/></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 03</div><b>Узнай сильные стороны</b><p>Сравни результат с учёбой, хобби и школьными проектами. Подумай, какие занятия тебе нравятся и какие навыки ты хочешь развивать.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><Icon name="target" size={24}/></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 04</div><b>Посмотри профессии</b><p>Из атласа в 200 профессий подбираются подходящие тебе — с процентом совпадения и пояснением почему. Под каждое направление показываем вузы и специальности под твои предметы ЕГЭ.</p></div>
            </div>
            <div className="lv-vstep">
              <div className="lv-vstep-rail"><div className="lv-vstep-node"><Icon name="flag" size={24}/></div></div>
              <div className="lv-vstep-card"><div className="lv-vstep-tag">ШАГ 05</div><b>Построй маршрут</b><p>Выбери две интересные профессии и получи пошаговый план знакомства с ними. Результаты и дальнейшие шаги можно обсудить с наставником.</p></div>
            </div>
          </div>
        </div>
      </div>

      <SectionWave from="#f7fbff" to="#eaf4ff" />
      <div className="lv-prof" id="professions">
        <SectionDecor />
        <LandingAccents placement="professions" />
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
            <div className="lv-prof-card glass"><div className="lv-prof-ic"><Icon name="chart" size={24}/></div><b>Data-аналитик</b><p>Превращает сырые данные в решения: ищет закономерности, строит отчёты и отвечает на вопросы бизнеса цифрами. Подходит тем, у кого аналитический склад ума и тяга к системности.</p><div className="lv-prof-match">Совпадение 92%</div></div>
            <div className="lv-prof-card glass"><div className="lv-prof-ic"><Icon name="search" size={24}/></div><b>UX-исследователь</b><p>Изучает, как люди пользуются продуктом: проводит интервью, проверяет гипотезы и находит, что мешает пользователям. Для тех, кто сочетает эмпатию с любовью к данным.</p><div className="lv-prof-match">Совпадение 88%</div></div>
            <div className="lv-prof-card glass"><div className="lv-prof-ic"><Icon name="layout" size={24}/></div><b>Продуктовый менеджер</b><p>Решает, что команда делает и зачем: расставляет приоритеты и связывает бизнес, дизайн и разработку вокруг метрик. Для тех, кто любит ответственность и общую картину.</p><div className="lv-prof-match">Совпадение 85%</div></div>
          </div>
        </div>
      </div>

      <SectionWave from="#eaf4ff" to="#ffffff" flip />
      <div className="lv-about" id="about">
        <SectionDecor />
        <LandingAccents placement="about" />
        <div className="lv-about-inner">

          <div className="lv-about-head reveal">
            <div className="lv-eyebrow">О нас</div>
            <div className="lv-h2">Профориентация без угадывания</div>
            <p className="lv-lead">Пульс Карьеры — это не развлекательный тест из интернета. За каждым вопросом стоит признанная методика, а за результатом — объяснение, а не ярлык из четырёх букв. Мы помогаем выбрать направление осознанно: школьникам, студентам и взрослым.</p>
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
                <div className="lv-diff-ic"><Icon name="message" size={24}/></div>
                <div><b>Объяснение, а не ярлык</b><p>ИИ-разбор пишет связный портрет: кто ты и что тобой движет, — а не выдаёт четыре буквы типа и голый график.</p></div>
              </div>
              <div className="lv-diff">
                <div className="lv-diff-ic"><Icon name="flask" size={24}/></div>
                <div><b>Методики, а не угадайка</b><p>Шесть признанных психометрических моделей вместо случайных вопросов «кто ты из персонажей».</p></div>
              </div>
              <div className="lv-diff">
                <div className="lv-diff-ic"><Icon name="shield" size={24}/></div>
                <div><b>До конкретных шагов</b><p>Не только «кто ты», но и подходящие профессии, вузы под твои предметы ЕГЭ и живой наставник.</p></div>
              </div>
              <div className="lv-diff">
                <div className="lv-diff-ic"><Icon name="users" size={24}/></div>
                <div><b>Для всей семьи</b><p>Связанные кабинеты родителя и ребёнка: результат виден обоим, решение выбора — общее.</p></div>
              </div>
            </div>
          </div>

          <div className="reveal">
            <div className="lv-subhead">Для кого</div>
            <div className="lv-roles">
              <div className="lv-role"><div className="emo"><IconText text={"🎓"} /></div><b>Школьник</b><span>Выбор профиля и вуза перед ЕГЭ</span></div>
              <div className="lv-role"><div className="emo"><IconText text={"📚"} /></div><b>Студент</b><span>Проверить направление или сменить его</span></div>
              <div className="lv-role"><div className="emo"><IconText text={"💼"} /></div><b>Специалист</b><span>Рост или переход в новую сферу</span></div>
              <div className="lv-role"><div className="emo"><IconText text={"🚀"} /></div><b>Предприниматель</b><span>Понять свои сильные стороны</span></div>
              <div className="lv-role"><div className="emo"><IconText text={"👨‍👩‍👧"} /></div><b>Родитель</b><span>Помочь ребёнку выбрать осознанно</span></div>
            </div>
          </div>

          <div className="lv-info2 reveal">
            <div className="lv-infocard glass">
              <div className="ic"><Icon name="lock" size={24}/></div>
              <b>Твои данные — твои</b>
              <p>Ответы и профиль видишь только ты и те, кому ты открыл доступ. Мы не продаём данные третьим лицам, а сервис работает на собственных серверах, а не в чужом облаке.</p>
            </div>
            <div className="lv-infocard glass">
              <div className="ic"><Icon name="activity" size={24}/></div>
              <b>О проекте</b>
              <p>Пульс Карьеры начинался как дипломный проект и вырос в рабочую платформу карьерной диагностики. Мы развиваем методику и атлас профессий, опираясь на обратную связь пользователей.</p>
            </div>
          </div>

        </div>
      </div>

      <SectionWave from="#ffffff" to="#087cff" />
      <div className="lv-ctaband lv-ctaband--solid">
        <SectionDecor />
        <div className="blob a-morphC" style={{width:'460px',height:'460px',top:'-180px',left:'6%',background:'radial-gradient(circle,rgba(255,255,255,.55),transparent 70%)',opacity:.8}}></div>
        <div className="blob a-morphA" style={{width:'340px',height:'340px',bottom:'-180px',right:'10%',background:'radial-gradient(circle,rgba(255,255,255,.4),transparent 70%)',opacity:.7}}></div>
        <div className="ring a-spinRev" style={{width:'70px',height:'70px',top:'40px',right:'20%',borderColor:'rgba(255,255,255,.5)'}}></div>
        <div className="grain"></div>
        <div className="lv-ctaband-inner">
          <h2>Узнай, куда вести карьеру — за один тест</h2>
          <p>Бесплатно и без регистрации. Аккаунт понадобится, только если захочешь сохранить результат и пройти полный разбор.</p>
          <a href={startHref} className="lv-ctaband-btn glass-dark"><IconText text={"Начать бесплатно →"} /></a>
        </div>
      </div>

      <SectionWave from="#087cff" to="#070529" accent="#087cff" highlight="#087cff" flip />
      <footer className="lv-foot">
        <SectionDecor />
        <div className="lv-foot-brand">
          <div className="b"><BrandMark size={32} variant="white" />Пульс Карьеры</div>
          <p>Профориентация без угадывания.</p>
        </div>
        <div className="lv-foot-cols">
          <div className="lv-foot-col">
            <div className="h">Продукт</div>
            <a href="#how">Диагностика</a>
            <a href="/professions">Профессии</a>
            <a href="/vuzy">Вузы России</a>
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
        <div className="lv-foot-copy">© 2026 Пульс Карьеры<br/>careerpulse.ru</div>
      </footer>

    </div>
  )
}
