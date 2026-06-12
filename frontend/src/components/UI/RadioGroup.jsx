import '../../styles/ui.css'

/**
 * Группа одиночного выбора.
 * options: [{ text }], value: индекс выбранного, onChange(index).
 */
export default function RadioGroup({ options = [], value, onChange, name }) {
  return (
    <div className="cp-radio-group" role="radiogroup">
      {options.map((opt, i) => {
        const active = value === i
        return (
          <label
            key={i}
            className={['cp-radio', active && 'cp-radio--active'].filter(Boolean).join(' ')}
          >
            <input
              type="radio"
              name={name}
              checked={active}
              onChange={() => onChange(i)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
            />
            <span className="cp-radio__dot" aria-hidden="true" />
            <span className="cp-radio__text">{opt.text}</span>
          </label>
        )
      })}
    </div>
  )
}
