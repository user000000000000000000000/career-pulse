import { useState } from 'react'
import { CP } from '../../../shared/api'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from '../model/useDiagBlock'
import useBlockDraft from '../model/useBlockDraft'
import { scoreCognitive } from '../model/scoring/cognitive'

const SELF_QS = [
  { id: 'Y1', t: 'Мне нравится читать — книги, статьи, посты — я делаю это в своё удовольствие', s: 'LANG' },
  { id: 'Y2', t: 'Мне легко объяснить сложную вещь простыми словами', s: 'LANG' },
  { id: 'Y3', t: 'Я замечаю неточности в текстах — нелогичные аргументы, ошибки в формулировках', s: 'LANG' },
  { id: 'Y4', t: 'Когда мне нужно что-то обдумать, я проговариваю это мысленно или пишу', s: 'LANG' },
  { id: 'LM1', t: 'Мне нравится решать логические задачи и головоломки', s: 'MATH' },
  { id: 'LM2', t: 'Я замечаю закономерности там, где другие их не видят', s: 'MATH' },
  { id: 'LM3', t: 'Мне проще думать по шагам — составлять алгоритм и следовать ему', s: 'MATH' },
  { id: 'LM4', t: 'Числа, таблицы и схемы не пугают — с ними мне понятнее', s: 'MATH' },
  { id: 'PV1', t: 'Когда читаю или слушаю, у меня в голове сразу появляются образы и картинки', s: 'SPAT' },
  { id: 'PV2', t: 'Мне легко ориентироваться в незнакомом месте — я хорошо представляю карту', s: 'SPAT' },
  { id: 'PV3', t: 'Я хорошо представляю, как будет выглядеть что-то ещё до того, как это сделано', s: 'SPAT' },
  { id: 'PV4', t: 'Мне проще запомнить схему или карту, чем словесное описание маршрута', s: 'SPAT' },
  { id: 'TK1', t: 'Мне легче учиться, когда я могу попробовать сам(а), а не просто слушать', s: 'KINE' },
  { id: 'TK2', t: 'Я хорошо управляю своим телом — координация, ловкость, точность движений', s: 'KINE' },
  { id: 'TK3', t: 'Я запоминаю лучше через действие: если сделал(а) сам(а) — запомнил(а) навсегда', s: 'KINE' },
  { id: 'MZ1', t: 'Я легко запоминаю мелодии и ритмы — они сами откладываются в памяти', s: 'MUSI' },
  { id: 'MZ2', t: 'Я чувствую ритм и интонацию — в музыке, в речи, в движении', s: 'MUSI' },
  { id: 'SI1', t: 'Я быстро считываю настроение человека — даже когда он старается его скрыть', s: 'SOC' },
  { id: 'SI2', t: 'Я часто понимаю, почему человек поступил определённым образом, ещё до того, как он объяснит', s: 'SOC' },
  { id: 'SI3', t: 'Мне легко увидеть ситуацию глазами другого человека — даже если я с ним не согласен(на)', s: 'SOC' },
  { id: 'SM1', t: 'Когда я изучаю тему, я стараюсь понять, как отдельные части связаны друг с другом', s: 'SYS' },
  { id: 'SM2', t: 'Мне интересно разбираться, как устроены сложные вещи — экономика, экосистемы, технологии', s: 'SYS' },
  { id: 'SM3', t: 'Я умею видеть последствия решений заранее — «если сделать А, то потом произойдёт Б»', s: 'SYS' },
  { id: 'SM4', t: 'Мне нравится строить схемы, модели, алгоритмы — чтобы видеть картину целиком', s: 'SYS' },
]
const TASKS = [
  { id: 'task1', t: 'Книга : Библиотека = Картина : ?', opts: ['Художник', 'Галерея', 'Холст', 'Рама'], correct: 1, type: 'LANG' },
  { id: 'task2', t: '«Не все рыбы живут в солёной воде, и не все животные, живущие в воде — рыбы.» Какое утверждение точно следует из этого?', opts: ['Все рыбы живут в пресной воде', 'Некоторые водные животные — не рыбы', 'Рыбы не могут жить в солёной воде', 'Все водные животные — рыбы'], correct: 1, type: 'LANG' },
  { id: 'task3', t: 'Продолжи ряд: 2, 6, 12, 20, ?', opts: ['28', '30', '32', '24'], correct: 1, type: 'MATH' },
  { id: 'task4', t: 'В ряду: 1, 1, 2, 3, 5, 8, ?', opts: ['11', '13', '12', '10'], correct: 1, type: 'MATH' },
  { id: 'task5', t: 'Куб разрезали по диагонали одной грани. Какая фигура получится на срезе?', opts: ['Квадрат', 'Прямоугольник', 'Треугольник', 'Круг'], correct: 1, type: 'SPAT' },
  { id: 'task6', t: 'Представь букву «Р». Поверни её на 180° по часовой стрелке. Как она будет выглядеть?', opts: ['Р', 'Ь', 'Ъ', 'Перевёрнутая Р (ножкой вверх)'], correct: 3, type: 'SPAT' },
  { id: 'task7', t: 'В городе построили новую дорогу, чтобы разгрузить центр от пробок. Через год пробки стали ещё больше. Почему?', opts: ['Дорогу построили плохо', 'Люди не знали о дороге', 'Новая дорога привлекла больше водителей с других путей', 'Погода стала хуже'], correct: 2, type: 'SYS' },
  { id: 'task8', t: 'Друг говорит «Всё нормально», но не смотрит в глаза и отвечает односложно. Что происходит?', opts: ['Всё нормально', 'Он расстроен, но не хочет говорить', 'Ему скучно', 'Он обижен на тебя'], correct: 1, type: 'SOC' },
]
const VARK_QS = [
  { t: 'Как запомнить сложную тему?', opts: ['Схема / майнд-мэп', 'Лекция / обсуждение', 'Конспект своими словами', 'Практическое задание'] },
  { t: 'Как лучше объяснить дорогу?', opts: ['Карта / рисунок', 'Словами вслух', 'Текстовое описание', 'Пройти вместе'] },
  { t: 'Новое приложение — с чего начнёшь?', opts: ['Видеоурок', 'Попрошу объяснить', 'Прочитаю документацию', 'Начну тыкать кнопки'] },
  { t: 'Какой формат урока ближе?', opts: ['Графики и схемы', 'Рассказ и обсуждение', 'Чтение и конспект', 'Лабораторная / практикум'] },
  { t: 'Как запомнить текст для выступления?', opts: ['Визуальные карточки', 'Прочитаю вслух / диктофон', 'Напишу план и перечитаю', 'Порепетирую с жестами'] },
  { t: 'Как понять статистику?', opts: ['Графики / диаграммы', 'Когда объясняют на словах', 'Таблицы и текст', 'Сам(а) собираю данные'] },
  { t: 'Как научиться готовить новое блюдо?', opts: ['Видео-рецепт', 'Рассказ по шагам', 'Текстовый рецепт', 'Начну готовить по ходу'] },
  { t: 'Какой способ запоминания лучше?', opts: ['Картинки, образы, цвета', 'Звуки, ритм, проговаривание', 'Записи, списки, конспекты', 'Действия, движения'] },
]
const VARK_MAP = ['V', 'A', 'R', 'K']
const SCALE_NAMES = { LANG: 'Вербальное', MATH: 'Логико-мат.', SPAT: 'Пространств.', KINE: 'Практическое', MUSI: 'Музыкальное', SOC: 'Социальный инт.', SYS: 'Системное' }
const VARK_NAMES = { V: 'Визуальный', A: 'Аудиальный', R: 'Чтение/Письмо', K: 'Кинестетический', multimodal: 'Мультимодальный' }
const COLORS = ['#5f96e9', '#8b6fe8', '#e8a0c4', '#72a2eb', '#22d97a', '#72a2eb', '#8b6fe8']
const TOTAL = SELF_QS.length + TASKS.length + VARK_QS.length

