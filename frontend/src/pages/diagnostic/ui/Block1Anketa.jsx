import { useState } from 'react'
import { CP } from '../../../shared/api'
import DiagShell, { ResultNav } from './DiagShell'
import useDiagBlock from '../model/useDiagBlock'
import useBlockDraft from '../model/useBlockDraft'
import { scoreAnketa } from '../model/scoring/anketa'

const EGE = [
  ['russian', 'Русский язык'], ['math_prof', 'Мат. (проф.)'], ['math_base', 'Мат. (баз.)'], ['society', 'Обществознание'],
  ['physics', 'Физика'], ['informatics', 'Информатика'], ['history', 'История'], ['biology', 'Биология'],
  ['chemistry', 'Химия'], ['english', 'Иностр. язык'], ['literature', 'Литература'], ['geography', 'География'], ['not_decided', 'Ещё не решил(а)'],
]
const SUBJ = [
  ['math', 'Математика'], ['russian_lit', 'Русский / Литература'], ['physics', 'Физика'], ['chemistry', 'Химия'],
  ['biology', 'Биология'], ['history', 'История'], ['society', 'Обществознание'], ['informatics', 'Информатика'],
  ['english', 'Иностр. язык'], ['art', 'Искусство'], ['pe', 'Физкультура'], ['tech', 'Технология'],
]
const SUBJ_DISLIKE = SUBJ.filter(([k]) => k !== 'art' && k !== 'tech')
const B2A = [['content', 'Интересно содержание'], ['teacher', 'Нравится преподаватель'], ['easy', 'Легко получается'], ['tasks', 'Люблю решать задачи'], ['discuss', 'Люблю обсуждать'], ['create', 'Нравится создавать']]
const V4B = [['self', 'Сам(а) заинтересовался(ась)'], ['parents', 'Посоветовали родители'], ['friends', 'Друзья / знакомые'], ['internet', 'Интернет / соцсети'], ['acquaintance', 'Знакомый в профессии'], ['practice', 'Пробовал(а) на практике']]

const REQUIRED = {
  1: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
  2: ['B1', 'B4'],
  3: ['V1', 'V2', 'V3', 'V4'],
  4: ['G1', 'G2', 'G3', 'G4'],
}

