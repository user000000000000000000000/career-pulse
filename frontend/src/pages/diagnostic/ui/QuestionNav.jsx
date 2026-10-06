// Навигатор по вопросам блока с быстрыми ответами (личность, Holland, готовность…).
// Кнопка «Назад», прокручиваемая лента номеров 1..N (ткнуть — перейти к любому вопросу
// и поправить ответ) и «Готово», когда отвечены все. Отвеченные точки — залиты,
// текущая — в рамке, пропущенные — приглушены.
export default function QuestionNav({ total, current, isAnswered, onJump, onBack, onFinish }) {
  let answeredCount = 0
  for (let i = 0; i < total; i++) if (isAnswered(i)) answeredCount++
  const allAnswered = answeredCount === total

  return (
    <div className="qnav print-hide">
      <div className="qnav-top">
        <button className="qnav-back" onClick={onBack} disabled={current === 0}>← Назад</button>
        <span className="qnav-progress">{answeredCount} / {total} отвечено</span>
        {allAnswered && <button className="qnav-finish" onClick={onFinish}>Готово →</button>}
      </div>
      <div className="qnav-ribbon">
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
