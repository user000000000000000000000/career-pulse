import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CP from '../../services/cpStorage'
import { analyzeDiagnostic } from '../../services/diagnosticAPI'
import '../../styles/diagnostic.css'

const TYPE_NAMES = { R: 'Реалистичный', I: 'Исследоват.', A: 'Артистичный', S: 'Социальный', E: 'Предприимч.', C: 'Конвенц.' }
const SCALE_NAMES = { agreeableness: 'Дружелюбие', conscientiousness: 'Добросовестность', extraversion: 'Экстраверсия', openness: 'Открытость', stress_resilience: 'Стрессоустойч.', anxiety: 'Тревожность', impulse_control: 'Самоконтроль', ambiguity_tolerance: 'Толер. к неопр.' }
const SCALE_COLORS = { agreeableness: '#00e5c8', conscientiousness: '#7b5cf0', extraversion: '#ff6b35', openness: '#f5c842', stress_resilience: '#22d97a', anxiety: '#ff4d6d', impulse_control: '#00a8e0', ambiguity_tolerance: '#a480f8' }
const COG_NAMES = { LANG: 'Вербальное', MATH: 'Логико-мат.', SPAT: 'Пространств.', KINE: 'Практическое', MUSI: 'Музыкальное', SOC: 'Социальный инт.', SYS: 'Системное' }
const COG_COLORS = ['#00e5c8', '#7b5cf0', '#ff6b35', '#f5c842', '#22d97a', '#00a8e0', '#a480f8']
const VARK_NAMES = { V: 'Визуальный', A: 'Аудиальный', R: 'Чтение/Письмо', K: 'Кинестетический', multimodal: 'Мультимодальный' }
const VALUE_NAMES = { KR: 'Креативность', AK: 'Активные контакты', RZ: 'Развитие себя', DU: 'Духовное удовлетворение', PR: 'Престиж', MB: 'Материальное', DO: 'Достижения', IN: 'Индивидуальность' }
const MOTIV = { spiritual: 'Духовный', pragmatic: 'Прагматический', mixed: 'Смешанный' }
const READY_NAMES = { HH: 'Человек–Человек', HT: 'Человек–Техника', HZ: 'Человек–Знак', HX: 'Человек–Образ', HP: 'Человек–Природа' }
const READY_COLORS = { HH: '#00e5c8', HT: '#7b5cf0', HZ: '#ff6b35', HX: '#f5c842', HP: '#22d97a' }
const SE_NAMES = { S: 'Люди', I: 'Аналитика', A: 'Творчество', E: 'Лидерство', C: 'Системность' }

