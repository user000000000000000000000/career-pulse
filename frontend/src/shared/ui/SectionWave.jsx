export default function SectionWave({ from = '#f7fbff', to = '#eaf4ff', accent = '#b8dcff', highlight = '#dceeff', flip = false }) {
  return <div className={'section-wave' + (flip ? ' section-wave--flip' : '')} style={{ background: from }} aria-hidden="true">
    <svg viewBox="0 0 1600 130" preserveAspectRatio="none" focusable="false">
      <path d="M0 40C200 125 350-20 600 45S950 130 1190 55 1450 15 1600 45V130H0Z" fill={accent} opacity=".42" />
      <path d="M0 80C230-10 350 105 640 80S1010 10 1230 80 1450 100 1600 55V130H0Z" fill={highlight} opacity=".7" />
      <path d="M0 100C220 45 350 125 600 108S890 60 1160 100 1420 130 1600 85V130H0Z" fill={to} />
    </svg>
  </div>
}
