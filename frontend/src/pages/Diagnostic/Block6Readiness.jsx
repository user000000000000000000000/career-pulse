import { useState } from 'react'
import CP from '../../services/cpStorage'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from './useDiagBlock'

const TYPES = [
  { code: 'HH', name: 'Человек–Человек', icon: '👥' }, { code: 'HT', name: 'Человек–Техника', icon: '🔧' },
  { code: 'HZ', name: 'Человек–Знак', icon: '📊' }, { code: 'HX', name: 'Человек–Образ', icon: '🎨' }, { code: 'HP', name: 'Человек–Природа', icon: '🌿' },
]
const QS = [
  { id: 'HH1', t: 'Мне хорошо удаётся объяснить что-то другому так, чтобы он понял', type: 'HH', tag: 'self' },
  { id: 'HH2', t: 'Я умею слушать и чувствовать, что нужно человеку', type: 'HH', tag: 'self' },
  { id: 'HH3', t: 'Мне удаётся находить общий язык даже с трудными людьми', type: 'HH', tag: 'self' },
  { id: 'HH4', t: 'За последние полгода ко мне обращались за помощью или советом', type: 'HH', tag: 'behav' },
  { id: 'HH5', t: 'Я проводил(а) объяснение темы, урок или мастер-класс для других', type: 'HH', tag: 'behav' },
  { id: 'HH6', t: 'Мне приходилось улаживать конфликт или примирять людей', type: 'HH', tag: 'behav' },
  { id: 'HT1', t: 'Мне хорошо удаётся разбираться в устройстве технических вещей', type: 'HT', tag: 'self' },
  { id: 'HT2', t: 'Я могу починить или собрать что-то — руками или с помощью инструментов', type: 'HT', tag: 'self' },
  { id: 'HT3', t: 'Мне удаётся работать с техникой: компьютер, устройства, механизмы', type: 'HT', tag: 'self' },
  { id: 'HT4', t: 'Я самостоятельно настраивал(а), ремонтировал(а) или собирал(а) технику', type: 'HT', tag: 'behav' },
  { id: 'HT5', t: 'Меня просили помочь с компьютером, телефоном или другим устройством', type: 'HT', tag: 'behav' },
  { id: 'HT6', t: 'Я создавал(а) что-то техническое: программу, модель, устройство, схему', type: 'HT', tag: 'behav' },
  { id: 'HZ1', t: 'Мне хорошо удаётся работать с текстами — читать, писать, редактировать', type: 'HZ', tag: 'self' },
  { id: 'HZ2', t: 'Я могу разобраться в таблице с данными или в числовых отчётах', type: 'HZ', tag: 'self' },
  { id: 'HZ3', t: 'Мне удаётся замечать ошибки — в тексте, в расчётах, в логике', type: 'HZ', tag: 'self' },
  { id: 'HZ4', t: 'Я написал(а) текст, статью, отзыв или пост, который кто-то оценил', type: 'HZ', tag: 'behav' },
  { id: 'HZ5', t: 'Мне приходилось работать с реальными данными — таблицы, отчёты, статистика', type: 'HZ', tag: 'behav' },
  { id: 'HZ6', t: 'Я проверял(а) чью-то работу на ошибки — текст, расчёты, код', type: 'HZ', tag: 'behav' },
  { id: 'HX1', t: 'Мне хорошо удаётся создавать визуальное — рисунок, оформление, видео', type: 'HX', tag: 'self' },
  { id: 'HX2', t: 'У меня есть чувство стиля — я замечаю красоту, гармонию, дисгармонию', type: 'HX', tag: 'self' },
  { id: 'HX3', t: 'Мне удаётся придумывать оригинальные идеи и воплощать их', type: 'HX', tag: 'self' },
  { id: 'HX4', t: 'Я создал(а) что-то творческое, что показывал(а) другим', type: 'HX', tag: 'behav' },
  { id: 'HX5', t: 'Меня просили оформить что-то — презентацию, пост, открытку, пространство', type: 'HX', tag: 'behav' },
  { id: 'HX6', t: 'Я участвовал(а) в творческом проекте, конкурсе или выступлении', type: 'HX', tag: 'behav' },
  { id: 'HP1', t: 'Мне хорошо удаётся наблюдать за живым миром — растениями, животными', type: 'HP', tag: 'self' },
  { id: 'HP2', t: 'Мне нравится и получается заботиться о живых существах', type: 'HP', tag: 'self' },
  { id: 'HP3', t: 'Меня привлекают вопросы здоровья, экологии, биологических процессов', type: 'HP', tag: 'self' },
  { id: 'HP4', t: 'Я ухаживал(а) за растениями, животными или участвовал(а) в экологических проектах', type: 'HP', tag: 'behav' },
  { id: 'HP5', t: 'Я самостоятельно изучал(а) темы биологии, экологии или медицины вне школы', type: 'HP', tag: 'behav' },
  { id: 'HP6', t: 'Мне приходилось помогать кому-то с вопросами здоровья или ухода за живым', type: 'HP', tag: 'behav' },
]
const TYPE_NAMES = { HH: 'Человек–Человек', HT: 'Человек–Техника', HZ: 'Человек–Знак', HX: 'Человек–Образ', HP: 'Человек–Природа' }
const TYPE_COLORS = { HH: '#00e5c8', HT: '#7b5cf0', HZ: '#ff6b35', HX: '#f5c842', HP: '#22d97a' }
const OPEN_PROMPTS = [
  { title: 'Дело, которое получается', text: 'Расскажи о деле, которое у тебя хорошо получается — неважно, школьное это или нет. Что это? Почему думаешь, что получается хорошо? Как давно этим занимаешься?' },
  { title: 'Кейс признания', text: 'Вспомни ситуацию, когда кто-то попросил тебя помочь именно потому, что ты умеешь это лучше других. Что это было? Кто попросил? Какой результат?' },
]
const TOTAL = QS.length + 2

