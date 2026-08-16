import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { analyzeDiagnostic } from '../api/diagnosticAPI'
import { getCareerTracksForProfessions } from '../../../shared/api'
import { matchProfessions } from '../../../entities/profession'
import { HOLLAND_PLAIN, buildHollandPortrait } from '../model/hollandPlain.js'
import { PERSONALITY_PLAIN, buildPersonalityPortrait, COGNITIVE_PLAIN, buildCognitivePortrait, VALUES_PLAIN, MOTIVATION_PLAIN, READINESS_PLAIN } from '../model/resultsPlain.js'
import Mascot from './mascot/Mascot'
import ThemeToggle from '../../../shared/ui/ThemeToggle.jsx'
import { MASCOT_RESULTS_LINE } from '../model/mascotLines'
import '../diagnostic.css'

const SCALE_NAMES = Object.fromEntries(Object.entries(PERSONALITY_PLAIN).map(([k, v]) => [k, v.title]))
const SCALE_COLORS = { agreeableness: 'var(--accent)', conscientiousness: 'var(--violet)', extraversion: 'var(--ember)', openness: 'var(--gold)', stress_resilience: 'var(--ok)', anxiety: 'var(--danger)', impulse_control: '#72a2eb', ambiguity_tolerance: '#8b6fe8' }
const COG_NAMES = Object.fromEntries(Object.entries(COGNITIVE_PLAIN).map(([k, v]) => [k, v.title]))
const COG_COLORS = ['var(--accent)', 'var(--violet)', 'var(--ember)', 'var(--gold)', 'var(--ok)', '#72a2eb', '#8b6fe8']
const VARK_NAMES = { V: 'Визуальный', A: 'Аудиальный', R: 'Чтение/Письмо', K: 'Кинестетический', multimodal: 'Мультимодальный' }
const VALUE_NAMES = Object.fromEntries(Object.entries(VALUES_PLAIN).map(([k, v]) => [k, v.title]))
const MOTIV = MOTIVATION_PLAIN
const READY_NAMES = Object.fromEntries(Object.entries(READINESS_PLAIN).map(([k, v]) => [k, v.title]))
const READY_COLORS = { HH: 'var(--accent)', HT: 'var(--violet)', HZ: 'var(--ember)', HX: 'var(--gold)', HP: 'var(--ok)' }
const SE_NAMES = { S: 'Люди', I: 'Аналитика', A: 'Творчество', E: 'Лидерство', C: 'Системность' }
// Цвета типов Holland — согласованы с плашками на странице результата (result.css).
const HOLLAND_COLOR = { R: '#c25686', I: '#3f77cf', A: '#7a5bd6', S: '#2b8f6b', E: '#b57e1f', C: '#d63456' }

// Уровень словами по баллу (нейтрально, без оценки «хорошо/плохо» — годится и для тревожности).
function levelInfo(v) {
  if (v >= 75) return { label: 'Ярко выражено', color: '#1a9d5c' }
  if (v >= 55) return { label: 'Заметно', color: '#4079d3' }
  if (v >= 35) return { label: 'Умеренно', color: '#b57e1f' }
  return { label: 'Слабо', color: '#82819b' }
}

function BlockHead({ icon, color, title, sub }) {
  return (
    <>
      <div className="block-head"><span className="bh-ic" style={{ background: color + '18', color }}>{icon}</span><h3>{title}</h3></div>
      {sub && <div className="block-head-sub">{sub}</div>}
    </>
  )
}

// Метрики-карточки: число + уровень словами + смысл (шаблонный текст из *_PLAIN).
function MetricGrid({ items }) {
  return (
    <div className="metrics">
      {items.map(it => {
        const lv = levelInfo(it.v)
        return (
          <div key={it.key} className="metric">
            <div className="metric__top">
              <span className="metric__name">{it.name}</span>
              <span className="metric__num" style={{ color: it.color }}>{it.v}</span>
            </div>
            <span className="metric__lvl" style={{ background: lv.color + '1f', color: lv.color }}>{lv.label}</span>
            {it.mean && <div className="metric__mean">{it.mean}</div>}
          </div>
        )
      })}
    </div>
  )
}

