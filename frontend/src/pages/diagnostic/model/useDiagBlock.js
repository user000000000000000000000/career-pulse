import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { choiceDialog } from '../../../shared/ui/Dialog.jsx'
import { clearBlockDraft, markBlockEdit, seedDraftFromResult } from './useBlockDraft'

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
  const [editMode, setEditMode] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const ex = await CP.getBlockResult(blockNum)
      if (ex && ex.status === 'completed') {
        const choice = await choiceDialog({
          title: 'Блок уже пройден',
          message: 'Ты уже проходил(а) этот блок. Что сделать?',
          options: [
            { label: 'Изменить ответы', value: 'edit' },
            { label: 'Начать заново', value: 'restart', style: 'ghost' },
            { label: 'В кабинет', value: 'cancel', style: 'ghost' },
          ],
        })
        if (choice === 'restart') {
          // Полный сброс блока: и сохранённый результат, и черновик-копия ответов.
          await CP.clearBlock(blockNum)
          clearBlockDraft(blockNum)
        } else if (choice !== 'edit') {
          // «В кабинет», клик по фону или Escape — ничего не меняем.
          navigate('/dashboard')
          return
        } else {
          // 'edit' — восстанавливаем ответы из сохранённого результата в черновик (на случай
          // старых прохождений без черновика) и открываем блок с первого вопроса.
          seedDraftFromResult(blockNum, ex)
          markBlockEdit(blockNum)
          setEditMode(true)
        }
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
    // если остались непройденные блоки — на следующий; иначе сразу на страницу результатов
    navigate(n ? '/test/' + n : '/diagnostic')
  }, [navigate])

  return { ready, timerRef, goNext, editMode }
}
