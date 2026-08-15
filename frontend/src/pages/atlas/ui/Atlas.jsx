import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PROFESSIONS, PROFESSION_CATEGORIES } from '../../../entities/profession'
import Header from '../../../shared/ui/Header.jsx'
import '../atlas.css'

const HOLLAND_LABEL = { R: 'Реалист', I: 'Исследователь', A: 'Артист', S: 'Социальный', E: 'Предприниматель', C: 'Конвенциональный' }
const HOLLAND_COLOR = { R: '#e8a0c4', I: '#5f96e9', A: '#8b6fe8', S: '#3b82f6', E: '#72a2eb', C: '#ff4d6d' }

export default function Atlas() {
  const navigate = useNavigate()
  const location = useLocation()
  // если пришли из результатов/маршрута с конкретной профессией — сразу ищем её
  const [search, setSearch] = useState(location.state?.q || '')
  const [activeCategory, setActiveCategory] = useState('Все')
  const [activeHolland, setActiveHolland] = useState([]) // до 3 кодов, логика «И»
  const [expanded, setExpanded] = useState(null)

  const categories = ['Все', ...PROFESSION_CATEGORIES]
  const MAX_HOLLAND = 3

  const toggleHolland = (k) => setActiveHolland(prev =>
    prev.includes(k) ? prev.filter(x => x !== k) : prev.length < MAX_HOLLAND ? [...prev, k] : prev
  )

  const filtered = useMemo(() => {
    return PROFESSIONS.filter(p => {
      const matchCat = activeCategory === 'Все' || p.category === activeCategory
      // профессия должна содержать ВСЕ выбранные качества (связка)
      const matchHolland = activeHolland.length === 0 || activeHolland.every(c => p.holland.includes(c))
      const q = search.toLowerCase()
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      return matchCat && matchHolland && matchSearch
    })
  }, [search, activeCategory, activeHolland])

  return (
    <div className="atlas-page cp-legal">
      <Header backTo="/dashboard" backLabel="← В кабинет" reserveRight />

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
            {Object.entries(HOLLAND_LABEL).map(([k, label]) => {
              const on = activeHolland.includes(k)
              const dim = !on && activeHolland.length >= MAX_HOLLAND
              return (
                <button
                  key={k}
                  className={['atlas-chip atlas-chip--holland', on && 'active'].filter(Boolean).join(' ')}
                  style={{ '--hc': HOLLAND_COLOR[k], opacity: dim ? 0.4 : 1 }}
                  onClick={() => toggleHolland(k)}
                >{k} — {label}</button>
              )
            })}
            {activeHolland.length > 0 && (
              <button className="atlas-chip" onClick={() => setActiveHolland([])}>× сбросить</button>
            )}
          </div>
          <div className="atlas-filter-hint">
            {activeHolland.length === 0
              ? `Можно выбрать до ${MAX_HOLLAND} качеств — покажем профессии, где есть все выбранные (связка).`
              : `Связка: ${activeHolland.map(c => HOLLAND_LABEL[c]).join(' + ')} — профессии, где есть все эти качества${activeHolland.length >= MAX_HOLLAND ? ' (максимум 3)' : ''}.`}
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
