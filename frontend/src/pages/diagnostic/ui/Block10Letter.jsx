import IconText from '../../../shared/ui/IconText.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import DiagShell from './DiagShell'
import useDiagBlock from '../model/useDiagBlock'
import useBlockDraft from '../model/useBlockDraft'
import { blockSummary } from '../../../shared/lib/blockSummary'
import JourneyMascot from '../../../shared/ui/JourneyMascot.jsx'
import { isSupabaseConfigured } from '../../../shared/api'
import '../letter-journey.css'

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
const SECTION_SCENES = { now: 'self', future: 'future', values: undefined, path: 'path', message: 'letter' }

export default function Block10Letter() {
  const { ready, timerRef } = useDiagBlock(10)
  const navigate = useNavigate()
  const [blockIdx, setBlockIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)

  const clearDraft = useBlockDraft({
    blockNum: 10, ready,
    snapshot: () => ({ answers, blockIdx, qIdx }),
    restore: (d) => {
      if (d && d.answers && Object.keys(d.answers).length) {
        setAnswers(d.answers)
        setBlockIdx(Math.min(d.blockIdx || 0, SECTIONS.length - 1))
        setQIdx(d.qIdx || 0)
      }
    },
    deps: [answers, blockIdx, qIdx],
  })

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
    // agency_ratio — грубая локальная эвристика по ключевым словам, нужна только как
    // мгновенный превью-сигнал до ответа ИИ. Итоговую оценку тона письма даёт
    // analyze-diagnostic (поле agency_assessment) — письмо целиком уходит туда,
    // и модель судит по смыслу, а не по regex-совпадениям.
    const scores = { word_count: wordCount, char_count: charCount, agency_markers: { active_count: activeCount, passive_count: passiveCount, ratio: agencyRatio }, ai_pending: true }
    const openAnswers = []
    SECTIONS.forEach(b => b.questions.forEach(qq => openAnswers.push({ questionId: qq.id, text: answers[qq.id] || '' })))
    await CP.saveBlockResult(10, { answers, scores, durationSec: dur, openAnswers })
    await CP.saveLetter({ blocks: openAnswers, fullText, wordCount, charCount, agencyRatio })
    await CP.updateProfile({ letter_completed: true, letter_word_count: wordCount, agency_ratio: agencyRatio })
    clearDraft()
    setResult({ ...scores, durationSec: dur })
  }

  if (result) {
    return (
      <DiagShell num={10} title="ПИСЬМО ОТПРАВЛЕНО" pct={100}>
        <div className="result letter-result">
          <div className="letter-result__mascot"><JourneyMascot num={10} variant="sent" /></div>
          <div className="result-title">ПИСЬМО ОТПРАВЛЕНО</div>
          <div className="result-desc">Твоё письмо в будущее сохранено. Здесь остались твои сегодняшние мысли, мечты и цели. Позже ты сможешь вернуться к ним и посмотреть, что изменилось.</div>
          <p className="letter-storage-note">{isSupabaseConfigured
            ? 'Письмо сохранено в этом браузере. Для аккаунта работает синхронизация при доступном подключении. По электронной почте письмо не отправляется.'
            : 'Письмо хранится только в этом браузере. Если очистить данные сайта или открыть другой браузер, оно будет недоступно. По электронной почте письмо не отправляется.'}</p>
          <div className="letter-stat"><span><IconText text={"📝 "} />{result.word_count} слов</span><span><IconText text={"🕐 "} />{Math.ceil(result.durationSec / 60)} мин</span></div>
          <div className="result-summary">{blockSummary(10, result)}</div>
          <div style={{ background: 'var(--card)', border: '1px solid rgba(8,124,255,.2)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left', maxWidth: 440, margin: '0 auto 24px' }}>
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700, letterSpacing: 1, marginBottom: 8, fontFamily: "'JetBrains Mono',monospace" }}>ЧТО ДАЛЬШЕ</div>
            <div style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.7 }}>Посмотри результаты диагностики или вернись в кабинет. В блоке «Письмо в будущее» можно снова открыть свои ответы через «Изменить ответы».</div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-accent" onClick={() => navigate('/diagnostic')}><IconText text={"Посмотреть результаты 🧠"} /></button>
            <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}><IconText text={"В кабинет →"} /></button>
          </div>
        </div>
      </DiagShell>
    )
  }

  return (
    <DiagShell num={10} title="ПИСЬМО В БУДУЩЕЕ"
      desc="Напиши себе через 5 лет. О том, что радует, волнует и к чему хочется прийти. Здесь можно быть собой."
      mascotVariant={SECTION_SCENES[section.id] || 'values'} chapter={`Часть ${blockIdx + 1} из ${SECTIONS.length} · ${section.title}`}
      meta={['🕐 ~25 мин', '📝 19 вопросов', '✨ О мечтах и целях']} pct={pct}>
      <div className="q-area">
        <div className="letter-chapter"><span>{section.title}</span><span>Часть {blockIdx + 1} / {SECTIONS.length}</span></div>
        {qIdx === 0 && <p className="letter-chapter__desc">{section.desc}</p>}
        <div className="q-counter">{globalIdx + 1} / {totalQ}</div>
        <label htmlFor="letter-answer" className="q-prompt">{q.prompt}</label>
        <div className="q-hint" id="letter-hint">{q.hint}</div>
        <textarea id="letter-answer" aria-describedby="letter-hint" className="q-textarea" style={{ minHeight: 160 }} placeholder="Пиши свободно, как будто рассказываешь близкому другу..." value={answers[q.id] || ''} onChange={e => setText(e.target.value)} />
        <div className="nav-row">
          {globalIdx > 0 && <button className="btn btn-ghost" onClick={goBack}><IconText text={"← Назад"} /></button>}
          <button className="btn btn-gold" disabled={!(answers[q.id] || '').trim()} onClick={goForward}><IconText text={isLast ? 'Отправить письмо ✉️' : 'Далее →'} /></button>
        </div>
      </div>
    </DiagShell>
  )
}
