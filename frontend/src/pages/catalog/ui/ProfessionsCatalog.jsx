import IconText from '../../../shared/ui/IconText.jsx'
import Header from '../../../shared/ui/Header.jsx'
import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROFESSIONS, PROFESSION_CATEGORIES } from '../../../entities/profession'
import { usePageMeta } from '../../../shared/lib/pageMeta'
import Icon from '../../../shared/ui/Icon.jsx'
import SectionWave from '../../../shared/ui/SectionWave.jsx'
import SectionDecor from '../../../shared/ui/SectionDecor.jsx'
import DarkFooter from '../../../shared/ui/DarkFooter.jsx'
import { useScrollReveal } from '../../../shared/lib/useScrollReveal'
import MaterialsPhoto from './MaterialsPhoto.jsx'
import MaterialsDecor from './MaterialsDecor.jsx'
import '../catalog.css'
import '../materials.css'

const HOLLAND_LABEL = { R: 'Реалист', I: 'Исследователь', A: 'Артист', S: 'Социальный', E: 'Предприниматель', C: 'Конвенциональный' }
const HOLLAND_COLOR = { R: '#087cff', I: '#087cff', A: '#087cff', S: '#087cff', E: '#087cff', C: '#087cff' }
const MAX_HOLLAND = 3

export default function ProfessionsCatalog() {
  const pageRef = useRef(null)
  useScrollReveal(pageRef, '.materials-photo, .materials-section-heading, .materials-filters, .materials-cta__copy, .materials-decor__symbol', '', 'interior')
  usePageMeta('Профессии — атлас из 200 профессий', 'Каталог из 200 профессий России: описание, тип по Holland (RIASEC), категория. Подбери подходящую профессию и пройди бесплатную профориентацию на Пульс Карьеры.')
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('Все')
  const [holland, setHolland] = useState([])

  const categories = useMemo(() => ['Все', ...PROFESSION_CATEGORIES], [])
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return PROFESSIONS.filter(p => {
      const okCat = cat === 'Все' || p.category === cat
      const okH = holland.length === 0 || holland.every(c => p.holland.includes(c))
      const okQ = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      return okCat && okH && okQ
    })
  }, [search, cat, holland])

  const toggleH = (c) => setHolland(prev => prev.includes(c) ? prev.filter(x => x !== c) : (prev.length < MAX_HOLLAND ? [...prev, c] : prev))

  return (
    <div ref={pageRef} className="cp-legal materials-page">
      <main className="cp-catalog materials-catalog">
        <section className="materials-hero" aria-labelledby="materials-title">
          <Header backTo="/" backLabel="← На главную" />
          <SectionDecor />
          <MaterialsDecor placement="hero" />
          <div className="cat-inner materials-hero__inner">
            <div className="materials-hero__copy">
              <div className="cat-eyebrow"><Icon name="sparkles" size={18} />Материалы · Атлас профессий</div>
              <h1 id="materials-title" className="cat-title">200 профессий <span className="heading-accent">России</span></h1>
              <p className="cat-sub">Описание, категория и профессиональный тип по модели Holland (RIASEC). Найди, что тебе ближе — а бесплатный тест подскажет, какие подходят именно тебе.</p>
              <a className="materials-button" href="#materials-library">Исследовать профессии <span aria-hidden="true">↓</span></a>
              <div className="materials-hero__facts"><span><Icon name="book" size={18} />Описания профессий</span><span><Icon name="compass" size={18} />Holland (RIASEC)</span></div>
            </div>
            <MaterialsPhoto />
          </div>
          <svg className="materials-hero__wave" viewBox="0 0 1600 180" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 30C220 130 400-20 650 50S1030 140 1280 50 1490 10 1600 35V180H0Z" fill="#b8dcff" opacity=".55" /><path d="M0 75C230-5 410 140 680 95S1030 20 1280 100 1490 65 1600 80V180H0Z" fill="#dceeff" /><path d="M0 120C220 180 410 65 650 115S1040 175 1280 110 1490 90 1600 115V180H0Z" fill="#f7fbff" /></svg>
        </section>
        <section id="materials-library" className="materials-library" aria-labelledby="materials-library-title">
          <MaterialsDecor placement="library" />
          <div className="cat-inner">
            <div className="materials-section-heading"><div><span className="materials-kicker">Исследуй направления</span><h2 id="materials-library-title">Что тебе интересно?</h2></div><p>Описание, категория и профессиональный тип — всё в одной карточке.</p></div>
            <div className="materials-filters">
              <label className="materials-search"><Icon name="search" size={22} /><span className="materials-sr-only">Поиск профессий</span><input type="search" className="cat-input" placeholder="Поиск по профессии или описанию…" value={search} onChange={e => setSearch(e.target.value)} /></label>
              <details className="materials-filter-group" open>
                <summary>Сфера деятельности <span aria-hidden="true">⌄</span></summary>
                <div className="cat-chips">
                  {categories.map(c => <button key={c} aria-pressed={cat === c} className={'cat-chip' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>{c}</button>)}
                </div>
              </details>
              <details className="materials-filter-group" open>
                <summary>Профессиональный тип <span aria-hidden="true">⌄</span></summary>
                <div className="cat-chips">
                  {Object.entries(HOLLAND_LABEL).map(([k, label]) => <button key={k} aria-pressed={holland.includes(k)} className={'cat-chip' + (holland.includes(k) ? ' active' : '')} onClick={() => toggleH(k)}>{k} — <IconText text={label} /></button>)}
                </div>
              </details>
            </div>
          <div className="cat-count" role="status" aria-live="polite"><span>Найдено в атласе</span><b>{filtered.length} профессий</b></div>
          <div className="cat-grid">
            {filtered.map(p => (
              <article key={p.id} className="cat-card">
                <div className="cat-card-top">
                  <span className="materials-card-icon"><Icon name="briefcase" size={24} /></span>
                  <span className="cat-card-cat">{p.category}</span>
                </div>
                <h3 className="cat-card-h">{p.name}</h3>
                <p className="cat-card-p">{p.desc}</p>
                <div className="materials-card-types"><span>Holland</span>{p.holland.map(h => <span key={h} className="cat-htag" title={HOLLAND_LABEL[h]} style={{ background: HOLLAND_COLOR[h] + '12', color: HOLLAND_COLOR[h] }}>{h}</span>)}</div>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <div className="cat-empty">Ничего не найдено — попробуй другой запрос.</div>}

          </div>
        </section>
        <SectionWave from="#f7fbff" to="#eaf4ff" flip />
        <section className="materials-cta">
          <SectionDecor />
          <MaterialsDecor placement="cta" />
          <div className="materials-cta__copy"><span className="materials-kicker">Следующий шаг</span><h2>Найди, что <span className="heading-accent">тебе ближе</span></h2><p>Бесплатный тест подскажет, какие профессии подходят именно тебе.</p></div>
          <div className="cat-cta"><a href="/proba" onClick={(e) => { e.preventDefault(); navigate('/proba') }}><IconText text={"Пройти бесплатный тест →"} /></a></div>
        </section>
      </main>
      <DarkFooter />
    </div>
  )
}
