import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts'

const ACCENT = '#00e5c8'
const VIOLET = '#7b5cf0'
const EMBER  = '#ff6b35'
const GOLD   = '#f5c518'
const PINK   = '#ff4d6d'
const BLUE   = '#3b82f6'
const GREEN  = '#22c55e'

const TOOLTIP = {
  backgroundColor: '#12122a',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8,
  color: '#e8e8f0',
  fontSize: 12,
  padding: '8px 12px',
}

// ─── Интересы (радар) ────────────────────────────────────────────
const INT_KEYS   = ['tech','anal','crea','soc','lead','ord']
const INT_LABELS = { tech:'Техника', anal:'Анализ', crea:'Творчество', soc:'Коммуникация', lead:'Лидерство', ord:'Порядок' }
const INT_COLORS = [VIOLET, ACCENT, PINK, BLUE, GOLD, GREEN]

export function InterestsRadar({ scores = {} }) {
  const hasData = INT_KEYS.some(k => (scores[k] || 0) > 0)
  const data = INT_KEYS.map(k => ({ subject: INT_LABELS[k], value: scores[k] || 0, fullMark: 100 }))
  return (
    <div className="chart-block">
      <div className="chart-title">Интересы и склонности</div>
      {!hasData && <div className="chart-empty">Нет данных по этому блоку</div>}
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={data} margin={{ top: 10, right: 34, bottom: 10, left: 34 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#b0b0c8', fontSize: 10, fontWeight: 600 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Вы" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.22} strokeWidth={2.5} dot={{ fill: ACCENT, r: 3 }} />
          <Tooltip contentStyle={TOOLTIP} formatter={v => [`${v}%`, 'Балл']} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {INT_KEYS.map((k, i) => (
          <div key={k} className="legend-item">
            <span className="legend-dot" style={{ background: INT_COLORS[i] }} />
            <span>{INT_LABELS[k]}</span>
            <span className="legend-val">{scores[k] || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Способности (вертикальные бары) ────────────────────────────
const ABL_KEYS   = ['AN','VC','CR','OR','PT']
const ABL_LABELS = { AN:'Аналитика', VC:'Коммуникация', CR:'Креативность', OR:'Организация', PT:'Практика' }
const ABL_COLORS = [ACCENT, BLUE, PINK, GOLD, VIOLET]

export function AbilitiesBar({ scores = {} }) {
  const hasData = ABL_KEYS.some(k => (scores[k] || 0) > 0)
  const data = ABL_KEYS.map((k, i) => ({ name: ABL_LABELS[k], value: scores[k] || 0, color: ABL_COLORS[i] }))
  return (
    <div className="chart-block">
      <div className="chart-title">Способности</div>
      {!hasData && <div className="chart-empty">Нет данных по этому блоку</div>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 40 }} barCategoryGap="28%">
          <XAxis dataKey="name" tick={{ fill: '#c0c0d8', fontSize: 10, fontWeight: 600 }}
            axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" />
          <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP} formatter={v => [`${v}%`, 'Балл']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[5, 5, 0, 0]} minPointSize={3}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Ценности (круговая) ──────────────────────────────────────────
const VAL_KEYS   = ['M','ST','FR','PR','HL','SR','DV']
const VAL_LABELS = { M:'Доход', ST:'Стабильность', FR:'Свобода', PR:'Признание', HL:'Польза', SR:'Самовыражение', DV:'Развитие' }
const VAL_COLORS = [GOLD, BLUE, ACCENT, PINK, GREEN, VIOLET, EMBER]

export function ValuesPie({ scores = {} }) {
  const rawVals = VAL_KEYS.map(k => scores[k] || 0)
  const hasData = rawVals.some(v => v > 0)
  const raw   = VAL_KEYS.map((k, i) => ({ name: VAL_LABELS[k], value: hasData ? rawVals[i] : 0, color: VAL_COLORS[i] }))
  const total = raw.reduce((s, d) => s + d.value, 0) || 1
  const data  = raw.map(d => ({ ...d, pct: Math.round((d.value / total) * 100) }))
  return (
    <div className="chart-block">
      <div className="chart-title">Ценности и мотивация</div>
      {!hasData && <div className="chart-empty">Нет данных по этому блоку</div>}
      {hasData && (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP} formatter={(_, __, props) => [`${props.payload.pct}%`, props.payload.name]} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <div className="chart-legend">
        {data.map(d => (
          <div key={d.name} className="legend-item">
            <span className="legend-dot" style={{ background: d.color }} />
            <span>{d.name}</span>
            {hasData && <span className="legend-val">{d.pct}%</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Поведение (вертикальные бары) ───────────────────────────────
const BEH_KEYS   = ['IN','SD','RS','CO','RE']
const BEH_LABELS = { IN:'Инициатива', SD:'Дисциплина', RS:'Стойкость', CO:'Команда', RE:'Ответств.' }
const BEH_COLORS = [EMBER, VIOLET, GOLD, BLUE, ACCENT]

export function BehaviorBar({ scores = {} }) {
  const hasData = BEH_KEYS.some(k => (scores[k] || 0) > 0)
  const data = BEH_KEYS.map((k, i) => ({ name: BEH_LABELS[k], value: scores[k] || 0, color: BEH_COLORS[i] }))
  return (
    <div className="chart-block">
      <div className="chart-title">Поведенческие паттерны</div>
      {!hasData && <div className="chart-empty">Нет данных по этому блоку</div>}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 40 }} barCategoryGap="28%">
          <XAxis dataKey="name" tick={{ fill: '#c0c0d8', fontSize: 10, fontWeight: 600 }}
            axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" />
          <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP} formatter={v => [`${v}%`, 'Балл']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="value" radius={[5, 5, 0, 0]} minPointSize={3}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Горизонтальные бары профессий ───────────────────────────────
export function ProfessionBars({ professions = [] }) {
  if (!professions.length) return null
  const data = professions.slice(0, 7).map(p => ({
    name:  typeof p === 'string' ? p : (p.name || '—'),
    match: typeof p === 'string' ? 80 : Math.round(p.match ?? p.score ?? 80),
  }))
  const GRAD_ID = 'profGrad'
  return (
    <div className="chart-block">
      <div className="chart-title">Совместимость с профессиями</div>
      <ResponsiveContainer width="100%" height={data.length * 46 + 20}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 52, left: 4, bottom: 4 }} barCategoryGap="22%">
          <defs>
            <linearGradient id={GRAD_ID} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stopColor={VIOLET} />
              <stop offset="100%" stopColor={ACCENT} />
            </linearGradient>
          </defs>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#888', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" width={155} tick={{ fill: '#d0d0e8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP} formatter={v => [`${v}%`, 'Совпадение']} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="match" radius={[0, 5, 5, 0]} fill={`url(#${GRAD_ID})`}
            background={{ fill: 'rgba(255,255,255,0.05)', radius: [0, 5, 5, 0] }}
            label={{ position: 'right', fill: ACCENT, fontSize: 11, fontWeight: 700, formatter: v => `${v}%` }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ─── Обратная совместимость (старые компоненты → новые) ──────────
export const HollandRadar  = InterestsRadar
export const BigFiveBar    = AbilitiesBar
export const IntelligencePie = ValuesPie
