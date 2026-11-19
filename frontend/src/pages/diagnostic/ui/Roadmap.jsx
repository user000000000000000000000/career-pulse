import Header from '../../../shared/ui/Header.jsx'
import Icon from '../../../shared/ui/Icon.jsx'
import IconText from '../../../shared/ui/IconText.jsx'
import JourneyMascot from '../../../shared/ui/JourneyMascot.jsx'
import '../roadmap-journey.css'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { matchProfessions } from '../../../entities/profession'
import { generateRoadmap } from '../../../shared/api'
import { confirmDialog } from '../../../shared/ui/Dialog.jsx'
import { buildStages, gradeNum, INTRO, CLOSING } from '../model/roadmapContent'
import { HOLLAND } from '../../../shared/lib/blockRings'
import BoltIcon from '../../../shared/ui/BoltIcon.jsx'
import '../diagnostic.css'

function stepIcon(title = '') {
  if (/ЕГЭ|экзамен|предмет/i.test(title)) return 'calendar'
  if (/проект|портфолио/i.test(title)) return 'document'
  if (/навык|практик|курс/i.test(title)) return 'bulb'
  if (/поступ|профиль/i.test(title)) return 'graduation'
  if (/стажиров|знаком|нетворк/i.test(title)) return 'users'
  if (/работ|входи/i.test(title)) return 'briefcase'
  return 'search'
}

function RoadmapShell({ children }) {
  return <div className="cp-diag roadmap-journey">
    <Header backTo="/diagnostic" backLabel="← К результатам" />
    <div className="container" style={{ maxWidth: 980 }}>{children}</div>
  </div>
}

function JourneyHeader({ title, children }) {
  return <section className="roadmap-journey__hero">
    <div className="roadmap-journey__copy">
      <div className="block-num"><Icon name="compass" size={16} />КАРЬЕРНЫЙ МАРШРУТ</div>
      <h1 className="block-title">{title}</h1>
      {children}
    </div>
    <div className="roadmap-journey__guide" aria-hidden="true">
      <JourneyMascot num={2} variant="search" />
      <span className="roadmap-journey__guide-note"><Icon name="route" size={16} />Шаг за шагом</span>
    </div>
  </section>
}

