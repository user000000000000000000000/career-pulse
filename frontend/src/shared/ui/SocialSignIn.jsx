import { useState } from 'react'
import { startVkLogin } from '../auth'
import { config } from '../config'
import SocialIcon from './SocialIcon.jsx'
import './social-sign-in.css'

const PROVIDERS = [
  { id: 'vk', name: 'VK ID', label: 'Войти через VK ID' },
  { id: 'max', name: 'MAX', label: 'Войти через MAX' },
  { id: 'esia', name: 'Госуслуги', label: 'Войти через Госуслуги' },
  { id: 'yandex', name: 'Яндекс ID', label: 'Войти через Яндекс ID' },
]

function ProviderMark({ provider }) {
  if (provider === 'vk') return <SocialIcon name="vk" size={32} />
  return <span className={`social-sign-in__mark social-sign-in__mark--${provider}`} aria-hidden="true">{provider === 'max' ? 'M' : provider === 'esia' ? <><i>гос</i><b>услуги</b></> : 'Я'}</span>
}

export default function SocialSignIn({ registration = false }) {
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const vkConfigured = !!config.vkAppId && !config.demoMode
  async function onVk() {
    setMessage('')
    if (config.demoMode) {
      setMessage('Это локальная демоверсия. Вход через VK здесь отключён. Продолжите по email ниже.')
      return
    }
    try { setBusy(true); await startVkLogin() }
    catch { setMessage('Не удалось открыть VK ID. Попробуйте ещё раз или продолжите по email.') }
    finally { setBusy(false) }
  }
  return <section className="social-sign-in" aria-label="Вход через другие сервисы">
    <div className="social-sign-in__heading">{registration ? 'Начать с привычного аккаунта' : 'Войти через другой сервис'}</div>
    <div className="social-sign-in__grid">
      {PROVIDERS.map(provider => {
        const available = provider.id === 'vk' && (vkConfigured || config.demoMode)
        return <button key={provider.id} type="button" className={`social-sign-in__provider social-sign-in__provider--${provider.id}`}
          disabled={!available || busy} onClick={available ? onVk : undefined}
          aria-label={`${provider.label}${available ? '' : ' — пока недоступно'}`}>
          <ProviderMark provider={provider.id} />
          <span className="social-sign-in__name">{provider.name}</span>
          <span className="social-sign-in__status">{available ? config.demoMode ? 'Демо' : 'Продолжить' : 'Не подключён'}</span>
        </button>
      })}
    </div>
    <p className="social-sign-in__note">{config.demoMode ? 'В демоверсии регистрация и вход доступны по email. Остальные способы пока недоступны.' : 'MAX, Госуслуги и Яндекс ID пока недоступны. Можно продолжить по email.'}</p>
    {message && <p className="social-sign-in__message" role="status">{message}</p>}
    <div className="auth-divider"><span>или по email</span></div>
  </section>
}
