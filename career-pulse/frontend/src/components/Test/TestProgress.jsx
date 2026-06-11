import ProgressBar from '../UI/ProgressBar.jsx'

/** Общий прогресс теста. */
export default function TestProgress({ answered, total }) {
  const pct = total ? Math.round((answered / total) * 100) : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
      <ProgressBar value={pct} />
    </div>
  )
}
