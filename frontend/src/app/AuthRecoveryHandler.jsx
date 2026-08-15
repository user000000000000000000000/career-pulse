import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../shared/api'

// Когда пользователь переходит по ссылке восстановления пароля из письма,
// Supabase разбирает токен из URL и шлёт событие PASSWORD_RECOVERY — ведём
// его на страницу установки нового пароля.
export default function AuthRecoveryHandler() {
  const navigate = useNavigate()
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/reset-password')
    })
    return () => data?.subscription?.unsubscribe()
  }, [navigate])
  return null
}
