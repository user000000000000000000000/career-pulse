import { useState } from 'react'
import { submitFeedback } from '../api'
import { friendlyError } from '../lib/errors'

// Плавающая кнопка «Сообщить о проблеме» + окно с формой. Рендерится глобально.
const CATS = [
  ['bug', '🐞 Ошибка'],
  ['idea', '💡 Идея / пожелание'],
  ['other', '💬 Другое'],
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [cat, setCat] = useState('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)

  function reset() { setCat('bug'); setMessage(''); setEmail(''); setErr(''); setDone(false) }
  function close() { setOpen(false); setTimeout(reset, 200) }

  async function send() {
    setErr('')
    if (!message.trim()) return setErr('Опишите, что случилось')
    try {
      setBusy(true)
      await submitFeedback({ category: cat, message, email })
      setDone(true)
    } catch (e) { setErr(friendlyError(e)) }
    finally { setBusy(false) }
  }

  const field = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit' }

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Сообщить о проблеме" className="fb-fab"
        style={{ position: 'fixed', left: 16, bottom: 16, zIndex: 400, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 24, background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--line2)', boxShadow: '0 6px 20px rgba(0,0,0,.18)', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>
        <span style={{ fontSize: 15 }}>🐞</span><span className="fb-btn-label">Сообщить о проблеме</span>
      </button>

      {open && (
        <div onClick={close} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"
            style={{ width: '100%', maxWidth: 420, background: 'var(--card)', border: '1px solid var(--line2)', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,.5)', padding: 22, fontFamily: "'Golos Text',sans-serif" }}>
            {done ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>Спасибо!</div>
                <div style={{ fontSize: 13.5, color: 'var(--sub)', marginBottom: 18 }}>Сообщение получено — мы разберёмся.</div>
                <button className="btn btn-accent" onClick={close}>Закрыть</button>
              </div>
            ) : (
              <>
                <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Сообщить о проблеме</div>
                <div style={{ fontSize: 12.5, color: 'var(--sub)', marginBottom: 16 }}>Нашли баг или есть идея? Напишите — это помогает.</div>

                {err && <div style={{ fontSize: 12.5, color: 'var(--danger)', marginBottom: 10 }}>{err}</div>}

                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {CATS.map(([v, l]) => (
                    <button key={v} onClick={() => setCat(v)} type="button"
                      style={{ padding: '7px 12px', borderRadius: 20, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: '1px solid ' + (cat === v ? 'var(--accent)' : 'var(--line2)'), background: cat === v ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'transparent', color: cat === v ? 'var(--accent)' : 'var(--sub)' }}>{l}</button>
                  ))}
                </div>

                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                  placeholder="Что случилось? Что делали перед этим?" style={{ ...field, resize: 'vertical', marginBottom: 10 }} />
                <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                  placeholder="Email для ответа (необязательно)" style={{ ...field, marginBottom: 16 }} />

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={close} disabled={busy}>Отмена</button>
                  <button className="btn btn-accent" onClick={send} disabled={busy}>{busy ? 'Отправляю…' : 'Отправить'}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
