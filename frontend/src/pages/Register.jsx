import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Layout/Header.jsx'
import Card from '../components/UI/Card.jsx'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import { register as doRegister, resendConfirmation } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'
import '../styles/legal.css'
import '../styles/auth.css'

const ROLES = [
  { value: 'parent', label: '👪 Родитель школьника' },
  { value: 'student', label: '🎓 Школьник / Студент' },
  { value: 'specialist', label: '💼 Специалист / Взрослый' },
  { value: 'entrepreneur', label: '🚀 Предприниматель' },
  { value: 'hr', label: '🏢 HR / Компания' }
]

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'parent' })
  const [agree, setAgree]         = useState(false)
  const [adult, setAdult]         = useState(false)
  const [parent, setParent]       = useState({ name: '', email: '' })
  const [error, setError]         = useState('')
  const [busy, setBusy]           = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [resendMsg, setResendMsg] = useState('')

  async function onResend() {
    setResendMsg('')
    try {
      await resendConfirmation(form.email)
      setResendMsg('Письмо отправлено повторно на ' + form.email + '. Проверьте почту и «Спам».')
    } catch (err) {
      setResendMsg(err.message || 'Не удалось отправить письмо повторно (возможно, лимит — подождите немного).')
    }
  }

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function onSubmit() {
    setError('')
    if (!form.name.trim()) return setError('Введите имя')
    if (!form.email.includes('@')) return setError('Введите корректный email')
    if (form.password.length < 8) return setError('Пароль минимум 8 символов')
    if (!adult && (!parent.name.trim() || !parent.email.includes('@'))) {
      return setError('Если тебе меньше 18 — укажи ФИО и email родителя/представителя')
    }
    if (!agree) return setError('Примите условия использования')
    try {
      setBusy(true)
      const { user } = await doRegister({
        ...form,
        isMinor: !adult,
        parentName: adult ? '' : parent.name.trim(),
        parentEmail: adult ? '' : parent.email.trim(),
      })
      // Supabase требует подтверждения email — у сессии не будет токена сразу.
      // В демо-режиме (без Supabase) подтверждать нечего — сразу на лендинг.
      if (isSupabaseConfigured && user && !user.confirmed_at && !user.email_confirmed_at) {
        setConfirmed(true)
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Не удалось зарегистрироваться')
      setBusy(false)
    }
  }

  if (confirmed) return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="auth-wrap">
        <Card accent className="auth-card">
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <div className="auth-eyebrow">Почти готово</div>
            <h1 className="auth-title" style={{ fontSize: 'clamp(28px,5vw,40px)' }}>ПОДТВЕРДИТЕ EMAIL</h1>
            <p className="auth-sub">
              Мы отправили письмо на <strong>{form.email}</strong>.<br />
              Перейдите по ссылке в письме, чтобы активировать аккаунт.
            </p>
            {resendMsg && <div className="auth-success" style={{ marginTop: 18 }}>{resendMsg}</div>}
            <div style={{ marginTop: 24 }}>
              <Button block onClick={() => navigate('/login')}>Перейти ко входу →</Button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button type="button" className="auth-link-btn" onClick={onResend}>
                Не пришло письмо? Отправить ещё раз
              </button>
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

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--sub)', margin: '6px 0 4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
            <span>Мне есть 18 лет</span>
          </label>
          {!adult && (
            <div style={{ background: 'var(--card2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.5, marginBottom: 10 }}>
                Тебе меньше 18 — по закону (ст. 26 ГК РФ) нужно согласие родителя или законного представителя. Укажи его данные:
              </div>
              <Input id="reg-parent-name" label="ФИО родителя / представителя" placeholder="Иванов Иван Иванович" value={parent.name} onChange={(e) => setParent({ ...parent, name: e.target.value })} />
              <Input id="reg-parent-email" label="Email родителя" type="email" placeholder="parent@email.com" value={parent.email} onChange={(e) => setParent({ ...parent, email: e.target.value })} />
            </div>
          )}

          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--sub)', margin: '10px 0 18px', cursor: 'pointer' }}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
            <span>
              Я принимаю <Link to="/legal/terms" style={{ color: 'var(--accent)' }}>Условия</Link> и{' '}
              <Link to="/legal/privacy" style={{ color: 'var(--accent)' }}>Политику конфиденциальности</Link>,{' '}
              а также даю <Link to="/legal/consent" style={{ color: 'var(--accent)' }}>согласие на обработку персональных данных</Link>
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
