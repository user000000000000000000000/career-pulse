import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { usePageMeta } from '../../../shared/lib/pageMeta'
import { encodeProba } from '../../../shared/lib/probaShare'
import ProbaResultView from './ProbaResultView'
import '../proba.css'

export default function ProbaResult() {
  usePageMeta('Экспресс-профиль', 'Результат бесплатного мини-теста CareerPulse.')
  const navigate = useNavigate()
  const [results, setResults] = useState(null)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [b2, b4, b5] = await Promise.all([CP.getBlockResult(2), CP.getBlockResult(4), CP.getBlockResult(5)])
      if (!alive) return
      if (!b2?.scores || !b4?.scores || !b5?.scores) { navigate('/proba', { replace: true }); return }
      setResults({ 2: b2.scores, 4: b4.scores, 5: b5.scores })
    })()
    return () => { alive = false }
  }, [navigate])

  function onShare() {
    const url = `${window.location.origin}/t/${encodeProba(results)}`
    setShareUrl(url)
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }).catch(() => {})
  }

  if (!results) return null

  return (
    <div className="cp-proba">
      <div className="p-wrap">
        <div className="p-head">
          <div className="p-eyebrow">Экспресс-профиль</div>
          <h1 className="p-title">Вот что уже о тебе видно</h1>
          <p className="p-sub">Это 3 из 10 блоков диагностики. Зарегистрируйся — результат сохранится, а остальные блоки откроют полный ИИ-разбор и подбор профессий.</p>
        </div>

        <ProbaResultView results={results} />

        <div className="p-cta">
          <b>Сохранить результат и пройти полностью</b>
          <p>Эти 3 блока уже готовы. После регистрации они появятся в кабинете — останется пройти оставшиеся 7.</p>
          <div className="p-actions">
            <a href="/register" className="p-btn p-btn-primary" onClick={(e) => { e.preventDefault(); navigate('/register') }}>Зарегистрироваться →</a>
            <button className="p-btn p-btn-ghost" onClick={onShare}>{copied ? 'Ссылка скопирована' : 'Поделиться'}</button>
          </div>
          {shareUrl && (
            <div className="p-link-row"><input readOnly value={shareUrl} onFocus={(e) => e.target.select()} /></div>
          )}
          <div className="p-note">Уже есть аккаунт? <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }} style={{ color: 'var(--p-blue)' }}>Войти</a> — результат подхватится автоматически.</div>
        </div>
      </div>
    </div>
  )
}
