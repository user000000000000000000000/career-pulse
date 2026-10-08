import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSharedResults } from '../../../shared/api'
import { friendlyError } from '../../../shared/lib/errors'
import { matchProfessions } from '../../../entities/profession'
import ResultsView from '../../../shared/ui/ResultsView.jsx'
import { usePageMeta } from '../../../shared/lib/pageMeta'

// Публичный read-only просмотр результатов по ссылке (без логина).
// Данные — RPC public_shared_results(token). Рендер — общий ResultsView.

export default function SharedResults() {
  const { token } = useParams()
  usePageMeta('Результаты диагностики', 'Результаты профориентационной диагностики CareerPulse.')
  const [state, setState] = useState({ loading: true, error: '', row: null })

  useEffect(() => {
    let alive = true
    getSharedResults(token)
      .then(row => { if (alive) setState({ loading: false, error: row ? '' : 'Ссылка недействительна или была отозвана', row }) })
      .catch(e => { if (alive) setState({ loading: false, error: friendlyError(e, 'Не удалось загрузить результаты'), row: null }) })
    return () => { alive = false }
  }, [token])

  return (
    <div className="cp-legal">
      <nav className="legal-nav">
        <Link to="/" className="nav-logo-link">
          <div className="nav-logo-mark">⚡</div>
          <div className="nav-logo-txt">CAREER<span>PULSE</span></div>
        </Link>
        <Link to="/" className="nav-back-link">Пройти свою диагностику →</Link>
      </nav>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '96px 16px 60px' }}>
        {state.loading
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--ghost)' }}>Загрузка…</div>
          : state.error
            ? <div style={{ color: 'var(--danger)', marginTop: 16, fontSize: 15 }}>{state.error}</div>
            : <>
                <ResultsView row={state.row} professions={state.row?.diagnostic_data?.profile?.holland_scores ? matchProfessions(state.row.diagnostic_data.profile, 6) : []} />
                <div style={{ marginTop: 28, textAlign: 'center' }}>
                  <Link to="/" className="btn btn-accent">Пройти свою диагностику →</Link>
                </div>
              </>}
      </div>
    </div>
  )
}
