import { useState } from 'react'
import CP from '../../services/cpStorage'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from './useDiagBlock'
import useBlockDraft from './useBlockDraft'

// ════════════ DATA (порт block-2.html) ════════════
const PAIRS = [
  { id: 1, a: 'Починить сломанный велосипед своими руками', b: 'Разобраться, почему велосипед сломался, изучив его устройство', tA: 'R', tB: 'I' },
  { id: 2, a: 'Собрать мебель или конструктор по схеме', b: 'Придумать и нарисовать постер для школьного мероприятия', tA: 'R', tB: 'A' },
  { id: 3, a: 'Работать на свежем воздухе — в саду, в мастерской, на площадке', b: 'Работать с людьми — консультировать, обучать, помогать', tA: 'R', tB: 'S' },
  { id: 4, a: 'Управлять техникой или механизмом (станок, дрон, 3D-принтер)', b: 'Управлять командой людей и направлять их к цели', tA: 'R', tB: 'E' },
  { id: 5, a: 'Работать физически — на природе, в мастерской, в поле', b: 'Работать с информацией — вводить, проверять, систематизировать', tA: 'R', tB: 'C' },
  { id: 6, a: 'Провести эксперимент и записать результаты', b: 'Написать рассказ или снять короткое видео', tA: 'I', tB: 'A' },
  { id: 7, a: 'Самостоятельно изучить новую тему в интернете', b: 'Провести урок или мастер-класс для других', tA: 'I', tB: 'S' },
  { id: 8, a: 'Провести исследование и написать отчёт о результатах', b: 'Представить идею и убедить других в её ценности', tA: 'I', tB: 'E' },
  { id: 9, a: 'Найти закономерность в данных и сделать выводы', b: 'Внести данные в систему точно и без ошибок', tA: 'I', tB: 'C' },
  { id: 10, a: 'Читать научные статьи и искать новые знания', b: 'Работать руками — ремонтировать, строить, конструировать', tA: 'I', tB: 'R' },
  { id: 11, a: 'Участвовать в творческом проекте — театр, музыка, кино', b: 'Помочь однокласснику разобраться в сложной теме', tA: 'A', tB: 'S' },
  { id: 12, a: 'Создать что-то художественное — музыку, текст, иллюстрацию', b: 'Продать идею или продукт, договориться о сотрудничестве', tA: 'A', tB: 'E' },
  { id: 13, a: 'Оформить проект красиво и нестандартно', b: 'Структурировать информацию по разделам и категориям', tA: 'A', tB: 'C' },
  { id: 14, a: 'Написать музыку, текст песни или стихотворение', b: 'Собрать устройство или починить технику', tA: 'A', tB: 'R' },
  { id: 15, a: 'Создавать визуальные образы — снимать, рисовать, оформлять', b: 'Исследовать явления и объяснять, как они устроены', tA: 'A', tB: 'I' },
  { id: 16, a: 'Выслушать друга, у которого проблемы, и поддержать его', b: 'Организовать командное мероприятие и взять на себя роль лидера', tA: 'S', tB: 'E' },
  { id: 17, a: 'Заботиться о людях — пожилых, детях, больных', b: 'Вести учёт, документацию, базы данных', tA: 'S', tB: 'C' },
  { id: 18, a: 'Работать волонтёром — помогать людям в трудной ситуации', b: 'Придумать оригинальное название или визуальный образ', tA: 'S', tB: 'A' },
  { id: 19, a: 'Напрямую помогать людям решать их проблемы', b: 'Анализировать поведение людей с научной точки зрения', tA: 'S', tB: 'I' },
  { id: 20, a: 'Работать в команде, поддерживать и вдохновлять коллег', b: 'Работать самостоятельно в мастерской, лаборатории, на площадке', tA: 'S', tB: 'R' },
  { id: 21, a: 'Убедить группу попробовать новый способ решения задачи', b: 'Составить чёткий план и распределить задачи по шагам', tA: 'E', tB: 'C' },
  { id: 22, a: 'Придумать бизнес-идею и найти людей для её реализации', b: 'Сделать что-то своими руками — построить, вырастить, смастерить', tA: 'E', tB: 'R' },
  { id: 23, a: 'Основать собственное дело или проект', b: 'Провести глубокое исследование в интересной теме', tA: 'E', tB: 'I' },
  { id: 24, a: 'Выступать перед аудиторией и вдохновлять людей', b: 'Выступать как автор — режиссёр, писатель, художник', tA: 'E', tB: 'A' },
  { id: 25, a: 'Вести переговоры и добиваться нужного результата', b: 'Поддерживать людей в трудные моменты', tA: 'E', tB: 'S' },
  { id: 26, a: 'Аккуратно заполнить таблицу с данными и проверить ошибки', b: 'Собрать модель или конструктор по схеме', tA: 'C', tB: 'R' },
  { id: 27, a: 'Работать по чёткой инструкции и проверять соблюдение правил', b: 'Решать сложные логические задачи, где правил ещё нет', tA: 'C', tB: 'I' },
  { id: 28, a: 'Проверить документ на ошибки и привести его в порядок', b: 'Искать нестандартные образные решения', tA: 'C', tB: 'A' },
  { id: 29, a: 'Работать с цифрами, таблицами, отчётами', b: 'Работать с людьми — слушать, поддерживать, помогать', tA: 'C', tB: 'S' },
  { id: 30, a: 'Тщательно готовиться и действовать по проверенному плану', b: 'Принимать быстрые решения в условиях неопределённости', tA: 'C', tB: 'E' },
]
const MATURITY = [
  { type: 'R', q: 'Был ли у тебя реальный опыт работы руками — строить, чинить, мастерить, работать с техникой?' },
  { type: 'I', q: 'Был ли у тебя реальный опыт исследований — олимпиады, научные проекты, эксперименты, анализ данных?' },
  { type: 'A', q: 'Был ли у тебя реальный опыт в творчестве — рисование, музыка, фото/видео, тексты, дизайн?' },
  { type: 'S', q: 'Был ли у тебя реальный опыт помощи людям — волонтёрство, наставничество, обучение, поддержка?' },
  { type: 'E', q: 'Был ли у тебя реальный опыт лидерства — организация событий, руководство проектами, продажи, публичные выступления?' },
  { type: 'C', q: 'Был ли у тебя реальный опыт работы с данными, документами, таблицами, учётом, системами?' },
]
const MAT_OPTS = ['Да, занимаюсь регулярно', 'Пробовал(а) несколько раз', 'Только интересно, но не пробовал(а)', 'Мне это неинтересно']
const MAT_SCORES = [4, 3, 2, 1]
const ANTI_ITEMS = [
  { v: 'R', t: 'Ремонтировать технику и работать с инструментами' }, { v: 'I', t: 'Проводить исследования и анализировать данные' },
  { v: 'A', t: 'Создавать дизайн, писать тексты, рисовать' }, { v: 'S', t: 'Слушать людей, поддерживать, обучать' },
  { v: 'E', t: 'Убеждать, продавать, руководить людьми' }, { v: 'C', t: 'Заполнять документы, вести учёт, проверять ошибки' },
]
const ENERGY_ITEMS = [
  { v: 'I', t: 'Решить сложную задачу' }, { v: 'S', t: 'Помочь человеку' }, { v: 'A', t: 'Создать что-то новое' },
  { v: 'E', t: 'Организовать процесс и видеть, как всё работает' }, { v: 'R', t: 'Сделать что-то руками и увидеть результат' }, { v: 'C', t: 'Навести порядок и разложить всё по полочкам' },
]
const ARCHETYPE_MAP = { RI: 'Инженер-исследователь', IR: 'Инженер-исследователь', RA: 'Мастер-создатель', AR: 'Мастер-создатель', RS: 'Практик-наставник', SR: 'Практик-наставник', RE: 'Технолидер', ER: 'Технолидер', RC: 'Техник-системщик', CR: 'Техник-системщик', IA: 'Аналитик-творец', AI: 'Аналитик-творец', IS: 'Наставник-исследователь', SI: 'Наставник-исследователь', IE: 'Стратег-аналитик', EI: 'Стратег-аналитик', IC: 'Системный аналитик', CI: 'Системный аналитик', AS: 'Творец-наставник', SA: 'Творец-наставник', AE: 'Творческий лидер', EA: 'Творческий лидер', AC: 'Дизайнер-системщик', CA: 'Дизайнер-системщик', SE: 'Лидер-наставник', ES: 'Лидер-наставник', SC: 'Организатор заботы', CS: 'Организатор заботы', EC: 'Управленец-системщик', CE: 'Управленец-системщик' }
const TYPE_NAMES = { R: 'Реалистичный', I: 'Исследовательский', A: 'Артистичный', S: 'Социальный', E: 'Предпринимательский', C: 'Конвенциональный' }
const TOTAL_STEPS = 30 + 6 + 4 + 1

