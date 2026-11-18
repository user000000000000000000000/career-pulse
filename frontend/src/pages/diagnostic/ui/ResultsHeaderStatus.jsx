import Icon from '../../../shared/ui/Icon.jsx'
import HeaderContext from '../../../shared/ui/HeaderContext.jsx'

export default function ResultsHeaderStatus({ percent = 0, completed = 0, total = 10 }) {
  return <HeaderContext>
    <span className="results-completion" role="status" aria-label={`Готовность профиля: ${percent}%. Пройдено ${completed} из ${total} блоков`}>
      <Icon name={percent === 100 ? 'check' : 'chart'} size={18}/>
      <span>Готовность профиля</span><strong>{percent}%</strong>
    </span>
  </HeaderContext>
}
