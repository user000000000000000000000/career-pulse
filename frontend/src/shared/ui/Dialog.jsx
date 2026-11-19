import IconText from './IconText.jsx'
import { useEffect, useRef, useState } from 'react'
import { useModal } from './ModalProvider.jsx'

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
// Выбор из нескольких вариантов: options = [{ label, value, style }]. Резолвится value кнопки.
export function choiceDialog(opts = {}) {
  return new Promise((resolve) => {
    if (typeof _open !== 'function') { resolve(null); return }
    _open({ ...opts, resolve, isAlert: false })
  })
}

const btnBase = { padding: '12px 20px', borderRadius: 999, minHeight: 44, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)', border: 'none' }
const btnAccent = { ...btnBase, background: 'var(--brand-gradient)', color: '#ffffff' }
const btnDanger = { ...btnBase, background: 'var(--brand-danger,#087cff)', color: '#fff' }
const btnGhost = { ...btnBase, background: 'transparent', color: 'var(--brand-copy,#42658c)', border: '1px solid var(--line2,rgba(255,255,255,.12))' }

export function DialogHost() {
  const [d, setD] = useState(null)
  const dialogRef = useRef(null)
  const confirmRef = useRef(null)
  const close = val => { if (!d) return; setD(null); d.resolve(val) }
  useModal({ open: Boolean(d), dialogRef, initialFocusRef: confirmRef, onClose: () => close(d?.options ? null : d?.isAlert ? undefined : false) })

  useEffect(() => {
    _open = (s) => setD(s)
    return () => { _open = null }
  }, [])

  if (!d) return null
  const onOverlay = (e) => { if (e.target === e.currentTarget) close(d.isAlert ? undefined : false) }

  return (
    <div className="site-dialog-overlay" onClick={onOverlay} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(8,124,255,.38)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, animation: 'cpDlgFade .15s ease' }}>
      <div ref={dialogRef} className="site-dialog" role="dialog" aria-modal="true" aria-labelledby={d.title ? 'site-dialog-title' : undefined} aria-describedby="site-dialog-message" style={{ width: '100%', maxWidth: 440, maxHeight: '85dvh', overflowY: 'auto', background: 'var(--card,#fff)', border: '1px solid var(--brand-border)', borderRadius: 28, boxShadow: '0 24px 70px #174d8438', padding: 28, fontFamily: 'var(--font-body)', animation: 'cpDlgIn .18s ease' }}>
        {d.title && <div id="site-dialog-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 21, lineHeight: 1.4, letterSpacing: '-.025em', color: 'var(--brand-ink)', marginBottom: 14 }}><IconText text={d.title} /></div>}
        <div id="site-dialog-message" style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--brand-copy,#42658c)', whiteSpace: 'pre-line' }}>{d.message}</div>
        {d.options ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
            {d.options.map((o) => (
              <button key={o.value} onClick={() => close(o.value)}
                style={o.style === 'danger' ? btnDanger : o.style === 'ghost' ? btnGhost : btnAccent}>
                <IconText text={o.label} />
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22 }}>
            {!d.isAlert && (
              <button onClick={() => close(false)} style={btnGhost}>{d.cancelText || 'Отмена'}</button>
            )}
            <button ref={confirmRef} onClick={() => close(d.isAlert ? undefined : true)} style={d.danger ? btnDanger : btnAccent}>
              {d.confirmText || (d.isAlert ? 'Понятно' : 'Да')}
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes cpDlgFade{from{opacity:0}to{opacity:1}}@keyframes cpDlgIn{from{opacity:0;transform:translateY(-8px) scale(.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}
