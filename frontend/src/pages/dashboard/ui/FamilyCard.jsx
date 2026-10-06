import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateLinkCode, redeemLinkCode, listFamily, unlinkFamily } from '../../../shared/api'
import { confirmDialog, alertDialog } from '../../../shared/ui/Dialog.jsx'
import { friendlyError } from '../../../shared/lib/errors'

// Карточка «Семья» на дашборде.
//  • Ребёнок (student): показывает код для родителя + список привязанных родителей.
//  • Родитель (parent): вводит код ребёнка + список детей с результатами.
export default function FamilyCard({ role }) {
  const navigate = useNavigate()
  const isParent = role === 'parent'
  const [links, setLinks] = useState({ parents: [], children: [] })
  const [code, setCode] = useState('')          // сгенерированный код (ребёнок)
  const [input, setInput] = useState('')        // ввод кода (родитель)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)

  function onCopy() {
    if (!code) return
    try { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* нет доступа к буферу */ }
  }

  async function load() {
    try { setLinks(await listFamily()) } catch { /* тихо: секция просто пустая */ }
  }
  useEffect(() => { load() }, [])

  async function onGenerate() {
    setErr('')
    try { setBusy(true); const { code } = await generateLinkCode(); setCode(code) }
    catch (e) { setErr(friendlyError(e, 'Не удалось создать код')) }
    finally { setBusy(false) }
  }
  async function onRedeem() {
    setErr('')
    const c = input.trim()
    if (c.length < 4) return setErr('Введите 4-значный код')
    try {
      setBusy(true)
      const res = await redeemLinkCode(c)
      if (!res?.ok) { setErr(res?.error || 'Код неверный или истёк'); return }
      setInput('')
      await load()
      alertDialog({ title: 'Готово ✓', message: `Аккаунт «${res.child_name}» привязан. Теперь вы видите его результаты.` })
    } catch (e) { setErr(friendlyError(e, 'Не удалось привязать')) }
    finally { setBusy(false) }
  }
  async function onUnlink(id, name) {
    if (!await confirmDialog({ title: 'Отвязать', message: `Отвязать ${name || 'аккаунт'}?`, confirmText: 'Отвязать', danger: true })) return
    try { await unlinkFamily(id); await load() } catch (e) { alertDialog({ message: friendlyError(e, 'Не удалось отвязать') }) }
  }

  const list = isParent ? links.children : links.parents
  const fmt = (c) => c || ''

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: 20, marginTop: 16 }}>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{isParent ? '👪 Мои дети' : '👪 Родители'}</div>
      <div style={{ fontSize: 12.5, color: 'var(--sub)', marginBottom: 14 }}>
        {isParent
          ? 'Введите код из кабинета ребёнка — и вы увидите его результаты диагностики.'
          : 'Покажите код родителю — он сможет видеть ваши результаты (только просмотр).'}
      </div>

      {err && <div style={{ fontSize: 12.5, color: 'var(--danger)', marginBottom: 10 }}>{err}</div>}

      {isParent ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <input value={input} onChange={e => setInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="Код ребёнка, напр. 4821" inputMode="numeric" maxLength={4}
            onKeyDown={e => e.key === 'Enter' && onRedeem()}
            style={{ flex: 1, minWidth: 160, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--line2)', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'JetBrains Mono',monospace", letterSpacing: 2, fontSize: 15 }} />
          <button className="btn btn-accent" onClick={onRedeem} disabled={busy}>{busy ? '…' : 'Привязать'}</button>
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          {code ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={onCopy} title="Нажми, чтобы скопировать"
                style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 26, fontWeight: 800, letterSpacing: 3, color: 'var(--accent)', background: 'var(--bg)', border: '1px dashed var(--accent)', borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}>{fmt(code)}</button>
              <div style={{ fontSize: 11.5, color: copied ? 'var(--ok)' : 'var(--ghost)' }}>
                {copied ? 'Скопировано ✓' : <>Действует 30 минут.<br />Нажми на код, чтобы скопировать, и отправь родителю.</>}
              </div>
            </div>
          ) : (
            <button className="btn btn-accent" onClick={onGenerate} disabled={busy}>{busy ? '…' : 'Показать код для родителя'}</button>
          )}
        </div>
      )}

      {list.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          {list.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name || p.email || 'Аккаунт'}</div>
                {isParent && <div style={{ fontSize: 11, color: 'var(--ghost)' }}>{p.has_passed_test ? 'Диагностика пройдена' : 'Диагностика не пройдена'}</div>}
              </div>
              {isParent && p.has_passed_test && (
                <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }}
                  onClick={() => navigate(`/child/${p.id}`)}>Результаты →</button>
              )}
              <button onClick={() => onUnlink(p.id, p.full_name)} title="Отвязать"
                style={{ background: 'transparent', border: '1px solid var(--line2)', color: 'var(--sub)', borderRadius: 8, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Отвязать</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
