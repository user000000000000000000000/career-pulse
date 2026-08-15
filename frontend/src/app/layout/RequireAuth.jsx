import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { getCurrentUser } from '../../shared/auth'
import { CP } from '../../shared/api'

/** Защищает маршрут: пускает только авторизованных. */
export default function RequireAuth({ children }) {
  const [state, setState] = useState({ loading: true, user: null })

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const user = await getCurrentUser()
        // Подтягиваем результаты диагностики из базы (если на сервере свежее),
        // чтобы они были доступны с любого устройства.
        if (user) { try { await CP.hydrateFromRemote() } catch { /* не критично */ } }
        if (alive) setState({ loading: false, user })
      } catch {
        if (alive) setState({ loading: false, user: null })
      }
    })()
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
