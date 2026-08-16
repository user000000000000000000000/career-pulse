// Графики результатов — чистый CSS, без внешних библиотек (recharts удалён).
// Единый визуальный язык: горизонтальные ранжированные бары.

const ACCENT = '#5f96e9'
const VIOLET = '#8b6fe8'
const EMBER  = '#e8a0c4'
const GOLD   = '#72a2eb'
const PINK   = '#ff4d6d'
const BLUE   = '#3b82f6'
const GREEN  = '#22c55e'

/** Общий блок ранжированных баров (интересы / способности / ценности / поведение). */
function Bars({ title, rows }) {
  const hasData = rows.some(r => (r.val || 0) > 0)
  const sorted = [...rows].sort((a, b) => (b.val || 0) - (a.val || 0))
  return (
    <div className="chart-block">
      <div className="chart-title">{title}</div>
      {!hasData && <div className="chart-empty">Нет данных по этому блоку</div>}
      <div className="rc-bars">
        {sorted.map(r => (
          <div key={r.name} className="rc-bar">
            <span className="rc-bar__name">{r.name}</span>
            <div className="rc-bar__track"><div className="rc-bar__fill" style={{ width: (r.val || 0) + '%', background: r.color }} /></div>
            <span className="rc-bar__val">{r.val || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Интересы ────────────────────────────────────────────────────
const INT_KEYS   = ['tech','anal','crea','soc','lead','ord']
const INT_LABELS = { tech:'Техника', anal:'Анализ', crea:'Творчество', soc:'Коммуникация', lead:'Лидерство', ord:'Порядок' }
const INT_COLORS = [VIOLET, ACCENT, PINK, BLUE, GOLD, GREEN]

export function InterestsRadar({ scores = {} }) {
  return <Bars title="Интересы и склонности"
    rows={INT_KEYS.map((k, i) => ({ name: INT_LABELS[k], val: scores[k] || 0, color: INT_COLORS[i] }))} />
}

// ─── Способности ─────────────────────────────────────────────────
const ABL_KEYS   = ['AN','VC','CR','OR','PT']
const ABL_LABELS = { AN:'Аналитика', VC:'Коммуникация', CR:'Креативность', OR:'Организация', PT:'Практика' }
const ABL_COLORS = [ACCENT, BLUE, PINK, GOLD, VIOLET]

export function AbilitiesBar({ scores = {} }) {
  return <Bars title="Способности"
    rows={ABL_KEYS.map((k, i) => ({ name: ABL_LABELS[k], val: scores[k] || 0, color: ABL_COLORS[i] }))} />
}

// ─── Ценности (нормируем к 100%) ─────────────────────────────────
const VAL_KEYS   = ['M','ST','FR','PR','HL','SR','DV']
const VAL_LABELS = { M:'Доход', ST:'Стабильность', FR:'Свобода', PR:'Признание', HL:'Польза', SR:'Самовыражение', DV:'Развитие' }
const VAL_COLORS = [GOLD, BLUE, ACCENT, PINK, GREEN, VIOLET, EMBER]

export function ValuesPie({ scores = {} }) {
  const raw = VAL_KEYS.map(k => scores[k] || 0)
  const total = raw.reduce((s, v) => s + v, 0) || 1
  return <Bars title="Ценности и мотивация"
    rows={VAL_KEYS.map((k, i) => ({ name: VAL_LABELS[k], val: Math.round((raw[i] / total) * 100), color: VAL_COLORS[i] }))} />
}

// ─── Поведение ───────────────────────────────────────────────────
const BEH_KEYS   = ['IN','SD','RS','CO','RE']
const BEH_LABELS = { IN:'Инициатива', SD:'Дисциплина', RS:'Стойкость', CO:'Команда', RE:'Ответств.' }
const BEH_COLORS = [EMBER, VIOLET, GOLD, BLUE, ACCENT]

export function BehaviorBar({ scores = {} }) {
  return <Bars title="Поведенческие паттерны"
    rows={BEH_KEYS.map((k, i) => ({ name: BEH_LABELS[k], val: scores[k] || 0, color: BEH_COLORS[i] }))} />
}

// ─── Совместимость с профессиями (широкие названия + градиент) ───
export function ProfessionBars({ professions = [] }) {
  if (!professions.length) return null
  const rows = professions.slice(0, 7).map(p => ({
    name:  typeof p === 'string' ? p : (p.name || '—'),
    match: typeof p === 'string' ? 80 : Math.round(p.match ?? p.score ?? 80),
  }))
  return (
    <div className="chart-block">
      <div className="chart-title">Совместимость с профессиями</div>
      <div className="rc-bars rc-bars--prof">
        {rows.map(r => (
          <div key={r.name} className="rc-bar">
            <span className="rc-bar__name">{r.name}</span>
            <div className="rc-bar__track"><div className="rc-bar__fill" style={{ width: r.match + '%', background: `linear-gradient(90deg, ${VIOLET}, ${ACCENT})` }} /></div>
            <span className="rc-bar__val">{r.match}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
