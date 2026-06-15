import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CP from '../../services/cpStorage'
import DiagShell from './DiagShell'
import useDiagBlock from './useDiagBlock'

const SECTIONS = [
  { id: 'now', icon: '🙂', title: 'Я сейчас', desc: 'Опиши себя — каким ты видишь себя прямо сейчас', questions: [
    { id: 'P1.1', prompt: 'Расскажи о себе — какой ты человек? Что тебя описывает лучше всего?', hint: 'Характер, привычки, что отличает от других' },
    { id: 'P1.2', prompt: 'Что тебя заряжает энергией? А что отнимает силы?', hint: 'Занятия, люди, ситуации' },
    { id: 'P1.3', prompt: 'Что тебя сейчас беспокоит или тревожит больше всего?', hint: 'Можно про учёбу, будущее, отношения — что угодно' },
    { id: 'P1.4', prompt: 'Чем ты занимаешься с удовольствием в свободное время?', hint: 'Хобби, интересы, увлечения' },
  ] },
  { id: 'future', icon: '🔮', title: 'Я через 5 лет', desc: 'Представь себя через 5 лет. Закрой глаза на секунду. Что видишь?', questions: [
    { id: 'P2.1', prompt: 'Каким ты видишь себя через 5 лет? Где ты, чем занимаешься?', hint: 'Город, работа, образ жизни' },
    { id: 'P2.2', prompt: 'Какую работу ты делаешь? Опиши свой рабочий день.', hint: 'Что делаешь утром, днём, с кем общаешься' },
    { id: 'P2.3', prompt: 'С кем ты работаешь — один или в команде? Какие люди рядом?', hint: 'Коллеги, клиенты, партнёры' },
    { id: 'P2.4', prompt: 'Что для тебя важнее в будущей работе — деньги, свобода, влияние или смысл?', hint: 'Попробуй расставить приоритеты' },
    { id: 'P2.5', prompt: 'Что ты чувствуешь, просыпаясь утром в этом будущем?', hint: 'Эмоции, настроение, ощущение' },
  ] },
  { id: 'values', icon: '💎', title: 'Ценности и смыслы', desc: 'Что для тебя по-настоящему важно', questions: [
    { id: 'P3.1', prompt: 'Что для тебя означает «успех»?', hint: 'Не что принято считать, а что для тебя лично' },
    { id: 'P3.2', prompt: 'Ради чего ты готов(а) отказаться от комфорта?', hint: 'Что стоит усилий, жертв, долгого труда' },
    { id: 'P3.3', prompt: 'Какие ценности для тебя самые важные?', hint: 'Свобода? Семья? Справедливость? Творчество?' },
    { id: 'P3.4', prompt: 'Что ты считаешь бессмысленным или неприемлемым в работе?', hint: 'Что точно «не твоё» — условия, атмосфера, задачи' },
  ] },
  { id: 'path', icon: '🗺️', title: 'Путь', desc: 'Как дойти до того будущего, которое ты описал(а)', questions: [
    { id: 'P4.1', prompt: 'Какие шаги, по-твоему, нужны, чтобы прийти к этому будущему?', hint: 'Учёба, опыт, знакомства, навыки' },
    { id: 'P4.2', prompt: 'Что может помешать? Какие препятствия ты видишь?', hint: 'Внешние обстоятельства' },
    { id: 'P4.3', prompt: 'Что внутри тебя может помешать — страхи, сомнения, привычки?', hint: 'Будь честен(а) с собой' },
    { id: 'P4.4', prompt: 'Какая помощь тебе нужна? Чего не хватает?', hint: 'Информация, наставник, деньги, поддержка' },
  ] },
  { id: 'message', icon: '💌', title: 'Послание себе', desc: 'Напиши письмо себе в будущее — тепло и честно', questions: [
    { id: 'P5.1', prompt: 'Напиши себе послание из будущего. Что ты хочешь сказать себе сегодняшнему?', hint: 'Совет, поддержка, предупреждение — что угодно' },
    { id: 'P5.2', prompt: 'Что ты хочешь, чтобы ты будущий(ая) запомнил(а) о себе сегодняшнем(ей)?', hint: 'Что важно не забыть' },
  ] },
]
const ACTIVE_WORDS = ['решил', 'решила', 'сделаю', 'выбираю', 'собираюсь', 'начну', 'создам', 'построю', 'буду', 'хочу', 'планирую']
const PASSIVE_WORDS = ['надеюсь', 'может быть', 'получится', 'если повезёт', 'хотелось бы', 'наверное', 'не знаю', 'боюсь']
const totalQ = SECTIONS.reduce((s, b) => s + b.questions.length, 0)

