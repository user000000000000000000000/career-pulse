import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROFESSIONS, PROFESSION_CATEGORIES } from '../../../entities/profession'
import { usePageMeta } from '../../../shared/lib/pageMeta'
import Header from '../../../shared/ui/Header.jsx'
import '../catalog.css'

const HOLLAND_LABEL = { R: 'Реалист', I: 'Исследователь', A: 'Артист', S: 'Социальный', E: 'Предприниматель', C: 'Конвенциональный' }
const HOLLAND_COLOR = { R: '#e8a0c4', I: '#5f96e9', A: '#8b6fe8', S: '#3b82f6', E: '#72a2eb', C: '#ff4d6d' }
const MAX_HOLLAND = 3

export default function ProfessionsCatalog() {
  usePageMeta('Профессии — атлас из 200 профессий', 'Каталог из 200 профессий России: описание, тип по Holland (RIASEC), категория. Подбери подходящую профессию и пройди бесплатную профориентацию на CareerPulse.')
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
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="cp-catalog">
        <div className="cat-inner">
          <div className="cat-eyebrow">Атлас профессий</div>
          <h1 className="cat-title">200 профессий России</h1>
          <p className="cat-sub">Описание, категория и профессиональный тип по модели Holland (RIASEC). Найди, что тебе ближе — а бесплатный тест подскажет, какие подходят именно тебе.</p>

          <div className="cat-controls">
            <input className="cat-input" placeholder="Поиск по профессии или описанию…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="cat-chips">
            {categories.map(c => (
              <button key={c} className={'cat-chip' + (cat === c ? ' active' : '')} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
          <div className="cat-chips">
            {Object.entries(HOLLAND_LABEL).map(([k, label]) => (
              <button key={k} className={'cat-chip' + (holland.includes(k) ? ' active' : '')} onClick={() => toggleH(k)}>{k} — {label}</button>
            ))}
          </div>

          <div className="cat-count">{filtered.length} профессий</div>
          <div className="cat-grid">
            {filtered.map(p => (
              <div key={p.id} className="cat-card">
                <div className="cat-card-top">
                  <span className="cat-card-cat">{p.category}</span>
                  <span style={{ display: 'flex', gap: 4 }}>
                    {p.holland.map(h => <span key={h} className="cat-htag" style={{ background: HOLLAND_COLOR[h] + '22', color: HOLLAND_COLOR[h] }}>{h}</span>)}
                  </span>
                </div>
                <div className="cat-card-h">{p.name}</div>
                <p className="cat-card-p">{p.desc}</p>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <div className="cat-empty">Ничего не найдено — попробуй другой запрос.</div>}

          <div className="cat-cta"><a href="/proba" onClick={(e) => { e.preventDefault(); navigate('/proba') }}>Пройти бесплатный тест →</a></div>
        </div>
      </div>
    </div>
  )
}
