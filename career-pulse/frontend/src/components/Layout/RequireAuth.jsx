import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../../services/auth'

/** Защищает маршрут: пускает только авторизованных. */
export default function RequireAuth({ children }) {
  const [state, setState] = useState({ loading: true, user: null })

  useEffect(() => {
    let alive = true
    getCurrentUser()
      .then(user => { if (alive) setState({ loading: false, user }) })
      .catch(() => { if (alive) setState({ loading: false, user: null }) })
    return () => { alive = false }
  }, [])

  if (state.loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: 'var(--ghost)', fontFamily: "'JetBrains Mono', monospace",
        fontSize: 13, letterSpacing: 2
      }}>
        ЗАГРУЗКА…
      </div>
    )
  }

  if (!state.user) return <Navigate to="/login" replace />
  return children
}