export default function Block10Letter() {
  const { ready, timerRef } = useDiagBlock(10)
  const navigate = useNavigate()
  const [blockIdx, setBlockIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  if (!ready) return null

  const section = SECTIONS[blockIdx]
  const q = section?.questions[qIdx]
  const globalIdx = (() => { let c = 0; for (let i = 0; i < blockIdx; i++) c += SECTIONS[i].questions.length; return c + qIdx })()
  const pct = result ? 100 : Math.round(globalIdx / totalQ * 100)
  const isLast = blockIdx === SECTIONS.length - 1 && qIdx === section.questions.length - 1

  function setText(v) { setAnswers(p => ({ ...p, [q.id]: v })) }
  function goForward() {
    let bi = blockIdx, qi = qIdx + 1
    if (qi >= SECTIONS[bi].questions.length) { bi++; qi = 0 }
    if (bi >= SECTIONS.length) submit()
    else { setBlockIdx(bi); setQIdx(qi) }
  }
  function goBack() {
    if (qIdx > 0) setQIdx(qIdx - 1)
    else if (blockIdx > 0) { const nb = blockIdx - 1; setBlockIdx(nb); setQIdx(SECTIONS[nb].questions.length - 1) }
  }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    let fullText = ''
    SECTIONS.forEach(b => {
      fullText += `\n\n=== ${b.title} ===\n`
      b.questions.forEach(qq => { fullText += `\n[${qq.id}] ${qq.prompt}\n${answers[qq.id] || '(пропущено)'}\n` })
    })
    const wordCount = fullText.split(/\s+/).filter(w => w.length > 0).length
    const charCount = fullText.length
    const textLower = fullText.toLowerCase()
    let activeCount = 0, passiveCount = 0
    ACTIVE_WORDS.forEach(w => { const m = textLower.match(new RegExp(w, 'gi')); if (m) activeCount += m.length })
    PASSIVE_WORDS.forEach(w => { const m = textLower.match(new RegExp(w, 'gi')); if (m) passiveCount += m.length })
    const total = activeCount + passiveCount || 1
    const agencyRatio = Math.round(activeCount / total * 100) / 100
    const scores = { word_count: wordCount, char_count: charCount, agency_markers: { active_count: activeCount, passive_count: passiveCount, ratio: agencyRatio }, ai_pending: true }
    const openAnswers = []
    SECTIONS.forEach(b => b.questions.forEach(qq => openAnswers.push({ questionId: qq.id, text: answers[qq.id] || '' })))
    await CP.saveBlockResult(10, { answers, scores, durationSec: dur, openAnswers })
    await CP.saveLetter({ blocks: openAnswers, fullText, wordCount, charCount, agencyRatio })
    await CP.updateProfile({ letter_completed: true, letter_word_count: wordCount, agency_ratio: agencyRatio })
    setResult({ ...scores, durationSec: dur })
  }

  if (result) {
    const agencyLabel = result.agency_markers.ratio > 0.7 ? 'Высокая' : result.agency_markers.ratio > 0.4 ? 'Средняя' : 'Низкая'
    return (
      <DiagShell num={10} title="ПИСЬМО ОТПРАВЛЕНО" pct={100}>
        <div className="result">
          <div className="result-icon">✉️</div>
          <div className="result-title">ПИСЬМО ОТПРАВЛЕНО</div>
          <div className="result-desc">Твоё письмо в будущее сохранено. ИИ проанализирует его и найдёт то, что закрытые тесты не показывают: мотивы, ценности, образ будущего из твоих собственных слов.</div>
          <div className="letter-stat"><span>📝 {result.word_count} слов</span><span>🕐 {Math.ceil(result.durationSec / 60)} мин</span><span>⚡ Агентность: {agencyLabel}</span></div>
          <div style={{ background: 'var(--card)', border: '1px solid rgba(245,200,66,.2)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left', maxWidth: 440, margin: '0 auto 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: 1, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>ЧТО ДАЛЬШЕ</div>
            <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.7 }}>Наставник получит твоё письмо вместе с результатами всех тестов. ИИ-анализ выделит ключевые мотивы, противоречия и скрытые ресурсы.</div>
          </div>
          <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>Вернуться в кабинет →</button>
        </div>
      </DiagShell>
    )
  }

  return (
    <DiagShell num={10} title="ПИСЬМО В БУДУЩЕЕ"
      desc="Это не тест. Это письмо себе через 5 лет. Пиши честно, как будто никто не прочитает."
      meta={['🕐 ~25 мин', '📝 19 вопросов', '✨ ИИ-анализ x2']} pct={pct}>
      <div className="q-area">
        {qIdx === 0 && (
          <div className="section-intro"><div className="si-icon">{section.icon}</div><div className="si-title">{section.title}</div><div className="si-desc">{section.desc}</div></div>
        )}
        <div className="q-counter">{globalIdx + 1} / {totalQ}</div>
        <div className="q-prompt">{q.prompt}</div>
        <div className="q-hint">{q.hint}</div>
        <textarea className="q-textarea" style={{ minHeight: 160 }} placeholder="Пиши свободно, как будто рассказываешь близкому другу..." value={answers[q.id] || ''} onChange={e => setText(e.target.value)} />
        <div className="nav-row">
          {globalIdx > 0 && <button className="btn btn-ghost" onClick={goBack}>← Назад</button>}
          <button className="btn btn-gold" onClick={goForward}>{isLast ? 'Отправить письмо ✉️' : 'Далее →'}</button>
        </div>
      </div>
    </DiagShell>
  )
}
