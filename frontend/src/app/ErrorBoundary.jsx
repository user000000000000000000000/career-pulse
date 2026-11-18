import IconText from '../shared/ui/IconText.jsx'
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
    console.error('[Пульс Карьеры] UI error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    const btn = {
      padding: '12px 24px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: 14,
      fontFamily: 'var(--font-body)', cursor: 'pointer', border: 'none',
    }
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16,
        background: 'var(--brand-page)', color: 'var(--brand-ink)', fontFamily: 'var(--font-body)',
        padding: 24, textAlign: 'center',
      }}>
        <div style={{ fontSize: 52 }}><IconText text={"😵"} /></div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, lineHeight: 1.4 }}>Что-то сломалось</div>
        <div style={{ fontSize: 14, color: 'var(--brand-copy)', maxWidth: 420, lineHeight: 1.6 }}>
          Произошла ошибка на странице. Твои данные сохранены — попробуй обновить или вернуться на главную.
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          <button style={{ ...btn, background: 'var(--brand-blue)', color: '#fff' }}
            onClick={() => { window.location.href = import.meta.env.BASE_URL }}>
            На главную
          </button>
          <button style={{ ...btn, background: 'transparent', color: 'var(--brand-copy)', border: '1px solid var(--brand-border)' }}
            onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }
}
