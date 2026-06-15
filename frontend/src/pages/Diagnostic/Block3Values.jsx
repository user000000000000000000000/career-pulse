import { useState } from 'react'
import CP from '../../services/cpStorage'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from './useDiagBlock'

const VNAMES = { KR: 'Креативность', AK: 'Активные контакты', RZ: 'Развитие себя', DU: 'Духовное удовлетворение', PR: 'Собственный престиж', MB: 'Материальное благополучие', DO: 'Достижения', IN: 'Индивидуальность' }
const QS = [
  { id: 1, a: 'Создать авторский блог или канал, где ты делаешь контент в своём стиле', b: 'Стать организатором молодёжного фестиваля, где ты работаешь с людьми каждый день', tA: 'KR', tB: 'AK', ctx: 'Тебе предлагают два проекта на лето:' },
  { id: 2, a: 'Сделать собственный творческий проект — снять фильм, написать книгу, создать игру', b: 'Пройти интенсивный курс по новому навыку, который сильно прокачает тебя', tA: 'KR', tB: 'RZ', ctx: 'У тебя есть свободный месяц:' },
  { id: 3, a: 'Работа, где ты каждый день придумываешь что-то новое, но не всегда понимаешь, кому это нужно', b: 'Работа, которая полностью совпадает с твоими ценностями, хотя там мало пространства для идей', tA: 'KR', tB: 'DU', ctx: 'Ты выбираешь между двумя направлениями:' },
  { id: 4, a: 'Подать экспериментальный, нестандартный проект, который может не понравиться жюри', b: 'Подать проверенный проект, который точно произведёт впечатление и принесёт награду', tA: 'KR', tB: 'PR', ctx: 'Ты можешь представить свой проект на конкурсе:' },
  { id: 5, a: 'Творческий проект мечты, но платят мало', b: 'Менее интересная работа, но доход в два раза выше', tA: 'KR', tB: 'MB', ctx: 'Ты выбираешь между двумя подработками:' },
  { id: 6, a: 'Хочешь найти необычное решение, даже если это займёт больше времени', b: 'Хочешь сделать быстро и качественно, чтобы получить лучший результат среди всех', tA: 'KR', tB: 'DO', ctx: 'Ты работаешь над задачей:' },
  { id: 7, a: 'Идея творческая и яркая, но тебе придётся работать в чужом формате', b: 'Идея проще, зато полностью твоя — делаешь так, как считаешь нужным', tA: 'KR', tB: 'IN', ctx: 'Ты придумал(а) идею для проекта:' },
  { id: 8, a: 'Провести время с друзьями, помочь кому-то с проблемой, пообщаться', b: 'Остаться одному и разобраться в новой теме, которая тебе интересна', tA: 'AK', tB: 'RZ', ctx: 'У тебя свободный вечер:' },
  { id: 9, a: 'Координатор: много общения, встреч, организации людей', b: 'Работа один на один с теми, кому нужна помощь — глубоко и осмысленно', tA: 'AK', tB: 'DU', ctx: 'Тебе предлагают две роли в волонтёрской организации:' },
  { id: 10, a: 'Быть ведущим — общаться с залом, вовлекать людей, создавать атмосферу', b: 'Быть главным организатором — тебя не видно на сцене, но все знают, что это твоя заслуга', tA: 'AK', tB: 'PR', ctx: 'На школьном мероприятии ты можешь:' },
  { id: 11, a: 'Волонтёрский лагерь: много людей, новые знакомства, но денег не заработаешь', b: 'Оплачиваемая стажировка: работа самостоятельная, зато к осени будут свои деньги', tA: 'AK', tB: 'MB', ctx: 'Тебе предлагают два варианта лета:' },
  { id: 12, a: 'Важнее, чтобы все чувствовали себя частью команды, даже если это снизит шансы на победу', b: 'Важнее победить, даже если придётся принять непопулярные решения', tA: 'AK', tB: 'DO', ctx: 'Ты капитан команды. Впереди финал:' },
  { id: 13, a: 'Стараешься примирить стороны и сохранить хорошие отношения', b: 'Говоришь то, что думаешь, даже если это вызывает напряжение', tA: 'AK', tB: 'IN', ctx: 'В компании друзей разгорается спор:' },
  { id: 14, a: 'Пройти мастер-класс или вебинар — вырасти как профессионал', b: 'Провести день в тишине — гулять, думать, перезагрузиться, побыть в гармонии с собой', tA: 'RZ', tB: 'DU', ctx: 'Ты выбираешь, как провести выходные:' },
  { id: 15, a: 'Интенсивный курс от сильного преподавателя — реальные знания, но никто не узнает', b: 'Программа известного университета — знания послабее, зато в резюме впечатляющая строчка', tA: 'RZ', tB: 'PR', ctx: 'Тебе предлагают две программы обучения:' },
  { id: 16, a: 'Поступить на сложную специальность, которая даст сильное образование, но перспективы неясны', b: 'Пойти туда, где точно высокий доход через 4 года, хотя предмет не самый увлекательный', tA: 'RZ', tB: 'MB', ctx: 'После школы ты выбираешь:' },
  { id: 17, a: 'Разобраться максимально глубоко — ради знаний, даже если не успеешь к дедлайну', b: 'Закончить вовремя и показать результат — ради победы', tA: 'RZ', tB: 'DO', ctx: 'Ты работаешь над проектом:' },
  { id: 18, a: 'С интересом изучишь новый подход и, если он лучше, изменишь своё мнение', b: 'Останешься при своём мнении — твоя позиция проверена опытом', tA: 'RZ', tB: 'IN', ctx: 'В твоей области появился новый подход, который противоречит тому, что ты думал(а):' },
  { id: 19, a: 'Работа, которая полностью совпадает с твоими ценностями, но мало кто о ней слышал', b: 'Престижная позиция, которую уважают все, но работа не вызывает внутреннего отклика', tA: 'DU', tB: 'PR', ctx: 'Тебе предлагают должность:' },
  { id: 20, a: 'Жить по своим ценностям, даже если это означает более скромный уровень жизни', b: 'Обеспечить себе и близким комфортную жизнь, даже если работа не вдохновляет', tA: 'DU', tB: 'MB', ctx: 'Ты выбираешь между двумя путями:' },
  { id: 21, a: 'Важнее, чтобы путь был честным и осмысленным, даже если результат скромнее', b: 'Важнее результат — главное, что цель достигнута', tA: 'DU', tB: 'DO', ctx: 'Ты достиг(ла) цели, но способ вызывает сомнения:' },
  { id: 22, a: 'Стараешься найти общие смыслы и прийти к пониманию', b: 'Остаёшься при своём — для тебя важнее быть собой, чем быть понятым', tA: 'DU', tB: 'IN', ctx: 'Твои ценности отличаются от ценностей близкого круга:' },
  { id: 23, a: 'Должность с громким названием и высоким статусом, но зарплата средняя', b: 'Обычная должность без особого статуса, но зарплата значительно выше', tA: 'PR', tB: 'MB', ctx: 'Тебе предлагают две позиции:' },
  { id: 24, a: 'Важнее, чтобы другие это оценили и признали', b: 'Важнее, что ты сам(а) знаешь — результат достигнут', tA: 'PR', tB: 'DO', ctx: 'Ты завершил(а) проект:' },
  { id: 25, a: 'Быть человеком, которого уважают — ради этого иногда подстраиваться', b: 'Быть собой и жить по своим правилам, даже если это не вызывает восхищения', tA: 'PR', tB: 'IN', ctx: 'Ты можешь выбрать стиль поведения:' },
  { id: 26, a: 'Проект с гарантированным хорошим доходом, но без амбициозной цели', b: 'Амбициозный проект с возможностью большой победы, но финансово рискованный', tA: 'MB', tB: 'DO', ctx: 'Тебе предлагают два проекта:' },
  { id: 27, a: 'Соглашаешься — деньги дают свободу в остальном', b: 'Отказываешься — не готов(а) жить по чужим правилам ради денег', tA: 'MB', tB: 'IN', ctx: 'Тебе предлагают высокооплачиваемую работу с жёсткими правилами и дресс-кодом:' },
  { id: 28, a: 'Готов(а) адаптировать свой проект под требования жюри, чтобы победить', b: 'Сделаешь по-своему, даже если это уменьшит шансы на победу', tA: 'DO', tB: 'IN', ctx: 'Ты участвуешь в конкурсе:' },
]
const ANTI_ITEMS = [{ v: 'KR', t: 'Творчество' }, { v: 'AK', t: 'Отношения' }, { v: 'RZ', t: 'Развитие' }, { v: 'DU', t: 'Смысл' }, { v: 'PR', t: 'Статус' }, { v: 'MB', t: 'Деньги' }, { v: 'DO', t: 'Результат' }, { v: 'IN', t: 'Свобода' }]
const ARCHETYPES = [
  { name: 'Исследователь роста', keys: ['RZ', 'IN', 'DU'] }, { name: 'Лидер достижений', keys: ['DO', 'PR', 'MB'] },
  { name: 'Создатель', keys: ['KR', 'IN', 'RZ'] }, { name: 'Наставник', keys: ['AK', 'DU', 'RZ'] },
  { name: 'Прагматик', keys: ['MB', 'DO', 'PR'] }, { name: 'Свободный художник', keys: ['KR', 'IN', 'DU'] },
  { name: 'Амбассадор', keys: ['AK', 'PR', 'DO'] }, { name: 'Философ', keys: ['DU', 'IN', 'RZ'] },
]
const TOTAL = 30

