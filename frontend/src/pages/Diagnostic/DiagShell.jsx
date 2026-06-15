import { useNavigate } from 'react-router-dom'
import '../../styles/diagnostic.css'

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
            <div className="tb-logo-mark">⚡</div>CAREER<span>PULSE</span>
          </div>
          <div className="tb-divider"></div>
          <div className="tb-block">Блок <b>{pad}</b> из 10</div>
        </div>
        <button className="tb-btn" onClick={() => navigate('/dashboard')}>← Вернуться</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: pct + '%' }}></div>
      </div>

      <div className={'container' + (wide ? ' wide' : '')}>
        <div className="block-num">БЛОК {pad} / 10</div>
        <div className="block-title">{title}</div>
        {desc && <div className="block-desc">{desc}</div>}
        {meta.length > 0 && (
          <div className="block-meta">
            {meta.map((m, i) => <span key={i}>{m}</span>)}
          </div>
        )}
        {children}
      </div>
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
