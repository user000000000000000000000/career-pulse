import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { ProbaContext } from '../model/probaContext'
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
  const proba = useContext(ProbaContext)
  const pad = String(num).padStart(2, '0')
  const exit = proba ? proba.exit : '/dashboard'
  const label = proba
    ? `Шаг ${proba.stepOf(num).step} из ${proba.stepOf(num).total}`
    : `Блок ${pad} из ${CP.TOTAL_BLOCKS}`

  return (
    <div className={'cp-diag' + (proba ? ' cp-diag--proba' : '')}>
      <div className="topbar">
        <div className="tb-left">
          <div className="tb-logo" onClick={() => navigate(exit)}>
            <div className="tb-logo-mark">
              <svg viewBox="0 0 32 32" width="13" height="13" aria-hidden="true"><path d="M17.8 4.5 8.5 18.2h6.1L13 27.5 23.5 13.4h-6.1z" fill="#fff"/></svg>
            </div>CAREER<span>PULSE</span>
          </div>
          <div className="tb-divider"></div>
          <div className="tb-block">{proba ? label : <>Блок <b>{pad}</b> из {CP.TOTAL_BLOCKS}</>}</div>
        </div>
        <button className="tb-btn" onClick={() => navigate(exit)}>← {proba ? 'На главную' : 'Вернуться'}</button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: pct + '%' }}></div>
      </div>

      <div className={'container' + (wide ? ' wide' : '')}>
        <div className="block-num">{proba ? label.toUpperCase() : `БЛОК ${pad} / ${CP.TOTAL_BLOCKS}`}</div>
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

/** Кнопки под экраном результата блока: «дальше» + выход. */
export function ResultNav({ onNext }) {
  const navigate = useNavigate()
  const proba = useContext(ProbaContext)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <button className="btn btn-accent" onClick={onNext}>{proba ? 'Далее →' : 'Следующий блок →'}</button>
      <button className="btn btn-ghost" onClick={() => navigate(proba ? '/' : '/dashboard')}>{proba ? 'На главную' : 'В кабинет'}</button>
    </div>
  )
}
