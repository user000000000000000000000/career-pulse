import { createContext } from 'react'

// Мини-тест («проба»): лёгкий бесплатный прогон блоков 2/4/5 без регистрации.
// Контекст читают useDiagBlock, DiagShell и ResultNav, чтобы вести поток
// 2 → 4 → 5 → /proba/result и выходить на главную, не меняя сами блоки.
export const PROBA_SEQ = [2, 4, 5]

export const ProbaContext = createContext(null)

export const PROBA_VALUE = {
  seq: PROBA_SEQ,
  exit: '/',
  nextPath(blockNum) {
    const i = PROBA_SEQ.indexOf(Number(blockNum))
    return (i === -1 || i === PROBA_SEQ.length - 1) ? '/proba/result' : '/proba/' + PROBA_SEQ[i + 1]
  },
  stepOf(blockNum) {
    const i = PROBA_SEQ.indexOf(Number(blockNum))
    return { step: i + 1, total: PROBA_SEQ.length }
  },
}
