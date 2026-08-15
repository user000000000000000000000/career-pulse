// SVG-рисунок лисы-маскота: одна геометрия, 4 состояния (mood).
// Портировано из артефакта-черновика (органичный силуэт на кривых Безье,
// радиальный градиент вместо плоской заливки, блик в глазах, румянец).
export default function FoxSVG({ mood = 'idle', size = 96 }) {
  const gradId = `foxGrad-${mood}`

  const eyes = (mood === 'happy' || mood === 'celebrating')
    ? (
      <>
        <path d="M74,112 Q84,100 94,112" stroke="#161018" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M126,112 Q136,100 146,112" stroke="#161018" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      </>
    ) : (
      <>
        <ellipse cx="84" cy="114" rx="10.5" ry="13" fill="#161018" />
        <ellipse cx="136" cy="114" rx="10.5" ry="13" fill="#161018" />
        <circle cx="84" cy="110" r="4.5" fill="#00e5c8" />
        <circle cx="136" cy="110" r="4.5" fill="#00e5c8" />
        <circle cx="81.5" cy="107" r="2" fill="white" />
        <circle cx="133.5" cy="107" r="2" fill="white" />
      </>
    )

  const tilt = mood === 'thinking' ? 'rotate(-7 110 116)' : mood === 'celebrating' ? 'rotate(4 110 116) translate(0 -8)' : ''

  const mouth = mood === 'happy'
    ? <path d="M96,140 Q110,152 124,140" stroke="#c1501f" strokeWidth="3" fill="none" strokeLinecap="round" />
    : mood === 'celebrating'
    ? (
      <>
        <path d="M94,138 Q110,156 126,138" stroke="#c1501f" strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="44" cy="56" r="4" fill="#00e5c8" /><circle cx="176" cy="66" r="3" fill="#f5c842" />
        <circle cx="184" cy="140" r="4" fill="#7b5cf0" /><circle cx="30" cy="120" r="3" fill="#ff6b6b" />
      </>
    )
    : <path d="M110,140 C110,146 108,148 104,150 M110,140 C110,146 112,148 116,150" stroke="#c1501f" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" />

  const brows = mood === 'thinking'
    ? <path d="M70,100 Q84,88 100,98" stroke="#c1501f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    : (
      <>
        <path d="M70,102 Q84,92 100,100" stroke="#c1501f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
        <path d="M150,102 Q136,92 120,100" stroke="#c1501f" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
      </>
    )

  return (
    <svg viewBox="0 0 220 220" width={size} height={size} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <radialGradient id={gradId} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ff9a66" /><stop offset="70%" stopColor="#ff9a66" /><stop offset="100%" stopColor="#e0672f" />
        </radialGradient>
      </defs>
      <g transform={tilt}>
        <ellipse cx="110" cy="186" rx="52" ry="10" fill="black" opacity="0.2" />
        <path d="M52,58 C40,30 34,8 46,4 C60,0 74,26 78,52 C70,44 60,44 52,58 Z" fill="#c1501f" />
        <path d="M168,58 C180,30 186,8 174,4 C160,0 146,26 142,52 C150,44 160,44 168,58 Z" fill="#c1501f" />
        <path d="M58,50 C51,32 49,18 55,15 C63,12 71,28 74,46 C68,42 62,42 58,50 Z" fill="#fff4e6" opacity="0.9" />
        <path d="M162,50 C169,32 171,18 165,15 C157,12 149,28 146,46 C152,42 158,42 162,50 Z" fill="#fff4e6" opacity="0.9" />
        <path d="M110,40 C150,40 182,68 182,114 C182,156 152,190 110,190 C68,190 38,156 38,114 C38,68 70,40 110,40 Z" fill={`url(#${gradId})`} />
        <path d="M62,150 C62,190 90,208 110,208 C130,208 158,190 158,150 C158,140 140,144 110,144 C80,144 62,140 62,150 Z" fill="#fff4e6" />
        {brows}
        {eyes}
        <path d="M110,132 C104,132 101,136 103,140 C105,144 115,144 117,140 C119,136 116,132 110,132 Z" fill="#c1501f" />
        {mouth}
      </g>
    </svg>
  )
}