export default function Block3Values() {
  const { ready, timerRef, goNext } = useDiagBlock(3)
  const [phase, setPhase] = useState('dilemmas')
  const [qIdx, setQIdx] = useState(0)
  const [scales] = useState(() => ({ KR: 0, AK: 0, RZ: 0, DU: 0, PR: 0, MB: 0, DO: 0, IN: 0 }))
  const [answers] = useState(() => [])
  const [antiSel, setAntiSel] = useState([])
  const [openText, setOpenText] = useState('')
  const [result, setResult] = useState(null)
  if (!ready) return null

  const pct = result ? 100 : Math.round((phase === 'dilemmas' ? qIdx : phase === 'anti' ? 28 : 29) / TOTAL * 100)

  function pick(ch) {
    const q = QS[qIdx]
    const type = ch === 'A' ? q.tA : q.tB
    scales[type]++
    answers.push({ qId: q.id, choice: ch, type })
    const ni = qIdx + 1
    setQIdx(ni)
    if (ni >= 28) setPhase('anti')
  }
  function togAnti(v) {
    if (antiSel.includes(v)) setAntiSel(antiSel.filter(x => x !== v))
    else if (antiSel.length < 2) setAntiSel([...antiSel, v])
  }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const norm = {}; for (const [k, v] of Object.entries(scales)) norm[k] = Math.round(v / 7 * 1000) / 10
    const sorted = Object.entries(norm).sort((a, b) => b[1] - a[1])
    const top3 = sorted.slice(0, 3).map(s => s[0])
    const antiTop2 = sorted.slice(-2).map(s => s[0])
    const spiritual = ['KR', 'RZ', 'DU', 'IN'], pragmatic = ['PR', 'MB', 'DO', 'AK']
    const spirAvg = spiritual.reduce((s, k) => s + norm[k], 0) / 4
    const pragAvg = pragmatic.reduce((s, k) => s + norm[k], 0) / 4
    let motType = 'mixed'
    if (spirAvg > pragAvg + 15) motType = 'spiritual'; else if (pragAvg > spirAvg + 15) motType = 'pragmatic'
    let archetype = 'Смешанный профиль', bestMatch = 0
    ARCHETYPES.forEach(a => { const ov = a.keys.filter(k => top3.includes(k)).length; if (ov > bestMatch) { bestMatch = ov; archetype = a.name } })
    const leadGroup = motType === 'spiritual' ? spiritual : pragmatic
    const leadScores = leadGroup.map(k => norm[k])
    const consistency = Math.round(100 - (Math.max(...leadScores) - Math.min(...leadScores)))
    const scores = { ...norm, values_top3: top3, values_antitop2: antiTop2, anti_values_chosen: antiSel, motivation_type: motType, values_archetype: archetype, values_consistency: consistency }
    const flags = []
    if (Object.values(norm).every(v => v >= 35 && v <= 65)) flags.push({ code: 'values_flat_profile', level: 'warning' })
    if (consistency < 50) flags.push({ code: 'values_internal_conflict', level: 'warning' })
    if (dur < 180) flags.push({ code: 'values_too_fast', level: 'warning' })
    await CP.saveBlockResult(3, { answers, scores: { ...scores, flags }, durationSec: dur, openAnswers: [{ questionId: 'maturity', text: openText }] })
    await CP.updateProfile({ values_top3: top3, values_antitop2: antiTop2, anti_values_chosen: antiSel, motivation_type: motType, values_archetype: archetype, values_consistency: consistency })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ ...scores, durationSec: dur })
  }

  if (result) {
    const motMap = { spiritual: 'Духовный', pragmatic: 'Прагматический', mixed: 'Смешанный' }
    return (
      <DiagShell num={3} title="ЖИЗНЕННЫЕ ЦЕННОСТИ" pct={100}>
        <div className="result">
          <div className="result-icon">💎</div>
          <div className="result-title">{result.values_archetype.toUpperCase()}</div>
          <div className="result-desc">Твои ведущие ценности: <b>{result.values_top3.map(k => VNAMES[k]).join(', ')}</b></div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Мотивационный профиль</div><div className="r-val r-accent">{motMap[result.motivation_type]}</div></div>
            <div className="r-card"><div className="r-label">Согласованность</div><div className="r-val r-violet">{result.values_consistency}%</div></div>
            <div className="r-card"><div className="r-label">Антиценности</div><div className="r-val" style={{ color: 'var(--ember)' }}>{result.anti_values_chosen.map(k => VNAMES[k]).join(', ')}</div></div>
            <div className="r-card"><div className="r-label">Время</div><div className="r-val">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  let body = null
  if (phase === 'dilemmas') {
    const q = QS[qIdx]
    body = (
      <>
        <div className="q-counter">Дилемма {qIdx + 1} из 28</div>
        <div className="q-context">{q.ctx}</div>
        <div className="pair-row">
          <div className="pair-card" onClick={() => pick('A')}><div className="pair-label">А</div><div className="pair-text">{q.a}</div></div>
          <div className="pair-card" onClick={() => pick('B')}><div className="pair-label">Б</div><div className="pair-text">{q.b}</div></div>
        </div>
      </>
    )
  } else if (phase === 'anti') {
    body = (
      <>
        <div className="q-counter" style={{ color: 'var(--ember)' }}>Антиценности</div>
        <div className="q-text">Выбери <b>2 пункта</b>, которые для тебя <b>наименее важны</b> прямо сейчас</div>
        <div className="chip-grid">{ANTI_ITEMS.map(a => <div key={a.v} className={'chip' + (antiSel.includes(a.v) ? ' sel' : '')} onClick={() => togAnti(a.v)}>{a.t}</div>)}</div>
        <div className="chip-hint">Выбрано: {antiSel.length} / 2</div>
        <div className="nav-row"><button className="btn btn-accent" disabled={antiSel.length !== 2} onClick={() => setPhase('open')}>Далее →</button></div>
      </>
    )
  } else {
    body = (
      <>
        <div className="q-counter">Зрелость ценностей</div>
        <div className="q-text">Ты выбрал(а) свои главные ценности. Подумай: <b>почему именно это для тебя важно?</b></div>
        <div className="q-text" style={{ fontSize: 13, color: 'var(--ghost)', marginTop: -12 }}>Напиши 2–3 предложения — как будто объясняешь другу</div>
        <textarea className="q-textarea" placeholder="Напиши здесь..." maxLength={500} value={openText} onChange={e => setOpenText(e.target.value)} />
        <div className="char-count">{openText.length} / 500</div>
        <div className="nav-row"><button className="btn btn-accent" onClick={submit}>Завершить блок ✓</button></div>
      </>
    )
  }

  return (
    <DiagShell num={3} title="ЖИЗНЕННЫЕ ЦЕННОСТИ"
      desc="Ситуации выбора — оба варианта привлекательны. Выбирай тот, который реально предпочёл(а) бы. Не думай долго."
      meta={['🕐 ~15 мин', '📝 30 заданий', '💎 Ценностные дилеммы']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
