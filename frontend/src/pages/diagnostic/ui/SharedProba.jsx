import { useParams, useNavigate } from 'react-router-dom'
import { usePageMeta } from '../../../shared/lib/pageMeta'
import { decodeProba } from '../../../shared/lib/probaShare'
import ProbaResultView from './ProbaResultView'
import '../proba.css'

export default function SharedProba() {
  usePageMeta('Экспресс-профиль', 'Чей-то результат мини-теста CareerPulse. Пройди свой бесплатно.')
  const { data } = useParams()
  const navigate = useNavigate()
  const results = decodeProba(data)

  const goTest = (e) => { e.preventDefault(); navigate('/proba') }

  if (!results || !results[2] || !results[4] || !results[5]) {
    return (
      <div className="cp-proba">
        <div className="p-wrap">
          <div className="p-head">
            <h1 className="p-title">Ссылка не открывается</h1>
            <p className="p-sub">Похоже, ссылка повреждена или устарела. Но ты можешь пройти свой мини-тест — это бесплатно и без регистрации.</p>
          </div>
          <div className="p-actions"><a href="/proba" className="p-btn p-btn-primary" onClick={goTest}>Пройти тест →</a></div>
        </div>
      </div>
    )
  }

  return (
    <div className="cp-proba">
      <div className="p-wrap">
        <div className="p-head">
          <div className="p-eyebrow">Экспресс-профиль</div>
          <h1 className="p-title">Результат мини-теста</h1>
          <p className="p-sub">Это 3 блока из диагностики CareerPulse. Хочешь такой же про себя — пройди бесплатно, без регистрации.</p>
        </div>

        <ProbaResultView results={results} />

        <div className="p-cta">
          <b>А какой профиль у тебя?</b>
          <p>Три блока, около 10 минут, без регистрации. В конце — такой же разбор и возможность поделиться.</p>
          <div className="p-actions"><a href="/proba" className="p-btn p-btn-primary" onClick={goTest}>Пройти свой тест →</a></div>
        </div>
      </div>
    </div>
  )
}