export default function Roadmap() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [profs, setProfs] = useState([])        // список рекомендованных профессий
  const [chosen, setChosen] = useState([])      // выбранные (макс 2)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)  // загрузка профиля/профессий
  const [savingStep, setSavingStep] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [p, pr] = await Promise.all([CP.getProfile(), CP.getProgress()])
      if (!alive) return
      setProfile(p); setCompletedCount(pr.completed?.length || 0)
      if (p.roadmap && p.chosen_professions) { setRoadmap(p.roadmap); setChosen(p.chosen_professions) }
      if (alive) {
        // профессии берём из атласа по Holland-профилю (русские, курированные)
        setProfs(matchProfessions(p, 8))
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [])

  const toggle = (name) => {
    setChosen(c => c.includes(name) ? c.filter(x => x !== name) : c.length < 2 ? [...c, name] : c)
  }

  // Отметить/снять шаг чеклиста; состояние храним в roadmap.checked и сохраняем в профиль.
  const toggleTask = (key) => {
    setRoadmap(rm => {
      // Снятие пишем как false (не delete): updateProfile делает deepMerge и
      // удалённый ключ не затёрся бы, а false — примитив, он перезапишет true.
      const nc = { ...(rm.checked || {}), [key]: !rm.checked?.[key] }
      const next = { ...rm, checked: nc }
      CP.updateProfile({ roadmap: next })
      return next
    })
  }

  async function build() {
    setBuilding(true)
    // От ИИ берём только одну персональную строку; остальной маршрут — курированный.
    let aiLine = ''
    try { const r = await generateRoadmap(profile, chosen); aiLine = (r?.intro || '').trim() } catch { /* ИИ недоступен — не критично */ }
    const rm = { aiLine, chosen }
    setRoadmap(rm)
    await CP.updateProfile({ roadmap: rm, chosen_professions: chosen })
    setBuilding(false)
  }
  async function reset() {
    const ok = await confirmDialog({
      title: 'Выбрать другие профессии?',
      message: 'Текущий маршрут будет сброшен, и мы построим новый под выбранные профессии. Продолжить?',
      confirmText: 'Да, выбрать заново',
      cancelText: 'Оставить маршрут',
      danger: true,
    })
    if (!ok) return
    setRoadmap(null)
    CP.updateProfile({ roadmap: null })
  }

  async function toggleStep(index) {
    if (savingStep) return
    setSavingStep(true)
    setSaveError('')
    const updated = { ...roadmap, steps: roadmap.steps.map((step, i) => i === index ? { ...step, completed: step.completed !== true } : step) }
    try {
      await CP.updateProfile({ roadmap: updated })
      setRoadmap(updated)
    } catch {
      setSaveError('Не удалось сохранить отметку. Попробуй ещё раз.')
    } finally {
      setSavingStep(false)
    }
  }

  const Shell = RoadmapShell

  if (loading) return <Shell><div className="block-title" style={{ marginTop: 40 }}>ЗАГРУЖАЕМ…</div></Shell>

  if (completedCount === 0) {
    return <Shell>
      <div className="block-title" style={{ marginTop: 40 }}>СНАЧАЛА ДИАГНОСТИКА</div>
      <div className="block-desc">Чтобы построить маршрут, пройди хотя бы базовые блоки теста.</div>
      <div className="nav-row"><button className="btn btn-accent" onClick={() => navigate('/test/1')}>Начать диагностику →</button></div>
    </Shell>
  }

  // ── Готовый маршрут (гибрид: мост «Ты → Профессия» + интерактивный чеклист) ──
  if (roadmap && Array.isArray(roadmap.steps) && roadmap.steps.length > 0) {
    const done = roadmap.steps.filter(step => step.completed === true).length
    const nextStep = roadmap.steps.findIndex(step => step.completed !== true)
    return <RoadmapShell>
      <JourneyHeader title="ТВОЙ ПУТЬ">
        {roadmap.goal && <p className="block-desc">{roadmap.goal}</p>}
        <div className="roadmap-journey__professions"><Icon name="flag" size={17} /><span>{chosen.join(' · ')}</span></div>
      </JourneyHeader>

      {roadmap.intro && (
        <div className="r-card" style={{ borderColor: 'var(--brand-border)', background: 'var(--gradient-hero)', marginBottom: 20 }}>
          <div className="r-label" style={{ color: '#087cff', marginBottom: 8 }}><Icon name="compass" size={17} /> Твой ориентир</div>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>{roadmap.intro}</div>
        </div>
      )}

      <div className="roadmap-journey__progress">
        <div><b>Твои шаги к профессии</b><span aria-live="polite">Пройдено {done} из {roadmap.steps.length}</span></div>
        <progress max={roadmap.steps.length || 1} value={done} aria-label="Завершённые шаги карьерного маршрута" />
        <p>Отмечай то, что уже получилось. Можно двигаться в своём темпе.</p>
      </div>
      {saveError && <p className="roadmap-journey__error" role="alert">{saveError}</p>}
      <ol className="roadmap-journey__steps" aria-label="Этапы твоего карьерного маршрута">
        {roadmap.steps.map((s, i) => {
          const completed = s.completed === true
          return <li className={`roadmap-journey__step${completed ? ' is-complete' : ''}${i === nextStep ? ' is-next' : ''}`} key={i}>
            <span className="roadmap-journey__node" aria-hidden="true">{completed ? <Icon name="check" size={19} /> : s.n || i + 1}</span>
            <article className="roadmap-journey__card">
              <span className="roadmap-journey__illustration" aria-hidden="true"><Icon name={stepIcon(s.title)} size={30} /></span>
              <div className="roadmap-journey__step-copy">
                <div className="roadmap-journey__timing">{s.horizon}{i === nextStep && <span>Ближайший шаг</span>}</div>
                <h2><IconText text={s.title} /></h2>
                <p>{s.desc}</p>
              </div>
              <button type="button" className="roadmap-journey__complete" aria-pressed={completed} aria-label={`${completed ? 'Снять отметку' : 'Отметить пройденным'}: ${s.title}`} disabled={savingStep} onClick={() => toggleStep(i)}>
                <span className="roadmap-journey__checkbox" aria-hidden="true">{completed && <Icon name="check" size={15} />}</span>{completed ? 'Пройдено' : 'Отметить'}
              </button>
            </article>
          </li>
        })}
      </ol>
      <div className="roadmap-journey__destination"><Icon name={done === roadmap.steps.length ? 'award' : 'flag'} size={21} /><span>{done === roadmap.steps.length ? 'Все шаги отмечены. Посмотри, какой путь уже позади!' : 'Твоя профессия становится ближе с каждым шагом'}</span></div>

      {roadmap.skills?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="r-label" style={{ textAlign: 'center', marginBottom: 10 }}>Навыки, которые пригодятся в пути</div>
          <div className="rm-skills">{roadmap.skills.map((sk, i) => <span key={i} className="rm-skill">{sk}</span>)}</div>
        </div>
      )}

      <div className="nav-row" style={{ marginTop: 28 }}>
        <button className="btn btn-ghost" disabled={savingStep} onClick={reset}><IconText text={"← Выбрать другие профессии"} /></button>
        <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>В кабинет</button>
      </div>
    </RoadmapShell>
  }

  if (roadmap) {
    const picked = roadmap.chosen || chosen
    const ctx = profile?.context || {}
    const stages = buildStages(ctx, picked)
    const checked = roadmap.checked || {}

    // Полюс «Ты сейчас» — из данных диагностики
    const g = gradeNum(ctx)
    const gradeLabel = g ? `${g} класс · твой профиль` : (ctx.grade ? `${ctx.grade} · твой профиль` : 'Твой профиль')
    const topHolland = Object.entries(profile?.holland_scores || {})
      .sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => HOLLAND[k]).filter(Boolean)
    const nowBullets = [
      profile?.career_archetype ? `Тип: «${profile.career_archetype}»` : null,
      topHolland.length ? `Сильные стороны: ${topHolland.join(' + ')}` : null,
      'Диагностика пройдена — склад ума уже понятен',
    ].filter(Boolean)

    // Прогресс по чеклисту
    const allKeys = stages.flatMap(s => s.tasks.map((_, ti) => `${s.id}_${ti}`))
    const total = allKeys.length
    const done = allKeys.filter(k => checked[k]).length
    const pct = total ? Math.round((done / total) * 100) : 0

    return <Shell>
      <JourneyHeader title="ОТ ТЕБЯ СЕЙЧАС — К ЦЕЛИ"><p className="rm-intro">{INTRO}</p></JourneyHeader>

      <div className="rm-poles">
        <div className="rm-pole now">
          <div className="rm-pole-cap">Ты сейчас</div>
          <div className="rm-pole-h">{gradeLabel}</div>
          <ul>{nowBullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
        </div>
        <div className="rm-pole goal">
          <div className="rm-pole-cap">Цель</div>
          <div className="rm-pole-h">{picked.join(' · ')}</div>
          <ul>
            {picked.map((p, i) => <li key={i}>{p}</li>)}
            <li>Путь ниже закрывает опыт и образование</li>
          </ul>
        </div>
      </div>

      {roadmap.aiLine && (
        <div className="rm-personal">
          <div className="rm-personal-h">✦ Персонально по твоему профилю</div>
          <div className="rm-personal-t">{roadmap.aiLine}</div>
        </div>
      )}

      <div className="rm-prog">
        <div className="rm-progcard">
          <div className="rm-prog-big">{pct}%</div>
          <div className="rm-prog-track"><div className="rm-prog-fill" style={{ width: pct + '%' }} /></div>
          <div className="rm-prog-lbl">{done} / {total} шагов к цели</div>
        </div>
      </div>

      <div className="rm-bridge">
        {stages.map((s, i) => {
          const doneHere = s.tasks.filter((_, ti) => checked[`${s.id}_${ti}`]).length
          const complete = doneHere === s.tasks.length
          return (
            <div className={'rm-span' + (complete ? ' complete' : '')} key={s.id}>
              <div className="rm-dot">{complete ? '✓' : i + 1}</div>
              <div className="rm-c">
                <div className="rm-c-top">
                  <span className="rm-c-h">{s.horizon}</span>
                  <span className="rm-c-cnt">{doneHere}/{s.tasks.length}</span>
                </div>
                <div className="rm-c-title">{s.title}</div>
                <p className="rm-c-desc">{s.desc}</p>
                {s.tasks.map((t, ti) => {
                  const key = `${s.id}_${ti}`
                  return (
                    <label className={'rm-task' + (checked[key] ? ' on' : '')} key={ti}>
                      <span className="rm-cb">✓</span>
                      <input type="checkbox" checked={!!checked[key]} onChange={() => toggleTask(key)} className="rm-task-input" />
                      <span className="rm-tx">{t}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
        <div className="rm-span goal-span">
          <div className="rm-dot">🎯</div>
          <div className="rm-c">
            <div className="rm-goal-em">🎯</div>
            <div className="rm-c-title">{picked.join(' · ')}</div>
            <p className="rm-c-desc">Стажировка с первого курса и живое портфолио — и ты уже в профессии, а не «готовишься к ней».</p>
          </div>
        </div>
      </div>

      {total > 0 && done === total && (
        <div className="rm-banner">
          <b>🎉 Мост построен!</b>
          <span>Ты прошёл весь путь до цели. Самое время обсудить детали с живым наставником.</span>
        </div>
      )}

      <p className="rm-closing">{CLOSING}</p>

      <div className="nav-row" style={{ marginTop: 20 }}>
        <button className="btn btn-ghost" onClick={reset}>← Выбрать другие профессии</button>
        <button className="btn btn-accent" onClick={() => navigate('/dashboard')}>В кабинет</button>
      </div>
    </Shell>
  }

  // ── Выбор профессий ──
  return <Shell>
    <JourneyHeader title="ВЫБЕРИ 2 ПРОФЕССИИ" />
    <div className="block-desc">Отметь две профессии из подобранных по твоему профилю — мы построим к ним пошаговый маршрут под твой возраст и класс.</div>

    <div className="prof-pick" style={{ marginTop: 24 }}>
      {profs.length === 0 && <div style={{ textAlign: 'center', color: 'var(--sub)' }}>Профессии появятся после анализа профиля.</div>}
      {profs.map((p, i) => {
        const sel = chosen.includes(p.name)
        return (
          <div key={i} className={'prof-opt' + (sel ? ' sel' : '')} onClick={() => toggle(p.name)}>
            <div className="pp-check">{sel ? '✓' : ''}</div>
            <div className="pp-name">{p.name}</div>
            {typeof p.match === 'number' && <div className="pp-match">{p.match}%</div>}
          </div>
        )
      })}
    </div>

    <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ghost)', marginTop: 12 }}>Выбрано: {chosen.length} / 2</div>
    <div className="nav-row" style={{ marginTop: 16 }}>
      <button className="btn btn-accent" disabled={chosen.length !== 2 || building} onClick={build}>
        {building ? 'Собираю маршрут… ⏳' : 'Построить маршрут →'}
      </button>
    </div>
  </Shell>
}
