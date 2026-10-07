import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getChildProfile } from '../../../shared/api'
import { friendlyError } from '../../../shared/lib/errors'
import { matchProfessions } from '../../../entities/profession'
import ResultsView from '../../../shared/ui/ResultsView.jsx'
import Header from '../../../shared/ui/Header.jsx'

// Read-only просмотр результатов ребёнка родителем. Данные — из
// profiles.diagnostic_data привязанного ребёнка (доступ открыт RLS-политикой
// profiles_select_linked). Рендер — общий ResultsView.

export default function ChildResults() {
  const { id } = useParams()
  const [state, setState] = useState({ loading: true, error: '', row: null })

  useEffect(() => {
    let alive = true
    getChildProfile(id)
      .then(row => { if (alive) setState({ loading: false, error: row ? '' : 'Нет доступа или профиль не найден', row }) })
      .catch(e => { if (alive) setState({ loading: false, error: friendlyError(e, 'Не удалось загрузить результаты'), row: null }) })
    return () => { alive = false }
  }, [id])

  return (
    <div className="cp-legal">
      <Header backTo="/dashboard" backLabel="← В кабинет" reserveRight />
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '88px 16px 60px' }}>
        {state.loading
          ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--ghost)' }}>Загрузка…</div>
          : state.error
            ? <div style={{ color: 'var(--danger)', marginTop: 16 }}>{state.error}</div>
            : <ResultsView row={state.row} professions={state.row?.diagnostic_data?.profile?.holland_scores ? matchProfessions(state.row.diagnostic_data.profile, 6) : []} />}
      </div>
    </div>
  )
}
