import { useNavigate, Link } from 'react-router-dom'

// Экран-заглушка для ролей, кабинеты которых ещё не готовы (HR, предприниматель).
const CONTENT = {
  hr: {
    icon: '🏢',
    title: 'Кабинет HR / Компании',
    sub: 'Раздел для работодателей — сейчас в активной разработке.',
    soon: [
      ['🎯', 'Пул кандидатов по профессии, Holland-типу и региону'],
      ['📊', 'Оценка команды и кадровых пробелов'],
      ['✉️', 'Приглашение сотрудников на диагностику'],
    ],
  },
  entrepreneur: {
    icon: '🚀',
    title: 'Кабинет предпринимателя',
    sub: 'Раздел для основателей — сейчас в активной разработке.',
    soon: [
      ['🧭', 'Фаундер-профиль: риск, лидерство, бизнес-склонности'],
      ['🤝', 'Твоя роль в команде основателей'],
      ['💡', 'Сильные и слабые стороны как предпринимателя'],
    ],
  },
}

export default function RolePlaceholder({ role }) {
  const navigate = useNavigate()
  const c = CONTENT[role] || CONTENT.hr

  return (
    <div className="cp-dashboard" style={{ minHeight: '100vh' }}>
      <div className="main">
      <div className="topbar">
        <div className="topbar-left">
          <div className="tb-logo" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontWeight: 800, letterSpacing: 1 }} onClick={() => navigate('/')}>
            <span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,var(--violet),var(--accent))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 32 32" width="14" height="14" aria-hidden="true"><path d="M17.8 4.5 8.5 18.2h6.1L13 27.5 23.5 13.4h-6.1z" fill="#fff" /></svg>
            </span>
            CAREER<span style={{ color: 'var(--accent)' }}>PULSE</span>
          </div>
        </div>
        <div className="topbar-right" />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{c.icon}</div>
        <div style={{ display: 'inline-block', fontSize: 11, letterSpacing: 2, fontWeight: 800, color: 'var(--violet)', background: 'color-mix(in srgb, var(--violet) 15%, transparent)', padding: '5px 12px', borderRadius: 20, marginBottom: 16 }}>
          В РАЗРАБОТКЕ
        </div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', margin: '0 0 10px', lineHeight: 1.15 }}>{c.title}</h1>
        <p style={{ fontSize: 15, color: 'var(--sub)', margin: '0 0 28px', lineHeight: 1.6 }}>{c.sub}</p>

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 20, textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Что здесь появится</div>
          {c.soon.map(([ic, text]) => (
            <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0' }}>
              <span style={{ fontSize: 18 }}>{ic}</span>
              <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--ghost)', marginBottom: 20 }}>
          Мы сообщим, когда раздел откроется. А пока можно пройти диагностику — для этого смени роль в профиле.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-accent">Сменить роль</Link>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>← На главную</button>
        </div>
      </div>
      </div>
    </div>
  )
}
