import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CP from '../../services/cpStorage'

/**
 * Общая логика старта диагностического блока (порт init-IIFE из block-N.html):
 *  - если блок уже пройден — спросить «пройти заново?», иначе уйти в кабинет;
 *  - запустить таймер;
 *  - дать goNext() → следующий рекомендуемый блок (или кабинет).
 *
 * @returns { ready, timerRef, goNext }
 */
export default function useDiagBlock(blockNum) {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const ex = await CP.getBlockResult(blockNum)
      if (ex && ex.status === 'completed') {
        if (!window.confirm('Блок уже пройден. Пройти заново?')) {
          navigate('/dashboard')
          return
        }
        await CP.clearBlock(blockNum)
      }
      if (!alive) return
      timerRef.current = CP.startTimer()
      setReady(true)
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNum])

  // Предупреждение при попытке закрыть/перезагрузить вкладку посреди блока,
  // чтобы случайно не потерять незавершённые ответы (универсально для всех блоков).
  useEffect(() => {
    if (!ready) return
    const handler = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [ready])

  const goNext = useCallback(async () => {
    const n = await CP.getNextBlock()
    navigate(n ? '/test/' + n : '/dashboard')
  }, [navigate])

  return { ready, timerRef, goNext }
}
