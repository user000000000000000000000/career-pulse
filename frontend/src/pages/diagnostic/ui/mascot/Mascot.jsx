import { useEffect, useState } from 'react'
import FoxSVG from './FoxSVG'
import './mascot.css'

/**
 * Лиса-маскот платформы. Показывает состояние (idle/thinking/happy/celebrating)
 * и реплику во всплывающем «облачке». mood/message управляются снаружи —
 * компонент сам ничего не решает про прогресс диагностики.
 *
 * props:
 *  - mood    : 'idle' | 'thinking' | 'happy' | 'celebrating'
 *  - message : текст реплики (если не задан — облачко не показывается)
 *  - size    : 'sm' (уголок блока) | 'lg' (результаты/лендинг)
 */
export default function Mascot({ mood = 'idle', message, size = 'sm' }) {
  const [shownMessage, setShownMessage] = useState(message)

  // Реплика меняется вместе с блоком, но не резче, чем читается — короткая пауза на смену.
  useEffect(() => {
    setShownMessage(message)
  }, [message])

  const px = size === 'lg' ? 140 : 84

  return (
    <div className={'cp-mascot cp-mascot--' + size}>
      <div className={'cp-mascot-figure cp-mascot-figure--' + mood}>
        <FoxSVG mood={mood} size={px} />
      </div>
      {shownMessage && (
        <div className="cp-mascot-bubble">{shownMessage}</div>
      )}
    </div>
  )
}
