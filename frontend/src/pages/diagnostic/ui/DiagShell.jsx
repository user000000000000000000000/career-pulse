import { useNavigate } from 'react-router-dom'
import Mascot from './mascot/Mascot'
import { getMascotBlockLine } from '../model/mascotLines'
import { CP } from '../../../shared/api'
import '../diagnostic.css'

/**
 * Общий каркас диагностического блока: topbar + тонкий прогресс-бар + заголовок.
 * Порт верхней части block-N.html из «Сайт V3».
 *
 * props:
 *  - num   : номер блока (1..10)
 *  - title : заголовок
 *  - desc  : описание
 *  - meta  : массив строк для строки мета («🕐 ~15 мин», …)
 *  - pct   : заполнение прогресс-бара (0..100)
 *  - wide  : чуть шире контейнер (для анкеты)
 *  - children
 */
export default function DiagShell({ num, title, desc, meta = [], pct = 0, wide = false, children }) {
  const navigate = useNavigate()
  const pad = String(num).padStart(2, '0')

  return (
    <div className="cp-diag">
      <div className="topbar">
        <div className="tb-left">
          <div className="tb-logo" onClick={() => navigate('/dashboard')}>
            <div className="tb-logo-mark">
              <svg viewBox="0 0 32 32" width="13" height="13" aria-hidden="true"><path d="M17.8 4.5 8.5 18.2h6.1L13 27.5 23.5 13.4h-6.1z" fill="#fff"/></svg>
            </div>CAREER<span>PULSE</span>
          </div>
          <div className="tb-divider"></div>
          <div className="tb-block">Блок <b>{pad}</b> из {CP.TOTAL_BLOCKS}</div>
        </div>
        <button className="tb-btn" onClick={() => navigate('/dashboard')}>← Вернуться</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: pct + '%' }}></div>
      </div>

      <div className={'container' + (wide ? ' wide' : '')}>
        <div className="block-num">БЛОК {pad} / {CP.TOTAL_BLOCKS}</div>
        <div className="block-title">{title}</div>
        {desc && <div className="block-desc">{desc}</div>}
        {meta.length > 0 && (
          <div className="block-meta">
            {meta.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        )}
        {children}
      </div>

      <Mascot mood={pct >= 100 ? 'happy' : 'idle'} message={getMascotBlockLine(num)} />
    </div>
  )
}

/** Кнопки под экраном результата блока: «следующий блок» + «в кабинет». */
export function ResultNav({ onNext }) {
  const navigate = useNavigate()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <button className="btn btn-accent" onClick={onNext}>Следующий блок →</button>
      <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>В кабинет</button>
    </div>
  )
}
