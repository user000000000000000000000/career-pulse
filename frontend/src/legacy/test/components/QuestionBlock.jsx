import Card from '../../../shared/ui/Card.jsx'
import '../test.css'

export default function QuestionBlock({ question, index, total, value, onAnswer }) {
  if (!question) return null
  const { id, type, text, options } = question

  return (
    <Card accent className="q-card">
      <div className="q-eyebrow">Вопрос {index + 1} из {total}</div>
      <div className="q-text">{text}</div>

      {/* ── Открытый вопрос ── */}
      {type === 'open' && (
        <textarea
          className="q-open"
          placeholder="Напиши здесь свой ответ…"
          value={value || ''}
          rows={5}
          onChange={(e) => onAnswer(id, e.target.value)}
        />
      )}

      {/* ── Шкала 1–5 ── */}
      {type === 'scale' && (
        <div className="q-scale">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={['q-scale-btn', value === i && 'q-scale-btn--active'].filter(Boolean).join(' ')}
              onClick={() => onAnswer(id, i)}
            >
              <span className="q-scale-num">{i + 1}</span>
              {opt.text && <span className="q-scale-label">{opt.text.replace(/^\d+ ?[—–-] ?/, '')}</span>}
            </button>
          ))}
        </div>
      )}

      {/* ── Пара А / Б ── */}
      {type === 'pair' && (
        <div className="q-pair">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              className={['q-pair-btn', value === i && 'q-pair-btn--active'].filter(Boolean).join(' ')}
              onClick={() => onAnswer(id, i)}
            >
              <span className="q-pair-letter">{String.fromCharCode(65 + i)}</span>
              <span className="q-pair-text">{opt.text.replace(/^[АBА-Яа-я] ?[—–-] ?/, '')}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Мультивыбор ── */}
      {type === 'multi' && (
        <div className="q-multi">
          {options.map((opt, i) => {
            const selected = Array.isArray(value) ? value.includes(i) : false
            const toggle = () => {
              const cur = Array.isArray(value) ? value : []
              const next = selected ? cur.filter((x) => x !== i) : [...cur, i]
              onAnswer(id, next)
            }
            return (
              <button
                key={i}
                type="button"
                className={['q-multi-btn', selected && 'q-multi-btn--active'].filter(Boolean).join(' ')}
                onClick={toggle}
              >
                <span className="q-multi-check">{selected ? '✓' : ''}</span>
                <span className="q-multi-text">{opt.text}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Одиночный выбор (single) ── */}
      {type === 'single' && (
        <div className="cp-radio-group">
          {options.map((opt, i) => {
            const active = value === i
            return (
              <label
                key={i}
                className={['cp-radio', active && 'cp-radio--active'].filter(Boolean).join(' ')}
              >
                <input
                  type="radio"
                  name={id}
                  checked={active}
                  onChange={() => onAnswer(id, i)}
                  style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                />
                <span className="cp-radio__dot" aria-hidden="true" />
                <span className="cp-radio__text">{opt.text}</span>
              </label>
            )
          })}
        </div>
      )}
    </Card>
  )
}
