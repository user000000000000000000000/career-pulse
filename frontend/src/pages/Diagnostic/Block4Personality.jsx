import { useState } from 'react'
import CP from '../../services/cpStorage'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from './useDiagBlock'

const QS = [
  { id: 'B1', t: 'Когда у кого-то неприятности, я хочу помочь — даже если меня не просят', s: 'agreeableness' },
  { id: 'B2', t: 'Я стараюсь избегать конфликтов и искать компромисс', s: 'agreeableness' },
  { id: 'B3', t: 'Мне важно, чтобы всем в группе было комфортно, а не только мне', s: 'agreeableness' },
  { id: 'B4r', t: 'Иногда мне всё равно, что чувствуют другие, если я уверен(а) в своей правоте', s: 'agreeableness', r: true },
  { id: 'B5r', t: 'Если кто-то не справляется — это его проблема, не моя', s: 'agreeableness', r: true },
  { id: 'D1', t: 'Перед важным делом я стараюсь всё спланировать заранее', s: 'conscientiousness' },
  { id: 'D2', t: 'Порядок на рабочем месте и в делах помогает мне чувствовать себя лучше', s: 'conscientiousness' },
  { id: 'D3', t: 'Если мне задали проект на месяц, я обычно начинаю работать заранее, а не в последнюю неделю', s: 'conscientiousness' },
  { id: 'D4r', t: 'Я часто откладываю важные дела до последнего момента', s: 'conscientiousness', r: true },
  { id: 'D5r', t: 'Мне сложно поддерживать порядок — вещи, файлы, планы часто оказываются в хаосе', s: 'conscientiousness', r: true },
  { id: 'E1', t: 'Я легко знакомлюсь с новыми людьми и быстро чувствую себя в компании своим', s: 'extraversion' },
  { id: 'E2', t: 'После шумного дня с людьми я чувствую прилив сил, а не усталость', s: 'extraversion' },
  { id: 'E3', t: 'В группе я обычно первым начинаю разговор или предлагаю идеи', s: 'extraversion' },
  { id: 'E4r', t: 'Мне тяжело в больших компаниях — я быстро устаю от общения', s: 'extraversion', r: true },
  { id: 'E5r', t: 'Я предпочту провести выходные в одиночестве, чем на вечеринке', s: 'extraversion', r: true },
  { id: 'OP1', t: 'Мне интересно изучать темы, которые далеки от школьной программы', s: 'openness' },
  { id: 'OP2', t: 'Я люблю, когда появляется что-то новое — новые места, идеи, форматы', s: 'openness' },
  { id: 'OP3', t: 'Мне нравится думать о необычных вопросах — смысл жизни, устройство мира', s: 'openness' },
  { id: 'OP4r', t: 'Я предпочитаю делать то, что уже знаю, а не пробовать незнакомое', s: 'openness', r: true },
  { id: 'OP5r', t: 'Мне неинтересно абстрактное искусство, философия или эксперименты — мне ближе конкретные вещи', s: 'openness', r: true },
  { id: 'ST1', t: 'Когда всё идёт не по плану, я быстро перестраиваюсь и ищу выход', s: 'stress_resilience' },
  { id: 'ST2', t: 'Под давлением дедлайна я могу собраться и работать эффективно', s: 'stress_resilience' },
  { id: 'ST3', t: 'Неудача расстраивает меня, но не надолго — я быстро двигаюсь дальше', s: 'stress_resilience' },
  { id: 'ST4r', t: 'Когда накапливается много задач одновременно, я теряюсь и не знаю, за что взяться', s: 'stress_resilience', r: true },
  { id: 'ST5r', t: 'После стресса мне нужно много времени, чтобы вернуться в нормальное состояние', s: 'stress_resilience', r: true },
  { id: 'TR1', t: 'Я часто беспокоюсь о будущем — даже когда всё идёт нормально', s: 'anxiety' },
  { id: 'TR2', t: 'Я склонен(на) представлять худший сценарий раньше, чем он случится', s: 'anxiety' },
  { id: 'TR3', t: 'Чужое мнение обо мне влияет на моё настроение больше, чем хотелось бы', s: 'anxiety' },
  { id: 'TR4r', t: 'Я легко отпускаю ситуации — если что-то случилось, я не прокручиваю это в голове', s: 'anxiety', r: true },
  { id: 'TR5r', t: 'Перед новым и незнакомым я чувствую скорее интерес, чем страх', s: 'anxiety', r: true },
  { id: 'IK1', t: 'Если я злюсь, я могу сдержаться и не показывать это сразу', s: 'impulse_control' },
  { id: 'IK2', t: 'Я умею ждать — могу отказаться от чего-то приятного сейчас ради лучшего результата потом', s: 'impulse_control' },
  { id: 'IK3', t: 'Прежде чем отправить сообщение на эмоциях, я обычно даю себе паузу', s: 'impulse_control' },
  { id: 'IK4r', t: 'Мне сложно удержаться от того, что хочется сделать прямо сейчас — даже если это не вовремя', s: 'impulse_control', r: true },
  { id: 'IK5r', t: 'Бывает, я говорю или делаю что-то под влиянием момента, а потом жалею', s: 'impulse_control', r: true },
  { id: 'TN1', t: 'Мне комфортно начинать дело, даже если не всё понятно заранее', s: 'ambiguity_tolerance' },
  { id: 'TN2', t: 'Когда нет чёткого плана, я всё равно могу двигаться вперёд', s: 'ambiguity_tolerance' },
  { id: 'TN3', t: 'Неизвестность вызывает у меня скорее интерес, чем тревогу', s: 'ambiguity_tolerance' },
  { id: 'TN4r', t: 'Мне некомфортно, если я не знаю точно, что будет дальше', s: 'ambiguity_tolerance', r: true },
  { id: 'TN5r', t: 'Я предпочитаю задачи с чётким условием — не люблю, когда «думай сам что делать»', s: 'ambiguity_tolerance', r: true },
  { id: 'SJ1', t: 'Я никогда не обманываю — даже по мелочам', s: 'sj' },
  { id: 'SJ2', t: 'Я всегда выполняю абсолютно все обещания, которые даю', s: 'sj' },
  { id: 'SJ3', t: 'Я никогда не завидую другим людям', s: 'sj' },
  { id: 'SJ4', t: 'Я никогда не говорю о людях плохо за их спиной', s: 'sj' },
]
const SCALE_NAMES = { agreeableness: 'Дружелюбие', conscientiousness: 'Добросовестность', extraversion: 'Экстраверсия', openness: 'Открытость опыту', stress_resilience: 'Стрессоустойчивость', anxiety: 'Тревожность', impulse_control: 'Управление импульсами', ambiguity_tolerance: 'Толерантность к неопр.' }
const SCALE_COLORS = { agreeableness: '#00e5c8', conscientiousness: '#7b5cf0', extraversion: '#ff6b35', openness: '#f5c842', stress_resilience: '#22d97a', anxiety: '#ff4d6d', impulse_control: '#00a8e0', ambiguity_tolerance: '#a480f8' }
const ARCHETYPES = [
  { name: 'Исследователь возможностей', needs: ['openness', 'ambiguity_tolerance', 'extraversion'] },
  { name: 'Устойчивый лидер', needs: ['stress_resilience', 'extraversion', 'ambiguity_tolerance'] },
  { name: 'Надёжный исполнитель', needs: ['conscientiousness', 'impulse_control'], anti: ['ambiguity_tolerance'] },
  { name: 'Чуткий творец', needs: ['openness', 'agreeableness'], high_anxiety: true },
  { name: 'Свободный деятель', needs: ['ambiguity_tolerance', 'openness'], anti: ['conscientiousness'] },
]
const MAIN = ['agreeableness', 'conscientiousness', 'extraversion', 'openness', 'stress_resilience', 'anxiety', 'impulse_control', 'ambiguity_tolerance']
const TOTAL = QS.length

