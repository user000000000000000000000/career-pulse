import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts'

const ACCENT   = '#00e5c8'
const VIOLET   = '#7b5cf0'
const EMBER    = '#ff6b35'
const GOLD     = '#f5c518'
const PINK     = '#ff4d6d'
const BLUE     = '#3b82f6'

const HOLLAND_LABELS = { R: 'Реалист', I: 'Исследователь', A: 'Артист', S: 'Социальный', E: 'Предприниматель', C: 'Конвенциональный' }
const HOLLAND_COLORS = { R: EMBER, I: ACCENT, A: VIOLET, S: BLUE, E: GOLD, C: PINK }

const BIG5_KEYS = ['AG','CO','EX','OP','ES']
const BIG5_LABELS = { AG: 'Дружелюбие', CO: 'Добросовестность', EX: 'Экстраверсия', OP: 'Открытость', ES: 'Эмоц. стабильность' }
const BIG5_COLORS = [ACCENT, VIOLET, GOLD, EMBER, PINK]

const INTEL_KEYS = ['VB','LM','SP','BK','MS','IP','IA']
const INTEL_LABELS = { VB: 'Речевой', LM: 'Логический', SP: 'Пространств.', BK: 'Кинестетич.', MS: 'Музыкальный', IP: 'Межличностный', IA: 'Внутриличностный' }

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1a2e',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#e0e0e0',
  fontSize: 12,
}

// ── Радар Holland RIASEC ─────────────────────────────────────
export function HollandRadar({ scores = {} }) {
  const data = Object.entries(HOLLAND_LABELS).map(([key, name]) => ({
    subject: name,
    value: scores[key] || 0,
    fullMark: 100,
  }))

  return (
    <div className="chart-block">
      <div className="chart-title">Holland RIASEC — профиль склонностей</div>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#a0a0b0', fontSize: 11 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#555', fontSize: 9 }} />
          <Radar name="Вы" dataKey="value" stroke={ACCENT} fill={ACCENT} fillOpacity={0.18} strokeWidth={2} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Балл']} />
        </RadarChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {Object.entries(HOLLAND_LABELS).map(([k, label]) => (
          <div key={k} className="legend-item">
            <span className="legend-dot" style={{ background: HOLLAND_COLORS[k] }} />
            <span>{k} — {label}</span>
            <span className="legend-val">{scores[k] || 0}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Столбчатая диаграмма Big Five ────────────────────────────
export function BigFiveBar({ scores = {} }) {
  const data = BIG5_KEYS.map((k, i) => ({
    name: BIG5_LABELS[k],
    value: scores[k] || 0,
    color: BIG5_COLORS[i],
  }))

  return (
    <div className="chart-block">
      <div className="chart-title">Личностный профиль Big Five</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="30%">
          <XAxis dataKey="name" tick={{ fill: '#a0a0b0', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Балл']} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Круговая диаграмма типа интеллекта ──────────────────────
export function IntelligencePie({ scores = {} }) {
  const raw = INTEL_KEYS.map(k => ({ name: INTEL_LABELS[k], value: Math.max(scores[k] || 0, 1) }))
  const total = raw.reduce((s, d) => s + d.value, 0)
  const data = raw.map(d => ({ ...d, pct: Math.round((d.value / total) * 100) }))

  const COLORS = [ACCENT, VIOLET, EMBER, GOLD, PINK, BLUE, '#22c55e']

  return (
    <div className="chart-block">
      <div className="chart-title">Тип интеллекта (Гарднер)</div>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(_, name, props) => [`${props.payload.pct}%`, props.payload.name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div key={d.name} className="legend-item">
            <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span>{d.name}</span>
            <span className="legend-val">{d.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Горизонтальные бары для профессий ───────────────────────
export function ProfessionBars({ professions = [] }) {
  if (!professions.length) return null
  const data = professions.slice(0, 7).map(p => ({
    name: typeof p === 'string' ? p : p.name,
    match: typeof p === 'string' ? 80 : (p.match ?? p.score ?? 80),
  }))

  return (
    <div className="chart-block">
      <div className="chart-title">Совместимость с профессиями</div>
      <ResponsiveContainer width="100%" height={data.length * 42 + 20}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 50, left: 0, bottom: 0 }} barCategoryGap="25%">
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#555', fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={160} tick={{ fill: '#a0a0b0', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Совпадение']} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="match" radius={[0, 4, 4, 0]} background={{ fill: 'rgba(255,255,255,0.04)', radius: [0,4,4,0] }}>
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#barGrad${i})`} />
            ))}
          </Bar>
          <defs>
            {data.map((_, i) => (
              <linearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={VIOLET} />
                <stop offset="100%" stopColor={ACCENT} />
              </linearGradient>
            ))}
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
