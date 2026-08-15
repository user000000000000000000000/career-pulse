import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CP } from '../../../shared/api'
import { analyzeDiagnostic } from '../api/diagnosticAPI'
import { getCareerTracksForProfessions } from '../../../shared/api'
import { matchProfessions } from '../../../entities/profession'
import { HOLLAND_PLAIN, buildHollandPortrait } from '../model/hollandPlain.js'
import { PERSONALITY_PLAIN, buildPersonalityPortrait, COGNITIVE_PLAIN, buildCognitivePortrait, VALUES_PLAIN, MOTIVATION_PLAIN, READINESS_PLAIN } from '../model/resultsPlain.js'
import { HOLLAND_SHORT as TYPE_NAMES } from '../model/hollandTypes'
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

function HollandRadar({ scores }) {
  const types = ['R', 'I', 'A', 'S', 'E', 'C']
  const cx = 130, cy = 125, R = 92
  const pt = (i, v) => { const ang = (Math.PI * 2 * i / 6) - Math.PI / 2; return [cx + R * v * Math.cos(ang), cy + R * v * Math.sin(ang)] }
  const poly = types.map((t, i) => pt(i, (scores[t] || 0) / 100).map(n => n.toFixed(1)).join(',')).join(' ')
  const rings = [1, 0.66, 0.33].map((s, k) => (
    <polygon key={k} points={types.map((_, i) => pt(i, s).map(n => n.toFixed(1)).join(',')).join(' ')} fill="none" stroke={`rgba(var(--overlay-rgb),${0.06 * s})`} strokeWidth="1" />
  ))
  const axes = types.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="rgba(var(--overlay-rgb),0.08)" /> })
  const labels = types.map((t, i) => {
    const [lx, ly] = pt(i, 1.18); const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle'
    return <text key={i} x={lx.toFixed(1)} y={(ly + 4).toFixed(1)} textAnchor={anchor} fill="var(--sub)" fontSize="10" fontFamily="Manrope">{TYPE_NAMES[t]}</text>
  })
  const dots = types.map((t, i) => { const [x, y] = pt(i, (scores[t] || 0) / 100); return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="var(--accent)" /> })
  return (
    <svg viewBox="-48 -6 356 290" style={{ width: '100%', maxWidth: 320 }} xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--violet)" stopOpacity="0.3" /><stop offset="100%" stopColor="var(--accent)" stopOpacity="0.3" /></linearGradient></defs>
      {rings}{axes}
      <polygon points={poly} fill="url(#rg)" stroke="var(--accent)" strokeWidth="2" />
      {dots}{labels}
    </svg>
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
        <div className="topbar"><div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark">⚡</div>CAREER<span>PULSE</span></div></div><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><ThemeToggle /><button className="tb-btn" onClick={() => navigate('/dashboard')}>← В кабинет</button></div></div>
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
        <div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark">⚡</div>CAREER<span>PULSE</span></div><div className="tb-divider"></div><div className="tb-block">Готовность профиля: <b>{progress.pct}%</b></div></div>
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
                <div style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text)' }}>
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
            <div className="r-label" style={{ color: 'var(--accent)', marginBottom: 4 }}>Типология личности</div>
            <div style={{ fontSize: 12, color: 'var(--ghost)', marginBottom: 10 }}>Один и тот же человек можно описать с четырёх разных сторон — ниже эти четыре взгляда на тебя</div>
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
            <div className="r-label" style={{ marginBottom: 8 }}>Что тебе интересно на самом деле</div>
            {profile.holland_top2?.length === 2 && (
              <div style={{ fontSize: 14.5, lineHeight: 1.7, color: 'var(--text)', marginBottom: 16 }}>
                {buildHollandPortrait(profile.holland_top2, profile.career_archetype)}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', textAlign: 'center' }}>
              <HollandRadar scores={profile.holland_scores} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, marginTop: 14 }}>
              {['R', 'I', 'A', 'S', 'E', 'C'].map(t => {
                const isTop = profile.holland_top2?.includes(t)
                const p = HOLLAND_PLAIN[t]
                return (
                  <div key={t} style={{
                    padding: '8px 10px', borderRadius: 8, fontSize: 12, lineHeight: 1.5,
                    background: isTop ? 'rgba(95,150,233,.08)' : 'transparent',
                    border: `1px solid ${isTop ? 'rgba(95,150,233,.3)' : 'var(--line)'}`,
                    color: isTop ? 'var(--text)' : 'var(--ghost)',
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{p.emoji} {p.title}</div>
                    <div>{p.tags.join(' · ')}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {persOrder.some(s => pers[s] != null) && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 8 }}>Твой характер</div>
            {buildPersonalityPortrait(pers, persOrder) && (
              <div style={{ fontSize: 13.5, color: 'var(--text)', marginBottom: 12 }}>{buildPersonalityPortrait(pers, persOrder)}</div>
            )}
            {persOrder.filter(s => pers[s] != null).map(s => (
              <div key={s} className="bar-row"><div className="bar-lbl">{SCALE_NAMES[s]}</div><div className="bar-track"><div className="bar-fill" style={{ width: pers[s] + '%', background: SCALE_COLORS[s] }}></div></div><div className="bar-val">{Math.round(pers[s])}</div></div>
            ))}
          </div>
        )}

        {cogSorted.length > 0 && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 8 }}>Как тебе легче думать и учиться {profile.vark_style ? `· стиль ${VARK_NAMES[profile.vark_style] || profile.vark_style}` : ''}</div>
            {buildCognitivePortrait(cogSorted) && (
              <div style={{ fontSize: 13.5, color: 'var(--text)', marginBottom: 12 }}>{buildCognitivePortrait(cogSorted)}</div>
            )}
            {cogSorted.map(([k, v], i) => (
              <div key={k} className="bar-row"><div className="bar-lbl">{COG_NAMES[k] || k}</div><div className="bar-track"><div className="bar-fill" style={{ width: v + '%', background: COG_COLORS[i % 7] }}></div></div><div className="bar-val">{Math.round(v)}</div></div>
            ))}
          </div>
        )}

        {(profile.values_archetype || profile.values_top3) && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 4 }}>Что для тебя важно в работе</div>
            <div style={{ fontSize: 12, color: 'var(--ghost)', marginBottom: 10 }}>Все 8 ценностей, от самой важной для тебя до наименее важной — не абсолютные баллы, а то, что ты выбирал(а) чаще при сравнении друг с другом</div>
            {profile.motivation_type && MOTIV[profile.motivation_type] && (
              <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>В целом {MOTIV[profile.motivation_type]}.</div>
            )}
            {Object.keys(VALUES_PLAIN)
              .map(k => [k, profile[k]])
              .filter(([, v]) => v != null)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v], i) => (
                <div key={k} className="bar-row" title={VALUES_PLAIN[k]?.hint || ''}>
                  <div className="bar-lbl">{i + 1}. {VALUE_NAMES[k] || k}</div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: v + '%', background: COG_COLORS[i % 7] }}></div></div>
                  <div className="bar-val">{Math.round(v)}</div>
                </div>
              ))}
            {profile.values_consistency != null && <div style={{ fontSize: 12, color: 'var(--ghost)', marginTop: 8 }}>Насколько твои ответы были последовательны: {profile.values_consistency}%</div>}
          </div>
        )}

        {profile.readiness_scores && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 4 }}>Насколько ты готов(а) к разным видам работы</div>
            <div style={{ fontSize: 12, color: 'var(--ghost)', marginBottom: 12 }}>Верхняя полоса — как ты сам(а) себя оцениваешь, нижняя — что показал реальный опыт (кружки, проекты, подработки)</div>
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
            <div className="r-label" style={{ marginBottom: 12 }}>В чём ты увереннее всего</div>
            {Object.entries(profile.se_confidence).sort((a, b) => b[1] - a[1]).map(([d, v], i) => (
              <div key={d} className="bar-row"><div className="bar-lbl">{SE_NAMES[d] || d}</div><div className="bar-track"><div className="bar-fill" style={{ width: v + '%', background: COG_COLORS[i % 7] }}></div></div><div className="bar-val">{Math.round(v)}</div></div>
            ))}
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
