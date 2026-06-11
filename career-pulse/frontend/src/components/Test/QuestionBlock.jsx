import Card from '../UI/Card.jsx'
import RadioGroup from '../UI/RadioGroup.jsx'
import '../../styles/test.css'

/** Один вопрос с вариантами ответа. */
export default function QuestionBlock({ question, index, total, value, onAnswer }) {
  if (!question) return null
  return (
    <Card accent className="q-card">
      <div className="q-eyebrow">Вопрос {index + 1} из {total}</div>
      <div className="q-text">{question.text}</div>
      <RadioGroup
        name={question.id}
        options={question.options}
        value={value}
        onChange={(i) => onAnswer(question.id, i)}
      />
    </Card>
  )
}
