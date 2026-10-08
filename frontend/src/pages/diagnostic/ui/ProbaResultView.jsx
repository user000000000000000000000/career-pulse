import { blockSummary } from '../model/blockSummary'

// Общий презентационный рендер экспресс-профиля: три карточки (блоки 2/4/5).
// Используется и на своей странице результата, и на публичной шар-странице.
// arch(): поля различаются между живым состоянием блока и формой в хранилище —
// читаем оба варианта (career_archetype / personality_archetype / cognitive_archetype)
const CARDS = [
  { n: 2, tag: 'Склонности · Holland', arch: (r) => r.career_archetype || r.archetype },
  { n: 4, tag: 'Личность · Big Five', arch: (r) => r.archetype || r.personality_archetype },
  { n: 5, tag: 'Мышление', arch: (r) => r.archetype || r.cognitive_archetype },
]

export default function ProbaResultView({ results }) {
  return (
    <div className="p-cards">
      {CARDS.map(({ n, tag, arch }) => {
        const r = results[n] || {}
        return (
          <div className="p-card" key={n}>
            <div className="p-card-top">
              <span className="p-card-tag">{tag}</span>
              <span className="p-card-arch">{arch(r) || '—'}</span>
            </div>
            <p>{blockSummary(n, r)}</p>
          </div>
        )
      })}
    </div>
  )
}
