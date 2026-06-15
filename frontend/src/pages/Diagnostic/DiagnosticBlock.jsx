import { useParams, Navigate } from 'react-router-dom'

import Block1Anketa from './Block1Anketa'
import Block2Holland from './Block2Holland'
import Block3Values from './Block3Values'
import Block4Personality from './Block4Personality'
import Block5Cognitive from './Block5Cognitive'
import Block6Readiness from './Block6Readiness'
import Block7SelfEfficacy from './Block7SelfEfficacy'
import Block8Future from './Block8Future'
import Block9Social from './Block9Social'
import Block10Letter from './Block10Letter'

/**
 * Диспетчер диагностических блоков: /test/:n → нужный компонент блока.
 * Полный порт 10 блоков из прототипа «Сайт V3».
 */
const BLOCKS = {
  1: Block1Anketa,
  2: Block2Holland,
  3: Block3Values,
  4: Block4Personality,
  5: Block5Cognitive,
  6: Block6Readiness,
  7: Block7SelfEfficacy,
  8: Block8Future,
  9: Block9Social,
  10: Block10Letter,
}

export default function DiagnosticBlock() {
  const { n } = useParams()
  const num = parseInt(n, 10)
  const Comp = BLOCKS[num]
  if (!Comp) return <Navigate to="/dashboard" replace />
  return <Comp key={num} />
}