export default function DiagResults() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState({ completed: [], pct: 0 })
  const [report, setReport] = useState(null)
  const [repLoading, setRepLoading] = useState(false)
  const [tracks, setTracks] = useState({}) // professionId → { status, specialties }

  useEffect(() => {
    let alive = true
    Promise.all([CP.getProfile(), CP.getProgress()]).then(([p, pr]) => { if (alive) { setProfile(p); setProgress(pr) } })
    return () => { alive = false }
  }, [])

  // Разбор от нейросети: берём из кэша профиля или запрашиваем (YandexGPT / локально).
  // Прикладываем письмо в будущее и открытые ответы из всех блоков — раньше ИИ
  // получал только структурированные баллы и не видел ни строчки из того, что
  // подросток написал своими словами.
  useEffect(() => {
    if (!profile || !progress.completed?.length) return
    if (profile.ai_report) { setReport(profile.ai_report); return }
    let alive = true
    setRepLoading(true)
    Promise.all([CP.getLetter(), CP.getAllResults()]).then(([letter, allResults]) => {
      if (!alive) return
      const open_answers = []
      Object.entries(allResults || {}).forEach(([blockNum, r]) => {
        if (blockNum === '10') return // письмо идёт отдельным полем letter_text, не дублируем
        ;(r.openAnswers || []).forEach(a => { if (a.text && a.text.trim()) open_answers.push(a) })
      })
      const enrichedProfile = { ...profile, letter_text: letter?.fullText || null, open_answers }
      return analyzeDiagnostic(enrichedProfile)
    }).then(r => { if (!alive || !r) return; setReport(r); CP.updateProfile({ ai_report: r }) })
      .finally(() => { if (alive) setRepLoading(false) })
    return () => { alive = false }
  }, [profile, progress])

  // Образовательный путь (ЕГЭ + вузы/колледжи) под рекомендованные профессии.
  // Работает и без данных в БД — тогда просто не показывает секцию у конкретной профессии.
  useEffect(() => {
    if (!profile?.holland_scores) return
    let alive = true
    const profs = matchProfessions(profile, 7)
    getCareerTracksForProfessions(profs.map(p => p.id), profile.context?.city || '')
      .then(list => { if (!alive) return; const m = {}; list.forEach(t => { m[t.professionId] = t }); setTracks(m) })
    return () => { alive = false }
  }, [profile])

  if (!profile) return null
  const has = progress.completed.length > 0
  // Подходящие профессии берём ИЗ АТЛАСА по Holland-профилю (всё на русском, с привязкой к атласу)
  const atlasProfs = matchProfessions(profile, 7)

  if (!has) {
    return (
      <div className="cp-diag">
        <div className="topbar"><div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark"><svg viewBox="0 0 32 32" width="13" height="13" aria-hidden="true"><path d="M17.8 4.5 8.5 18.2h6.1L13 27.5 23.5 13.4h-6.1z" fill="#fff"/></svg></div>CAREER<span>PULSE</span></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ThemeToggle /><button className="tb-btn" onClick={() => navigate('/dashboard')}>← В кабинет</button></div></div>
        <div className="container">
          <div className="block-title" style={{ marginTop: 40 }}>РЕЗУЛЬТАТОВ ПОКА НЕТ</div>
          <div className="block-desc">Пройди хотя бы один блок диагностики — и здесь появится твой профиль.</div>
          <div className="nav-row"><button className="btn btn-accent" onClick={() => navigate('/test/1')}>Начать диагностику →</button></div>
        </div>
      </div>
    )
  }

  const arche = [
    ['Карьерный тип', profile.career_archetype, 'Какая деятельность тебе интереснее всего'],
    ['Ценностный тип', profile.values_archetype, 'Что для тебя важнее всего в работе'],
    ['Тип личности', profile.personality_archetype, 'Как ты обычно ведёшь себя с людьми и задачами'],
    ['Тип мышления', profile.cognitive_archetype, 'Как тебе легче всего думать и учиться'],
  ].filter(([, v]) => v)
  const pers = profile.personality_scores || {}
  const persOrder = ['agreeableness', 'conscientiousness', 'extraversion', 'openness', 'stress_resilience', 'anxiety', 'impulse_control', 'ambiguity_tolerance']
  const cog = profile.cognitive_scores || {}
  const cogSorted = Object.entries(cog).sort((a, b) => b[1] - a[1])

  return (
    <div className="cp-diag">
      <div className="topbar">
        <div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark"><svg viewBox="0 0 32 32" width="13" height="13" aria-hidden="true"><path d="M17.8 4.5 8.5 18.2h6.1L13 27.5 23.5 13.4h-6.1z" fill="#fff"/></svg></div>CAREER<span>PULSE</span></div><div className="tb-divider"></div><div className="tb-block">Готовность профиля: <b>{progress.pct}%</b></div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle />
          <button className="tb-btn" onClick={() => navigate('/dashboard')}>← В кабинет</button>
        </div>
      </div>
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="block-num">РЕЗУЛЬТАТ ДИАГНОСТИКИ</div>
        <div className="block-title">ТВОЙ ПРОФИЛЬ</div>
        <div className="block-desc">Пройдено блоков: {progress.completed.length} / {CP.TOTAL_BLOCKS}. Каждый блок добавляет слой.</div>

        {/* ── Разбор от нейросети (представляет маскот) ── */}
        <div className="r-card" style={{ marginTop: 24, borderColor: 'rgba(139,111,232,.3)', background: 'linear-gradient(135deg, rgba(139,111,232,.08), rgba(95,150,233,.04))' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <Mascot mood={repLoading ? 'thinking' : 'celebrating'} size="lg" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="r-label" style={{ marginBottom: 10, color: 'var(--violet)' }}>
                {!repLoading && report?.full_report ? MASCOT_RESULTS_LINE : 'Твой разбор'}
                {report?._source && <span style={{ fontSize: 9, color: 'var(--ghost)', marginLeft: 8 }}>{report._source === 'yandexgpt' ? '· YandexGPT' : '· локально'}</span>}
              </div>
              {repLoading && <div style={{ color: 'var(--sub)', fontSize: 14 }}>Пока думаю над твоим разбором… ⏳</div>}
              {!repLoading && report?.full_report && (
                <div style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--text)', maxWidth: '65ch' }}>
                  {String(report.full_report).split(/\n+/).map(s => s.trim()).filter(Boolean).map((para, i) => (
                    <p key={i} style={{ margin: i === 0 ? 0 : '12px 0 0' }}>{para}</p>
                  ))}
                </div>
              )}
              {!repLoading && !report?.full_report && <div style={{ color: 'var(--sub)', fontSize: 14 }}>Разбор пока недоступен.</div>}
            </div>
          </div>

          {!repLoading && report && (report.strengths?.length || report.weaknesses?.length) && (
            <div className="r-grid" style={{ marginTop: 18 }}>
              {report.strengths?.length > 0 && (
                <div><div className="r-label" style={{ color: 'var(--ok)', marginBottom: 6 }}>Сильные стороны</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.7 }}>{report.strengths.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              )}
              {report.weaknesses?.length > 0 && (
                <div><div className="r-label" style={{ color: 'var(--ember)', marginBottom: 6 }}>Зоны роста</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--sub)', lineHeight: 1.7 }}>{report.weaknesses.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
              )}
            </div>
          )}
          {atlasProfs.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="r-label" style={{ color: 'var(--accent)', marginBottom: 8 }}>Подходящие профессии <span style={{ color: 'var(--ghost)', fontWeight: 400 }}>· из атласа</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {atlasProfs.map((p) => (
                  <div key={p.id}
                    onClick={() => navigate('/atlas', { state: { q: p.name } })}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', padding: '6px 8px', borderRadius: 8, transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--overlay-rgb),.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <span style={{ flex: 1 }}>{p.name} <span style={{ color: 'var(--ghost)', fontSize: 11 }}>→ в атласе</span></span>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--accent)' }}>{p.match}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Образовательный путь: ЕГЭ + вузы/колледжи под топ-5 рекомендованных профессий ── */}
        {atlasProfs.slice(0, 5).length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div className="r-label" style={{ color: 'var(--accent)', marginBottom: 10 }}>Образовательный путь</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {atlasProfs.slice(0, 5).map(p => {
                const track = tracks[p.id]
                return (
                  <div key={p.id} className="r-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: track?.status === 'ready' ? 10 : 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--accent)', fontSize: 12 }}>{p.match}%</div>
                    </div>
                    {!track || track.status !== 'ready' ? (
                      <div style={{ fontSize: 12.5, color: 'var(--ghost)' }}>
                        {track?.status === 'unavailable'
                          ? 'Доступно только с подключённой базой данных.'
                          : 'Вузы и ЕГЭ для этой профессии пока заполняются — скоро появятся здесь.'}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {track.specialties.map(sp => (
                          <div key={sp.code}>
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{sp.name} <span style={{ color: 'var(--ghost)', fontWeight: 400 }}>· {sp.code}</span></div>
                            <div style={{ fontSize: 12, color: 'var(--sub)', marginBottom: 6 }}>
                              ЕГЭ: {sp.ege_required.join(', ')}{sp.ege_choose_one_of.length ? ` + один из (${sp.ege_choose_one_of.join(' / ')})` : ''}
                            </div>
                            {sp.programs.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {sp.programs.slice(0, 6).map((prog, i) => (
                                  <div key={i} style={{ fontSize: 12, color: 'var(--text)', display: 'flex', gap: 8 }}>
                                    <span style={{ flex: 1 }}>{prog.institution_name}{prog.city ? ` · ${prog.city}` : ''}</span>
                                    {prog.min_score_last_year && <span style={{ color: 'var(--ghost)' }}>от {prog.min_score_last_year} баллов ({prog.admission_year})</span>}
                                  </div>
                                ))}
                                {sp.programs.length > 6 && (
                                  <div style={{ fontSize: 11.5, color: 'var(--ghost)', marginTop: 2 }}>+{sp.programs.length - 6} вузов ещё</div>
                                )}
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: 'var(--ghost)' }}>Список вузов для этого направления пока не заполнен.</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {arche.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <BlockHead icon="🧩" color="#4079d3" title="Типология личности"
              sub="Один и тот же человек можно описать с четырёх разных сторон — ниже эти четыре взгляда на тебя." />
            <div className="r-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              {arche.map(([label, val, hint]) => (
                <div key={label} className="r-card">
                  <div className="r-label">{label}</div>
                  <div className="r-val r-accent" style={{ fontSize: 15 }}>{val}</div>
                  {hint && <div style={{ fontSize: 11, color: 'var(--ghost)', marginTop: 4 }}>{hint}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {profile.holland_scores && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <BlockHead icon="🧭" color="#3f77cf" title="Что тебе интересно" />
            {profile.holland_top2?.length === 2 && (
              <div className="block-intro">
                {buildHollandPortrait(profile.holland_top2, profile.career_archetype)}
              </div>
            )}
            {(() => {
              const ranked = ['R', 'I', 'A', 'S', 'E', 'C']
                .map(t => ({ t, v: Math.round(profile.holland_scores[t] || 0), p: HOLLAND_PLAIN[t], c: HOLLAND_COLOR[t] }))
                .sort((a, b) => b.v - a.v)
              const [lead, ...rest] = ranked
              return (
                <div className="holland-soty">
                  <div className="hs-lead" style={{ borderLeftColor: lead.c }}>
                    <span className="hs-lead-badge" style={{ color: lead.c, background: lead.c + '1f' }}>★ Твой ведущий тип</span>
                    <div className="hs-lead-name" style={{ color: lead.c }}>{lead.p.emoji} {lead.p.title}</div>
                    <div className="hs-lead-mean">{lead.p.hook}</div>
                    <div className="hs-metric">
                      <span className="hs-metric-cap">Насколько это про тебя</span>
                      <div className="hs-track"><div className="hs-fill" style={{ width: lead.v + '%', background: lead.c }} /></div>
                      <span className="hs-val">{lead.v}%</span>
                    </div>
                  </div>
                  <div className="hs-grid">
                    {rest.map(({ t, v, p, c }) => (
                      <div key={t} className="hs-card">
                        <div className="hs-card-top">
                          <span className="hs-card-name" style={{ color: c }}>{p.emoji} {p.title}</span>
                          <span className="hs-val">{v}%</span>
                        </div>
                        <div className="hs-card-mean">{p.tags.join(' · ')}</div>
                        <div className="hs-track"><div className="hs-fill" style={{ width: v + '%', background: c }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {persOrder.some(s => pers[s] != null) && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <BlockHead icon="🎭" color="#8b6fe8" title="Твой характер" />
            {buildPersonalityPortrait(pers, persOrder) && (
              <div className="block-intro">{buildPersonalityPortrait(pers, persOrder)}</div>
            )}
            <MetricGrid items={persOrder.filter(s => pers[s] != null).map(s => ({ key: s, name: SCALE_NAMES[s], v: Math.round(pers[s]), color: SCALE_COLORS[s], mean: PERSONALITY_PLAIN[s]?.hook }))} />
          </div>
        )}

        {cogSorted.length > 0 && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <BlockHead icon="🧠" color="#4079d3" title={`Как тебе легче думать и учиться${profile.vark_style ? ` · ${VARK_NAMES[profile.vark_style] || profile.vark_style}` : ''}`} />
            {buildCognitivePortrait(cogSorted) && (
              <div className="block-intro">{buildCognitivePortrait(cogSorted)}</div>
            )}
            <MetricGrid items={cogSorted.map(([k, v], i) => ({ key: k, name: COG_NAMES[k] || k, v: Math.round(v), color: COG_COLORS[i % 7], mean: COGNITIVE_PLAIN[k]?.hook }))} />
          </div>
        )}

        {(profile.values_archetype || profile.values_top3) && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <BlockHead icon="💎" color="#4a82db" title="Что для тебя важно в работе"
              sub="Все 8 ценностей — от самой важной к наименее важной (по тому, что ты выбирал(а) чаще при сравнении друг с другом)." />
            {profile.motivation_type && MOTIV[profile.motivation_type] && (
              <div className="block-intro">В целом {MOTIV[profile.motivation_type]}.</div>
            )}
            <div className="metrics">
              {Object.keys(VALUES_PLAIN)
                .map(k => [k, profile[k]])
                .filter(([, v]) => v != null)
                .sort((a, b) => b[1] - a[1])
                .map(([k], i) => (
                  <div key={k} className="metric">
                    <div className="metric__top"><span className="metric__name">{VALUE_NAMES[k] || k}</span><span className="metric__rank">#{i + 1}</span></div>
                    <div className="metric__mean">{VALUES_PLAIN[k]?.hint}</div>
                  </div>
                ))}
            </div>
            {profile.values_consistency != null && <div style={{ fontSize: 12, color: 'var(--ghost)', marginTop: 10 }}>Насколько твои ответы были последовательны: {profile.values_consistency}%</div>}
          </div>
        )}

        {profile.readiness_scores && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <BlockHead icon="🎯" color="#e8a0c4" title="Насколько ты готов(а) к разным видам работы"
              sub="Верхняя полоса — как ты сам(а) себя оцениваешь, нижняя — что показал реальный опыт (кружки, проекты, подработки)." />
            {Object.entries(profile.readiness_scores).sort((a, b) => (b[1].combined || 0) - (a[1].combined || 0)).map(([code, d]) => {
              const c = READY_COLORS[code] || 'var(--accent)'
              return (
                <div key={code} className="dual-bar">
                  <div className="dual-label">{READY_NAMES[code] || code}</div>
                  <div className="dual-tracks">
                    <div className="dtrack"><div className="dtrack-lbl">Сам(а) о себе</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: (d.ability_pct || 0) + '%', background: c, opacity: .6 }}></div></div><div className="dtrack-val">{Math.round(d.ability_pct || 0)}</div></div>
                    <div className="dtrack"><div className="dtrack-lbl">Реальный опыт</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: (d.experience_pct || 0) + '%', background: c }}></div></div><div className="dtrack-val">{Math.round(d.experience_pct || 0)}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {profile.se_confidence && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <BlockHead icon="⭐" color="#1a9d5c" title="В чём ты увереннее всего" />
            <MetricGrid items={Object.entries(profile.se_confidence).sort((a, b) => b[1] - a[1]).map(([d, v], i) => ({ key: d, name: SE_NAMES[d] || d, v: Math.round(v), color: COG_COLORS[i % 7] }))} />
          </div>
        )}

        <div className="r-grid" style={{ marginTop: 18 }}>
          {profile.career_execution != null && <div className="r-card"><div className="r-label">Опыт на практике</div><div className="r-val r-violet">{profile.career_execution}/100</div></div>}
          {profile.career_maturity != null && <div className="r-card"><div className="r-label">Ясность плана</div><div className="r-val r-accent">{profile.career_maturity}/100</div></div>}
          {profile.se_general != null && <div className="r-card"><div className="r-label">Уверенность в себе</div><div className="r-val">{profile.se_general}/100</div></div>}
          {profile.readiness_top2 && <div className="r-card"><div className="r-label">Больше всего готов(а) к</div><div className="r-val">{profile.readiness_top2.map(c => READY_NAMES[c] || c).join(' · ')}</div></div>}
        </div>

        <div className="nav-row" style={{ marginTop: 28 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>← В кабинет</button>
          <button className="btn btn-violet" onClick={() => navigate('/atlas')}>Атлас профессий</button>
          <button className="btn btn-accent" onClick={() => navigate('/roadmap')}>🗺️ Построить маршрут →</button>
        </div>
      </div>
    </div>
  )
}
