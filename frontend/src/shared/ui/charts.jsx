import IconText from './IconText.jsx'
import '../../pages/diagnostic/charts.css'
// Визуализация результатов диагностики — инлайн SVG/CSS, без библиотек, с полными
// подписями. Цвета — токены темы (работает в светлой и тёмной). Варианты из галереи:
// A радар, B столбцы, E кольцо, F мини-кольца, H карточки-ранги, J сегменты.

const PALETTE = ['var(--accent)', 'var(--violet)', 'var(--accent3)', 'var(--ok)', 'var(--gold)', 'var(--sub)']

// ── A. Радар профиля (6 осей) + легенда с полными названиями ──
export function RadarChart({ data, color = 'var(--accent)' }) {
  // data: [{ label, value }] (value 0..100), порядок = порядок осей
  const n = data.length
  const cx = 110, cy = 110, R = 82
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  }
  const ring = (f) => data.map((_, i) => pt(i, R * f).join(',')).join(' ')
  const shape = data.map((d, i) => pt(i, R * Math.max(0, Math.min(100, d.value)) / 100).join(',')).join(' ')
  return (
    <div className="diag-radar" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 220 220" width="220" role="img" aria-label={`Диаграмма интересов: ${data.map(d => `${d.label} — ${Math.round(d.value)} из 100`).join('; ')}`}>
        {[1, 0.66, 0.33].map((f, i) => <polygon key={i} points={ring(f)} fill="none" stroke="var(--line)" strokeWidth="1" />)}
        {data.map((_, i) => { const [x, y] = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" strokeWidth="1" /> })}
        <polygon points={shape} fill={color} fillOpacity="0.22" stroke={color} strokeWidth="2" />
        {data.map((d, i) => { const [x, y] = pt(i, R * Math.max(0, Math.min(100, d.value)) / 100); return <circle key={i} cx={x} cy={y} r="3" fill={color} /> })}
        {data.map((d, i) => { const [x, y] = pt(i, R + 15); return <text key={d.label} x={x} y={y} textAnchor="middle" dominantBaseline="central" fill="var(--sub)" fontSize="10" fontFamily="var(--font-body)" fontWeight="700">{i + 1}</text> })}
      </svg>
      <div className="diag-radar__legend">
        {data.map((d, i) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span className="diag-radar__key">{i + 1}</span>
            <span style={{ flex: 1, color: 'var(--text)' }}><IconText text={d.label} /></span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", color: 'var(--sub)' }}>{Math.round(d.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── B. Сортированные столбцы (несколько шкал) ──
export function BarList({ data, unit = '' }) {
  // data: [{ label, value }] (value 0..100)
  const sorted = [...data].sort((a, b) => b.value - a.value)
  const avg = data.reduce((s, d) => s + d.value, 0) / (data.length || 1)
  return (
    <div className="diag-bars">
      {sorted.map((d) => (
        <div key={d.label} className="diag-bars__row">
          <div className="diag-bars__label"><IconText text={d.label} /></div>
          <div className="diag-bars__track" role="meter" aria-label={d.label} aria-valuenow={d.value} aria-valuemin={0} aria-valuemax={100}>
            <div style={{ width: Math.max(0, Math.min(100, d.value)) + '%', height: '100%', background: d.value >= avg ? 'var(--accent)' : 'var(--ghost)', borderRadius: 5 }} />
          </div>
          <div className="diag-bars__value">{Math.round(d.value)}{unit}</div>
        </div>
      ))}
    </div>
  )
}

// ── E. Кольцо-гейдж (один балл) ──
export function RingGauge({ value, max = 100, label, caption, color = 'var(--accent)', size = 128 }) {
  const r = (size / 2) - 10, c = 2 * Math.PI * r
  const frac = Math.max(0, Math.min(1, value / max))
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} role="img" aria-label={`${label}: ${value} из ${max}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card2)" strokeWidth="11" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2 - 2} textAnchor="middle" fontSize="27" fontWeight="700" fill="var(--text)">{Math.round(value)}</text>
        <text x={size / 2} y={size / 2 + 18} textAnchor="middle" fontSize="11" fill="var(--ghost)">из {max}</text>
      </svg>
      {(label || caption) && (
        <div style={{ maxWidth: 160 }}>
          {label && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}><IconText text={label} /></div>}
          {caption && <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5 }}>{caption}</div>}
        </div>
      )}
    </div>
  )
}

// ── F. Мини-кольца в ряд (несколько процентов) ──
const lvlColor = (v) => (v >= 66 ? 'var(--ok)' : v >= 40 ? 'var(--accent)' : 'var(--gold)')
export function MiniRings({ data }) {
  // data: [{ label, value }] (value 0..100)
  return (
    <div className="diag-minirings">
      {data.map((d) => {
        const r = 27, frac = Math.max(0, Math.min(1, d.value / 100))
        return (
          <div key={d.label} className="diag-minirings__item">
            <svg viewBox="0 0 70 70" width="76" role="img" aria-label={`${d.label}: ${Math.round(d.value)} из 100`}>
              <circle cx="35" cy="35" r={r} fill="none" stroke="var(--card2)" strokeWidth="7" />
              <circle cx="35" cy="35" r={r} fill="none" stroke={lvlColor(d.value)} strokeWidth="7" strokeLinecap={frac === 1 ? 'butt' : 'round'} opacity={frac === 0 ? 0 : 1} pathLength="100"
                strokeDasharray={frac === 1 ? undefined : '100'} strokeDashoffset={100 - frac * 100} transform="rotate(-90 35 35)" />
              <text x="35" y="40" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)">{Math.round(d.value)}</text>
            </svg>
            <div className="diag-minirings__label"><IconText text={d.label} /></div>
          </div>
        )
      })}
    </div>
  )
}

// ── H. Карточки с рангом (топ-N) ──
export function RankCards({ items }) {
  // items: [string]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((name, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--card2)', borderRadius: 10, padding: '9px 12px' }}>
          <span style={{ width: 24, height: 24, borderRadius: '50%', background: PALETTE[i] || 'var(--sub)', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
          <span style={{ fontSize: 14, color: 'var(--text)' }}>{name}</span>
        </div>
      ))}
    </div>
  )
}

// ── J. Сегментированная шкала (процент 0..100 → max сегментов) ──
export function SegmentScale({ data, max = 5 }) {
  // data: [{ label, value }] (value 0..100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {data.map((d) => {
        const filled = Math.round(Math.max(0, Math.min(100, d.value)) / 100 * max)
        return (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text)', marginBottom: 5 }}>
              <span><IconText text={d.label} /></span><span style={{ color: 'var(--sub)', fontFamily: "'JetBrains Mono',monospace", fontSize: 12 }}>{Math.round(d.value)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: max }, (_, i) => (
                <div key={i} style={{ flex: 1, height: 14, borderRadius: 3, background: i < filled ? (d.value >= 60 ? 'var(--ok)' : 'var(--accent)') : 'var(--card2)' }} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