export default function Block2Holland() {
  const { ready, timerRef, goNext } = useDiagBlock(2)

  const [phase, setPhase] = useState('pairs')
  const [pairIdx, setPairIdx] = useState(0)
  const [scales] = useState(() => ({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }))
  const [pairAnswers] = useState(() => [])
  const [matAnswers] = useState(() => ({}))
  const [curChoice, setCurChoice] = useState(null)
  const [curMatIdx, setCurMatIdx] = useState(0)
  const [matSel, setMatSel] = useState(null)
  const [antiSel, setAntiSel] = useState([])
  const [energySel, setEnergySel] = useState([])
  const [explorationVal, setExplorationVal] = useState(0)
  const [openText, setOpenText] = useState('')
  const [result, setResult] = useState(null)

  const clearDraft = useBlockDraft({
    blockNum: 2, ready,
    snapshot: () => ({ phase, pairIdx, scales, pairAnswers, matAnswers, antiSel, energySel, explorationVal, openText }),
    restore: (d) => {
      if (d.scales) Object.assign(scales, d.scales)
      if (Array.isArray(d.pairAnswers)) { pairAnswers.length = 0; d.pairAnswers.forEach(x => pairAnswers.push(x)) }
      if (d.matAnswers) Object.assign(matAnswers, d.matAnswers)
      if (typeof d.pairIdx === 'number') setPairIdx(d.pairIdx)
      if (Array.isArray(d.antiSel)) setAntiSel(d.antiSel)
      if (Array.isArray(d.energySel)) setEnergySel(d.energySel)
      if (typeof d.explorationVal === 'number') setExplorationVal(d.explorationVal)
      if (typeof d.openText === 'string') setOpenText(d.openText)
      if (d.phase) setPhase(d.phase === 'maturity' ? 'pairs' : d.phase)
    },
    deps: [phase, pairIdx, antiSel, energySel, explorationVal, openText],
  })

  if (!ready) return null

  const progressDone = () => {
    if (phase === 'pairs') return pairIdx
    if (phase === 'maturity') return 30 + Object.keys(matAnswers).length
    if (phase === 'anti') return 36
    if (phase === 'energy') return 37
    if (phase === 'exploration') return 38
    if (phase === 'open') return 39
    return TOTAL_STEPS
  }
  const pct = result ? 100 : Math.round(progressDone() / TOTAL_STEPS * 100)

  // Биполярная шкала: один тап = и сторона (A/Б), и сила (1–3)
  function choosePair(choice, intensity) {
    const p = PAIRS[pairIdx]
    const type = choice === 'A' ? p.tA : p.tB
    scales[type] += intensity
    pairAnswers.push({ qId: p.id, choice, intensity, type })
    const ni = pairIdx + 1
    setPairIdx(ni)
    setCurChoice(null)
    if (ni % 5 === 0 && ni <= 30) {
      const matIdx = ni / 5 - 1
      if (matIdx < 6) { setCurMatIdx(matIdx); setMatSel(null); setPhase('maturity'); return }
    }
    if (ni >= 30) { setPhase('anti'); return }
  }

  function afterMat() {
    if (pairIdx >= 30) setPhase('anti')
    else setPhase('pairs')
  }

  function toggleSel(list, setList, v, max) {
    if (list.includes(v)) setList(list.filter(x => x !== v))
    else if (list.length < max) setList([...list, v])
  }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const norm = {}
    for (const [k, v] of Object.entries(scales)) norm[k] = Math.round(v / 30 * 100 * 10) / 10
    const sorted = Object.entries(norm).sort((a, b) => b[1] - a[1])
    const top2 = [sorted[0][0], sorted[1][0]]
    const code = top2.join('')
    const archetype = ARCHETYPE_MAP[code] || code
    const vals = Object.values(norm)
    const mean_rest = vals.filter((_, i) => i > 0).reduce((a, b) => a + b, 0) / (vals.length - 1)
    const std = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - mean_rest, 2), 0) / vals.length) || 1
    const clarity = Math.min(100, Math.round((sorted[0][1] - mean_rest) / std * 100))
    const flexibility = Math.round((1 - (sorted[0][1] - sorted[1][1]) / 30) * 100) / 100
    const matTop = Math.round(((matAnswers[top2[0]] || 2) + (matAnswers[top2[1]] || 2)) / 2 / 4 * 100)

    const scores = {
      R: norm.R, I: norm.I, A: norm.A, S: norm.S, E: norm.E, C: norm.C,
      holland_top2: top2, holland_code: code, career_archetype: archetype,
      profile_clarity: clarity, profile_flexibility: flexibility,
      interest_maturity: matTop, anti_interests: antiSel, energy_sources: energySel,
      exploration_index: explorationVal, maturity_raw: { ...matAnswers },
    }
    const flags = []
    if (vals.every(v => v < 20)) flags.push({ code: 'holland_flat_profile', level: 'warning' })
    if (Math.abs(sorted[0][1] - sorted[1][1]) < 5) flags.push({ code: 'holland_ambiguous', level: 'info' })
    if (dur < 180) flags.push({ code: 'holland_too_fast', level: 'warning' })
    if (antiSel.includes(top2[0])) flags.push({ code: 'holland_self_contradiction', level: 'warning' })
    if (!energySel.includes(top2[0]) && !energySel.includes(top2[1])) flags.push({ code: 'energy_mismatch', level: 'info' })
    if (explorationVal <= 2 && clarity > 80) flags.push({ code: 'uninformed_confidence', level: 'warning' })
    if (matTop < 40) flags.push({ code: 'untested_interests', level: 'info' })

    await CP.saveBlockResult(2, { answers: pairAnswers, scores: { ...scores, flags }, durationSec: dur, openAnswers: [{ questionId: 'open', text: openText }] })
    await CP.updateProfile({ holland_scores: { R: norm.R, I: norm.I, A: norm.A, S: norm.S, E: norm.E, C: norm.C }, holland_top2: top2, holland_code: code, career_archetype: archetype, profile_clarity: clarity, profile_flexibility: flexibility, interest_maturity: matTop, anti_interests: antiSel, energy_sources: energySel, exploration_index: explorationVal })
    if (flags.length) await CP.updateExpertData({ flags })
    clearDraft()
    setResult({ ...scores, durationSec: dur })
  }

  // ── result ──
  if (result) {
    const matLabel = result.interest_maturity >= 75 ? 'Подтверждён' : result.interest_maturity >= 50 ? 'Частично подтверждён' : 'Гипотеза'
    return (
      <DiagShell num={2} title="СКЛОННОСТИ В ДЕЯТЕЛЬНОСТИ" pct={100}>
        <div className="result">
          <div className="result-icon">🎯</div>
          <div className="result-title">{result.career_archetype.toUpperCase()}</div>
          <div className="result-desc">Твой карьерный архетип по Holland RIASEC: <b>{TYPE_NAMES[result.holland_top2[0]]}</b> + <b>{TYPE_NAMES[result.holland_top2[1]]}</b></div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Код Holland</div><div className="r-val r-accent">{result.holland_code}</div></div>
            <div className="r-card"><div className="r-label">Ясность профиля</div><div className="r-val r-violet">{result.profile_clarity}%</div></div>
            <div className="r-card"><div className="r-label">Зрелость интересов</div><div className="r-val" style={{ color: result.interest_maturity >= 60 ? 'var(--ok)' : 'var(--gold)' }}>{matLabel}</div></div>
            <div className="r-card"><div className="r-label">Время</div><div className="r-val">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  // ── question area ──
  let body = null
  if (phase === 'pairs') {
    const p = PAIRS[pairIdx]
    body = (
      <>
        <div className="q-counter">Вопрос {pairIdx + 1} из 30</div>
        <div className="q-text">Что тебе ближе?</div>
        <div className="pair-row">
          {['A', 'B'].map(side => {
            const sel = curChoice === side
            return (
              <div key={side}
                className={'pair-card' + (sel ? ' sel' : '') + (curChoice && !sel ? ' dim' : '')}
                onClick={() => { if (!sel) setCurChoice(side) }}>
                <div className="pair-label">{side === 'A' ? 'А' : 'Б'}</div>
                <div className="pair-text">{side === 'A' ? p.a : p.b}</div>
                {sel && (
                  <div className="ii">
                    <div className="ii-label">насколько ближе?</div>
                    <div className="ii-row">
                      {[1, 2, 3].map(lvl => (
                        <button key={lvl}
                          className={`ii-btn ii-${side} lvl${lvl}`}
                          onClick={(e) => { e.stopPropagation(); choosePair(side, lvl) }}>
                          {['Немного', 'Заметно', 'Намного'][lvl - 1]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
        {curChoice && <div className="ii-hint">цвет показывает силу: бледный — немного, насыщенный — намного</div>}
      </>
    )
  } else if (phase === 'maturity') {
    const m = MATURITY[curMatIdx]
    body = (
      <>
        <div className="q-counter" style={{ color: 'var(--gold)' }}>⏸ Микро-вопрос: {TYPE_NAMES[m.type]}</div>
        <div className="q-text" style={{ fontSize: 15 }}>{m.q}</div>
        {MAT_OPTS.map((o, i) => (
          <div key={i} className={'mat-card' + (matSel === i ? ' sel' : '')} onClick={() => { matAnswers[m.type] = MAT_SCORES[i]; setMatSel(i) }}><div className="mat-dot"></div>{o}</div>
        ))}
        <div className="nav-row"><button className="btn btn-accent" disabled={matSel === null} onClick={afterMat}>Далее →</button></div>
      </>
    )
  } else if (phase === 'anti') {
    body = (
      <>
        <div className="q-counter" style={{ color: 'var(--ember)' }}>Дополнительно: Антиинтересы</div>
        <div className="q-text">Выбери 3 занятия, которыми ты <b>точно не хотел(а) бы</b> заниматься каждый день</div>
        <div className="chip-grid">{ANTI_ITEMS.map(a => <div key={a.v} className={'chip' + (antiSel.includes(a.v) ? ' sel' : '')} onClick={() => toggleSel(antiSel, setAntiSel, a.v, 3)}>{a.t}</div>)}</div>
        <div className="chip-hint">Выбрано: {antiSel.length} / 3</div>
        <div className="nav-row"><button className="btn btn-accent" disabled={antiSel.length !== 3} onClick={() => setPhase('energy')}>Далее →</button></div>
      </>
    )
  } else if (phase === 'energy') {
    body = (
      <>
        <div className="q-counter" style={{ color: 'var(--gold)' }}>Дополнительно: Источники энергии</div>
        <div className="q-text">Что тебя обычно больше всего <b>заряжает</b>? Выбери 2 варианта</div>
        <div className="chip-grid">{ENERGY_ITEMS.map(e => <div key={e.v} className={'chip' + (energySel.includes(e.v) ? ' sel' : '')} onClick={() => toggleSel(energySel, setEnergySel, e.v, 2)}>{e.t}</div>)}</div>
        <div className="chip-hint">Выбрано: {energySel.length} / 2</div>
        <div className="nav-row"><button className="btn btn-accent" disabled={energySel.length !== 2} onClick={() => setPhase('exploration')}>Далее →</button></div>
      </>
    )
  } else if (phase === 'exploration') {
    body = (
      <>
        <div className="q-counter">Дополнительно: Исследованность профессий</div>
        <div className="q-text">Насколько хорошо ты изучал(а) профессии, которые тебе интересны?</div>
        <div className="scale-labels"><span>Почти ничего не знаю</span><span>Хорошо понимаю изнутри</span></div>
        <div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (explorationVal === n ? ' sel' : '')} onClick={() => setExplorationVal(n)}>{n}</button>)}</div>
        <div className="nav-row"><button className="btn btn-accent" disabled={!explorationVal} onClick={() => setPhase('open')}>Далее →</button></div>
      </>
    )
  } else if (phase === 'open') {
    body = (
      <>
        <div className="q-counter">Открытый вопрос</div>
        <div className="q-text">Представь, что у тебя свободный день и не нужно думать об оценках или деньгах. Чем бы ты занимался(ась)?</div>
        <div className="q-text" style={{ fontSize: 13, color: 'var(--ghost)', marginTop: -12 }}>Напиши 2–3 предложения — как будто рассказываешь другу</div>
        <textarea className="q-textarea" placeholder="Напиши здесь..." maxLength={500} value={openText} onChange={e => setOpenText(e.target.value)} />
        <div className="char-count">{openText.length} / 500</div>
        <div className="nav-row"><button className="btn btn-accent" onClick={submit}>Завершить блок ✓</button></div>
      </>
    )
  }

  return (
    <DiagShell num={2} title="СКЛОННОСТИ В ДЕЯТЕЛЬНОСТИ"
      desc="Выбирай между двумя занятиями и оценивай силу предпочтения. Нет правильных ответов — доверяй первому ощущению."
      meta={['🕐 ~15 мин', '📝 40 заданий', '🔬 Holland RIASEC']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
