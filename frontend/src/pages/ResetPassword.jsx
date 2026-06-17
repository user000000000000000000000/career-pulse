import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header.jsx'
import Card from '../components/UI/Card.jsx'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import { updatePassword } from '../services/auth'
import '../styles/legal.css'
import '../styles/auth.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function onSubmit() {
    setError('')
    if (password.length < 8) return setError('Пароль минимум 8 символов')
    if (password !== confirm) return setError('Пароли не совпадают')
    try {
      setBusy(true)
      await updatePassword(password)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Не удалось обновить пароль. Возможно, ссылка устарела — запросите новую.')
      setBusy(false)
    }
  }

  if (done) return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="auth-wrap">
        <Card accent className="auth-card">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div className="auth-eyebrow">Готово</div>
            <h1 className="auth-title" style={{ fontSize: 'clamp(28px,5vw,40px)' }}>ПАРОЛЬ ОБНОВЛЁН</h1>
            <p className="auth-sub">Теперь можно войти с новым паролем.</p>
            <div style={{ marginTop: 24 }}>
              <Button block onClick={() => navigate('/login')}>Перейти ко входу →</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="auth-wrap">
        <Card accent className="auth-card">
          <div className="auth-eyebrow">Восстановление</div>
          <h1 className="auth-title">НОВЫЙ ПАРОЛЬ</h1>
          <p className="auth-sub">Придумайте новый пароль для входа.</p>

          {error && <div className="auth-error">{error}</div>}

          <Input
            id="rp-pass" label="Новый пароль" type="password" placeholder="Минимум 8 символов"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          <Input
            id="rp-confirm" label="Повторите пароль" type="password" placeholder="Ещё раз"
            value={confirm} onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          <Button block onClick={onSubmit} disabled={busy}>
            {busy ? 'Сохраняем…' : 'Сохранить пароль'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
