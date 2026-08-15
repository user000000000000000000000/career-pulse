import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import Header from '../../../shared/ui/Header.jsx'
import Card from '../../../shared/ui/Card.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { InterestsRadar, AbilitiesBar, ValuesPie, BehaviorBar, ProfessionBars } from './ResultCharts.jsx'
import { supabase, isSupabaseConfigured } from '../../../shared/api'
import { PROFESSIONS } from '../../../entities/profession'
import { getCurrentUser } from '../../../shared/auth'
import '../../../shared/ui/legal.css'
import '../result.css'

export default function Result() {
  const location = useLocation()
  const navigate = useNavigate()
  const [report, setReport] = useState(location.state?.report || null)
  const [scores, setScores] = useState(location.state?.result?.scores || location.state?.scores || {})
  const [loading, setLoading] = useState(!location.state?.report)

  useEffect(() => {
    if (report) return
    let alive = true
    ;(async () => {
      if (!isSupabaseConfigured) { setLoading(false); return }
      try {
        const user = await getCurrentUser()
        if (!user) { setLoading(false); return }
        const { data } = await supabase
          .from('test_results')
          .select('strengths, weaknesses, recommended_professions, full_report, scores')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (alive && data) {
          setReport(data)
          setScores(data.scores || {})
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [report])

  const wrap = (children) => (
    <div className="cp-legal">
      <Header backTo="/dashboard" backLabel="← В кабинет" reserveRight />
      <div className="res-bg" />
      {children}
    </div>
  )

  if (loading) return wrap(<div className="res-page"><div className="res-empty">Загружаем результат…</div></div>)

  if (!report) return wrap(
    <div className="res-page">
      <div className="res-empty">
        <p style={{ marginBottom: 18 }}>Результатов пока нет — сначала пройдите диагностику.</p>
        <Button as={Link} to="/test/1">Пройти тест →</Button>
      </div>
    </div>
  )

  const strengths   = report.strengths || []
  const weaknesses  = report.weaknesses || []
  const professions = normalizeProfs(report.recommended_professions)

  return wrap(
    <div className="res-page">
      <div className="res-eyebrow">Результат диагностики</div>
      <h1 className="res-title">ВАШ КАРЬЕРНЫЙ ПРОФИЛЬ</h1>

      {/* ── Сильные стороны / Зоны роста ── */}
      <div className="res-grid">
        <Card>
          <div className="res-card-h"><span className="dot" style={{ background: 'var(--ok)' }} />Сильные стороны</div>
          <ul className="res-list">
            {strengths.length ? strengths.map((s, i) => <li key={i}>{s}</li>) : <li>—</li>}
          </ul>
        </Card>
        <Card>
          <div className="res-card-h"><span className="dot" style={{ background: 'var(--ember)' }} />Зоны роста</div>
          <ul className="res-list">
            {weaknesses.length ? weaknesses.map((s, i) => <li key={i}>{s}</li>) : <li>—</li>}
          </ul>
        </Card>
      </div>

      {/* ── Диаграммы ── */}
      <div className="charts-section">
        <InterestsRadar scores={scores} />
        <AbilitiesBar scores={scores} />
      </div>
      <div className="charts-section">
        <ValuesPie scores={scores} />
        <BehaviorBar scores={scores} />
      </div>
      <div className="charts-section" style={{ gridTemplateColumns: '1fr' }}>
        <ProfessionBars professions={professions} />
      </div>

      {/* ── Список профессий ── */}
      <Card accent style={{ marginBottom: 18 }}>
        <div className="res-card-h"><span className="dot" style={{ background: 'var(--accent)' }} />Подходящие профессии</div>
        {professions.length ? professions.map((p, i) => {
          const atlas = PROFESSIONS.find(a => a.name.toLowerCase() === p.name.toLowerCase())
          return (
            <div className="res-prof" key={i}>
              <span className="res-prof__name">{p.name}</span>
              <span className="res-prof__tags">
                {atlas ? atlas.holland.map(h => (
                  <span key={h} className="res-prof__htag" data-h={h}>{h}</span>
                )) : <span className="res-prof__cat">{atlas?.category || ''}</span>}
              </span>
              {typeof p.match === 'number' && (
                <span className="res-prof__pct">{p.match}%</span>
              )}
            </div>
          )
        }) : <p style={{ color: 'var(--sub)' }}>—</p>}
      </Card>

      {/* ── Полный разбор ── */}
      <Card>
        <div className="res-card-h"><span className="dot" style={{ background: 'var(--violet)' }} />Полный разбор</div>
        <div className="res-report">{report.full_report || '—'}</div>
      </Card>

      <div className="res-actions">
        <Button as={Link} to="/dashboard">← Вернуться в кабинет</Button>
        <Button variant="ghost" onClick={() => navigate('/test/1')}>Пройти заново</Button>
      </div>
    </div>
  )
}

function normalizeProfs(list) {
  if (!Array.isArray(list)) return []
  return list.map(p => {
    if (typeof p === 'string') return { name: p }
    return { name: p.name || p.profession || '—', match: p.match ?? p.score }
  })
}