export default function Block4Personality() {
  const { ready, timerRef, goNext } = useDiagBlock(4)
  const [qIdx, setQIdx] = useState(0)
  const [answers] = useState(() => ({}))
  const [sel, setSel] = useState(null)
  const [result, setResult] = useState(null)
  if (!ready) return null
  const pct = result ? 100 : Math.round(qIdx / TOTAL * 100)

  function pick(v) {
    answers[QS[qIdx].id] = v
    setSel(v)
    setTimeout(() => {
      const ni = qIdx + 1
      setSel(null)
      if (ni >= TOTAL) submit()
      else setQIdx(ni)
    }, 220)
  }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const scaleItems = {}; QS.forEach(q => { (scaleItems[q.s] = scaleItems[q.s] || []).push(q) })
    const scores = {}
    MAIN.forEach(scale => {
      let raw = 0
      scaleItems[scale].forEach(q => { let val = answers[q.id] || 3; if (q.r) val = 6 - val; raw += val })
      const p = Math.round((raw - 5) / 20 * 100 * 10) / 10
      scores[scale] = { raw, pct: Math.max(0, Math.min(100, p)) }
    })
    const sjItems = scaleItems['sj'] || []
    const sjScores = sjItems.map(q => answers[q.id] || 3)
    const sjFives = sjScores.filter(v => v === 5).length
    const sjFlag = sjFives >= 3
    const sjMean = sjScores.reduce((a, b) => a + b, 0) / sjScores.length
    const sincerity = Math.round(100 - (sjMean - 1) / 4 * 100)
    const consistency = {}
    MAIN.forEach(scale => {
      const items = scaleItems[scale]
      const direct = items.filter(q => !q.r).map(q => answers[q.id] || 3)
      const reverse = items.filter(q => q.r).map(q => 6 - (answers[q.id] || 3))
      const dAvg = direct.reduce((a, b) => a + b, 0) / direct.length
      const rAvg = reverse.reduce((a, b) => a + b, 0) / reverse.length
      consistency[scale] = { delta: Math.round(Math.abs(dAvg - rAvg) * 10) / 10, ok: Math.abs(dAvg - rAvg) <= 2 }
    })
    const ranked = MAIN.filter(s => s !== 'anxiety').map(s => ({ s, pct: scores[s].pct })).sort((a, b) => b.pct - a.pct)
    const top3 = ranked.slice(0, 3).map(r => r.s)
    let archetype = 'Индивидуальный профиль'
    ARCHETYPES.forEach(a => {
      const needsMet = a.needs.every(n => scores[n].pct >= 60)
      const antiMet = !a.anti || a.anti.every(n => scores[n].pct < 40)
      const anxMet = !a.high_anxiety || scores.anxiety.pct > 60
      if (needsMet && antiMet && anxMet) archetype = a.name
    })
    const flags = []
    if (scores.anxiety.pct > 70 && scores.stress_resilience.pct < 40) flags.push({ code: 'high_vulnerability', level: 'critical' })
    if (scores.impulse_control.pct < 30 && scores.conscientiousness.pct < 30) flags.push({ code: 'low_self_regulation', level: 'warning' })
    if (scores.openness.pct < 30) flags.push({ code: 'low_openness', level: 'info' })
    if (sjFlag) flags.push({ code: 'low_sincerity', level: 'warning' })
    Object.entries(consistency).forEach(([s, c]) => { if (!c.ok) flags.push({ code: 'inconsistent_' + s, level: 'warning' }) })
    if (scores.ambiguity_tolerance.pct > 70 && scores.conscientiousness.pct < 30) flags.push({ code: 'freedom_without_discipline', level: 'info' })
    const scoresFlat = {}; MAIN.forEach(s => { scoresFlat[s] = scores[s].pct })
    await CP.saveBlockResult(4, { answers, scores: { ...scoresFlat, personality_archetype: archetype, top3_strengths: top3, sincerity_index: sincerity, social_desirability_flag: sjFlag, flags }, durationSec: dur })
    await CP.updateProfile({ personality_scores: scoresFlat, personality_archetype: archetype, sincerity_index: sincerity, social_desirability_flag: sjFlag, ambiguity_tolerance_pct: scores.ambiguity_tolerance.pct })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ sc: scores, archetype, top3, sincerity, durationSec: dur })
  }

  if (result) {
    return (
      <DiagShell num={4} title="ЛИЧНОСТНЫЕ КАЧЕСТВА" pct={100}>
        <div className="result">
          <div className="result-icon">🧠</div>
          <div className="result-title">{result.archetype.toUpperCase()}</div>
          <div className="result-desc">Твои сильные стороны: <b>{result.top3.map(s => SCALE_NAMES[s]).join(', ')}</b></div>
          <div style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            {MAIN.map(s => (
              <div key={s} className="bar-row">
                <div className="bar-lbl">{SCALE_NAMES[s]}</div>
                <div className="bar-track"><div className="bar-fill" style={{ width: result.sc[s].pct + '%', background: SCALE_COLORS[s] }}></div></div>
                <div className="bar-val">{Math.round(result.sc[s].pct)}</div>
              </div>
            ))}
          </div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Индекс искренности</div><div className={'r-val ' + (result.sincerity >= 70 ? 'r-accent' : 'r-violet')}>{result.sincerity}%</div></div>
            <div className="r-card"><div className="r-label">Время</div><div className="r-val">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  const q = QS[qIdx]
  return (
    <DiagShell num={4} title="ЛИЧНОСТНЫЕ КАЧЕСТВА"
      desc="Оцени каждое утверждение от 1 до 5. Описывай себя как есть, а не как хотелось бы. Каждый профиль по-своему сильный."
      meta={['🕐 ~15 мин', '📝 44 утверждения', '🧠 Big Five+']} pct={pct}>
      <div className="q-area">
        <div className="q-counter">{qIdx + 1} / {TOTAL}</div>
        <div className="q-text">{q.t}</div>
        <div className="scale-labels" style={{ maxWidth: 360 }}><span>Совсем не про меня</span><span>Точно про меня</span></div>
        <div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (sel === n ? ' sel' : '')} onClick={() => pick(n)}>{n}</button>)}</div>
        <div className="scale-hint"><span>1 — нет</span><span>2 — скорее нет</span><span>3 — иногда</span><span>4 — скорее да</span><span>5 — да</span></div>
      </div>
    </DiagShell>
  )
}
