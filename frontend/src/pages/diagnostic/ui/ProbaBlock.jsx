import { useParams, Navigate } from 'react-router-dom'
import Block2Holland from './Block2Holland'
import Block4Personality from './Block4Personality'
import Block5Cognitive from './Block5Cognitive'
import { ProbaContext, PROBA_VALUE } from '../model/probaContext'

// Мини-тест: прогоняем только блоки 2/4/5 в proba-режиме. Сами блоки те же,
// что и в полной диагностике, — отличается лишь навигация (через ProbaContext).
const MAP = { 2: Block2Holland, 4: Block4Personality, 5: Block5Cognitive }

export default function ProbaBlock() {
  const { n } = useParams()
  const Comp = MAP[parseInt(n, 10)]
  if (!Comp) return <Navigate to="/proba" replace />
  return (
    <ProbaContext.Provider value={PROBA_VALUE}>
      <Comp key={n} />
    </ProbaContext.Provider>
  )
}
