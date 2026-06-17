import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Layout/Header.jsx'
import Card from '../components/UI/Card.jsx'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import { login as doLogin, requestPasswordReset } from '../services/auth'
import '../styles/legal.css'
import '../styles/auth.css'

export default function Login() {
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
      setResetMsg('Письмо для сброса пароля отправлено на ' + email + '. Проверьте почту (и папку «Спам»).')
    } catch (err) {
      setError(err.message || 'Не удалось отправить письмо')
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
      setError(err.message || 'Не удалось войти')
      setBusy(false)
    }
  }

  return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="auth-wrap">
        <Card accent className="auth-card">
          <div className="auth-eyebrow">Вход</div>
          <h1 className="auth-title">С ВОЗВРАЩЕНИЕМ</h1>
          <p className="auth-sub">Войдите, чтобы продолжить карьерную диагностику.</p>

          {error && <div className="auth-error">{error}</div>}
          {resetMsg && <div className="auth-success">{resetMsg}</div>}

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
            {busy ? 'Входим…' : 'Войти →'}
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
      </div>
    </div>
  )
}
