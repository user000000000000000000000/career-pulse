import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { checkIsAdmin, adminDashboardStats, adminListUsers, adminListFeedback, adminSetFeedbackStatus } from '../../../shared/api'
import Header from '../../../shared/ui/Header.jsx'
import '../admin.css'

const FB_CAT = { bug: '🐞 Ошибка', idea: '💡 Идея', other: '💬 Другое' }
const FB_NEXT = { new: 'read', read: 'done', done: 'new' }
const FB_STATUS = { new: 'Новое', read: 'Просмотрено', done: 'Решено' }
const FB_COLOR = { new: '#e08a2e', read: '#4079d3', done: '#16a085' }
const fbDate = (d) => d ? new Date(d).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''

const PAGE = 40
// Различимые по тону цвета для каждой роли (синий/фиолет/розовый/оранжевый/бирюза/серый).
const ROLES = {
  student:      { ru: 'Школьник',       color: '#4079d3' },
  parent:       { ru: 'Родитель',        color: '#8b6fe8' },
  specialist:   { ru: 'Специалист',      color: '#e0699b' },
  entrepreneur: { ru: 'Предприниматель', color: '#e08a2e' },
  hr:           { ru: 'HR / Компания',   color: '#16a085' },
  '—':          { ru: 'Не указана',      color: '#82819b' },
}
const roleInfo = (r) => ROLES[r] || ROLES['—']
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'

function Tile({ ic, value, label, sub }) {
  return (
    <div className="adm-tile">
      <div className="adm-tile__ic">{ic}</div>
      <div className="adm-tile__val">{value}</div>
      <div className="adm-tile__label">{label}</div>
      {sub && <div className="adm-tile__sub">{sub}</div>}
    </div>
  )
}

