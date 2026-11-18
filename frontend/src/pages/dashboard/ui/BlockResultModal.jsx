import IconText from '../../../shared/ui/IconText.jsx'
import { blockSummary } from '../../../shared/lib/blockSummary'
import { blockRings, BIG5, COG, HOLLAND } from '../../../shared/lib/blockRings'
import { RadarChart, BarList, MiniRings } from '../../../shared/ui/charts'
import { useRef } from 'react'
import { useModal } from '../../../shared/ui/ModalProvider.jsx'

// Диаграмма под конкретный блок (из сохранённых scores).
function BlockChart({ blockNum, scores: r }) {
  if (!r) return null
  if (blockNum === 2) {
    const data = ['R', 'I', 'A', 'S', 'E', 'C'].map(k => ({ label: HOLLAND[k] || k, value: r[k] || 0 }))
    if (data.some(d => d.value > 0)) return <RadarChart data={data} />
  }
  if (blockNum === 4) {
    const data = Object.keys(BIG5).filter(k => r[k] != null).map(k => ({ label: BIG5[k], value: Math.round(r[k]) }))
    if (data.length) return <BarList data={data} unit="" />
  }
  if (blockNum === 5) {
    const sp = r.self_reported_pct || {}
    const data = Object.keys(COG).filter(k => sp[k] != null).map(k => ({ label: COG[k], value: Math.round(sp[k]) }))
    if (data.length) return <BarList data={data} />
  }
  const rings = blockRings(blockNum, r)
  if (rings.length) return <MiniRings data={rings} />
  return null
}

// Модалка с полным результатом одного пройденного блока.
export default function BlockResultModal({ blockNum, title, scores, onClose }) {
  const summary = blockSummary(blockNum, scores)
  const dialogRef = useRef(null)
  useModal({ open: true, dialogRef, onClose })
  const rings = blockRings(blockNum, scores)
  return (
    <div className="brm-overlay" onClick={onClose}>
      <div ref={dialogRef} className="brm-card" role="dialog" aria-modal="true" aria-labelledby="block-result-title" onClick={(e) => e.stopPropagation()}>
        <button className="brm-close" onClick={onClose} aria-label="Закрыть"><IconText text={"✕"} /></button>
        <div className="brm-eyebrow">Результат · блок {String(blockNum).padStart(2, '0')}</div>
        <h3 id="block-result-title" className="brm-title"><IconText text={title} /></h3>
        {summary && <p className="brm-text">{summary}</p>}
        {rings.length > 0 && <p className="brm-text">Числа показывают результат по шкалам этого блока. Это не школьные оценки.</p>}
        <div className="brm-chart"><BlockChart blockNum={blockNum} scores={scores} /></div>
        <button className="btn btn-ghost brm-full" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}
