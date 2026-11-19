import IconText from '../../../shared/ui/IconText.jsx'
import Header from '../../../shared/ui/Header.jsx'
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
    <div className="cp-dashboard" style={{ minHeight: '100vh', paddingTop: 'var(--site-header-clearance)' }}>
      <div className="main">
      <Header backTo="/" backLabel="← На главную" />

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}><IconText text={c.icon} /></div>
        <div style={{ display: 'inline-block', fontSize: 11, letterSpacing: 2, fontWeight: 800, color: 'var(--violet)', background: 'color-mix(in srgb, var(--violet) 15%, transparent)', padding: '5px 12px', borderRadius: 20, marginBottom: 16 }}>
          В РАЗРАБОТКЕ
        </div>
        <h1 style={{ fontSize: 'clamp(24px,5vw,34px)', margin: '0 0 10px', lineHeight: 1.15 }}><IconText text={c.title} /></h1>
        <p style={{ fontSize: 15, color: 'var(--sub)', margin: '0 0 28px', lineHeight: 1.6 }}>{c.sub}</p>

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 20, textAlign: 'left', marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--ghost)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Что здесь появится</div>
          {c.soon.map(([ic, text]) => (
            <div key={text} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0' }}>
              <span style={{ fontSize: 18 }}><IconText text={ic} /></span>
              <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: 'var(--ghost)', marginBottom: 20 }}>
          Мы сообщим, когда раздел откроется. А пока можно пройти диагностику — для этого смени роль в профиле.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/profile" className="btn btn-accent">Сменить роль</Link>
          <button className="btn btn-ghost" onClick={() => navigate('/')}><IconText text={"← На главную"} /></button>
        </div>
      </div>
      </div>
    </div>
  )
}
