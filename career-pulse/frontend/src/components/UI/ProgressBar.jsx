import '../../styles/ui.css'

/** Прогресс-бар. value 0..100. */
export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="cp-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="cp-progress__fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
