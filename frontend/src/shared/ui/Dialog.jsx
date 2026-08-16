import { useEffect, useState } from 'react'

// Общий диалог вместо нативных alert/confirm.
//   const ok = await confirmDialog({ title, message, confirmText, cancelText, danger })
//   await alertDialog({ title, message, confirmText })
// Под капотом — singleton: открывающую функцию регистрирует смонтированный <DialogHost/>.

let _open = null

export function confirmDialog(opts = {}) {
  return new Promise((resolve) => {
    if (typeof _open !== 'function') { resolve(window.confirm(opts.message || '')); return }
    _open({ ...opts, resolve, isAlert: false })
  })
}
export function alertDialog(opts = {}) {
  return new Promise((resolve) => {
    if (typeof _open !== 'function') { window.alert(opts.message || ''); resolve(); return }
    _open({ ...opts, resolve, isAlert: true })
  })
}

const btnBase = { padding: '10px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: "'Golos Text',sans-serif", border: 'none' }
const btnAccent = { ...btnBase, background: 'var(--accent,#5f96e9)', color: '#ffffff' }
const btnDanger = { ...btnBase, background: 'var(--danger,#ff4d6d)', color: '#fff' }
const btnGhost = { ...btnBase, background: 'transparent', color: 'var(--sub,#626185)', border: '1px solid var(--line2,rgba(255,255,255,.12))' }

export function DialogHost() {
  const [d, setD] = useState(null)

  useEffect(() => {
    _open = (s) => setD(s)
    return () => { _open = null }
  }, [])

  useEffect(() => {
    if (!d) return
    const onKey = (e) => {
      if (e.key === 'Escape') close(d.isAlert ? undefined : false)
      if (e.key === 'Enter') close(d.isAlert ? undefined : true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d])

  if (!d) return null
  const close = (val) => { setD(null); d.resolve(val) }
  const onOverlay = (e) => { if (e.target === e.currentTarget) close(d.isAlert ? undefined : false) }

  return (
    <div onClick={onOverlay} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'cpDlgFade .15s ease' }}>
      <div role="dialog" aria-modal="true" style={{ width: '100%', maxWidth: 400, background: 'var(--card,#eef0fb)', border: '1px solid var(--line2,rgba(255,255,255,.12))', borderRadius: 16, boxShadow: '0 24px 70px rgba(0,0,0,.6)', padding: 24, fontFamily: "'Golos Text',sans-serif", animation: 'cpDlgIn .18s ease' }}>
        {d.title && <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: 1.5, color: 'var(--text,#25205c)', marginBottom: 10 }}>{d.title}</div>}
        <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--sub,#626185)', whiteSpace: 'pre-line' }}>{d.message}</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
          {!d.isAlert && (
            <button onClick={() => close(false)} style={btnGhost}>{d.cancelText || 'Отмена'}</button>
          )}
          <button onClick={() => close(d.isAlert ? undefined : true)} style={d.danger ? btnDanger : btnAccent}>
            {d.confirmText || (d.isAlert ? 'Понятно' : 'Да')}
          </button>
        </div>
      </div>
      <style>{`@keyframes cpDlgFade{from{opacity:0}to{opacity:1}}@keyframes cpDlgIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
