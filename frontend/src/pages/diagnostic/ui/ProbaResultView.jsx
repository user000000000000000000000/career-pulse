import { blockSummary } from '../../../shared/lib/blockSummary'
import { blockRings } from '../../../shared/lib/blockRings'
import InfoHint from '../../../shared/ui/InfoHint.jsx'

// Общий презентационный рендер экспресс-профиля: три карточки (блоки 2/4/5),
// в каждой — архетип, текст-резюме и строка с ведущими шкалами. Диаграммы —
// в кабинете зарегистрированного пользователя, а не здесь.
const CARDS = [
  { n: 2, tag: 'Склонности · Holland', hint: 'holland', arch: (r) => r.career_archetype || r.archetype, lead: 'Ведущие склонности' },
  { n: 4, tag: 'Личность · Big Five', hint: 'bigfive', arch: (r) => r.archetype || r.personality_archetype, lead: 'Сильные стороны' },
  { n: 5, tag: 'Мышление', hint: 'cognitive', arch: (r) => r.archetype || r.cognitive_archetype, lead: 'Ведущие способности' },
]

export default function ProbaResultView({ results }) {
  return (
    <div className="p-cards">
      {CARDS.map(({ n, tag, hint, arch, lead }) => {
        const r = results[n] || {}
        const top = blockRings(n, r).map(d => d.label)
        return (
          <div className="p-card" key={n}>
            <div className="p-card-top">
              <span className="p-card-tag">{tag}{hint && <InfoHint term={hint} />}</span>
              <span className="p-card-arch">{arch(r) || '—'}</span>
            </div>
            <p>{blockSummary(n, r)}</p>
            {top.length > 0 && <p className="p-card-lead"><b>{lead}:</b> {top.join(', ')}.</p>}
          </div>
        )
      })}
    </div>
  )
}
