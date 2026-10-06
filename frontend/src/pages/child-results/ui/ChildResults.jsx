import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getChildProfile } from '../../../shared/api'
import { friendlyError } from '../../../shared/lib/errors'
import { matchProfessions } from '../../../entities/profession'
import Header from '../../../shared/ui/Header.jsx'

// Read-only просмотр результатов ребёнка родителем. Данные — из
// profiles.diagnostic_data привязанного ребёнка (доступ открыт RLS-политикой
// profiles_select_linked). Ничего не редактируем.

const HOLLAND = {
  R: 'Реалистичный', I: 'Исследовательский', A: 'Артистичный',
  S: 'Социальный', E: 'Предприимчивый', C: 'Конвенциональный',
}

export default function ChildResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [state, setState] = useState({ loading: true, error: '', row: null })

  useEffect(() => {
    let alive = true
    getChildProfile(id)
      .then(row => { if (alive) setState({ loading: false, error: row ? '' : 'Нет доступа или профиль не найден', row }) })
      .catch(e => { if (alive) setState({ loading: false, error: friendlyError(e, 'Не удалось загрузить результаты'), row: null }) })
    return () => { alive = false }
  }, [id])

  if (state.loading) return <div className="cp-legal"><Header backTo="/dashboard" backLabel="← В кабинет" reserveRight /><div style={{ padding: 40, textAlign: 'center', color: 'var(--ghost)' }}>Загрузка…</div></div>

  const row = state.row
  const dd = row?.diagnostic_data || {}
  const prof = dd.profile || {}
  const progress = dd.progress || { completed: [], pct: 0 }
  const report = prof.ai_report
  const professions = prof.holland_scores ? matchProfessions(prof, 6) : []
  const archetypes = [
    ['Карьерный тип', prof.career_archetype],
    ['Ценностный тип', prof.values_archetype],
    ['Тип личности', prof.personality_archetype],
    ['Тип мышления', prof.cognitive_archetype],
  ].filter(([, v]) => v)
  const holland = prof.holland_scores
    ? ['R', 'I', 'A', 'S', 'E', 'C'].map(t => ({ t, v: Math.round(prof.holland_scores[t] || 0) })).sort((a, b) => b.v - a.v)
    : []

  const Card = ({ title, children }) => (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 18, marginTop: 14 }}>
      <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div className="cp-legal">
      <Header backTo="/dashboard" backLabel="← В кабинет" reserveRight />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '88px 16px 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--ghost)', fontFamily: "'JetBrains Mono',monospace" }}>РЕЗУЛЬТАТЫ ДИАГНОСТИКИ</div>
        <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', margin: '4px 0 2px' }}>{row.full_name || row.email || 'Аккаунт'}</h1>
        <div style={{ fontSize: 13, color: 'var(--sub)' }}>Пройдено блоков: {progress.completed?.length || 0} / 10 · {progress.pct || 0}%</div>

        {state.error && <div style={{ color: 'var(--danger)', marginTop: 16 }}>{state.error}</div>}

        {!prof.holland_scores && !report && (
          <Card title="Диагностика ещё не пройдена">
            <div style={{ fontSize: 13, color: 'var(--sub)' }}>Как только ребёнок пройдёт блоки диагностики, здесь появится его профиль и разбор.</div>
          </Card>
        )}

        {report?.full_report && (
          <Card title="Разбор от нейросети">
            <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)' }}>
              {String(report.full_report).split(/\n+/).map(s => s.trim()).filter(Boolean).map((p, i) => <p key={i} style={{ margin: i ? '10px 0 0' : 0 }}>{p}</p>)}
            </div>
            {(report.strengths?.length || report.weaknesses?.length) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 14 }}>
                {report.strengths?.length > 0 && <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ok)', marginBottom: 4 }}>Сильные стороны</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{report.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
                {report.weaknesses?.length > 0 && <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ember)', marginBottom: 4 }}>Зоны роста</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{report.weaknesses.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
              </div>
            )}
          </Card>
        )}

        {archetypes.length > 0 && (
          <Card title="Типология">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {archetypes.map(([label, val]) => (
                <div key={label}><div style={{ fontSize: 11, color: 'var(--ghost)' }}>{label}</div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{val}</div></div>
              ))}
            </div>
          </Card>
        )}

        {holland.length > 0 && (
          <Card title="Что интересно (профиль Голланда)">
            {holland.map(({ t, v }) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 140, fontSize: 12.5 }}>{HOLLAND[t]}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: v + '%', height: '100%', background: 'var(--accent)' }} /></div>
                <div style={{ width: 34, textAlign: 'right', fontSize: 12, color: 'var(--sub)' }}>{v}%</div>
              </div>
            ))}
          </Card>
        )}

        {professions.length > 0 && (
          <Card title="Подходящие профессии">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {professions.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{p.name}</span>
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--accent)' }}>{p.match}%</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
