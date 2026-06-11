import '../../styles/ui.css'

export default function Card({ children, accent = false, className = '', ...rest }) {
  return (
    <div className={['cp-card', accent && 'cp-card--accent', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}
