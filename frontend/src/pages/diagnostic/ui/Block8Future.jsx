import { useState } from 'react'
import { CP } from '../../../shared/api'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from '../model/useDiagBlock'
import useBlockDraft from '../model/useBlockDraft'

const QS = [
  { id: 'BUD1', t: 'Что для тебя важнее в будущей работе?', type: 'radio', opts: ['Стабильность', 'Рост и вызовы', 'Оба одинаково'] },
  { id: 'BUD2', t: 'Как ты относишься к риску?', type: 'radio', opts: ['Избегаю', 'Готов(а), если вижу смысл', 'Принимаю — риск = возможность'] },
  { id: 'BUD3', t: 'Где тебе комфортнее работать?', type: 'radio', opts: ['В команде', 'Самостоятельно', 'Зависит от задачи'] },
  { id: 'BUD4', t: 'Важна ли физическая активность в работе?', type: 'scale', lo: 'Сидячая работа ок', hi: 'Хочу двигаться' },
  { id: 'BUD5', t: 'Баланс между работой и личной жизнью?', type: 'scale', lo: 'Работа на первом месте', hi: 'Личная жизнь важнее' },
  { id: 'BUD6', t: 'Насколько важно, чтобы другие ценили твои успехи?', type: 'scale', lo: 'Совсем не важно', hi: 'Очень важно' },
  { id: 'BUD11', t: 'Насколько высокий доход для тебя важен?', type: 'scale', lo: 'Не главное', hi: 'Один из главных критериев' },
  { id: 'BUD12', t: 'Насколько важно самому определять, как и когда работать?', type: 'scale', lo: 'Готов к чётким рамкам', hi: 'Свобода критична' },
  { id: 'BUD13', t: 'Что тебе ближе?', type: 'radio', opts: ['Спокойная стабильная жизнь', 'Заметный профессиональный успех', 'Желание оставить значимый след'] },
  { id: 'BUD14', t: 'Хотел(а) бы работать в другой стране?', type: 'radio', opts: ['Да, это мечта', 'Не исключаю', 'Нет, хочу остаться'] },
  { id: 'BUD7', t: 'Насколько ясно ты представляешь себя через 5 лет?', type: 'scale', lo: 'Совсем не ясно', hi: 'Очень ясно' },
  { id: 'BUD8', t: 'Готов(а) ли активно учиться ещё 4–6 лет после школы?', type: 'scale', lo: 'Совсем не готов(а)', hi: 'Полностью готов(а)' },
  { id: 'BUD9', t: 'Готов(а) к долгому пути к цели — 7–10 лет серьёзного труда?', type: 'scale', lo: 'Не готов(а)', hi: 'Полностью готов(а)' },
]
const OPEN = [
  { id: 'role_model', title: 'Ролевая модель', text: 'Кем ты восхищаешься — реальный человек или персонаж? Почему именно он/она? Что цепляет?' },
  { id: 'mission', title: 'Миссия', text: 'Что тебя злит или расстраивает в мире? Что ты хотел(а) бы изменить или сделать лучше?' },
]
const TOTAL = QS.length + OPEN.length