export default function Block1Anketa() {
  const { ready, timerRef, goNext } = useDiagBlock(1)
  const [step, setStep] = useState('intro')
  const [a, setA] = useState({})        // одиночные / текст
  const [chips, setChips] = useState({}) // мультивыбор
  const [errors, setErrors] = useState({})
  const [result, setResult] = useState(null)

  const clearDraft = useBlockDraft({
    blockNum: 1, ready,
    snapshot: () => ({ a, chips, step }),
    restore: (d) => {
      if (d && (Object.keys(d.a || {}).length || Object.keys(d.chips || {}).length)) {
        setA(d.a || {})
        setChips(d.chips || {})
        if (d.step) setStep(d.step)
      }
    },
    deps: [a, chips, step],
  })

  if (!ready) return null

  const TOTAL_STEPS = 4
  const pct = result ? 100 : (step === 'intro' ? 0 : Math.round((Number(step) / TOTAL_STEPS) * 100))
  const set = (id, v) => { setA(p => ({ ...p, [id]: v })); setErrors(e => ({ ...e, [id]: false })) }
  const toggleChip = (gid, v, max) => {
    setChips(p => {
      const arr = p[gid] || []
      let next
      if (arr.includes(v)) next = arr.filter(x => x !== v)
      else { if (max && arr.length >= max) return p; next = [...arr, v] }
      return { ...p, [gid]: next }
    })
    setErrors(e => ({ ...e, [gid]: false }))
  }
  const chipLen = (gid) => (chips[gid] || []).length

  const showCond = a.V4 === 'specific' || a.V4 === 'several'
  const showB2a = chipLen('B2') > 0

  function validate(n) {
    if (!REQUIRED[n]) return true
    const miss = {}
    REQUIRED[n].forEach(id => {
      const v = id === 'B1' ? chips[id] : a[id]
      if (!v || (Array.isArray(v) && v.length === 0)) miss[id] = true
    })
    setErrors(e => ({ ...e, ...miss }))
    return Object.keys(miss).length === 0
  }
  function go(n) {
    const cur = Number(step)
    const forward = !Number.isNaN(cur) && n !== 'intro' && Number(n) > cur
    if (!forward || validate(cur)) { setStep(String(n)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  async function submit() {
    if (!validate(4)) return
    const dur = timerRef.current ? timerRef.current.stop() : 0
    const ans = { ...a, B1: chips.B1 || [], B2: chips.B2 || [], B2a: chips.B2a || [], B3: chips.B3 || [], V4b: chips.V4b || [] }
    const { scores, flags, context } = scoreAnketa(ans)
    await CP.saveUser({ name: ans.A1, role: 'student' })
    await CP.saveBlockResult(1, { answers: ans, scores: { ...scores, flags, context }, durationSec: dur })
    await CP.updateProfile({ context, choice_clarity: scores.choice_clarity, career_anxiety: scores.career_anxiety, external_pressure_index: scores.external_pressure_index, subject_motivation: ans.B2a })
    if (flags.length) await CP.updateExpertData({ flags })
    clearDraft()
    setResult({ ...scores, durationSec: dur })
  }

  // ── функции-рендеры (не компоненты — чтобы поля не теряли фокус) ──
  const radio = (id, v, label) => (
    <label key={v} className={'opt-card' + (a[id] === v ? ' selected' : '')} onClick={() => set(id, v)}><div className="opt-dot"></div><div className="opt-text">{label}</div></label>
  )
  const scale = (id, lo, hi) => (
    <div>
      <div className="scale-labels"><span>{lo}</span><span>{hi}</span></div>
      <div className="scale-row">{[1, 2, 3, 4, 5].map(n => <button key={n} className={'scale-btn' + (a[id] === n ? ' selected' : '')} onClick={() => set(id, n)}>{n}</button>)}</div>
    </div>
  )
  const group = (id, label, sub, inner) => (
    <div key={id} className={'q-group' + (errors[id] ? ' error' : '')}>
      <div className="q-label"><span className="q-id">{id}</span> {label}</div>
      {sub && <div className="q-sub">{sub}</div>}
      {inner}
      <div className="q-error">Заполни это поле</div>
    </div>
  )
  const chipRow = (gid, items, max) => (
    <div className="chip-grid" style={{ justifyContent: 'flex-start' }}>
      {items.map(([v, l]) => <div key={v} className={'chip' + ((chips[gid] || []).includes(v) ? ' selected' : '')} onClick={() => toggleChip(gid, v, max)}>{l}</div>)}
    </div>
  )

  if (result) {
    const cMap = { high: 'Высокая', medium: 'Средняя', low: 'Низкая', none: 'Нет идей', uncertain_specific: 'Есть, но не уверен(а)' }
    const cClr = { high: 'rc-accent', medium: 'rc-gold', low: 'rc-ember', none: 'rc-ember', uncertain_specific: 'rc-violet' }
    const aMap = { 1: 'Минимальная', 2: 'Низкая', 3: 'Средняя', 4: 'Высокая', 5: 'Очень высокая' }
    const aClr = { 1: 'rc-accent', 2: 'rc-accent', 3: 'rc-gold', 4: 'rc-ember', 5: 'rc-ember' }
    return (
      <DiagShell num={1} title="АНКЕТА ГОТОВА" pct={100} wide>
        <div className="result">
          <div className="result-icon">✅</div>
          <div className="result-desc">Контекстный профиль создан. Все блоки настроены под твою ситуацию.</div>
          <div className="result-cards">
            <div className="r-card"><div className="rc-label">Определённость</div><div className={'rc-value ' + cClr[result.choice_clarity]}>{cMap[result.choice_clarity]}</div></div>
            <div className="r-card"><div className="rc-label">Тревога</div><div className={'rc-value ' + aClr[result.career_anxiety]}>{aMap[result.career_anxiety]}</div></div>
            <div className="r-card"><div className="rc-label">Внешнее давление</div><div className={'rc-value ' + (result.external_pressure_index >= 4 ? 'rc-ember' : result.external_pressure_index >= 3 ? 'rc-gold' : 'rc-accent')}>{result.external_pressure_index.toFixed(1)}/5</div></div>
            <div className="r-card"><div className="rc-label">Время</div><div className="rc-value">{Math.ceil(result.durationSec / 60)} мин</div></div>
          </div>
          <ResultNav onNext={goNext} />
        </div>
      </DiagShell>
    )
  }

  let body = null
  if (step === 'intro') {
    body = (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', margin: '24px 0' }}>
          {['👤 О тебе', '📚 Учёба', '🎯 Планы', '💭 Что беспокоит'].map(t => <div key={t} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 16px', fontSize: 12, color: 'var(--sub)' }}>{t}</div>)}
        </div>
        <p style={{ fontSize: 13, color: 'var(--ghost)', marginBottom: 28 }}>Отвечай быстро и честно — первая реакция самая точная</p>
        <button className="btn btn-accent" onClick={() => go(1)}>Начать анкету →</button>
      </div>
    )
  } else if (step === '1') {
    body = (
      <>
        <div className="step-header"><div className="step-eyebrow">Секция А</div><div className="step-title">О тебе</div><div className="step-hint">Базовые данные для настройки системы</div></div>
        {group('A1', 'Имя (или как к тебе обращаться)', null, <input className="q-input" placeholder="Например: Алина" value={a.A1 || ''} onChange={e => set('A1', e.target.value)} />)}
        {group('A2', 'Возраст', null, <select className="q-input" value={a.A2 || ''} onChange={e => set('A2', e.target.value)}><option value="">Выбери</option>{['13', '14', '15', '16', '17', '18', '19+'].map(o => <option key={o}>{o}</option>)}</select>)}
        {group('A3', 'Класс / курс', null, <div className="opt-grid cols-3">{[['8', '8 класс'], ['9', '9 класс'], ['10', '10 класс'], ['11', '11 класс'], ['college1', '1 курс колледжа'], ['college2', '2 курс колледжа'], ['other', 'Другое']].map(([v, l]) => radio('A3', v, l))}</div>)}
        {group('A4', 'Город', null, <input className="q-input" placeholder="Например: Санкт-Петербург" value={a.A4 || ''} onChange={e => set('A4', e.target.value)} />)}
        {group('A5', 'Пол', null, <div className="opt-grid cols-3">{[['male', 'Мужской'], ['female', 'Женский'], ['skip', 'Не указывать']].map(([v, l]) => radio('A5', v, l))}</div>)}
        {group('A6', 'Формат обучения', null, <div className="opt-grid">{[['school', 'Общеобразовательная школа'], ['lyceum', 'Гимназия / лицей'], ['college', 'Колледж / техникум'], ['home', 'Домашнее обучение'], ['other', 'Другое']].map(([v, l]) => radio('A6', v, l))}</div>)}
        <div className="nav-row spread"><button className="btn btn-ghost" onClick={() => go('intro')}>← Назад</button><button className="btn btn-accent" onClick={() => go(2)}>Далее →</button></div>
      </>
    )
  } else if (step === '2') {
    body = (
      <>
        <div className="step-header"><div className="step-eyebrow">Секция Б</div><div className="step-title">Учебный контекст</div><div className="step-hint">Предметы, успеваемость и мотивация</div></div>
        {group('B1', 'Какие ЕГЭ планируешь сдавать?', 'Выбери все, которые собираешься', chipRow('B1', EGE))}
        {group('B2', 'Какие предметы нравятся больше всего?', 'До 3 предметов', <>{chipRow('B2', SUBJ, 3)}<div className="chip-limit">{chipLen('B2')} / 3</div></>)}
        {showB2a && group('B2a', 'Почему именно эти предметы?', 'Можно несколько причин', chipRow('B2a', B2A))}
        {group('B3', 'Какие предметы не нравятся?', 'До 3 предметов', <>{chipRow('B3', SUBJ_DISLIKE, 3)}<div className="chip-limit">{chipLen('B3')} / 3</div></>)}
        {group('B4', 'Средний балл (примерно)', null, <div className="opt-grid cols-2">{[['below3.5', 'Ниже 3.5'], ['3.5-4', '3.5 — 4.0'], ['4-4.5', '4.0 — 4.5'], ['4.5-5', '4.5 — 5.0']].map(([v, l]) => radio('B4', v, l))}</div>)}
        <div className="nav-row spread"><button className="btn btn-ghost" onClick={() => go(1)}>← Назад</button><button className="btn btn-accent" onClick={() => go(3)}>Далее →</button></div>
      </>
    )
  } else if (step === '3') {
    body = (
      <>
        <div className="step-header"><div className="step-eyebrow">Секция В</div><div className="step-title">Планы и выбор</div><div className="step-hint">Понимаем, есть ли направление</div></div>
        {group('V1', 'Что наиболее вероятно после школы?', null, <div className="opt-grid">{[['university', 'Вуз (бакалавриат)'], ['college', 'Колледж'], ['work', 'Работа сразу'], ['army', 'Армия'], ['gap', 'Gap year'], ['unknown', 'Не знаю']].map(([v, l]) => radio('V1', v, l))}</div>)}
        {group('V2', 'Готов(а) к переезду ради учёбы?', null, <div className="opt-grid cols-3">{[['yes', 'Да'], ['maybe', 'Если нужно'], ['no', 'Нет']].map(([v, l]) => radio('V2', v, l))}</div>)}
        {group('V3', 'Бюджет на обучение', null, <div className="opt-grid">{[['budget', 'Только бюджетное место'], ['paid_limited', 'Платно, но с ограничениями'], ['any', 'Бюджет не критичен'], ['unknown', 'Не знаю']].map(([v, l]) => radio('V3', v, l))}</div>)}
        {group('V4', 'Есть ли идеи по профессии?', null, <div className="opt-grid">{[['specific', 'Да, конкретная'], ['several', 'Несколько вариантов'], ['vague', 'Смутные представления'], ['none', 'Нет, вообще не знаю']].map(([v, l]) => radio('V4', v, l))}</div>)}
        {showCond && group('V4a', 'Насколько уверен(а) в выборе?', null, scale('V4a', 'Совсем не уверен(а)', 'Полностью'))}
        {showCond && group('V4b', 'Откуда появилась идея?', 'Можно несколько', chipRow('V4b', V4B))}
        {showCond && group('V4c', 'Общался(ась) с представителем профессии?', null, <div className="opt-grid cols-3">{[['yes', 'Да'], ['no', 'Нет'], ['want', 'Нет, но хочу']].map(([v, l]) => radio('V4c', v, l))}</div>)}
        <div className="nav-row spread"><button className="btn btn-ghost" onClick={() => go(2)}>← Назад</button><button className="btn btn-accent" onClick={() => go(4)}>Далее →</button></div>
      </>
    )
  } else if (step === '4') {
    body = (
      <>
        <div className="step-header"><div className="step-eyebrow">Секция Г</div><div className="step-title">Что тебя беспокоит</div><div className="step-hint">Помогает наставнику подготовиться к встрече</div></div>
        {group('G1', 'Тревога вокруг выбора профессии', null, scale('G1', 'Спокоен(а)', 'Очень тревожно'))}
        {group('G2', 'Давление со стороны родителей', null, scale('G2', 'Никакого', 'Очень сильное'))}
        {group('G3', 'Что беспокоит больше всего?', null, <div className="opt-grid">{[['dont_know', 'Не знаю, чего хочу'], ['fear_mistake', 'Знаю, но боюсь ошибиться'], ['fear_admission', 'Боюсь не поступить'], ['parents_disagree', 'Родители хотят не то, что я'], ['self_doubt', 'Не уверен(а) в способностях']].map(([v, l]) => radio('G3', v, l))}</div>)}
        {group('G4', 'Кто принимает решения об образовании?', null, <div className="opt-grid">{[['self', 'Я сам(а)'], ['together', 'Вместе с родителями'], ['parents', 'В основном родители'], ['unaware', 'Не задумывался(ась)']].map(([v, l]) => radio('G4', v, l))}</div>)}
        <div className="nav-row spread"><button className="btn btn-ghost" onClick={() => go(3)}>← Назад</button><button className="btn btn-accent" onClick={submit}>Завершить анкету ✓</button></div>
      </>
    )
  }

  return (
    <DiagShell num={1} title="АНКЕТА-КОНТЕКСТ"
      desc="Короткая анкета, которая настраивает всю систему под тебя. Нет правильных ответов — только твоя ситуация."
      meta={['🕐 ~7 минут', '📝 20–24 вопроса', '🔒 Конфиденциально']} pct={pct} wide>
      <div className="q-area">{body}</div>
    </DiagShell>
  )
}
