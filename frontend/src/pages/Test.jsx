import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QuestionBlock from '../components/Test/QuestionBlock.jsx'
import BlockNavigator from '../components/Test/BlockNavigator.jsx'
import TestProgress from '../components/Test/TestProgress.jsx'
import Button from '../components/UI/Button.jsx'
import { BLOCKS } from '../data/scoring'
import { QUESTION_BANK, TOTAL_QUESTIONS, getBlockQuestions } from '../data/questions.js';
import { calculateScores } from '../utils/scoreCalculator'
import { analyzeTest } from '../services/testAPI'
import { getCurrentUser, markTestDone } from '../services/auth'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import '../styles/test.css'

const LS_ANSWERS = 'cp_test_answers'

export default function Test() {
  const navigate = useNavigate()
  

  const grouped = useMemo(() => {
    const result = {}
    BLOCKS.forEach(block => {
      result[block.id] = getBlockQuestions(block.id)
    })
    return result
  }, [])
  
  const [activeBlock, setActiveBlock] = useState(BLOCKS[0].id)
  const [answers, setAnswers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_ANSWERS)) || {} } catch { return {} }
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(LS_ANSWERS, JSON.stringify(answers))
  }, [answers])

  const onAnswer = (questionId, optionIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
  }

  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount >= TOTAL_QUESTIONS

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

  // DEV-only: быстрое прохождение с заданным профилем
  const DEV_PROFILES = {
    programmer: { interests: 1, personality: 0, abilities: 0, behavior: 0, values: 6 }, // anal, intro, AN, IN, DV
    designer:   { interests: 2, personality: 1, abilities: 2, behavior: 2, values: 5 }, // crea, extro, CR, RS, SR
    manager:    { interests: 4, personality: 1, abilities: 3, behavior: 0, values: 3 }, // lead, extro, OR, IN, PR
  }

  function devFill(profileKey) {
    const profile = DEV_PROFILES[profileKey]
    const filled = {}
    for (const q of QUESTION_BANK) {
      if (q.type === 'open') {
        filled[q.id] = 'Тестовый ответ для быстрой проверки.'
      } else {
        // выбираем нужный вариант для блока, с небольшой рандомизацией
        const base = profile[q.block] ?? 0
        const jitter = Math.random() < 0.3 ? (Math.floor(Math.random() * q.options.length)) : base
        const idx = Math.min(jitter, q.options.length - 1)
        filled[q.id] = idx
      }
    }
    setAnswers(filled)
  }

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

      // Сохраняем ответы в Supabase сразу, не ждём AI
      if (isSupabaseConfigured && user?.id) {
        await supabase.from('test_answers').upsert(
          { user_id: user.id, answers: answersArray, scores: result.scores, saved_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      }

      const letterAnswers = QUESTION_BANK
        .filter(q => q.block === 'letter' && answers[q.id])
        .map(q => ({ question: q.text, text: String(answers[q.id]) }))

      const report = await analyzeTest({ scores: result.scores, answers: answersArray, letterAnswers, userId: user?.id })
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
      {import.meta.env.DEV && (
        <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999, display: 'flex', gap: 8 }}>
          {Object.keys(DEV_PROFILES).map(p => (
            <button key={p} onClick={() => devFill(p)}
              style={{ background: '#7b5cf0', color: '#fff', border: 'none', borderRadius: 8,
                padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ⚡ {p}
            </button>
          ))}
        </div>
      )}

      <div className="test-top">
        <div className="test-top-row">
          <button className="test-back-btn" onClick={() => navigate('/dashboard')}>← Дашборд</button>
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