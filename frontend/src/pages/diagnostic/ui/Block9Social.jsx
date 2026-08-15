import { useState } from 'react'
import { CP } from '../../../shared/api'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from '../model/useDiagBlock'
import useBlockDraft from '../model/useBlockDraft'

const QS = [
  { id: 'A1', t: 'Знаешь ли ты, кем работают твои родители?', sec: '👨‍👩‍👧 Семья', opts: ['Хорошо знаю', 'В общих чертах', 'Почти не знаю'], enc: [5, 3, 1] },
  { id: 'A2', t: 'Есть ли профессия в семье, которую тебе советуют продолжить?', sec: '👨‍👩‍👧 Семья', opts: ['Да, активно', 'Намекают', 'Нет, выбираю сам(а)'], enc: [5, 3, 1] },
  { id: 'A3', t: 'Как в семье реагируют на твои идеи о профессии?', sec: '👨‍👩‍👧 Семья', opts: ['Поддерживают', 'Нейтрально', 'Критикуют', 'Нет идей пока'], enc: [5, 3, 1, 3] },
  { id: 'A4', t: 'Напряжение в семье вокруг темы учёбы и будущего?', sec: '👨‍👩‍👧 Семья', type: 'scale', lo: 'Нет напряжения', hi: 'Постоянное' },
  { id: 'A5', t: 'Кто обычно принимает решения о кружках, курсах, доп. занятиях?', sec: '👨‍👩‍👧 Семья', opts: ['Я сам(а)', 'Вместе с родителями', 'В основном родители'], enc: [5, 3, 1] },
  { id: 'B1', t: 'Есть ли рядом взрослый вне семьи, которому ты доверяешь?', sec: '🌐 Окружение', opts: ['Да', 'Есть, но редко общаемся', 'Нет'], enc: [5, 3, 1] },
  { id: 'B2', t: 'Как ты чувствуешь себя среди сверстников?', sec: '🌐 Окружение', opts: ['Легко нахожу общий язык', 'По-разному', 'Чаще один(а)'], enc: [5, 3, 1] },
  { id: 'B3', t: 'Участвуешь ли в объединениях — клубах, секциях, волонтёрстве?', sec: '🌐 Окружение', opts: ['Да, активно', 'Иногда', 'Нет'], enc: [5, 3, 1] },
  { id: 'B4', t: 'Есть ли человек, который верит в тебя и твои возможности?', sec: '🌐 Окружение', opts: ['Да', 'Наверное да', 'Нет'], enc: [5, 3, 1] },
  { id: 'B5', t: 'Твои друзья обычно:', sec: '🌐 Окружение', opts: ['Поддерживают мои интересы', 'Относятся нейтрально', 'Часто высмеивают или обесценивают'], enc: [5, 3, 1] },
  { id: 'V1', t: 'Был(а) ли опыт подработки, волонтёрства или стажировки?', sec: '💼 Опыт', opts: ['Да', 'Разово', 'Нет'], enc: [5, 3, 1] },
  { id: 'V2', t: 'Участвовал(а) в олимпиадах, конкурсах, проектах?', sec: '💼 Опыт', opts: ['Регулярно', 'Иногда', 'Нет'], enc: [5, 3, 1] },
  { id: 'V3', t: 'Есть ли портфолио — проекты, работы, достижения?', sec: '💼 Опыт', opts: ['Да', 'Кое-что, не собрано', 'Нет'], enc: [5, 3, 1] },
  { id: 'V4', t: 'Читаешь ли про какую-то сферу сам(а), из интереса?', sec: '💼 Опыт', opts: ['Регулярно', 'Иногда', 'Нет'], enc: [5, 3, 1] },
  { id: 'V5', t: 'Создавал(а) ли ты что-то самостоятельно — от идеи до результата?', sec: '💼 Опыт', opts: ['Да, несколько раз', 'Один раз', 'Нет'], enc: [5, 3, 1] },
  { id: 'G1', t: 'Есть ли занятие, которым занимаешься 2+ лет?', sec: '🎨 Хобби', opts: ['Да', 'Начинал(а), бросил(а)', 'Нет'], enc: [5, 3, 1] },
  { id: 'G2', t: 'Сколько часов в неделю на главное увлечение?', sec: '🎨 Хобби', opts: ['Больше 5 часов', '2–5 часов', 'Меньше 2 часов', 'Нет увлечений'], enc: [5, 4, 2, 1] },
  { id: 'G3', t: 'Хотел(а) бы связать хобби с профессией?', sec: '🎨 Хобби', opts: ['Да', 'Не против', 'Нет, хочу разделять'], enc: [5, 3, 1] },
  { id: 'D1', t: 'Чувствуешь ли поддержку в своём выборе?', sec: '🤝 Ресурсы', type: 'scale', lo: 'Совсем не чувствую', hi: 'Полностью поддерживают' },
  { id: 'D2', t: 'Финансовые ограничения при выборе образования?', sec: '🤝 Ресурсы', opts: ['Нет', 'Есть, но не критично', 'Серьёзные'], enc: [5, 3, 1] },
  { id: 'E1', t: 'Есть ли достижение, которым ты действительно гордишься?', sec: '🏆 Достижения', opts: ['Да', 'Нет'], enc: [5, 1] },
]
const OPEN = [
  { id: 'hobby', title: 'Главное увлечение', text: 'Расскажи о своём главном увлечении. Что это? Как давно? Почему именно это?' },
  { id: 'model', title: 'Человек-модель', text: 'Есть ли человек, на которого хочешь быть похожим? Что в нём привлекает?' },
]

