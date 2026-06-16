import { useEffect, useRef } from 'react'

/**
 * Автосохранение/восстановление черновика блока в localStorage.
 * Не теряем ответы при перезагрузке вкладки посреди прохождения.
 *
 * @param {object} opts
 *  - blockNum : номер блока
 *  - ready    : из useDiagBlock (восстанавливаем только когда блок «открыт»)
 *  - snapshot : () => object — что сохранить (текущее состояние ответов)
 *  - restore  : (data) => void — как применить восстановленные данные
 *  - deps     : массив зависимостей, при изменении которых пересохраняем
 * @returns {() => void} clearDraft — вызвать при завершении блока
 */
export default function useBlockDraft({ blockNum, ready, snapshot, restore, deps }) {
  const key = 'cp_draft_block' + blockNum
  const restored = useRef(false)

  // Восстановление один раз при готовности блока
  useEffect(() => {
    if (!ready || restored.current) return
    restored.current = true
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        if (data) restore(data)
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Автосохранение при изменении ответов (только после восстановления)
  useEffect(() => {
    if (!ready || !restored.current) return
    try { localStorage.setItem(key, JSON.stringify(snapshot())) } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, ...deps])

  return () => { try { localStorage.removeItem(key) } catch { /* ignore */ } }
}
