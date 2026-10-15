// Ряд круговых мини-диаграмм (несколько процентов). Инлайн-SVG, токены темы.
const lvlColor = (v) => (v >= 66 ? 'var(--ok)' : v >= 40 ? 'var(--accent)' : 'var(--gold)')

export default function MiniRings({ data, size = 66 }) {
  // data: [{ label, value }] (value 0..100). viewBox фиксирован 70×70, r=27; size — только ширина.
  const c = 2 * Math.PI * 27
  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'space-around', flexWrap: 'wrap' }}>
      {data.map((d) => {
        const frac = Math.max(0, Math.min(1, d.value / 100))
        return (
          <div key={d.label} style={{ textAlign: 'center' }}>
            <svg viewBox="0 0 70 70" width={size} role="img" aria-label={`${d.label}: ${Math.round(d.value)}%`}>
              <circle cx="35" cy="35" r="27" fill="none" stroke="var(--card2)" strokeWidth="7" />
              <circle cx="35" cy="35" r="27" fill="none" stroke={lvlColor(d.value)} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${c * frac} ${c}`} transform="rotate(-90 35 35)" />
              <text x="35" y="40" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)">{Math.round(d.value)}</text>
            </svg>
            <div style={{ fontSize: 11.5, color: 'var(--sub)', marginTop: 3, maxWidth: 92 }}>{d.label}</div>
          </div>
        )
      })}
    </div>
  )
}