export default function Block6Readiness() {
  const { ready, timerRef, goNext } = useDiagBlock(6)
  const [phase, setPhase] = useState('closed')
  const [idx, setIdx] = useState(0)
  const [ans] = useState(() => ({}))
  const [sel, setSel] = useState(null)
  const [openTexts, setOpenTexts] = useState(['', ''])
  const [result, setResult] = useState(null)
  if (!ready) return null

  const done = phase === 'closed' ? idx : phase === 'open1' ? 30 : 31
  const pct = result ? 100 : Math.round(done / TOTAL * 100)

  function pick(v) {
    ans[QS[idx].id] = v; setSel(v)
    setTimeout(() => { const ni = idx + 1; setSel(null); if (ni >= QS.length) setPhase('open1'); else setIdx(ni) }, 180)
  }
  function saveOpen(num) {
    if (num === 0) setPhase('open2')
    else submit()
  }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const readiness = {}
    TYPES.forEach(tp => {
      const items = QS.filter(q => q.type === tp.code)
      const selfItems = items.filter(q => q.tag === 'self').map(q => ans[q.id] || 3)
      const behavItems = items.filter(q => q.tag === 'behav').map(q => ans[q.id] || 3)
      const selfAvg = selfItems.reduce((a, b) => a + b, 0) / selfItems.length
      const behavAvg = behavItems.reduce((a, b) => a + b, 0) / behavItems.length
      const abilityPct = Math.round((selfAvg - 1) / 4 * 1000) / 10
      const expPct = Math.round((behavAvg - 1) / 4 * 1000) / 10
      const combined = Math.round((abilityPct * 0.4 + expPct * 0.6) * 10) / 10
      const gap = abilityPct - expPct
      const gapType = gap > 30 ? 'overconfident' : gap < -30 ? 'underconfident' : 'aligned'
      readiness[tp.code] = { ability_pct: abilityPct, experience_pct: expPct, combined, gap: gapType }
    })
    const sorted = Object.entries(readiness).sort((a, b) => b[1].combined - a[1].combined)
    const top2 = sorted.slice(0, 2).map(s => s[0])
    const avgExp = Object.values(readiness).reduce((s, r) => s + r.experience_pct, 0) / 5
    const hasStrong = Object.values(readiness).some(r => r.experience_pct > 60)
    const avgGap = Object.values(readiness).reduce((s, r) => s + Math.abs(r.ability_pct - r.experience_pct), 0) / 5
    const maturitySignals = [Math.min(avgExp / 100, 1), hasStrong ? 1 : 0.3, Math.max(1 - avgGap / 100, 0)]
    const openLen = openTexts.reduce((s, t) => s + t.length, 0)
    maturitySignals.push(openLen > 200 ? 1 : openLen > 80 ? 0.6 : 0.3)
    const careerMaturity = Math.round(maturitySignals.reduce((a, b) => a + b, 0) / maturitySignals.length * 100)
    const flags = []
    Object.entries(readiness).forEach(([code, r]) => {
      if (r.gap === 'overconfident') flags.push({ code: 'overconfident_' + code, level: 'info' })
      if (r.gap === 'underconfident') flags.push({ code: 'underconfident_' + code, level: 'info' })
    })
    if (dur < 180) flags.push({ code: 'readiness_too_fast', level: 'warning' })
    const scores = { readiness_scores: readiness, readiness_top2: top2, career_maturity: careerMaturity, flags }
    await CP.saveBlockResult(6, { answers: ans, scores, durationSec: dur, openAnswers: [{ questionId: 'skill', text: openTexts[0] }, { questionId: 'recognition', text: openTexts[1] }] })
    await CP.updateProfile({ readiness_top2: top2, readiness_scores: readiness, career_maturity: careerMaturity })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ readiness, top2, careerMaturity, durationSec: dur })
  }

  if (result) {
    return (
      <DiagShell num={6} title="ПРОФЕССИОНАЛЬНАЯ ГОТОВНОСТЬ" pct={100}>
        <div className="result">
          <div className="result-icon">⚙️</div>
          <div className="result-title">{TYPE_NAMES[result.top2[0]]} + {TYPE_NAMES[result.top2[1]]}</div>
          <div className="result-desc">Лучше всего у тебя получается: <b>{TYPE_NAMES[result.top2[0]]}</b> и <b>{TYPE_NAMES[result.top2[1]]}</b></div>
          <div style={{ maxWidth: 460, margin: '0 auto 20px' }}>
            {Object.entries(result.readiness).sort((a, b) => b[1].combined - a[1].combined).map(([code, d]) => {
              const c = TYPE_COLORS[code]
              return (
                <div key={code} className="dual-bar">
                  <div className="dual-label">{TYPE_NAMES[code]}</div>
                  <div className="dual-tracks">
                    <div className="dtrack"><div className="dtrack-lbl">Самооценка</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: d.ability_pct + '%', background: c, opacity: .6 }}></div></div><div className="dtrack-val">{Math.round(d.ability_pct)}</div></div>
                    <div className="dtrack"><div className="dtrack-lbl">Опыт</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: d.experience_pct + '%', background: c }}></div></div><div className="dtrack-val">{Math.round(d.experience_pct)}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Проф. зрелость</div><div className="r-val" style={{ color: result.careerMaturity >= 60 ? 'var(--accent)' : result.careerMaturity >= 40 ? 'var(--violet)' : 'var(--ember)' }}>{result.careerMaturity}/100</div></div>
            <div className="r-card"><div className="r-label">Время</div><div className="r-val">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  let body = null
  if (phase === 'closed') {
    const q = QS[idx]; const ti = TYPES.find(t => t.code === q.type)
    body = (
      <>
        <div className="type-badge">{ti.icon} {ti.name}</div>
        <div className="q-counter">{idx + 1} / 30</div>
        <div style={{ textAlign: 'center' }}><span className={'q-tag ' + (q.tag === 'self' ? 'tag-self' : 'tag-behav')}>{q.tag === 'self' ? 'Самооценка' : 'Реальный опыт'}</span></div>
        <div className="q-text">{q.t}</div>
        <div className="scale-labels" style={{ maxWidth: 340 }}><span>Совсем нет</span><span>Это моё сильное место</span></div>
        <div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (sel === n ? ' sel' : '')} onClick={() => pick(n)}>{n}</button>)}</div>
      </>
    )
  } else {
    const num = phase === 'open1' ? 0 : 1
    const p = OPEN_PROMPTS[num]
    body = (
      <>
        <div className="q-counter" style={{ color: 'var(--gold)' }}>Открытый вопрос {num + 1} / 2</div>
        <div className="q-text">{p.title}</div>
        <div className="q-text" style={{ fontSize: 13, color: 'var(--ghost)', marginTop: -12, fontWeight: 400 }}>{p.text}</div>
        <textarea className="q-textarea" placeholder="Минимум 3–5 предложений..." maxLength={500}
          value={openTexts[num]} onChange={e => { const c = [...openTexts]; c[num] = e.target.value; setOpenTexts(c) }} />
        <div className="char-count">{openTexts[num].length} / 500</div>
        <div className="nav-row"><button className="btn btn-accent" onClick={() => saveOpen(num)}>{num === 0 ? 'Далее →' : 'Завершить блок ✓'}</button></div>
      </>
    )
  }

  return (
    <DiagShell num={6} title="ПРОФЕССИОНАЛЬНАЯ ГОТОВНОСТЬ"
      desc="Не что нравится, а что реально получается. Часть вопросов — про самооценку, часть — про реальный опыт."
      meta={['🕐 ~15 мин', '📝 32 задания', '⚙️ Вектор + JamSkills']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
