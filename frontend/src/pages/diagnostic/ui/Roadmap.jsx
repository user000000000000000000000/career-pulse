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

export default function Roadmap() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [completedCount, setCompletedCount] = useState(0)
  const [profs, setProfs] = useState([])        // список рекомендованных профессий
  const [chosen, setChosen] = useState([])      // выбранные (макс 2)
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)  // загрузка профиля/профессий
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

  const Shell = ({ children }) => (
    <div className="cp-diag">
      <div className="topbar">
        <div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark"><BoltIcon /></div>CAREER<span>PULSE</span></div><div className="tb-divider"></div><div className="tb-block">Карьерный маршрут</div></div>
        <button className="tb-btn" onClick={() => navigate('/diagnostic')}>← К результатам</button>
      </div>
      <div className="container" style={{ maxWidth: 980 }}>{children}</div>
    </div>
  )

  if (loading) return <Shell><div className="block-title" style={{ marginTop: 40 }}>ЗАГРУЖАЕМ…</div></Shell>

  if (completedCount === 0) {
    return <Shell>
      <div className="block-title" style={{ marginTop: 40 }}>СНАЧАЛА ДИАГНОСТИКА</div>
      <div className="block-desc">Чтобы построить маршрут, пройди хотя бы базовые блоки теста.</div>
      <div className="nav-row"><button className="btn btn-accent" onClick={() => navigate('/test/1')}>Начать диагностику →</button></div>
    </Shell>
  }

  // ── Готовый маршрут (гибрид: мост «Ты → Профессия» + интерактивный чеклист) ──
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
      <div className="rm-head">
        <div className="rm-eyebrow">🌉 Твой маршрут</div>
        <div className="block-title" style={{ margin: '6px 0' }}>ОТ ТЕБЯ СЕЙЧАС — К ЦЕЛИ</div>
        <p className="rm-intro">{INTRO}</p>
      </div>

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
                      <input type="checkbox" checked={!!checked[key]} onChange={() => toggleTask(key)} style={{ display: 'none' }} />
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
    <div className="block-num">КАРЬЕРНЫЙ МАРШРУТ</div>
    <div className="block-title">ВЫБЕРИ 2 ПРОФЕССИИ</div>
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