function HollandRadar({ scores }) {
  const types = ['R', 'I', 'A', 'S', 'E', 'C']
  const cx = 130, cy = 125, R = 92
  const pt = (i, v) => { const ang = (Math.PI * 2 * i / 6) - Math.PI / 2; return [cx + R * v * Math.cos(ang), cy + R * v * Math.sin(ang)] }
  const poly = types.map((t, i) => pt(i, (scores[t] || 0) / 100).map(n => n.toFixed(1)).join(',')).join(' ')
  const rings = [1, 0.66, 0.33].map((s, k) => (
    <polygon key={k} points={types.map((_, i) => pt(i, s).map(n => n.toFixed(1)).join(',')).join(' ')} fill="none" stroke={`rgba(255,255,255,${0.06 * s})`} strokeWidth="1" />
  ))
  const axes = types.map((_, i) => { const [x, y] = pt(i, 1); return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke="rgba(255,255,255,0.04)" /> })
  const labels = types.map((t, i) => {
    const [lx, ly] = pt(i, 1.18); const anchor = lx < cx - 5 ? 'end' : lx > cx + 5 ? 'start' : 'middle'
    return <text key={i} x={lx.toFixed(1)} y={(ly + 4).toFixed(1)} textAnchor={anchor} fill="#9898b8" fontSize="10" fontFamily="Manrope">{TYPE_NAMES[t]}</text>
  })
  const dots = types.map((t, i) => { const [x, y] = pt(i, (scores[t] || 0) / 100); return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="4" fill="#00e5c8" /> })
  return (
    <svg viewBox="-48 -6 356 290" style={{ width: '100%', maxWidth: 320 }} xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#7b5cf0" stopOpacity="0.3" /><stop offset="100%" stopColor="#00e5c8" stopOpacity="0.3" /></linearGradient></defs>
      {rings}{axes}
      <polygon points={poly} fill="url(#rg)" stroke="#00e5c8" strokeWidth="2" />
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

  useEffect(() => {
    let alive = true
    Promise.all([CP.getProfile(), CP.getProgress()]).then(([p, pr]) => { if (alive) { setProfile(p); setProgress(pr) } })
    return () => { alive = false }
  }, [])

  // Разбор от нейросети: берём из кэша профиля или запрашиваем (YandexGPT / локально)
  useEffect(() => {
    if (!profile || !progress.completed?.length) return
    if (profile.ai_report) { setReport(profile.ai_report); return }
    let alive = true
    setRepLoading(true)
    analyzeDiagnostic(profile)
      .then(r => { if (!alive) return; setReport(r); CP.updateProfile({ ai_report: r }) })
      .finally(() => { if (alive) setRepLoading(false) })
    return () => { alive = false }
  }, [profile, progress])

  if (!profile) return null
  const has = progress.completed.length > 0

  if (!has) {
    return (
      <div className="cp-diag">
        <div className="topbar"><div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark">⚡</div>CAREER<span>PULSE</span></div></div><button className="tb-btn" onClick={() => navigate('/dashboard')}>← В кабинет</button></div>
        <div className="container">
          <div className="block-title" style={{ marginTop: 40 }}>РЕЗУЛЬТАТОВ ПОКА НЕТ</div>
          <div className="block-desc">Пройди хотя бы один блок диагностики — и здесь появится твой профиль.</div>
          <div className="nav-row"><button className="btn btn-accent" onClick={() => navigate('/test/1')}>Начать диагностику →</button></div>
        </div>
      </div>
    )
  }

  const arche = [
    ['Карьерный (Holland)', profile.career_archetype],
    ['Ценностный', profile.values_archetype],
    ['Личностный', profile.personality_archetype],
    ['Когнитивный', profile.cognitive_archetype],
  ].filter(([, v]) => v)
  const pers = profile.personality_scores || {}
  const persOrder = ['agreeableness', 'conscientiousness', 'extraversion', 'openness', 'stress_resilience', 'anxiety', 'impulse_control', 'ambiguity_tolerance']
  const cog = profile.cognitive_scores || {}
  const cogSorted = Object.entries(cog).sort((a, b) => b[1] - a[1])

  return (
    <div className="cp-diag">
      <div className="topbar">
        <div className="tb-left"><div className="tb-logo" onClick={() => navigate('/dashboard')}><div className="tb-logo-mark">⚡</div>CAREER<span>PULSE</span></div><div className="tb-divider"></div><div className="tb-block">Готовность профиля: <b>{progress.pct}%</b></div></div>
        <button className="tb-btn" onClick={() => navigate('/dashboard')}>← В кабинет</button>
      </div>
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="block-num">РЕЗУЛЬТАТ ДИАГНОСТИКИ</div>
        <div className="block-title">ТВОЙ ПРОФИЛЬ</div>
        <div className="block-desc">Пройдено блоков: {progress.completed.length} / 10. Каждый блок добавляет слой.</div>

        {/* ── Разбор от нейросети ── */}
        <div className="r-card" style={{ marginTop: 24, borderColor: 'rgba(123,92,240,.3)', background: 'linear-gradient(135deg, rgba(123,92,240,.08), rgba(0,229,200,.04))' }}>
          <div className="r-label" style={{ marginBottom: 10, color: '#a480f8', display: 'flex', alignItems: 'center', gap: 8 }}>
            🤖 Разбор от нейросети
            {report?._source && <span style={{ fontSize: 9, color: 'var(--ghost)' }}>{report._source === 'yandexgpt' ? '· YandexGPT' : '· локально'}</span>}
          </div>
          {repLoading && <div style={{ color: 'var(--sub)', fontSize: 14 }}>Нейросеть пишет разбор… ⏳</div>}
          {!repLoading && report?.full_report && (
            <div style={{ fontSize: 14.5, lineHeight: 1.8, color: 'var(--text)' }}>
              {String(report.full_report).split(/\n+/).map(s => s.trim()).filter(Boolean).map((para, i) => (
                <p key={i} style={{ margin: i === 0 ? 0 : '12px 0 0' }}>{para}</p>
              ))}
            </div>
          )}
          {!repLoading && !report?.full_report && <div style={{ color: 'var(--sub)', fontSize: 14 }}>Разбор пока недоступен.</div>}

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
          {!repLoading && report?.recommended_professions?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="r-label" style={{ color: 'var(--accent)', marginBottom: 8 }}>Подходящие профессии</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {report.recommended_professions.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                    <span style={{ flex: 1 }}>{p.name}</span>
                    {typeof p.match === 'number' && <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, color: 'var(--accent)' }}>{p.match}%</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {arche.length > 0 && (
          <div className="r-grid" style={{ gridTemplateColumns: 'repeat(2,1fr)', marginTop: 24 }}>
            {arche.map(([label, val]) => (
              <div key={label} className="r-card"><div className="r-label">{label}</div><div className="r-val r-accent" style={{ fontSize: 15 }}>{val}</div></div>
            ))}
          </div>
        )}

        {profile.holland_scores && (
          <div className="r-card" style={{ marginTop: 18, textAlign: 'center' }}>
            <div className="r-label" style={{ marginBottom: 8 }}>Склонности Holland · код {profile.holland_code}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><HollandRadar scores={profile.holland_scores} /></div>
          </div>
        )}

        {persOrder.some(s => pers[s] != null) && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 12 }}>Личность (Big Five+)</div>
            {persOrder.filter(s => pers[s] != null).map(s => (
              <div key={s} className="bar-row"><div className="bar-lbl">{SCALE_NAMES[s]}</div><div className="bar-track"><div className="bar-fill" style={{ width: pers[s] + '%', background: SCALE_COLORS[s] }}></div></div><div className="bar-val">{Math.round(pers[s])}</div></div>
            ))}
          </div>
        )}

        {cogSorted.length > 0 && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 12 }}>Когнитивный профиль {profile.vark_style ? `· стиль ${VARK_NAMES[profile.vark_style] || profile.vark_style}` : ''}</div>
            {cogSorted.map(([k, v], i) => (
              <div key={k} className="bar-row"><div className="bar-lbl">{COG_NAMES[k] || k}</div><div className="bar-track"><div className="bar-fill" style={{ width: v + '%', background: COG_COLORS[i % 7] }}></div></div><div className="bar-val">{Math.round(v)}</div></div>
            ))}
          </div>
        )}

        {(profile.values_archetype || profile.values_top3) && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 10 }}>Ценности {profile.motivation_type ? `· ${MOTIV[profile.motivation_type] || profile.motivation_type} профиль` : ''}</div>
            {profile.values_archetype && <div className="r-val r-accent" style={{ fontSize: 15, marginBottom: 8 }}>{profile.values_archetype}</div>}
            {profile.values_top3?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.values_top3.map((v, i) => (
                  <span key={v} style={{ padding: '6px 14px', borderRadius: 100, background: 'rgba(0,229,200,.08)', border: '1px solid rgba(0,229,200,.25)', color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>{i + 1}. {VALUE_NAMES[v] || v}</span>
                ))}
              </div>
            )}
            {profile.values_consistency != null && <div style={{ fontSize: 12, color: 'var(--ghost)', marginTop: 8 }}>Согласованность ценностей: {profile.values_consistency}%</div>}
          </div>
        )}

        {profile.readiness_scores && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 12 }}>Профессиональная готовность · самооценка vs реальный опыт</div>
            {Object.entries(profile.readiness_scores).sort((a, b) => (b[1].combined || 0) - (a[1].combined || 0)).map(([code, d]) => {
              const c = READY_COLORS[code] || 'var(--accent)'
              return (
                <div key={code} className="dual-bar">
                  <div className="dual-label">{READY_NAMES[code] || code}</div>
                  <div className="dual-tracks">
                    <div className="dtrack"><div className="dtrack-lbl">Самооценка</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: (d.ability_pct || 0) + '%', background: c, opacity: .6 }}></div></div><div className="dtrack-val">{Math.round(d.ability_pct || 0)}</div></div>
                    <div className="dtrack"><div className="dtrack-lbl">Опыт</div><div className="dtrack-bar"><div className="dtrack-fill" style={{ width: (d.experience_pct || 0) + '%', background: c }}></div></div><div className="dtrack-val">{Math.round(d.experience_pct || 0)}</div></div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {profile.se_confidence && (
          <div className="r-card" style={{ marginTop: 18 }}>
            <div className="r-label" style={{ marginBottom: 12 }}>Уверенность в себе по направлениям</div>
            {Object.entries(profile.se_confidence).sort((a, b) => b[1] - a[1]).map(([d, v], i) => (
              <div key={d} className="bar-row"><div className="bar-lbl">{SE_NAMES[d] || d}</div><div className="bar-track"><div className="bar-fill" style={{ width: v + '%', background: COG_COLORS[i % 7] }}></div></div><div className="bar-val">{Math.round(v)}</div></div>
            ))}
          </div>
        )}

        <div className="r-grid" style={{ marginTop: 18 }}>
          {profile.career_execution != null && <div className="r-card"><div className="r-label">Индекс реализации</div><div className="r-val r-violet">{profile.career_execution}/100</div></div>}
          {profile.career_maturity != null && <div className="r-card"><div className="r-label">Проф. зрелость</div><div className="r-val r-accent">{profile.career_maturity}/100</div></div>}
          {profile.se_general != null && <div className="r-card"><div className="r-label">Уверенность в себе</div><div className="r-val">{profile.se_general}/100</div></div>}
          {profile.readiness_top2 && <div className="r-card"><div className="r-label">Готовность (топ-2)</div><div className="r-val">{profile.readiness_top2.join(' · ')}</div></div>}
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
