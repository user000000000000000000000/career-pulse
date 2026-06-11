import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Layout/Header.jsx'
import Card from '../components/UI/Card.jsx'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import { register as doRegister } from '../services/auth'
import '../styles/legal.css'
import '../styles/auth.css'

const ROLES = [
  { value: 'student', label: '🎓 Выпускник' },
  { value: 'specialist', label: '💼 Специалист' },
  { value: 'entrepreneur', label: '🚀 Предприниматель' },
  { value: 'hr', label: '🏢 HR / Компания' }
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSubmit() {
    setError('')
    if (!form.name.trim()) return setError('Введите имя')
    if (!form.email.includes('@')) return setError('Введите корректный email')
    if (form.password.length < 8) return setError('Пароль минимум 8 символов')
    if (!agree) return setError('Примите условия использования')
    try {
      setBusy(true)
      await doRegister(form)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Не удалось зарегистрироваться')
      setBusy(false)
    }
  }

  return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="auth-wrap">
        <Card accent className="auth-card">
          <div className="auth-eyebrow">Регистрация</div>
          <h1 className="auth-title">НАЙДИ СВОЙ ПУТЬ</h1>
          <p className="auth-sub">Создайте аккаунт и пройдите диагностику из 250 вопросов.</p>

          {error && <div className="auth-error">{error}</div>}

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sub)', marginBottom: 10 }}>Кто вы?</div>
          <div className="auth-roles">
            {ROLES.map((r) => (
              <div
                key={r.value}
                className={['auth-role', form.role === r.value && 'auth-role--active'].filter(Boolean).join(' ')}
                onClick={() => setForm({ ...form, role: r.value })}
              >
                {r.label}
              </div>
            ))}
          </div>

          <Input id="reg-name" label="Имя" placeholder="Иван Иванов" value={form.name} onChange={upd('name')} />
          <Input id="reg-email" label="Email" type="email" placeholder="ivan@email.com" value={form.email} onChange={upd('email')} />
          <Input id="reg-pass" label="Пароль" type="password" placeholder="Минимум 8 символов" value={form.password} onChange={upd('password')} />

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--sub)', margin: '4px 0 18px', cursor: 'pointer' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              Я принимаю <Link to="/legal/terms" style={{ color: 'var(--accent)' }}>Условия</Link> и{' '}
              <Link to="/legal/privacy" style={{ color: 'var(--accent)' }}>Политику конфиденциальности</Link>
            </span>
          </label>

          <Button block onClick={onSubmit} disabled={busy}>
            {busy ? 'Создаём…' : 'Начать диагностику →'}
          </Button>

          <div className="auth-foot">
            Уже есть аккаунт? <Link to="/login">Войти</Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
