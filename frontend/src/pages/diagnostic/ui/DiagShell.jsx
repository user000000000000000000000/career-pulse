import IconText from '../../../shared/ui/IconText.jsx'
import Header from '../../../shared/ui/Header.jsx'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { BLOCKS } from '../../../shared/config'
import { ProbaContext } from '../model/probaContext'
import DiagnosticOverview from './DiagnosticOverview.jsx'
import QuestionStage from './QuestionStage.jsx'
import JourneyProgress from '../../../shared/ui/JourneyProgress.jsx'
import '../diagnostic.css'

/**
 * Общий каркас блока: переход в общей шапке, обзор и вопросы.
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
export default function DiagShell({ num, title, desc, meta = [], pct = 0, wide = false, mascotVariant, chapter, children }) {
  const proba = useContext(ProbaContext)
  const [completed, setCompleted] = useState(null)
  useEffect(() => {
    if (proba) return
    let alive = true
    CP.getProgress().then(progress => {
      if (alive) setCompleted(previous => previous?.join(',') === progress.completed.join(',') ? previous : progress.completed)
    })
    return () => { alive = false }
  }, [num, pct, meta.length, proba])
  const pad = String(num).padStart(2, '0')
  const exit = proba ? proba.exit : '/dashboard'
  const label = proba
    ? `Шаг ${proba.stepOf(num).step} из ${proba.stepOf(num).total}`
    : `Блок ${pad} из ${CP.TOTAL_BLOCKS}`

  return (
    <div className={'cp-diag' + (proba ? ' cp-diag--proba' : '') + (meta.length ? ' cp-diag--overview' : ' cp-diag--result')}>
      <Header backTo={exit} backLabel={proba ? '← На главную' : '← В кабинет'} />

      {meta.length > 0 && <DiagnosticOverview num={num} label={label} title={title} desc={desc} meta={meta} mascotVariant={mascotVariant} chapter={chapter} />}
      {!proba && completed && <div className="diag-journey"><JourneyProgress completed={completed} current={num} /></div>}
      <div className={'container' + (wide ? ' wide' : '')}>
        {meta.length === 0 && <>
        <div className="block-num">{proba ? label.toUpperCase() : `БЛОК ${pad} / ${CP.TOTAL_BLOCKS}`}</div>
        <h1 className="block-title"><IconText text={BLOCKS.find(block => block.n === num)?.title || title} /></h1>
        {desc && <div className="block-desc">{desc}</div>}
        </>}
        {meta.length ? <QuestionStage pct={pct}>{children}</QuestionStage> : children}
      </div>
    </div>
  )
}

/** Кнопки под экраном результата блока: «дальше» + выход. */
export function ResultNav({ onNext }) {
  const navigate = useNavigate()
  const proba = useContext(ProbaContext)
  return (
    <div className="result-nav">
      <button className="btn btn-accent" onClick={onNext}><IconText text={proba ? 'Далее →' : 'Следующий блок →'} /></button>
      <button className="btn btn-ghost" onClick={() => navigate(proba ? '/' : '/dashboard')}>{proba ? 'На главную' : 'В кабинет'}</button>
    </div>
  )
}
