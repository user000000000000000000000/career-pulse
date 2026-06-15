import { useState } from 'react'
import CP from '../../services/cpStorage'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from './useDiagBlock'

const GEN = [
  { id: 'OSE1', t: 'Если я сталкиваюсь со сложной задачей, обычно нахожу способ её решить' },
  { id: 'OSE2', t: 'Даже после неудачи я продолжаю пробовать' },
  { id: 'OSE3', t: 'Обычно я справляюсь лучше, чем ожидаю от себя заранее' },
  { id: 'OSE4', t: 'Я верю, что смогу освоить что-то новое, если потрачу достаточно времени' },
  { id: 'OSE5', t: 'Когда мне говорят «это сложно» — это скорее мотивирует, чем пугает' },
]
const PROF = [
  { id: 'SS1', t: 'Я уверен(а), что смогу объяснить сложную вещь так, чтобы другой понял', d: 'S', sub: 'conf' },
  { id: 'SS2', t: 'Я верю, что смогу помочь человеку, который расстроен или растерян', d: 'S', sub: 'conf' },
  { id: 'SS3', t: 'Я уверен(а), что справлюсь в профессии, где главное — люди', d: 'S', sub: 'conf' },
  { id: 'SS4', t: 'Я хорошо представляю, чем занимаются люди в социальных профессиях', d: 'S', sub: 'awar' },
  { id: 'SS5', t: 'Я знаю конкретные профессии в этой сфере и что для них нужно', d: 'S', sub: 'awar' },
  { id: 'SI1', t: 'Я уверен(а), что смогу разобраться в сложной теме, если потрачу время', d: 'I', sub: 'conf' },
  { id: 'SI2', t: 'Я верю, что смогу провести исследование и сделать выводы', d: 'I', sub: 'conf' },
  { id: 'SI3', t: 'Я уверен(а), что справлюсь с учёбой в научном или техническом направлении', d: 'I', sub: 'conf' },
  { id: 'SI4', t: 'Я представляю, как выглядит рабочий день учёного, аналитика или исследователя', d: 'I', sub: 'awar' },
  { id: 'SI5', t: 'Я знаю, какое образование нужно для исследовательских профессий', d: 'I', sub: 'awar' },
  { id: 'SA1', t: 'Я уверен(а), что смогу создать что-то оригинальное — текст, дизайн, видео', d: 'A', sub: 'conf' },
  { id: 'SA2', t: 'Я верю, что могу развить творческие навыки до профессионального уровня', d: 'A', sub: 'conf' },
  { id: 'SA3', t: 'Я уверен(а), что смогу работать в профессии, где нужно создавать и изобретать', d: 'A', sub: 'conf' },
  { id: 'SA4', t: 'Я понимаю, как устроена работа в творческих профессиях', d: 'A', sub: 'awar' },
  { id: 'SA5', t: 'Я знаю, что нужно для входа в творческую индустрию', d: 'A', sub: 'awar' },
  { id: 'SE1', t: 'Я уверен(а), что смогу организовать команду и направить к цели', d: 'E', sub: 'conf' },
  { id: 'SE2', t: 'Я верю, что смогу убедить людей в своей идее', d: 'E', sub: 'conf' },
  { id: 'SE3', t: 'Я уверен(а), что справлюсь с ролью лидера', d: 'E', sub: 'conf' },
  { id: 'SE4', t: 'Я хорошо понимаю, чем занимаются управленцы и предприниматели', d: 'E', sub: 'awar' },
  { id: 'SE5', t: 'Я знаю, что нужно для создания своего дела', d: 'E', sub: 'awar' },
  { id: 'SC1', t: 'Я уверен(а), что смогу работать точно с данными и документами', d: 'C', sub: 'conf' },
  { id: 'SC2', t: 'Я верю, что смогу выстроить систему и следовать ей', d: 'C', sub: 'conf' },
  { id: 'SC3', t: 'Я уверен(а), что справлюсь с задачами, где важна аккуратность', d: 'C', sub: 'conf' },
  { id: 'SC4', t: 'Я представляю, как выглядит работа в финансах, праве или аналитике', d: 'C', sub: 'awar' },
  { id: 'SC5', t: 'Я знаю, какое образование нужно для точных и системных профессий', d: 'C', sub: 'awar' },
]
const DEC = [
  { id: 'R1', t: 'Если решение принято, я быстро начинаю действовать' },
  { id: 'R2', t: 'Мне легче начать и скорректировать по пути, чем ждать идеального момента' },
  { id: 'R3', t: 'Я могу назвать хотя бы одно важное решение, которое принял(а) сам(а) за последний год' },
  { id: 'R4', t: 'Когда я знаю, что нужно делать, меня не надо заставлять — я начинаю сам(а)' },
]
const CASES = [
  { title: 'Выбор направления', desc: 'Два интересных направления в вузе. Оба примерно одинаковы. Срок — 2 недели.', opts: ['Собираю информацию, сравниваю, анализирую', 'Откладываю, жду что прояснится', 'Спрашиваю родителей, друзей', 'Чувствую, что одно тянет сильнее — иду туда', 'Решаю быстро по первому ощущению'] },
  { title: 'Новая возможность', desc: 'Крутая стажировка в другом городе. Решить надо за 3 дня.', opts: ['Составляю список плюсов и минусов', 'Тяну до последнего, потом отказываюсь', 'Без одобрения близких не соглашусь', 'Чувствую «да» или «нет» внутри', 'Соглашусь сразу, потом разберёмся'] },
  { title: 'Конфликт с родителями', desc: 'Ты выбрал(а) профессию. Родители категорически против.', opts: ['Ищу факты и аргументы', 'Соглашаюсь внешне, ничего не решаю', 'Родители важнее — соглашусь с ними', 'Доверяю ощущению — если тянет, значит моё', 'Делаю по-своему прямо сейчас'] },
  { title: 'Неудача', desc: 'Не прошёл(а) отбор на важную программу.', opts: ['Анализирую ошибки, пробую снова', 'Расстраиваюсь и не хочу пробовать', 'Иду к тому, кому доверяю — обсуждаю', 'Чувствую, что это не моё — ищу другой путь', 'Быстро переключаюсь на другое'] },
  { title: 'Много вариантов', desc: 'Три предложения от вузов/компаний. Все интересны.', opts: ['Делаю таблицу: плюсы, минусы, критерии', 'Не могу выбрать и тяну время', 'Обсуждаю с близкими', 'Слушаю себя — к чему тянет', 'Беру первое, что подвернётся'] },
]
const STYLES = ['analytical', 'avoidant', 'dependent', 'intuitive', 'impulsive']
const STYLE_NAMES = { analytical: 'Аналитический', avoidant: 'Избегающий', dependent: 'Зависимый', intuitive: 'Интуитивный', impulsive: 'Импульсивный', mixed: 'Смешанный' }
const DIR_NAMES = { S: 'Люди', I: 'Аналитика', A: 'Творчество', E: 'Лидерство', C: 'Системность' }
const ALL_LIKERT = [...GEN, ...PROF, ...DEC]
const TOTAL = ALL_LIKERT.length + CASES.length

