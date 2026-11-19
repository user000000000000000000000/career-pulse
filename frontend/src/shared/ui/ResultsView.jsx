import IconText from './IconText.jsx'
import { INTEREST_LABELS, MATCH_EXPLANATION } from '../lib/resultExplanation.js'
// Read-only рендер результатов диагностики по строке профиля
// ({ full_name, diagnostic_data }). Используется и в просмотре родителем
// (ChildResults), и в публичном шаринге (SharedResults). Ничего не редактирует.
// professions передаёт страница (shared-слой не может импортить entities).

const HOLLAND = {
  ...INTEREST_LABELS,
}

const Card = ({ title, children }) => (
  <div className="shared-result-card">
    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 10 }}><IconText text={title} /></div>
    {children}
  </div>
)

export default function ResultsView({ row, professions = [], eyebrow = 'РЕЗУЛЬТАТЫ ДИАГНОСТИКИ' }) {
  const dd = row?.diagnostic_data || {}
  const prof = dd.profile || {}
  const progress = dd.progress || { completed: [], pct: 0 }
  const report = prof.ai_report
  const archetypes = [
    ['Карьерный тип', prof.career_archetype],
    ['Ценностный тип', prof.values_archetype],
    ['Тип личности', prof.personality_archetype],
    ['Тип мышления', prof.cognitive_archetype],
  ].filter(([, v]) => v)
  const holland = prof.holland_scores
    ? ['R', 'I', 'A', 'S', 'E', 'C'].map(t => ({ t, v: Math.round(prof.holland_scores[t] || 0) })).sort((a, b) => b.v - a.v)
    : []

  return (
    <>
      <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--ghost)', fontFamily: "'JetBrains Mono',monospace" }}>{eyebrow}</div>
      <h1 style={{ fontSize: 'clamp(24px,4vw,34px)', margin: '4px 0 2px' }}>{row?.full_name || 'Профиль'}</h1>
      <div style={{ fontSize: 13, color: 'var(--sub)' }}>Пройдено блоков: {progress.completed?.length || 0} / 10 · {progress.pct || 0}%</div>
      <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--sub)' }}>Это описание ответов на момент прохождения. Интересы и уверенность могут меняться с опытом. Обсудите, что совпало с наблюдениями в учёбе и хобби и какие занятия хочется попробовать.</p>

      {!prof.holland_scores && !report && (
        <Card title="Диагностика ещё не пройдена">
          <div style={{ fontSize: 13, color: 'var(--sub)' }}>В профиле пока нет результатов об интересах или текстового разбора. Пройденные блоки можно проверить в кабинете.</div>
        </Card>
      )}

      {report?.full_report && (
        <Card title="Разбор от нейросети">
          <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)' }}>
            {String(report.full_report).split(/\n+/).map(s => s.trim()).filter(Boolean).map((p, i) => <p key={i} style={{ margin: i ? '10px 0 0' : 0 }}>{p}</p>)}
          </div>
          {report.key_insights?.length > 0 && (
            <div style={{ marginTop: 14, background: 'rgba(161,204,245,.07)', border: '1px solid rgba(161,204,245,.22)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--violet)', marginBottom: 8 }}><IconText text={"💡 Неочевидное"} /></div>
              <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14, lineHeight: 1.55 }}>
                {report.key_insights.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}
          {(report.strengths?.length || report.weaknesses?.length) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14, marginTop: 14 }}>
              {report.strengths?.length > 0 && <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ok)', marginBottom: 4 }}>Сильные стороны</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{report.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
              {report.weaknesses?.length > 0 && <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ember)', marginBottom: 4 }}>Зоны роста</div><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{report.weaknesses.map((x, i) => <li key={i}>{x}</li>)}</ul></div>}
            </div>
          )}
        </Card>
      )}

      {archetypes.length > 0 && (
        <Card title="Профиль с четырёх сторон">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {archetypes.map(([label, val]) => (
              <div key={label}><div style={{ fontSize: 11, color: 'var(--ghost)' }}><IconText text={label} /></div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)' }}>{val}</div></div>
            ))}
          </div>
        </Card>
      )}

      {holland.length > 0 && (
        <Card title="Какие занятия интересны">
          <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>Каждая шкала — от 0 до 100. Чем выше значение, тем чаще выбирались занятия этого типа. Значения не должны складываться в 100% и не являются оценкой способностей.</p>
          {holland.map(({ t, v }) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 140, flexShrink: 0, fontSize: 12.5 }}>{HOLLAND[t]}</div>
              <div style={{ flex: 1, height: 8, background: 'var(--line)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: v + '%', height: '100%', background: 'var(--accent)' }} /></div>
              <div style={{ width: 34, textAlign: 'right', fontSize: 12, color: 'var(--sub)' }}>{v}%</div>
            </div>
          ))}
        </Card>
      )}

      {professions.length > 0 && (
        <Card title="Подходящие профессии">
          <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>{MATCH_EXPLANATION}</p>
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
      {professions.length > 0 && <Card title="Как использовать результат"><div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.65 }}>Выберите интересные профессии и изучите их задачи в атласе. В своём кабинете ученик может выбрать две профессии и построить маршрут. Затем стоит попробовать небольшую задачу и обсудить впечатления.</div></Card>}
    </>
  )
}
