import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listInstitutions } from '../../../shared/api'
import { usePageMeta } from '../../../shared/lib/pageMeta'
import Header from '../../../shared/ui/Header.jsx'
import '../catalog.css'

const TYPES = [['', 'Все'], ['university', 'Вузы'], ['college', 'Колледжи']]
const typeLabel = (t) => (t === 'college' ? 'колледж' : 'вуз')

export default function VuzCatalog() {
  usePageMeta('Вузы России — каталог вузов и колледжей', 'Каталог вузов и колледжей России: поиск по названию, фильтр по городу и типу. Узнай, куда поступить, и пройди бесплатную профориентацию на CareerPulse.')
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    setLoading(true)
    const t = setTimeout(() => {
      listInstitutions({ q, city, type, limit: 120 }).then(r => { if (alive) { setList(r); setLoading(false) } }).catch(() => { if (alive) { setList([]); setLoading(false) } })
    }, 350)
    return () => { alive = false; clearTimeout(t) }
  }, [q, city, type])

  return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="cp-catalog">
        <div className="cat-inner">
          <div className="cat-eyebrow">Вузы России</div>
          <h1 className="cat-title">Каталог вузов и колледжей</h1>
          <p className="cat-sub">Ищи учебное заведение по названию и городу. А чтобы понять, какое направление тебе подходит — пройди бесплатный тест и получи подбор профессий с вузами.</p>

          <div className="cat-controls">
            <input className="cat-input" placeholder="Поиск по названию вуза…" value={q} onChange={e => setQ(e.target.value)} />
            <input className="cat-input" placeholder="Город" value={city} onChange={e => setCity(e.target.value)} style={{ flex: '0 1 200px' }} />
            <select className="cat-select" value={type} onChange={e => setType(e.target.value)}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="cat-empty">Загружаю…</div>
          ) : list.length === 0 ? (
            <div className="cat-empty">Ничего не нашли по этому запросу.<br />Если каталог пуст — база вузов ещё наполняется.</div>
          ) : (
            <>
              <div className="cat-count">{list.length} заведений{list.length >= 120 ? '+ (уточни фильтры)' : ''}</div>
              <div className="cat-grid">
                {list.map((v, i) => (
                  <div key={i} className="cat-card">
                    <div className="cat-card-top">
                      <span className="cat-card-cat">{typeLabel(v.type)}</span>
                    </div>
                    <div className="cat-card-h">{v.name}</div>
                    {v.full_name && v.full_name !== v.name && <p className="cat-card-p">{v.full_name}</p>}
                    <div className="cat-card-meta">
                      {v.city && <span>📍 {v.city}{v.region && v.region !== v.city ? `, ${v.region}` : ''}</span>}
                    </div>
                    {v.website && <a href={v.website} target="_blank" rel="noreferrer">Сайт вуза →</a>}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="cat-cta"><a href="/proba" onClick={(e) => { e.preventDefault(); navigate('/proba') }}>Подобрать профессию — бесплатный тест →</a></div>
        </div>
      </div>
    </div>
  )
}