export default function Block8Future() {
  const { ready, timerRef, goNext } = useDiagBlock(8)
  const [phase, setPhase] = useState('closed')
  const [idx, setIdx] = useState(0)
  const [ans] = useState(() => ({}))
  const [sel, setSel] = useState(null)
  const [openTexts, setOpenTexts] = useState(['', ''])
  const [result, setResult] = useState(null)
  const clearDraft = useBlockDraft({
    blockNum: 8, ready,
    snapshot: () => ({ phase, idx, ans, openTexts }),
    restore: (d) => {
      if (d.ans) Object.assign(ans, d.ans)
      if (Array.isArray(d.openTexts)) setOpenTexts(d.openTexts)
      if (d.phase) setPhase(d.phase)
      if (typeof d.idx === 'number') setIdx(d.idx)
    },
    deps: [phase, idx, openTexts],
  })
  if (!ready) return null

  const done = phase === 'closed' ? idx : QS.length + idx
  const pct = result ? 100 : Math.round(done / TOTAL * 100)

  function next() { const ni = idx + 1; setSel(null); if (ni >= QS.length) { setPhase('open'); setIdx(0) } else setIdx(ni) }
  function pickR(i) { ans[QS[idx].id] = i; setSel(i); setTimeout(next, 250) }
  function pickS(v) { ans[QS[idx].id] = v; setSel(v); setTimeout(next, 200) }
  function saveOpen() { const ni = idx + 1; if (ni >= OPEN.length) submit(); else setIdx(ni) }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const work_profile = {
      stability_vs_growth: ['stability', 'growth', 'both'][ans.BUD1 || 0],
      risk_tolerance: ['avoid', 'calculated', 'embrace'][ans.BUD2 || 0],
      solo_vs_team: ['team', 'solo', 'depends'][ans.BUD3 || 0],
      physical_activity: ans.BUD4 || 3, work_life_balance: ans.BUD5 || 3,
      recognition_need: ans.BUD6 || 3, income_importance: ans.BUD11 || 3,
      autonomy_importance: ans.BUD12 || 3,
      ambition_level: ['calm', 'success', 'legacy'][ans.BUD13 || 0],
      international: ['yes', 'maybe', 'no'][ans.BUD14 || 0],
    }
    const career_clarity = ans.BUD7 || 3, learning_readiness = ans.BUD8 || 3, long_term_readiness = ans.BUD9 || 3
    const flags = []
    if (career_clarity <= 2 && learning_readiness <= 2) flags.push({ code: 'low_readiness_overall', level: 'warning' })
    const scores = { work_profile, career_clarity, learning_readiness, long_term_readiness, flags }
    await CP.saveBlockResult(8, { answers: ans, scores, durationSec: dur, openAnswers: OPEN.map((o, i) => ({ questionId: o.id, text: openTexts[i] })) })
    await CP.updateProfile({ work_profile, career_clarity, learning_readiness, long_term_readiness })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ ...scores, durationSec: dur })
  }

  if (result) {
    const envMap = { stability: 'Стабильная', growth: 'Развивающая', both: 'Гибкая' }
    const ambMap = { calm: 'Спокойная жизнь', success: 'Проф. успех', legacy: 'Значимый след' }
    const bar = v => '■'.repeat(v) + '□'.repeat(5 - v) + ` (${v}/5)`
    return (
      <DiagShell num={8} title="ОБРАЗ БУДУЩЕГО" pct={100}>
        <div className="result">
          <div className="result-icon">🔮</div>
          <div className="result-title">ОБРАЗ БУДУЩЕГО</div>
          <div className="result-desc">Параметры будущей работы и готовность к пути сохранены в твой профиль.</div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Среда</div><div className="r-val r-accent">{envMap[result.work_profile.stability_vs_growth]}</div></div>
            <div className="r-card"><div className="r-label">Амбиции</div><div className="r-val r-violet">{ambMap[result.work_profile.ambition_level]}</div></div>
            <div className="r-card"><div className="r-label">Ясность будущего</div><div className="r-val" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{bar(result.career_clarity)}</div></div>
            <div className="r-card"><div className="r-label">Готовность учиться</div><div className="r-val" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>{bar(result.learning_readiness)}</div></div>
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
        <div className="q-counter">{idx + 1} / {QS.length}</div>
        <div className="q-text">{q.t}</div>
        {q.type === 'radio'
          ? q.opts.map((o, i) => <div key={i} className={'opt-card' + (sel === i ? ' sel' : '')} onClick={() => pickR(i)}><div className="opt-dot"></div><div>{o}</div></div>)
          : <><div className="scale-labels"><span>{q.lo}</span><span>{q.hi}</span></div><div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (sel === n ? ' sel' : '')} onClick={() => pickS(n)}>{n}</button>)}</div></>}
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
        <div className="nav-row"><button className="btn btn-accent" onClick={saveOpen}>{idx < OPEN.length - 1 ? 'Далее →' : 'Завершить блок ✓'}</button></div>
      </>
    )
  }

  return (
    <DiagShell num={8} title="ОБРАЗ БУДУЩЕГО"
      desc="Какой ты видишь будущую работу и жизнь. Закрытые вопросы + два открытых о смыслах."
      meta={['🕐 ~10 мин', '📝 16 заданий', '✨ ИИ-анализ']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