export default function Block7SelfEfficacy() {
  const { ready, timerRef, goNext } = useDiagBlock(7)
  const [phase, setPhase] = useState('likert')
  const [idx, setIdx] = useState(0)
  const [ans] = useState(() => ({}))
  const [caseAns] = useState(() => [])
  const [sel, setSel] = useState(null)
  const [result, setResult] = useState(null)
  if (!ready) return null

  const done = phase === 'likert' ? idx : ALL_LIKERT.length + caseAns.length
  const pct = result ? 100 : Math.round(done / TOTAL * 100)

  function pickL(v) {
    ans[ALL_LIKERT[idx].id] = v; setSel(v)
    setTimeout(() => { const ni = idx + 1; setSel(null); if (ni >= ALL_LIKERT.length) setPhase('cases'); else setIdx(ni) }, 180)
  }
  function pickCase(i) {
    caseAns.push(STYLES[i]); setSel(i)
    setTimeout(() => { setSel(null); if (caseAns.length >= CASES.length) submit(); else setIdx(idx + 1) }, 250)
  }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length
    const norm = arr => Math.round((mean(arr) - 1) / 4 * 100)
    const seGen = norm(GEN.map(q => ans[q.id] || 3))
    const seConf = {}, seAwar = {}
    ;['S', 'I', 'A', 'E', 'C'].forEach(d => {
      const items = PROF.filter(q => q.d === d)
      seConf[d] = norm(items.filter(q => q.sub === 'conf').map(q => ans[q.id] || 3))
      seAwar[d] = norm(items.filter(q => q.sub === 'awar').map(q => ans[q.id] || 3))
    })
    const decisiveness = norm(DEC.map(q => ans[q.id] || 3))
    const styleCounts = { analytical: 0, avoidant: 0, dependent: 0, intuitive: 0, impulsive: 0 }
    caseAns.forEach(s => styleCounts[s]++)
    const maxC = Math.max(...Object.values(styleCounts))
    const tops = Object.entries(styleCounts).filter(([, v]) => v === maxC).map(([k]) => k)
    const dominant = tops.length > 1 ? 'mixed' : tops[0]
    const exec = [seGen / 100, mean(Object.values(seConf)) / 100, decisiveness / 100, ['analytical', 'intuitive'].includes(dominant) ? 1 : 0.3]
    const careerExec = Math.round(mean(exec) * 100)
    const flags = []
    if (seGen < 35) flags.push({ code: 'low_self_belief', level: 'warning' })
    if (dominant === 'avoidant') flags.push({ code: 'decision_avoidance', level: 'warning' })
    if (decisiveness < 30) flags.push({ code: 'low_decisiveness', level: 'warning' })
    if (dominant === 'dependent') flags.push({ code: 'dependent_decisions', level: 'info' })
    const scores = { se_general: seGen, se_confidence: seConf, se_awareness: seAwar, decisiveness, dominant_style: dominant, style_scores: styleCounts, career_execution: careerExec, flags }
    await CP.saveBlockResult(7, { answers: { likert: ans, cases: caseAns }, scores, durationSec: dur })
    await CP.updateProfile({ se_general: seGen, se_confidence: seConf, se_awareness: seAwar, decisiveness, decision_style: dominant, career_execution: careerExec })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ ...scores, durationSec: dur })
  }

  if (result) {
    return (
      <DiagShell num={7} title="САМОЭФФЕКТИВНОСТЬ" pct={100}>
        <div className="result">
          <div className="result-icon">🎯</div>
          <div className="result-title">{(STYLE_NAMES[result.dominant_style] || 'СМЕШАННЫЙ').toUpperCase()} СТИЛЬ</div>
          <div className="result-desc">Общая уверенность в себе: <b>{result.se_general}/100</b>. Решительность: <b>{result.decisiveness}/100</b></div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Уверенность (общая)</div><div className="r-val r-accent">{result.se_general}</div></div>
            <div className="r-card"><div className="r-label">Решительность</div><div className="r-val r-violet">{result.decisiveness}</div></div>
            <div className="r-card"><div className="r-label">Индекс реализации</div><div className="r-val" style={{ color: result.career_execution >= 60 ? 'var(--ok)' : 'var(--gold)' }}>{result.career_execution}/100</div></div>
            <div className="r-card"><div className="r-label">Время</div><div className="r-val">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  let body = null
  if (phase === 'likert') {
    const q = ALL_LIKERT[idx]
    let badge
    if (idx < GEN.length) badge = <span className="section-badge badge-gen">Общая уверенность</span>
    else if (idx < GEN.length + PROF.length) badge = <span className="section-badge badge-prof">Проф. уверенность · {DIR_NAMES[PROF[idx - GEN.length].d]}</span>
    else badge = <span className="section-badge badge-dec">Решительность</span>
    body = (
      <>
        <div style={{ textAlign: 'center' }}>{badge}</div>
        <div className="q-counter">{idx + 1} / {ALL_LIKERT.length}</div>
        <div className="q-text">{q.t}</div>
        <div className="scale-labels" style={{ maxWidth: 340 }}><span>Совсем не уверен(а)</span><span>Полностью уверен(а)</span></div>
        <div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (sel === n ? ' sel' : '')} onClick={() => pickL(n)}>{n}</button>)}</div>
      </>
    )
  } else {
    const c = CASES[caseAns.length]
    body = (
      <>
        <div style={{ textAlign: 'center' }}><span className="section-badge badge-case">Кейс {caseAns.length + 1} / {CASES.length}</span></div>
        <div className="q-text">{c.title}</div>
        <div className="case-block">{c.desc}</div>
        {c.opts.map((o, i) => <div key={i} className={'opt-card' + (sel === i ? ' sel' : '')} onClick={() => pickCase(i)}><div className="opt-dot"></div><div>{o}</div></div>)}
      </>
    )
  }

  return (
    <DiagShell num={7} title="САМОЭФФЕКТИВНОСТЬ"
      desc="Насколько ты уверен(а) в своих силах + как принимаешь решения. Два формата: шкала и ситуационные кейсы."
      meta={['🕐 ~15 мин', '📝 39 заданий', '🎯 Бандура + JamSkills']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
