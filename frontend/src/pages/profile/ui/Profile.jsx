import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../../../shared/ui/Header.jsx'
import Card from '../../../shared/ui/Card.jsx'
import Input from '../../../shared/ui/Input.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { getCurrentUser, logout as doLogout } from '../../../shared/auth'
import { supabase, isSupabaseConfigured } from '../../../shared/api'
import { CP } from '../../../shared/api'
import { STORAGE_KEYS } from '../../../shared/lib/storageKeys'
import { config } from '../../../shared/config'
import { confirmDialog, alertDialog } from '../../../shared/ui/Dialog.jsx'
import '../../../shared/ui/legal.css'
import '../../../shared/ui/auth.css'
import '../profile.css'

const ROLES = [
  { value: 'student',       label: '🎓 Школьник / Студент' },
  { value: 'parent',        label: '👪 Родитель школьника' },
  { value: 'specialist',    label: '💼 Специалист / Взрослый' },
  { value: 'entrepreneur',  label: '🚀 Предприниматель' },
  { value: 'hr',            label: '🏢 HR / Компания' },
]

export default function Profile() {
  const navigate = useNavigate()
  const fileRef = useRef(null)

  const [user, setUser]       = useState(null)
  const [form, setForm]       = useState({ full_name: '', email: '', phone: '', role: 'specialist' })
  const [avatar, setAvatar]   = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg]         = useState('')
  const [error, setError]     = useState('')

  useEffect(() => {
    getCurrentUser().then(u => {
      if (!u) { navigate('/login'); return }
      setUser(u)
      setForm({ full_name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role || 'specialist' })
      if (u.avatar_url) setPreview(u.avatar_url)
    })
  }, [navigate])

  const upd = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Маска телефона как на лендинге: +7 (XXX) XXX-XX-XX
  function fmtPhone(v) {
    let d = (v || '').replace(/\D/g, '')
    if (d.startsWith('7') || d.startsWith('8')) d = d.slice(1)
    let f = '+7 '
    if (d.length > 0) f += '(' + d.slice(0, 3)
    if (d.length >= 3) f += ') ' + d.slice(3, 6)
    if (d.length >= 6) f += '-' + d.slice(6, 8)
    if (d.length >= 8) f += '-' + d.slice(8, 10)
    return f
  }
  const onPhone = (e) => setForm(f => ({ ...f, phone: fmtPhone(e.target.value) }))
  const fileToDataUrl = (file) => new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file) })

  function onFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setError('Файл не должен превышать 5 МБ'); return }
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  async function uploadAvatar(userId) {
    if (!avatar || !isSupabaseConfigured) return null
    setUploading(true)
    const ext  = avatar.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatar, { upsert: true })
    setUploading(false)
    if (upErr) { setError('Ошибка загрузки фото: ' + upErr.message); return null }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return data.publicUrl
  }

  async function onDelete() {
    const ok = await confirmDialog({
      title: 'Удалить аккаунт?',
      message: 'Все твои персональные данные и результаты диагностики будут удалены без возможности восстановления. Продолжить?',
      confirmText: 'Удалить', cancelText: 'Отмена', danger: true,
    })
    if (!ok) return
    try {
      if (isSupabaseConfigured && user?.id) {
        // полное удаление учётной записи — серверной функцией (если развёрнута)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          await fetch(`${config.supabaseUrl}/functions/v1/delete-account`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${session?.access_token}`, apikey: config.supabaseAnonKey },
          })
        } catch { /* функции может не быть — ниже всё равно обезличим */ }
        // на всякий случай обезличиваем профиль и чистим результаты
        try {
          await supabase.from('profiles')
            .update({ full_name: '', phone: '', avatar_url: '', diagnostic_data: null })
            .eq('id', user.id)
        } catch { /* ignore */ }
      }
      await CP.clearAll()
    } finally {
      try { await doLogout() } catch { /* ignore */ }
      await alertDialog({ title: 'Готово', message: 'Твои данные удалены. Аккаунт деактивирован.' })
      navigate('/')
    }
  }

  async function onSave() {
    setError(''); setMsg('')
    if (!form.full_name.trim()) { setError('Введите имя'); return }

    setSaving(true)
    try {
      let avatar_url = preview

      if (avatar) {
        if (isSupabaseConfigured) {
          const url = await uploadAvatar(user.id)
          if (url) avatar_url = url
        } else {
          // демо-режим: храним фото как data-URL, чтобы оно сохранялось и показывалось
          avatar_url = await fileToDataUrl(avatar)
        }
      }

      if (isSupabaseConfigured) {
        const { error: uErr } = await supabase
          .from('profiles')
          .update({ full_name: form.full_name, phone: form.phone, role: form.role, avatar_url })
          .eq('id', user.id)
        if (uErr) throw new Error(uErr.message)
      } else {
        // демо-режим: сохраняем в localStorage
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || '{}')
        const payload = { ...stored, name: form.full_name, phone: form.phone, role: form.role, avatar_url }
        try {
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(payload))
        } catch (quotaErr) {
          // Фото слишком большое для localStorage — сохраняем профиль без него
          console.warn('[Profile] localStorage quota, сохраняем без фото', quotaErr)
          localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...payload, avatar_url: stored.avatar_url || '' }))
          setError('Фото слишком большое для демо-режима — профиль сохранён без него. Подключите Supabase для хранения фото.')
        }
      }

      setMsg('Профиль сохранён ✓')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  const initials = form.full_name
    ? form.full_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??'

  return (
    <div className="cp-legal">
      <Header backTo="/dashboard" backLabel="← В кабинет" reserveRight />
      <div className="auth-wrap" style={{ paddingTop: 40 }}>
        <Card accent className="profile-card">
          <div className="auth-eyebrow">Личный кабинет</div>
          <h1 className="auth-title" style={{ fontSize: 'clamp(28px,5vw,42px)', marginBottom: 28 }}>МОЙ ПРОФИЛЬ</h1>

          {/* ── Аватар ── */}
          <div className="profile-avatar-wrap">
            <div
              className="profile-avatar"
              onClick={() => fileRef.current?.click()}
              title="Нажмите, чтобы сменить фото"
            >
              {preview
                ? <img src={preview} alt="avatar" />
                : <span>{initials}</span>
              }
              <div className="profile-avatar-overlay">
                {uploading ? '⏳' : '📷'}
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={onFileChange} />
            <div className="profile-avatar-hint">JPG / PNG / WEBP · до 5 МБ</div>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {msg   && <div className="auth-success">{msg}</div>}

          {/* ── Роль ── */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--sub)', marginBottom: 10 }}>Кто вы?</div>
            <div className="auth-roles">
              {ROLES.map(r => (
                <div
                  key={r.value}
                  className={['auth-role', form.role === r.value && 'auth-role--active'].filter(Boolean).join(' ')}
                  onClick={() => setForm(f => ({ ...f, role: r.value }))}
                >
                  {r.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Поля ── */}
          <Input
            id="p-name" label="ФИО (Фамилия Имя Отчество)"
            placeholder="Иванов Иван Иванович"
            value={form.full_name} onChange={upd('full_name')}
          />
          <Input
            id="p-email" label="Email" type="email"
            placeholder="ivan@email.com"
            value={form.email}
            onChange={upd('email')}
            disabled
            hint="Email изменить нельзя"
          />
          <Input
            id="p-phone" label="Телефон" type="tel"
            placeholder="+7 (___) ___-__-__"
            value={form.phone} onChange={onPhone}
          />

          <Button block onClick={onSave} disabled={saving || uploading} style={{ marginTop: 8 }}>
            {saving ? 'Сохраняем…' : 'Сохранить профиль'}
          </Button>

          <div className="auth-foot" style={{ marginTop: 20 }}>
            <Link to="/dashboard">← Вернуться в кабинет</Link>
          </div>

          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid var(--line)' }}>
            <button type="button" className="auth-link-btn" style={{ color: 'var(--danger)' }} onClick={onDelete}>
              Удалить мои данные и аккаунт
            </button>
            <div className="input-hint" style={{ marginTop: 4 }}>
              Право на удаление персональных данных (ст. 14 152-ФЗ). Действие необратимо.
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