function RoleBreakdown({ byRole, total }) {
  const entries = Object.entries(byRole || {}).sort((a, b) => b[1] - a[1])
  if (!entries.length || !total) return null
  return (
    <div className="adm-roles">
      <div className="adm-roles__head">Пользователи по ролям</div>
      <div className="adm-rolebar">
        {entries.map(([r, c]) => (
          <span key={r} title={`${roleInfo(r).ru}: ${c}`} style={{ width: (c / total * 100) + '%', background: roleInfo(r).color }} />
        ))}
      </div>
      <div className="adm-legend">
        {entries.map(([r, c]) => (
          <div key={r} className="adm-legend-item">
            <span className="adm-dot" style={{ background: roleInfo(r).color }} />
            {roleInfo(r).ru} <b>{c}</b>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const navigate = useNavigate()
  const [ok, setOk] = useState(null)
  const [stats, setStats] = useState({ total: 0, passed: 0, new7: 0, with_report: 0, links: 0, by_role: {} })
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const [offset, setOffset] = useState(0)
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    checkIsAdmin().then(a => { setOk(a); if (!a) navigate('/dashboard', { replace: true }) })
  }, [navigate])

  function loadFeedback() { adminListFeedback().then(r => setFeedback(r.items)).catch(() => {}) }
  async function cycleStatus(f) {
    const next = FB_NEXT[f.status] || 'read'
    try { await adminSetFeedbackStatus(f.id, next); setFeedback(list => list.map(x => x.id === f.id ? { ...x, status: next } : x)) } catch { /* noop */ }
  }

  const load = useCallback(async (opts = {}) => {
    setBusy(true)
    try {
      const off = opts.offset ?? offset
      const r = opts.role ?? role
      const s = opts.search ?? search
      const [st, list] = await Promise.all([
        opts.skipStats ? null : adminDashboardStats(),
        adminListUsers({ search: s, role: r, limit: PAGE, offset: off }),
      ])
      if (st) setStats(st)
      setUsers(list.users); setTotal(list.total)
    } catch { /* показываем что есть */ } finally { setBusy(false) }
  }, [search, role, offset])

  useEffect(() => { if (ok) { load(); loadFeedback() } }, [ok])

  function apply(nextRole = role) {
    setRole(nextRole); setOffset(0)
    load({ offset: 0, skipStats: true, role: nextRole })
  }
  function onSubmit(e) { e.preventDefault(); apply() }
  function page(delta) { const o = Math.max(0, offset + delta * PAGE); setOffset(o); load({ offset: o, skipStats: true }) }

  if (ok === null) return <div className="cp-legal"><Header backTo="/dashboard" backLabel="← В кабинет" reserveRight /><div className="adm-empty">Проверка доступа…</div></div>
  if (!ok) return null

  const conv = stats.total ? Math.round(stats.passed / stats.total * 100) : 0

  return (
    <div className="cp-legal">
      <Header backTo="/dashboard" backLabel="← В кабинет" reserveRight />
      <div className="adm-wrap">
        <div className="adm-eyebrow">АДМИН-ПАНЕЛЬ</div>
        <h1 className="adm-title">Обзор</h1>
        <div className="adm-sub">Пользователи, диагностика и разборы CareerPulse.</div>

        <div className="adm-tiles">
          <Tile ic="👥" value={stats.total} label="Всего зарегистрировано" />
          <Tile ic="✅" value={stats.passed} label="Прошли диагностику" sub={`конверсия ${conv}%`} />
          <Tile ic="🆕" value={stats.new7} label="Новых за 7 дней" />
          <Tile ic="🧠" value={stats.with_report} label="С ИИ-разбором" />
          <Tile ic="👪" value={stats.links} label="Связок родитель↔ребёнок" />
        </div>

        <RoleBreakdown byRole={stats.by_role} total={stats.total} />

        <form className="adm-toolbar" onSubmit={onSubmit}>
          <input className="adm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск: имя, email или телефон" />
          <select className="adm-select" value={role} onChange={e => apply(e.target.value)}>
            <option value="">Все роли</option>
            {Object.entries(ROLES).filter(([k]) => k !== '—').map(([k, v]) => <option key={k} value={k}>{v.ru}</option>)}
          </select>
          <button className="btn btn-accent" type="submit" disabled={busy}>Найти</button>
          <span className="adm-count">Найдено: {total}</span>
        </form>

        <div className="adm-tablewrap">
          <div className="adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Пользователь</th><th>Роль</th><th className="col-city">Город</th>
                  <th>Прогресс</th><th>Тест</th><th>ИИ</th><th className="col-date">Регистрация</th><th></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const ri = roleInfo(u.role || '—')
                  const pct = Number(u.pct) || 0
                  const passed = u.has_passed_test || pct >= 100
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="adm-user-name">{u.full_name || '—'}</div>
                        <div className="adm-user-contact">{u.email || '—'}{u.phone ? ` · ${u.phone}` : ''}</div>
                      </td>
                      <td><span className="adm-chip" style={{ background: ri.color + '22', color: ri.color }}>{ri.ru}</span></td>
                      <td className="col-city">{u.city || '—'}</td>
                      <td>
                        <div className="adm-mini">
                          <div className="adm-mini-track"><div className="adm-mini-fill" style={{ width: pct + '%' }} /></div>
                          <span className="adm-mini-val">{pct}%</span>
                        </div>
                      </td>
                      <td>{passed ? <span className="adm-yes">✓</span> : <span className="adm-no">—</span>}</td>
                      <td>{u.ai_src ? <span className="adm-badge-ai">{u.ai_src === 'yandexgpt' ? 'YandexGPT' : 'есть'}</span> : <span className="adm-no">—</span>}</td>
                      <td className="col-date"><span className="adm-date">{fmtDate(u.created_at)}</span></td>
                      <td>{(u.has_passed_test || u.pct) && <button className="adm-open" onClick={() => navigate(`/child/${u.id}`)}>Разбор →</button>}</td>
                    </tr>
                  )
                })}
                {!users.length && !busy && <tr><td colSpan={8} className="adm-empty">Ничего не найдено</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-pager">
          <span>Показаны {total ? offset + 1 : 0}–{Math.min(offset + PAGE, total)} из {total}</span>
          <span className="adm-pager-btns">
            <button className="btn btn-ghost" disabled={offset === 0 || busy} onClick={() => page(-1)}>← Назад</button>
            <button className="btn btn-ghost" disabled={offset + PAGE >= total || busy} onClick={() => page(1)}>Вперёд →</button>
          </span>
        </div>

        {/* ── Обратная связь ── */}
        <h2 className="adm-title" style={{ fontSize: 22, margin: '38px 0 4px' }}>Обратная связь</h2>
        <div className="adm-sub">Сообщения о проблемах и идеи от пользователей{feedback.some(f => f.status === 'new') ? ` · новых: ${feedback.filter(f => f.status === 'new').length}` : ''}. Нажмите на статус, чтобы переключить.</div>
        {feedback.length === 0 ? (
          <div className="adm-tile" style={{ color: 'var(--ghost)' }}>Пока сообщений нет.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {feedback.map(f => (
              <div key={f.id} className="adm-tile" style={{ opacity: f.status === 'done' ? 0.65 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span className="adm-chip" style={{ background: 'var(--line)', color: 'var(--sub)' }}>{FB_CAT[f.category] || f.category}</span>
                  <button onClick={() => cycleStatus(f)} className="adm-chip" title="Переключить статус"
                    style={{ background: (FB_COLOR[f.status] || '#82819b') + '22', color: FB_COLOR[f.status] || '#82819b', border: 0, cursor: 'pointer', fontFamily: 'inherit' }}>{FB_STATUS[f.status] || f.status}</button>
                  <span style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--ghost)' }}>{fbDate(f.created_at)}</span>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{f.message}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ghost)', marginTop: 8 }}>
                  {f.email ? `✉️ ${f.email}` : 'без контакта'}{f.page_url ? ` · ${f.page_url.replace(location.origin, '') || '/'}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
