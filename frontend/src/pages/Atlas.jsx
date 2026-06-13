import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PROFESSIONS, PROFESSION_CATEGORIES } from '../data/professions.js'
import Header from '../components/Layout/Header.jsx'
import '../styles/atlas.css'

const HOLLAND_LABEL = { R: 'Реалист', I: 'Исследователь', A: 'Артист', S: 'Социальный', E: 'Предприниматель', C: 'Конвенциональный' }
const HOLLAND_COLOR = { R: '#ff6b35', I: '#00e5c8', A: '#7b5cf0', S: '#3b82f6', E: '#f5c518', C: '#ff4d6d' }

export default function Atlas() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('Все')
  const [activeHolland, setActiveHolland] = useState('')
  const [expanded, setExpanded] = useState(null)

  const categories = ['Все', ...PROFESSION_CATEGORIES]

  const filtered = useMemo(() => {
    return PROFESSIONS.filter(p => {
      const matchCat = activeCategory === 'Все' || p.category === activeCategory
      const matchHolland = !activeHolland || p.holland.includes(activeHolland)
      const q = search.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      return matchCat && matchHolland && matchSearch
    })
  }, [search, activeCategory, activeHolland])

  return (
    <div className="atlas-page">
      <Header backTo="/dashboard" backLabel="← В кабинет" />

      <div className="atlas-hero">
        <div className="atlas-eyebrow">CareerPulse</div>
        <h1 className="atlas-title">АТЛАС ПРОФЕССИЙ</h1>
        <p className="atlas-sub">105 профессий с описаниями, типами по Holland и категориями. Найди своё направление.</p>
      </div>

      <div className="atlas-controls">
        <input
          className="atlas-search"
          placeholder="🔍  Поиск по профессии или описанию…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="atlas-filters">
          <div className="atlas-filter-row">
            {categories.map(c => (
              <button
                key={c}
                className={['atlas-chip', activeCategory === c && 'active'].filter(Boolean).join(' ')}
                onClick={() => setActiveCategory(c)}
              >{c}</button>
            ))}
          </div>
          <div className="atlas-filter-row">
            <span className="atlas-filter-label">Holland:</span>
            {Object.entries(HOLLAND_LABEL).map(([k, label]) => (
              <button
                key={k}
                className={['atlas-chip atlas-chip--holland', activeHolland === k && 'active'].filter(Boolean).join(' ')}
                style={{ '--hc': HOLLAND_COLOR[k] }}
                onClick={() => setActiveHolland(prev => prev === k ? '' : k)}
              >{k} — {label}</button>
            ))}
          </div>
        </div>

        <div className="atlas-count">{filtered.length} профессий</div>
      </div>

      <div className="atlas-grid">
        {filtered.map(p => (
          <div
            key={p.id}
            className={['atlas-card', expanded === p.id && 'atlas-card--open'].filter(Boolean).join(' ')}
            onClick={() => setExpanded(prev => prev === p.id ? null : p.id)}
          >
            <div className="ac-top">
              <div className="ac-category">{p.category}</div>
              <div className="ac-holland">
                {p.holland.map(h => (
                  <span key={h} className="ac-htag" style={{ background: HOLLAND_COLOR[h] + '22', color: HOLLAND_COLOR[h], borderColor: HOLLAND_COLOR[h] + '44' }}>{h}</span>
                ))}
              </div>
            </div>
            <div className="ac-name">{p.name}</div>
            {expanded === p.id && (
              <div className="ac-desc">{p.desc}</div>
            )}
            <div className="ac-arrow">{expanded === p.id ? '▲' : '▼'}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="atlas-empty">Ничего не найдено — попробуйте другой запрос</div>
      )}
    </div>
  )
}
