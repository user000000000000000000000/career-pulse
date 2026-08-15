import React from 'react'

/** Ловит ошибки рендера, чтобы вместо белого экрана показать понятный экран. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[CareerPulse] UI error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    const btn = {
      padding: '12px 24px', borderRadius: 8, fontWeight: 700, fontSize: 14,
      fontFamily: "'Manrope', sans-serif", cursor: 'pointer', border: 'none',
    }
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: '#25205c', color: '#25205c', fontFamily: "'Manrope', sans-serif",
        padding: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 52 }}>😵</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Что-то сломалось</div>
        <div style={{ fontSize: 14, color: '#626185', maxWidth: 420, lineHeight: 1.6 }}>
          Произошла ошибка на странице. Твои данные сохранены — попробуй обновить или вернуться на главную.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          <button style={{ ...btn, background: '#5f96e9', color: '#25205c' }}
            onClick={() => { window.location.href = import.meta.env.BASE_URL }}>
            На главную
          </button>
          <button style={{ ...btn, background: 'transparent', color: '#626185', border: '1px solid rgba(37,32,92,0.13)' }}
            onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }
}