export default function Block9Social() {
  const { ready, timerRef, goNext } = useDiagBlock(9)
  const [phase, setPhase] = useState('closed')
  const [idx, setIdx] = useState(0)
  const [ans] = useState(() => ({}))
  const [sel, setSel] = useState(null)
  const [showAchieve, setShowAchieve] = useState(false)
  const [achieveText, setAchieveText] = useState('')
  const [openTexts, setOpenTexts] = useState(['', ''])
  const [result, setResult] = useState(null)
  const clearDraft = useBlockDraft({
    blockNum: 9, ready,
    snapshot: () => ({ phase, idx, ans, showAchieve, achieveText, openTexts }),
    restore: (d) => {
      if (d.ans) Object.assign(ans, d.ans)
      if (typeof d.showAchieve === 'boolean') setShowAchieve(d.showAchieve)
      if (typeof d.achieveText === 'string') setAchieveText(d.achieveText)
      if (Array.isArray(d.openTexts)) setOpenTexts(d.openTexts)
      if (d.phase) setPhase(d.phase)
      if (typeof d.idx === 'number') setIdx(d.idx)
    },
    deps: [phase, idx, showAchieve, achieveText, openTexts],
  })
  if (!ready) return null

  const total = QS.length + (showAchieve ? 1 : 0) + OPEN.length
  const done = phase === 'closed' ? idx : phase === 'achieve' ? QS.length : QS.length + (showAchieve ? 1 : 0) + idx
  const pct = result ? 100 : Math.round(done / total * 100)

  function afterClosed() {
    setSel(null)
    if (showAchieve && !ans.E1a) { setPhase('achieve'); return }
    setPhase('open'); setIdx(0)
  }
  function pickR(i) {
    const q = QS[idx]; ans[q.id] = i
    if (q.id === 'E1' && i === 0) setShowAchieve(true)
    setSel(i)
    setTimeout(() => { const ni = idx + 1; if (ni >= QS.length) afterClosedWith(ni, q.id === 'E1' && i === 0); else { setIdx(ni); setSel(null) } }, 250)
  }
  function afterClosedWith(ni, justSetAchieve) {
    setSel(null)
    if ((showAchieve || justSetAchieve) && !ans.E1a) { setPhase('achieve') }
    else { setPhase('open'); setIdx(0) }
  }
  function pickS(v) { ans[QS[idx].id] = v; setSel(v); setTimeout(() => { const ni = idx + 1; setSel(null); if (ni >= QS.length) afterClosed(); else setIdx(ni) }, 200) }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const enc = id => { const q = QS.find(q => q.id === id); return q.enc ? q.enc[ans[id] || 0] : ans[id] || 3 }
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length
    const norm = v => Math.round((v - 1) / 4 * 100)
    const familySupport = norm(mean([enc('A3'), 6 - (ans.A4 || 3), ans.D1 || 3]))
    const socialSupport = norm(mean([enc('B1'), enc('B4'), enc('B5')]))
    const autonomy = norm(mean([enc('A5'), 5 - enc('A2')]))
    const experience = norm(mean([enc('V1'), enc('V2'), enc('V3'), enc('V5'), enc('G1')]))
    const pressure = norm(mean([ans.A4 || 3, enc('A2')]))
    const flags = []
    if (familySupport < 30 && socialSupport < 30) flags.push({ code: 'social_isolation', level: 'critical' })
    if (pressure > 70) flags.push({ code: 'high_family_pressure', level: 'warning' })
    if (autonomy < 30) flags.push({ code: 'low_autonomy', level: 'warning' })
    const scores = { family_support: familySupport, social_support: socialSupport, autonomy, experience, pressure, flags }
    const openAns = OPEN.map((o, i) => ({ questionId: o.id, text: openTexts[i] }))
    if (achieveText) openAns.push({ questionId: 'achievement', text: achieveText })
    clearDraft()
    await CP.saveBlockResult(9, { answers: { ...ans, E1a: achieveText }, scores, durationSec: dur, openAnswers: openAns })
    await CP.updateProfile({ family_support: familySupport, social_support: socialSupport, autonomy_pct: autonomy, experience_pct: experience, pressure_pct: pressure })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ ...scores, durationSec: dur })
  }

  if (result) {
    const level = v => v >= 60 ? 'Высокая' : v >= 40 ? 'Средняя' : 'Низкая'
    const clr = v => v >= 60 ? 'r-accent' : v >= 40 ? 'r-violet' : ''
    return (
      <DiagShell num={9} title="КОНТЕКСТ СОХРАНЁН" pct={100}>
        <div className="result">
          <div className="result-icon">🌐</div>
          <div className="result-title">КОНТЕКСТ СОХРАНЁН</div>
          <div className="result-desc">Профиль поддержки, опыта и ресурсов обновлён.</div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Поддержка семьи</div><div className={'r-val ' + clr(result.family_support)}>{level(result.family_support)} ({result.family_support}%)</div></div>
            <div className="r-card"><div className="r-label">Поддержка окружения</div><div className={'r-val ' + clr(result.social_support)}>{level(result.social_support)} ({result.social_support}%)</div></div>
            <div className="r-card"><div className="r-label">Автономия</div><div className={'r-val ' + clr(result.autonomy)}>{level(result.autonomy)} ({result.autonomy}%)</div></div>
            <div className="r-card"><div className="r-label">Опыт</div><div className={'r-val ' + clr(result.experience)}>{level(result.experience)} ({result.experience}%)</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  let body = null
  if (phase === 'closed') {
    const q = QS[idx]
    body = (
      <>
        <div className="type-badge">{q.sec}</div>
        <div className="q-counter">{idx + 1} / {QS.length}</div>
        <div className="q-text">{q.t}</div>
        {q.type === 'scale'
          ? <><div className="scale-labels"><span>{q.lo}</span><span>{q.hi}</span></div><div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (sel === n ? ' sel' : '')} onClick={() => pickS(n)}>{n}</button>)}</div></>
          : q.opts.map((o, i) => <div key={i} className={'opt-card' + (sel === i ? ' sel' : '')} onClick={() => pickR(i)}><div className="opt-dot"></div><div>{o}</div></div>)}
      </>
    )
  } else if (phase === 'achieve') {
    body = (
      <>
        <div className="type-badge">🏆 Достижения</div>
        <div className="q-text">Какое достижение? Расскажи кратко.</div>
        <textarea className="q-textarea" placeholder="1–3 предложения..." maxLength={300} value={achieveText} onChange={e => setAchieveText(e.target.value)} />
        <div className="char-count">{achieveText.length} / 300</div>
        <div className="nav-row"><button className="btn btn-accent" onClick={() => { ans.E1a = achieveText; setPhase('open'); setIdx(0) }}>Далее →</button></div>
      </>
    )
  } else {
    const o = OPEN[idx]
    body = (
      <>
        <div className="q-counter" style={{ color: 'var(--gold)' }}>Открытый {idx + 1} / {OPEN.length}</div>
        <div className="q-text">{o.title}</div>
        <div className="q-text" style={{ fontSize: 13, color: 'var(--ghost)', marginTop: -12, fontWeight: 400 }}>{o.text}</div>
        <textarea className="q-textarea" placeholder="Минимум 2–3 предложения..." maxLength={500} value={openTexts[idx]} onChange={e => { const c = [...openTexts]; c[idx] = e.target.value; setOpenTexts(c) }} />
        <div className="char-count">{openTexts[idx].length} / 500</div>
        <div className="nav-row"><button className="btn btn-accent" onClick={() => { const ni = idx + 1; if (ni >= OPEN.length) submit(); else setIdx(ni) }}>{idx < OPEN.length - 1 ? 'Далее →' : 'Завершить блок ✓'}</button></div>
      </>
    )
  }

  return (
    <DiagShell num={9} title="СОЦИАЛЬНЫЙ КОНТЕКСТ"
      desc="Семья, окружение, опыт и поддержка. Это помогает наставнику увидеть полную картину."
      meta={['🕐 ~10 мин', '📝 25 заданий', '✨ ИИ-анализ']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
