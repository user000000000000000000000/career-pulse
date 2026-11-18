import { useEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { useModal } from './ModalProvider.jsx'
import { submitFeedback } from '../api'
import { friendlyError } from '../lib/errors'
import { config } from '../config'
import './feedback-widget.css'

const CATEGORIES = [
  { value: 'bug', label: 'Ошибка', icon: 'bug' },
  { value: 'idea', label: 'Идея', icon: 'bulb' },
  { value: 'other', label: 'Другое', icon: 'message' },
]
const GREETINGS = [
  'Привет! Расскажи, что пошло не так. Я помогу передать твоё сообщение!',
  'Есть идея, как сделать сайт лучше? Расскажи мне — вместе придумаем больше!',
  'Что-то работает не так? Давай разберёмся. Опиши, что ты заметил.',
  'Я на связи! Поделись вопросом или идеей — твоё мнение помогает сайту расти.',
]

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [cat, setCat] = useState('bug')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [done, setDone] = useState(false)
  const [greeting, setGreeting] = useState(GREETINGS[0])
  const greetingIndex = useRef(Math.floor(Math.random() * GREETINGS.length))
  const closeTimer = useRef()
  const dialogRef = useRef(null)
  const messageRef = useRef(null)
  const pending = useRef(false)

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  function show() {
    clearTimeout(closeTimer.current)
    // An in-flight request keeps its state if the chat is closed and reopened.
    if (!pending.current) {
      setCat('bug'); setMessage(''); setEmail(''); setErr(''); setDone(false)
    }
    setGreeting(GREETINGS[greetingIndex.current++ % GREETINGS.length])
    setClosing(false)
    setOpen(true)
  }

  function close() {
    if (closing) return
    setClosing(true)
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 180
    // Keep the modal registered until its exit transition has finished.
    closeTimer.current = window.setTimeout(() => { setOpen(false); setClosing(false) }, delay)
  }

  useModal({ open, dialogRef, onClose: close })

  async function send(event) {
    event.preventDefault()
    if (pending.current) return
    setErr('')
    if (!message.trim()) {
      setErr('Опиши, что случилось, или поделись своей идеей.')
      messageRef.current?.focus()
      return
    }
    pending.current = true
    setBusy(true)
    try {
      await submitFeedback({ category: cat, message, email })
      setDone(true)
    } catch (error) {
      setErr(['QuotaExceededError', 'SecurityError'].includes(error?.name)
        ? 'Браузер не смог сохранить сообщение. Текст на месте — проверь доступ к хранилищу и попробуй ещё раз.'
        : friendlyError(error, 'Пока не получилось отправить сообщение. Текст на месте — попробуй ещё раз.'))
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return <>
    <button type="button" onClick={show} aria-label="Сообщить о проблеме" aria-haspopup="dialog" className="fb-fab">
      <Icon name="bug" size={20} /><span className="fb-btn-label">Сообщить о проблеме</span>
    </button>

    {open && <div className="feedback-overlay" data-state={closing ? 'closing' : 'open'} onClick={event => { if (event.target === event.currentTarget) close() }}>
      <section className="feedback-chat" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="feedback-title" aria-describedby="feedback-greeting" tabIndex={-1}>
        <div className="feedback-chat__mascot" aria-hidden="true">
          <Icon name="sparkles" className="feedback-chat__spark" size={19} />
          <img src={`${import.meta.env.BASE_URL}bird-helper-flying.webp`} alt="" width="580" height="435" />
        </div>
        <header className="feedback-chat__header">
          <span className="feedback-chat__eyebrow"><Icon name="message" size={15} /> Пульс Карьеры · на связи</span>
          <h2 id="feedback-title">Давай сделаем<br />сайт <span>лучше</span></h2>
          <button type="button" className="feedback-chat__close" aria-label="Закрыть окно обратной связи" onClick={close}><Icon name="close" size={21} /></button>
        </header>

        <div className="feedback-chat__body">
          <div className="feedback-chat__greeting">
            <span className="feedback-chat__sender">Птичка-помощник</span>
            <p id="feedback-greeting">{greeting}</p>
          </div>

          {done ? <div className="feedback-success">
            <div className="feedback-chat__sent">
              <span>Ты · {CATEGORIES.find(category => category.value === cat)?.label}</span>
              <p>{message.trim()}</p>
              <Icon name="check" size={17} />
            </div>
            <div className="feedback-success__reply" role="status">
              <span className="feedback-success__icon"><Icon name="check" size={24} /></span>
              <h3>{config.demoMode ? 'Спасибо, сообщение сохранено!' : 'Спасибо, сообщение получено!'}</h3>
              <p>{config.demoMode ? 'Демонстрация: сообщение сохранено в этом браузере и доступно в админ-панели.' : 'Мы получили твоё сообщение. Оно поможет сделать Пульс Карьеры лучше.'}</p>
            </div>
            <button type="button" className="feedback-chat__submit" onClick={close}>Закрыть <Icon name="check" size={19} /></button>
          </div> : <form className="feedback-chat__form" onSubmit={send} aria-busy={busy}>
            <fieldset className="feedback-chat__categories" disabled={busy}>
              <legend>О чём расскажем?</legend>
              <div>{CATEGORIES.map(category => <button key={category.value} type="button" data-category={category.value} aria-pressed={cat === category.value} onClick={() => setCat(category.value)}>
                <Icon name={category.icon} size={17} />{category.label}
              </button>)}</div>
            </fieldset>

            <div className="feedback-chat__composer">
              <label htmlFor="feedback-message">Твоё сообщение</label>
              <textarea ref={messageRef} id="feedback-message" value={message} onChange={event => { setMessage(event.target.value); if (err) setErr('') }} rows={3} maxLength={4000} placeholder="Что случилось? Что делали перед этим?" aria-required="true" aria-invalid={err && !message.trim() ? true : undefined} aria-describedby={err ? 'feedback-error' : undefined} disabled={busy} />
            </div>
            <div className="feedback-chat__email">
              <label htmlFor="feedback-email">Email для ответа <span>· необязательно</span></label>
              <div><Icon name="mail" size={18} /><input id="feedback-email" value={email} onChange={event => setEmail(event.target.value)} type="email" autoComplete="email" placeholder="you@example.com" disabled={busy} /></div>
            </div>
            {err && <div id="feedback-error" className="feedback-chat__error" role="alert"><Icon name="message" size={18} /><span>{err}</span></div>}
            <button className="feedback-chat__submit" type="submit" disabled={busy}>
              {busy ? <><span className="feedback-chat__spinner" aria-hidden="true" />Отправляем…</> : <>Отправить <Icon name="send" size={19} /></>}
            </button>
            <p className="feedback-chat__note"><Icon name="lock" size={13} />{config.demoMode ? 'В демоверсии сохраним в этом браузере.' : 'Это сообщение увидит команда сайта.'}</p>
          </form>}
        </div>
      </section>
    </div>}
  </>
}
