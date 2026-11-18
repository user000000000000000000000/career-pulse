import IconText from '../../../shared/ui/IconText.jsx'
// Навигатор по вопросам блока с быстрыми ответами (личность, Holland, готовность…).
// Кнопка «Назад», прокручиваемая лента номеров 1..N (ткнуть — перейти к любому вопросу
// и поправить ответ) и «Готово», когда отвечены все. Отвеченные точки — залиты,
// текущая — в рамке, пропущенные — приглушены.
import { useRef, useEffect } from 'react'

export default function QuestionNav({ total, current, isAnswered, onJump, onBack, onFinish }) {
  let answeredCount = 0
  for (let i = 0; i < total; i++) if (isAnswered(i)) answeredCount++
  const allAnswered = answeredCount === total

  // Колесо мыши прокручивает ленту номеров по горизонтали (как в соцсетях).
  const ribbonRef = useRef(null)
  useEffect(() => {
    const ribbon = ribbonRef.current
    const active = ribbon?.querySelector('.current')
    if (!active) return
    const left = active.offsetLeft - ribbon.offsetLeft
    if (left < ribbon.scrollLeft || left + active.offsetWidth > ribbon.scrollLeft + ribbon.clientWidth) {
      ribbon.scrollTo({ left: Math.max(0, left - ribbon.clientWidth / 2 + active.offsetWidth / 2), behavior: 'instant' })
    }
  }, [current])
  useEffect(() => {
    const el = ribbonRef.current
    if (!el) return
    const onWheel = (e) => {
      if (el.scrollWidth <= el.clientWidth) return          // нечего прокручивать
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return   // тачпад уже даёт горизонталь
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="qnav print-hide">
      <div className="qnav-top">
        <button className="qnav-back" onClick={onBack} disabled={current === 0}><IconText text={"← Назад"} /></button>
        <span className="qnav-progress">{answeredCount} / {total} отвечено</span>
        {allAnswered && <button className="qnav-finish" onClick={onFinish}><IconText text={"Готово →"} /></button>}
      </div>
      <div className="qnav-ribbon" ref={ribbonRef}>
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            className={'qnav-dot' + (i === current ? ' current' : '') + (isAnswered(i) ? ' done' : '')}
            onClick={() => onJump(i)}
            aria-label={`Вопрос ${i + 1}${isAnswered(i) ? ', отвечен' : ''}`}
            aria-current={i === current ? 'true' : undefined}
          >{i + 1}</button>
        ))}
      </div>
    </div>
  )
}
