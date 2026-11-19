import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CP } from '../api'
import { BLOCKS } from '../config'
import Icon from './Icon.jsx'
import JourneyMascot from './JourneyMascot.jsx'
import './navigation-panel.css'

export default function DrawerJourney({ completed, onNavigate }) {
  const [saved, setSaved] = useState(null)
  useEffect(() => {
    if (completed !== undefined) return
    let alive = true
    CP.getProgress().then(progress => { if (alive) setSaved(progress.completed || []) }).catch(() => {})
    return () => { alive = false }
  }, [completed])
  const data = completed ?? saved
  const done = BLOCKS.filter(block => data?.includes(block.n)).length
  const next = BLOCKS.find(block => !data?.includes(block.n))
  const percent = Math.round(done / BLOCKS.length * 100)
  return <section className="drawer-journey" aria-label="Твой прогресс диагностики">
    <div className="drawer-journey__copy">
      <span className="drawer-journey__eyebrow"><Icon name="sparkles" size={13} />ТВОЙ ПУТЬ</span>
      <h2>{done === BLOCKS.length ? 'Твой профиль готов' : done ? 'Ты уже ближе к цели' : 'Всё начинается с тебя'}</h2>
    </div>
    <div className="drawer-journey__art" aria-hidden="true"><JourneyMascot num={2} variant="path" /></div>
    <div className="drawer-journey__progress">
      <div><span>{data ? `${done} из ${BLOCKS.length} блоков` : 'Загружаем прогресс…'}</span><strong>{data ? `${percent}%` : '—'}</strong></div>
      <progress max="100" value={percent} aria-label="Пройдено диагностики" />
    </div>
    <Link to={!data ? '/test' : next ? `/test/${next.n}` : '/diagnostic'} onClick={onNavigate} className="drawer-journey__link">
      {next ? done ? 'Продолжить диагностику' : 'Начать диагностику' : 'Посмотреть результаты'}<Icon name="arrow-right" size={16} />
    </Link>
  </section>
}
