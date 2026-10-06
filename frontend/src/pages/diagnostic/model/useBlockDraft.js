import { useEffect, useRef, useReducer } from 'react'
import { STORAGE_KEYS } from '../../../shared/lib/storageKeys'

/** Полностью удалить черновик блока (при выборе «начать заново»). */
export function clearBlockDraft(blockNum) {
  try { localStorage.removeItem(STORAGE_KEYS.blockDraft(blockNum)) } catch { /* ignore */ }
}

// Блоки, открытые через «Изменить ответы»: при восстановлении грузим ответы, но сбрасываем
// позицию на первый вопрос (иначе блок открывается в конце и прошлых ответов не видно).
const editDrafts = new Set()
export function markBlockEdit(blockNum) { editDrafts.add(blockNum) }
// Ключи позиции/фазы — их НЕ восстанавливаем в режиме правки, чтобы начать с начала.
const POSITION_KEYS = ['step', 'qIdx', 'idx', 'pairIdx', 'phase', 'curMatIdx']

// Собрать черновик из СОХРАНЁННОГО результата блока (ex из CP.getBlockResult).
// Нужно для «Изменить ответы» у блоков, пройденных до появления фичи, — тогда
// отдельного черновика нет, но ответы лежат в результате. Форма ответов у каждого
// блока своя (см. saveBlockResult в каждом Block*.jsx).
export function seedDraftFromResult(blockNum, ex) {
  if (!ex || !ex.answers) return
  const a = ex.answers
  const open = (ex.openAnswers || []).map(o => (o && o.text) || '')
  let draft
  switch (blockNum) {
    case 2: draft = { pairAnswers: a, openText: open[0] || '' }; break            // пары; tail (anti/energy) не хранится — доотвечивается
    case 3: draft = { answers: a, openText: open[0] || '' }; break                // дилеммы; anti доотвечивается
    case 4: draft = { answers: a }; break
    case 5: draft = { selfAns: a.self || {}, taskAns: a.tasks || {}, varkAns: a.vark || [] }; break
    case 6: draft = { ans: a, openTexts: [open[0] || '', open[1] || ''] }; break
    case 7: draft = { ans: a.likert || {}, caseAns: a.cases || [] }; break
    case 8: draft = { ans: a, openTexts: [open[0] || '', open[1] || ''] }; break
    case 9: { const { E1a, ...rest } = a; draft = { ans: rest, achieveText: E1a || '', showAchieve: !!E1a, openTexts: [open[0] || '', open[1] || ''] }; break }
    default: return
  }
  try { localStorage.setItem(STORAGE_KEYS.blockDraft(blockNum), JSON.stringify(draft)) } catch { /* ignore */ }
}

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
  const key = STORAGE_KEYS.blockDraft(blockNum)
  const restored = useRef(false)
  const [, bump] = useReducer((x) => x + 1, 0) // форс-рендер после restore

  // Восстановление один раз при готовности блока
  useEffect(() => {
    if (!ready || restored.current) return
    restored.current = true
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const data = JSON.parse(raw)
        if (data) {
          if (editDrafts.has(blockNum)) {
            editDrafts.delete(blockNum)
            POSITION_KEYS.forEach(k => delete data[k]) // правка: ответы грузим, позицию — с начала
          }
          restore(data)
          // restore часто мутирует объекты ответов (Object.assign) без вызова setState —
          // сам по себе ре-рендер не произойдёт, и восстановленные ответы не отрисуются,
          // пока пользователь что-то не нажмёт. Форсируем перерисовку.
          bump()
        }
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

  // Раньше по завершении блока черновик удаляли. Теперь СОХРАНЯЕМ его как копию
  // ответов — чтобы при перепрохождении можно было «Изменить ответы», а не начинать
  // с нуля. Реальная очистка — только при «Начать заново» (clearBlockDraft в useDiagBlock).
  return () => { /* оставляем черновик как редактируемую копию ответов */ }
}
