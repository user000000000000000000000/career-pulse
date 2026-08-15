import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../../../shared/ui/Header.jsx'
import Card from '../../../shared/ui/Card.jsx'
import Input from '../../../shared/ui/Input.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { supabase } from '../../../shared/api'
import '../../../shared/ui/legal.css'
import '../../../shared/ui/auth.css'

// Вход через VK не проходит через Register.jsx, поэтому возрастной гейт
// (ст. 26 ГК РФ) и согласие на обработку ПД (152-ФЗ) фиксируем здесь —
// разово, сразу после первого входа через VK, перед допуском в кабинет.
export default function VkConsent() {
  const navigate = useNavigate()
  const [adult, setAdult] = useState(false)
  const [parent, setParent] = useState({ name: '', email: '' })
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    setError('')
    if (!adult && (!parent.name.trim() || !parent.email.includes('@'))) {
      return setError('Если тебе меньше 18 — укажи ФИО и email родителя/представителя')
    }
    if (!agree) return setError('Примите условия использования')
    try {
      setBusy(true)
      const consent = {
        consent_at: new Date().toISOString(),
        consent_version: '2026-06-01',
        is_minor: !adult,
        parent_name: adult ? '' : parent.name.trim(),
        parent_email: adult ? '' : parent.email.trim(),
      }
      const { error: err } = await supabase.auth.updateUser({ data: consent })
      if (err) throw err
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Не удалось сохранить согласие')
      setBusy(false)
    }
  }

  return (
    <div className="cp-legal">
      <Header backTo="/" backLabel="← На главную" />
      <div className="auth-wrap">
        <Card accent className="auth-card">
          <div className="auth-eyebrow">Ещё один шаг</div>
          <h1 className="auth-title">ПОДТВЕРДИ ДАННЫЕ</h1>
          <p className="auth-sub">Ты вошёл(ла) через ВКонтакте — перед началом нужно подтвердить возраст и согласие на обработку данных, как и при обычной регистрации.</p>

          {error && <div className="auth-error">{error}</div>}

          <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, color: 'var(--sub)', margin: '6px 0 4px', cursor: 'pointer' }}>
            <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} />
            <span>Мне есть 18 лет</span>
          </label>
          {!adult && (
            <div style={{ background: 'var(--card2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px', marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: 'var(--sub)', lineHeight: 1.5, marginBottom: 10 }}>
                Тебе меньше 18 — по закону (ст. 26 ГК РФ) нужно согласие родителя или законного представителя. Укажи его данные:
              </div>
              <Input id="vk-parent-name" label="ФИО родителя / представителя" placeholder="Иванов Иван Иванович" value={parent.name} onChange={(e) => setParent({ ...parent, name: e.target.value })} />
              <Input id="vk-parent-email" label="Email родителя" type="email" placeholder="parent@email.com" value={parent.email} onChange={(e) => setParent({ ...parent, email: e.target.value })} />
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
            {busy ? 'Сохраняем…' : 'Продолжить →'}
          </Button>
        </Card>
      </div>
    </div>
  )
}
