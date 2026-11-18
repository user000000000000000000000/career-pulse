import IconText from '../../../shared/ui/IconText.jsx'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import AuthLayout from '../../../shared/ui/AuthLayout.jsx'
import Card from '../../../shared/ui/Card.jsx'
import Input from '../../../shared/ui/Input.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { login as doLogin, requestPasswordReset } from '../../../shared/auth'
import SocialSignIn from '../../../shared/ui/SocialSignIn.jsx'
import { usePageMeta } from '../../../shared/lib/pageMeta'
import '../../../shared/ui/legal.css'
import { friendlyError } from '../../../shared/lib/errors'
import '../../../shared/ui/auth.css'
import { config } from '../../../shared/config'

export default function Login() {
  usePageMeta('Вход', 'Войдите в личный кабинет Пульс Карьеры, чтобы продолжить карьерную диагностику.')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  async function onForgot() {
    setError(''); setResetMsg('')
    if (!email.includes('@')) return setError('Введите email в поле выше, затем нажмите «Забыли пароль?»')
    try {
      setBusy(true)
      await requestPasswordReset(email)
      setResetMsg(config.demoMode ? 'Демонстрация: письмо не отправляется. Форму нового пароля можно открыть из панели «Демо · Все страницы».' : 'Письмо для сброса пароля отправлено на ' + email + '. Проверьте почту (и папку «Спам»).')
    } catch (err) {
      setError(friendlyError(err, 'Не удалось отправить письмо. Попробуйте позже.'))
    } finally {
      setBusy(false)
    }
  }

  async function onSubmit() {
    setError('')
    if (!email.includes('@')) return setError('Введите корректный email')
    if (password.length < 8) return setError('Пароль минимум 8 символов')
    try {
      setBusy(true)
      await doLogin({ email, password })
      navigate('/')
    } catch (err) {
      setError(friendlyError(err, 'Не удалось войти. Попробуйте позже.'))
      setBusy(false)
    }
  }

  return (
    <AuthLayout>
        <Card accent className="auth-card">
          <div className="auth-eyebrow">Вход</div>
          <h1 className="auth-title">С возвращением</h1>
          <p className="auth-sub">Войдите, чтобы продолжить карьерную диагностику.</p>

          {error && <div className="auth-error">{error}</div>}
          {resetMsg && <div className="auth-success">{resetMsg}</div>}

          <SocialSignIn />

          <Input
            id="login-email" label="Email" type="email" placeholder="ivan@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          <Input
            id="login-pass" label="Пароль" type="password" placeholder="Минимум 8 символов"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          <Button block onClick={onSubmit} disabled={busy}>
            <IconText text={busy ? 'Входим…' : 'Войти →'} />
          </Button>

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button type="button" className="auth-link-btn" onClick={onForgot} disabled={busy}>
              Забыли пароль?
            </button>
          </div>

          <div className="auth-foot">
            Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
          </div>
        </Card>
    </AuthLayout>
  )
}
