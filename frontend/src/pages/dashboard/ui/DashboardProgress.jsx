import { useId } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../../shared/ui/Icon.jsx'
import JourneyProgress from '../../../shared/ui/JourneyProgress.jsx'
import { BLOCKS } from '../../../shared/config'

const MILESTONES = [
  { title: 'Знакомство с собой', blocks: [1] },
  { title: 'Интересы и характер', blocks: [2, 3, 4] },
  { title: 'Письмо в будущее', blocks: [10] },
]

export default function DashboardProgress({ completed, onConsult }) {
  const id = useId().replace(/:/g, '')
  const percent = Math.round(completed.length / BLOCKS.length * 100)
  const next = BLOCKS.find(block => !completed.includes(block.n))
  const missing = [1, 2, 3, 4, 10].filter(n => !completed.includes(n))
  const ready = missing.length === 0

  return <section className="progress-block dashboard-progress" aria-labelledby={`${id}-title`}>
    <div className="dp-overview">
      <div className="dp-chart" role="progressbar" aria-label="Пройденные блоки диагностики" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-valuetext={`${completed.length} из ${BLOCKS.length} блоков, ${percent}%`}>
        <svg className="dp-chart__svg" viewBox="0 0 120 120" aria-hidden="true">
          <defs><linearGradient id={`${id}-blue`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#087cff"/><stop offset="1" stopColor="#087cff"/></linearGradient></defs>
          <circle className="dp-chart__track" cx="60" cy="60" r="50" />
          <circle className="dp-chart__value" cx="60" cy="60" r="50" pathLength="100" transform="rotate(-90 60 60)" stroke={`url(#${id}-blue)`} strokeDasharray={percent === 100 ? undefined : '100'} strokeDashoffset={100 - percent} strokeLinecap={percent === 100 ? 'butt' : 'round'} opacity={percent === 0 ? 0 : 1} />
        </svg>
        <div className="dp-chart__center" aria-hidden="true"><div className="dp-chart__number"><strong>{percent}</strong><span>%</span></div><span className="dp-chart__caption">пройдено</span></div>
      </div>
      <div className="dp-summary">
        <p className="dp-eyebrow"><Icon name="sparkles" size={16} />Твой прогресс</p>
        <h2 id={`${id}-title`} className="dp-count">{completed.length} <span>из {BLOCKS.length} блоков</span></h2>
        <p className="dp-next">{next ? <>Следующий — блок {next.n}: <strong>{next.title}</strong></> : 'Всё готово! Узнай свои сильные стороны и подходящие профессии.'}</p>
        <Link className="dp-action" to={next ? `/test/${next.n}` : '/diagnostic'}>{next ? (completed.length ? 'Продолжить' : 'Начать диагностику') : 'Посмотреть результаты'}<Icon name="arrow-right" size={17}/></Link>
      </div>
      <ul className="dp-milestones" aria-label="Основные этапы для консультации">
        {MILESTONES.map(({ title, blocks }) => {
          const done = blocks.filter(n => completed.includes(n)).length
          const complete = done === blocks.length
          return <li key={title} className={`dp-milestone${complete ? ' is-done' : ''}`}>
            <span className="dp-milestone__icon"><Icon name={complete ? 'check' : 'clock'} size={16}/></span>
            <span className="dp-milestone__copy"><strong>{title}</strong><span>{complete ? 'Пройдено' : `Пройдено ${done} из ${blocks.length}`}</span></span>
          </li>
        })}
      </ul>
    </div>
    <div className="dashboard-journey-progress dp-journey"><JourneyProgress completed={completed} current={next?.n ?? null}/></div>
    <div className={`dp-consult${ready ? ' is-ready' : ''}`}>
      <span className="dp-consult__icon"><Icon name={ready ? 'message' : 'compass'} size={22}/></span>
      <div><strong>{ready ? 'Можно обсудить результаты' : 'Подготовь профиль для консультации'}</strong><p>{ready ? 'Базовые блоки пройдены. Наставник поможет наметить дальнейший маршрут.' : `${missing.length === 1 ? 'Заверши блок' : 'Заверши блоки'} ${missing.join(', ')} — и профиль будет готов к предварительному разбору.`}</p></div>
      {ready && <button className="dp-consult__action" onClick={onConsult}>Записаться<Icon name="arrow-right" size={16}/></button>}
    </div>
  </section>
}