export default function Block5Cognitive() {
  const { ready, timerRef, goNext } = useDiagBlock(5)
  const [phase, setPhase] = useState('self')
  const [idx, setIdx] = useState(0)
  const [selfAns] = useState(() => ({}))
  const [taskAns] = useState(() => ({}))
  const [varkAns] = useState(() => [])
  const [sel, setSel] = useState(null)
  const [result, setResult] = useState(null)
  const clearDraft = useBlockDraft({
    blockNum: 5, ready,
    snapshot: () => ({ phase, idx, selfAns, taskAns, varkAns }),
    restore: (d) => {
      if (d.selfAns) Object.assign(selfAns, d.selfAns)
      if (d.taskAns) Object.assign(taskAns, d.taskAns)
      if (Array.isArray(d.varkAns)) { varkAns.length = 0; d.varkAns.forEach(x => varkAns.push(x)) }
      if (d.phase) setPhase(d.phase)
      if (typeof d.idx === 'number') setIdx(d.idx)
    },
    deps: [phase, idx],
  })
  if (!ready) return null

  const done = phase === 'self' ? idx : phase === 'tasks' ? SELF_QS.length + idx : SELF_QS.length + TASKS.length + idx
  const pct = result ? 100 : Math.round(done / TOTAL * 100)

  function advance(nextPhaseAtEnd, len) {
    const ni = idx + 1
    setSel(null)
    if (ni >= len) {
      if (nextPhaseAtEnd === 'submit') { submit(); return }
      setPhase(nextPhaseAtEnd); setIdx(0)
    } else setIdx(ni)
  }
  function pickSelf(v) { selfAns[SELF_QS[idx].id] = v; setSel(v); setTimeout(() => advance('tasks', SELF_QS.length), 180) }
  function pickTask(i) { taskAns[TASKS[idx].id] = i; setSel(i); setTimeout(() => advance('vark', TASKS.length), 280) }
  function pickVark(i) { varkAns.push(VARK_MAP[i]); setSel(i); setTimeout(() => advance('submit', VARK_QS.length), 230) }

  async function submit() {
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const { self_reported_pct, tested_pct, cognitive_top3, cognitive_archetype, vark_profile, vark_dominant, discrepancies, flags } =
      scoreCognitive({ SELF_QS, TASKS, selfAns, taskAns, varkAns })
    const scores = { self_reported_pct, tested_pct, cognitive_top3, cognitive_archetype, vark_profile, vark_dominant, discrepancies, flags }
    clearDraft()
    await CP.saveBlockResult(5, { answers: { self: selfAns, tasks: taskAns, vark: varkAns }, scores, durationSec: dur })
    await CP.updateProfile({ cognitive_scores: self_reported_pct, cognitive_tested_scores: tested_pct, cognitive_top3, cognitive_archetype, vark_style: vark_dominant, vark_profile })
    if (flags.length) await CP.updateExpertData({ flags })
    setResult({ selfPct: self_reported_pct, testedPct: tested_pct, archetype: cognitive_archetype, top3: cognitive_top3, domVark: vark_dominant, durationSec: dur })
  }

  if (result) {
    const allKeys = Object.entries(result.selfPct).sort((a, b) => b[1] - a[1])
    return (
      <DiagShell num={5} title="КОГНИТИВНЫЙ ПРОФИЛЬ" pct={100}>
        <div className="result">
          <div className="result-icon">🧠</div>
          <div className="result-title">{result.archetype.toUpperCase()}</div>
          <div className="result-desc">Топ-3 по самооценке: <b>{result.top3.map(k => SCALE_NAMES[k]).join(', ')}</b></div>
          <div style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            {allKeys.map(([k, v], i) => {
              const tested = result.testedPct[k]
              if (tested == null) {
                return (
                  <div key={k} className="bar-row"><div className="bar-lbl">{SCALE_NAMES[k]}</div><div className="bar-track"><div className="bar-fill" style={{ width: v + '%', background: COLORS[i % 7] }}></div></div><div className="bar-val">{Math.round(v)}</div></div>
                )
              }
              const c = COLORS[i % 7]
              return (
                <div key={k} className="dual-bar">
                  <div className="dual-label">{SCALE_NAMES[k]}</div>
                  <div className="dual-tracks">
                    <div className="dtrack"><div className="dtrack-lbl">Самооценка</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: v + '%', background: c, opacity: .6 }}></div></div><div className="dtrack-val">{Math.round(v)}</div></div>
                    <div className="dtrack"><div className="dtrack-lbl">Мини-задача</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: tested + '%', background: c }}></div></div><div className="dtrack-val">{Math.round(tested)}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="r-grid">
            <div className="r-card"><div className="r-label">Стиль обучения VARK</div><div className="r-val r-accent">{VARK_NAMES[result.domVark]}</div></div>
            <div className="r-card"><div className="r-label">Время</div><div className="r-val">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  let body = null
  if (phase === 'self') {
    const q = SELF_QS[idx]
    body = (
      <>
        <div style={{ textAlign: 'center' }}><span className="section-badge badge-self">Часть 1 · Самооценка</span></div>
        <div className="q-counter">{idx + 1} / {SELF_QS.length}</div>
        <div className="q-text">{q.t}</div>
        <div className="scale-labels" style={{ maxWidth: 280 }}><span>Совсем не про меня</span><span>Точно про меня</span></div>
        <div className="scale-row">{[1, 2, 3, 4].map(n => <button key={n} className={'scale-btn' + (sel === n ? ' sel' : '')} onClick={() => pickSelf(n)}>{n}</button>)}</div>
      </>
    )
  } else if (phase === 'tasks') {
    const t = TASKS[idx]
    body = (
      <>
        <div style={{ textAlign: 'center' }}><span className="section-badge badge-task">Часть 2 · Задачи</span></div>
        <div className="q-counter">Задача {idx + 1} / {TASKS.length}</div>
        <div className="task-block">{t.t}</div>
        {t.opts.map((o, i) => <div key={i} className={'opt-card' + (sel === i ? ' sel' : '')} onClick={() => pickTask(i)}><div className="opt-dot"></div><div>{o}</div></div>)}
      </>
    )
  } else {
    const v = VARK_QS[idx]
    body = (
      <>
        <div style={{ textAlign: 'center' }}><span className="section-badge badge-vark">Часть 3 · Стиль обучения</span></div>
        <div className="q-counter">VARK {idx + 1} / {VARK_QS.length}</div>
        <div className="q-text">{v.t}</div>
        {v.opts.map((o, i) => <div key={i} className={'opt-card' + (sel === i ? ' sel' : '')} onClick={() => pickVark(i)}><div className="opt-dot"></div><div>{o}</div></div>)}
      </>
    )
  }

  return (
    <DiagShell num={5} title="КОГНИТИВНЫЙ ПРОФИЛЬ"
      desc="Три части: самооценка мышления, практические задачи и стиль обучения. Нет ограничений по времени на задачи."
      meta={['🕐 ~15 мин', '📝 40 заданий', '🧠 Когнитивный + VARK']} pct={pct}>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
