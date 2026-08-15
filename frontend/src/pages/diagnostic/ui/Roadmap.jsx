import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { matchProfessions } from '../../../entities/profession'
import { generateRoadmap } from '../../../shared/api'
import { confirmDialog } from '../../../shared/ui/Dialog.jsx'
import '../diagnostic.css'

const NODE_COLORS = ['#5f96e9', '#8b6fe8', '#e8a0c4', '#72a2eb', '#22d97a', '#72a2eb', '#8b6fe8', '#ff4d6d']

export default function Roadmap() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [profs, setProfs] = useState([])        // список рекомендованных профессий
  const [chosen, setChosen] = useState([])      // выбранные (макс 2)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)  // загрузка профиля/профессий
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [p, pr] = await Promise.all([CP.getProfile(), CP.getProgress()])
      if (!alive) return
      setProfile(p); setCompletedCount(pr.completed?.length || 0)
      if (p.roadmap && p.chosen_professions) { setRoadmap(p.roadmap); setChosen(p.chosen_professions) }
      if (alive) {
        // профессии берём из атласа по Holland-профилю (русские, курированные)
        setProfs(matchProfessions(p, 8))
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const toggle = (name) => {
    setChosen(c => c.includes(name) ? c.filter(x => x !== name) : c.length < 2 ? [...c, name] : c)
  }

  async function build() {
    setBuilding(true)
    const r = await generateRoadmap(profile, chosen)
    setRoadmap(r)
    await CP.updateProfile({ roadmap: r, chosen_professions: chosen })
    setBuilding(false)
  }
  async function reset() {
    const ok = await confirmDialog({
      title: 'Выбрать другие профессии?',
      message: 'Текущий маршрут будет сброшен. Чтобы построить новый, нейросеть сгенерирует его заново. Продолжить?',
      confirmText: 'Да, выбрать заново',
      cancelText: 'Оставить маршрут',
      danger: true,
    })
    if (!ok) return
    setRoadmap(null)
    CP.updateProfile({ roadmap: null })
  }

  const Shell = ({ children }) => (
    <div className="cp-diag">
      <div className="topbar">
        <div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark">⚡</div>CAREER<span>PULSE</span></div><div className="tb-divider"></div><div className="tb-block">Карьерный маршрут</div></div>
        <button className="tb-btn" onClick={() => navigate('/diagnostic')}>← К результатам</button>
      </div>
      <div className="container" style={{ maxWidth: 980 }}>{children}</div>
    </div>
  )

  if (loading) return <Shell><div className="block-title" style={{ marginTop: 40 }}>ЗАГРУЖАЕМ…</div></Shell>

  if (completedCount === 0) {
    return <Shell>
      <div className="block-title" style={{ marginTop: 40 }}>СНАЧАЛА ДИАГНОСТИКА</div>
      <div className="block-desc">Чтобы построить маршрут, пройди хотя бы базовые блоки теста.</div>
      <div className="nav-row"><button className="btn btn-accent" onClick={() => navigate('/test/1')}>Начать диагностику →</button></div>
    </Shell>
  }

  // ── Готовый маршрут ──
  if (roadmap) {
    return <Shell>
      <div className="block-num">КАРЬЕРНЫЙ МАРШРУТ</div>
      <div className="block-title">ТВОЙ ПУТЬ</div>
      {roadmap.goal && <div className="block-desc">🎯 {roadmap.goal}</div>}
      <div style={{ textAlign: 'center', margin: '6px 0 18px', fontSize: 12, color: 'var(--ghost)' }}>
        Профессии: <b style={{ color: 'var(--accent)' }}>{chosen.join(' · ')}</b> {roadmap._source && <span>· {roadmap._source === 'yandexgpt' ? 'YandexGPT' : 'локально'}</span>}
      </div>

      {roadmap.intro && (
        <div className="r-card" style={{ borderColor: 'rgba(139,111,232,.3)', background: 'linear-gradient(135deg, rgba(139,111,232,.08), rgba(95,150,233,.04))', marginBottom: 20 }}>
          <div className="r-label" style={{ color: '#8b6fe8', marginBottom: 8 }}>🤖 От наставника</div>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>{roadmap.intro}</div>
        </div>
      )}

      <div className="rm-scroll">
        <div className="rm-row">
          {roadmap.steps.map((s, i) => (
            <div className="rm-step" key={i}>
              <div className="rm-horizon">{s.horizon}</div>
              <div className="rm-node" style={{ background: NODE_COLORS[i % NODE_COLORS.length] }}>{s.n || i + 1}</div>
              <div className="rm-card">
                <div className="rm-title">{s.title}</div>
                <div className="rm-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {roadmap.skills?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="r-label" style={{ textAlign: 'center', marginBottom: 10 }}>Ключевые навыки прокачать</div>
          <div className="rm-skills">{roadmap.skills.map((sk, i) => <span key={i} className="rm-skill">{sk}</span>)}</div>
        </div>
      )}

      <div className="nav-row" style={{ marginTop: 28 }}>
        <button className="btn btn-ghost" onClick={reset}>← Выбрать другие профессии</button>
        <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>В кабинет</button>
      </div>
    </Shell>
  }

  // ── Выбор профессий ──
  return <Shell>
    <div className="block-num">КАРЬЕРНЫЙ МАРШРУТ</div>
    <div className="block-title">ВЫБЕРИ 2 ПРОФЕССИИ</div>
    <div className="block-desc">Отметь две профессии из подобранных по твоему профилю — нейросеть построит к ним пошаговый маршрут с учётом твоего возраста.</div>

    <div className="prof-pick" style={{ marginTop: 24 }}>
      {profs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--sub)' }}>Профессии появятся после анализа профиля.</div>}
      {profs.map((p, i) => {
        const sel = chosen.includes(p.name)
        return (
          <div key={i} className={'prof-opt' + (sel ? ' sel' : '')} onClick={() => toggle(p.name)}>
            <div className="pp-check">{sel ? '✓' : ''}</div>
            <div className="pp-name">{p.name}</div>
            {typeof p.match === 'number' && <div className="pp-match">{p.match}%</div>}
          </div>
        )
      })}
    </div>

    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ghost)', marginTop: 12 }}>Выбрано: {chosen.length} / 2</div>
    <div className="nav-row" style={{ marginTop: 16 }}>
      <button className="btn btn-accent" disabled={chosen.length !== 2 || building} onClick={build}>
        {building ? 'Нейросеть строит маршрут… ⏳' : 'Построить маршрут →'}
      </button>
    </div>
  </Shell>
}
