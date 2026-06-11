import { forwardRef } from 'react'
import '../../styles/ui.css'

/** Поле ввода с подписью и ошибкой. */
const Input = forwardRef(function Input(
  { label, error, className = '', id, ...rest }, ref
) {
  return (
    <div className="cp-field">
      {label && <label htmlFor={id}>{label}</label>}
      <input
        id={id}
        ref={ref}
        className={['cp-input', error && 'cp-input--error', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {error && <span className="cp-field__error">{error}</span>}
    </div>
  )
})
export default Input
