import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionBlock from '../components/Test/QuestionBlock.jsx'
import BlockNavigator from '../components/Test/BlockNavigator.jsx'
import TestProgress from '../components/Test/TestProgress.jsx'
import Button from '../components/UI/Button.jsx'
import { BLOCKS } from '../data/scoring'
import { QUESTION_BANK, questionsByBlock, TOTAL_QUESTIONS } from '../data/questions'
import { calculateScores } from '../utils/scoreCalculator'
import { analyzeTest } from '../services/testAPI'
import { getCurrentUser, markTestDone } from '../services/auth'
import '../styles/test.css'

const LS_ANSWERS = 'cp_test_answers'

export default function Test() {
  const navigate = useNavigate()
  const grouped = useMemo(() => questionsByBlock(BLOCKS), [])
  const [activeBlock, setActiveBlock] = useState(BLOCKS[0].id)
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_ANSWERS)) || {} } catch { return {} }
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Сохранение прогресса (возобновление при перезагрузке)
  useEffect(() => {
    localStorage.setItem(LS_ANSWERS, JSON.stringify(answers))
  }, [answers])

  const onAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount >= TOTAL_QUESTIONS

  // Счётчики по блокам
  const counts = useMemo(() => {
    const out = {}
    for (const b of BLOCKS) {
      const qs = grouped[b.id] || []
      const answered = qs.filter((q) => answers[q.id] !== undefined).length
      out[b.id] = { answered, total: qs.length }
    }
    return out
  }, [answers, grouped])

  const blockIndex = BLOCKS.findIndex((b) => b.id === activeBlock)
  const isLastBlock = blockIndex === BLOCKS.length - 1
  const activeQuestions = grouped[activeBlock] || []

  function goPrev() { if (blockIndex > 0) { setActiveBlock(BLOCKS[blockIndex - 1].id); scrollTop() } }
  function goNext() { if (!isLastBlock) { setActiveBlock(BLOCKS[blockIndex + 1].id); scrollTop() } }
  function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

  async function finish() {
    setError('')
    if (!allAnswered) {
      setError(`Ответьте на все вопросы (${answeredCount} из ${TOTAL_QUESTIONS}).`)
      return
    }
    const answersArray = QUESTION_BANK
      .filter((q) => answers[q.id] !== undefined)
      .map((q) => ({ questionId: q.id, selectedOption: answers[q.id] }))

    try {
      setSubmitting(true)
      const result = calculateScores(answersArray)
      const user = await getCurrentUser()
      const report = await analyzeTest({ scores: result.scores, answers: answersArray, userId: user?.id })
      await markTestDone()
      localStorage.removeItem(LS_ANSWERS)
      navigate('/result', { state: { result, report } })
    } catch (err) {
      setError(err.message || 'Не удалось обработать результаты. Попробуйте ещё раз.')
      setSubmitting(false)
    }
  }

  return (
    <div className="test-shell">
      <div className="test-top">
        <div className="test-top-row">
          <div className="test-logo">CAREER<span>PULSE</span></div>
          <TestProgress answered={answeredCount} total={TOTAL_QUESTIONS} />
          <div className="test-count">{answeredCount}/{TOTAL_QUESTIONS}</div>
        </div>
        <BlockNavigator blocks={BLOCKS} counts={counts} activeId={activeBlock} onSelect={(id) => { setActiveBlock(id); scrollTop() }} />
      </div>

      <div className="test-body">
        {activeQuestions.map((q, i) => (
          <QuestionBlock
            key={q.id}
            question={q}
            index={i}
            total={activeQuestions.length}
            value={answers[q.id]}
            onAnswer={onAnswer}
          />
        ))}

        {error && (
          <div style={{ color: 'var(--danger)', fontWeight: 600, margin: '12px 0' }}>{error}</div>
        )}
      </div>

      <div className="test-footer-bar">
        <div className="test-footer-inner">
          <Button variant="ghost" onClick={goPrev} disabled={blockIndex === 0}>← Назад</Button>
          <span className="test-footer-meta">{BLOCKS[blockIndex].title}</span>
          {isLastBlock ? (
            <Button onClick={finish} disabled={submitting}>
              {submitting ? 'Анализируем…' : 'Завершить тест →'}
            </Button>
          ) : (
            <Button onClick={goNext}>Далее →</Button>
          )}
        </div>
      </div>
    </div>
  )
}
