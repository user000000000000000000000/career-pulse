import { blockSummary } from '../../../shared/lib/blockSummary'
import { blockRings } from '../../../shared/lib/blockRings'
import MiniRings from '../../../shared/ui/MiniRings.jsx'

// Модалка с кратким результатом одного пройденного блока.
export default function BlockResultModal({ blockNum, title, scores, onClose }) {
  const rings = blockRings(blockNum, scores)
  return (
    <div className="brm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="brm-card" onClick={(e) => e.stopPropagation()}>
        <button className="brm-close" onClick={onClose} aria-label="Закрыть">✕</button>
        <div className="brm-eyebrow">Результат · блок {String(blockNum).padStart(2, '0')}</div>
        <h3 className="brm-title">{title}</h3>
        <p className="brm-text">{blockSummary(blockNum, scores)}</p>
        {rings.length > 0 && <div className="brm-rings"><MiniRings data={rings} size={64} /></div>}
        <button className="btn btn-ghost brm-full" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  )
}
