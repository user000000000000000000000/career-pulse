import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react'
import './modal.css'

const ModalContext = createContext(null)
const FOCUSABLE = 'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
const canFocus = element => element instanceof HTMLElement && !element.closest('[inert], [aria-hidden="true"]') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden'
const focusable = dialog => [...dialog.querySelectorAll(FOCUSABLE)].filter(canFocus)
const focus = element => element?.focus({ preventScroll: true })

/** Shared full-screen modal lifecycle. Navigation drawers deliberately do not register. */
export function ModalProvider({ children }) {
  const stackRef = useRef([])
  const [stack, setStack] = useState([])
  const register = useCallback(entry => {
    const overlay = entry.dialogRef.current?.parentElement
    const previousLayer = overlay?.style.zIndex
    const previousFocus = document.activeElement
    const dialog = entry.dialogRef.current
    const hadTabIndex = dialog?.hasAttribute('tabindex')
    if (dialog && !hadTabIndex) dialog.tabIndex = -1
    const item = { ...entry, overlay, previousLayer, previousFocus }
    const publish = () => {
      stackRef.current.forEach((modal, index) => { if (modal.overlay) modal.overlay.style.zIndex = String(1000 + index * 20) })
      setStack([...stackRef.current])
    }
    stackRef.current.push(item)
    publish()
    const initialFrame = requestAnimationFrame(() => {
      if (stackRef.current.at(-1) !== item) return
      const preferred = entry.initialFocusRef?.current
      focus(canFocus(preferred) ? preferred : focusable(dialog)[0] || dialog)
    })
    return () => {
      cancelAnimationFrame(initialFrame)
      const wasTop = stackRef.current.at(-1) === item
      stackRef.current = stackRef.current.filter(modal => modal !== item)
      if (overlay) overlay.style.zIndex = previousLayer
      if (dialog && !hadTabIndex) dialog.removeAttribute('tabindex')
      publish()
      if (!wasTop) return
      requestAnimationFrame(() => {
        const top = stackRef.current.at(-1)?.dialogRef.current
        if (top) focus(canFocus(previousFocus) && top.contains(previousFocus) ? previousFocus : focusable(top)[0] || top)
        else if (previousFocus?.isConnected && canFocus(previousFocus)) focus(previousFocus)
      })
    }
  }, [])

  const hasModal = stack.length > 0
  useLayoutEffect(() => {
    if (!hasModal) return
    const html = document.documentElement
    const body = document.body
    const saved = { htmlOverflow: html.style.overflow, bodyOverflow: body.style.overflow, gutter: html.style.scrollbarGutter, padding: body.style.paddingRight, modalAttribute: html.getAttribute('data-full-modal-open') }
    const scrollbar = window.innerWidth - html.clientWidth
    // Overlay scrollbars occupy no layout width: reserving a gutter for them
    // would itself introduce a small horizontal jump in fixed navigation.
    if (scrollbar > 0 && CSS.supports('scrollbar-gutter', 'stable')) html.style.scrollbarGutter = 'stable'
    else if (scrollbar > 0) body.style.paddingRight = `${parseFloat(getComputedStyle(body).paddingRight) + scrollbar}px`
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    html.setAttribute('data-full-modal-open', '')
    const onKey = event => {
      const top = stackRef.current.at(-1)
      const dialog = top?.dialogRef.current
      if (!dialog) return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopImmediatePropagation()
        top.onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable(dialog), first = items[0], last = items.at(-1)
      if (!first) { event.preventDefault(); focus(dialog); return }
      if (!dialog.contains(document.activeElement) || document.activeElement === dialog) { event.preventDefault(); focus(event.shiftKey ? last : first) }
      else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); focus(last) }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); focus(first) }
    }
    const onFocus = event => {
      const dialog = stackRef.current.at(-1)?.dialogRef.current
      if (dialog && !dialog.contains(event.target)) focus(focusable(dialog)[0] || dialog)
    }
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('focusin', onFocus)
      html.style.overflow = saved.htmlOverflow
      html.style.scrollbarGutter = saved.gutter
      body.style.overflow = saved.bodyOverflow
      body.style.paddingRight = saved.padding
      if (saved.modalAttribute == null) html.removeAttribute('data-full-modal-open')
      else html.setAttribute('data-full-modal-open', saved.modalAttribute)
    }
  }, [hasModal])

  // A success/error screen can replace the focused form control without emitting
  // focusin. Keep focus in the active dialog after such local content changes.
  useLayoutEffect(() => {
    const dialog = stack.at(-1)?.dialogRef.current
    if (!dialog) return
    const observer = new MutationObserver(() => {
      if (dialog.isConnected && !dialog.contains(document.activeElement)) focus(focusable(dialog)[0] || dialog)
    })
    observer.observe(dialog, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [stack])

  return <ModalContext.Provider value={{ register, count: stack.length, topId: stack.at(-1)?.id }}>{children}</ModalContext.Provider>
}

/**
 * Call unconditionally before a conditional return; point dialogRef at the dialog card
 * (its immediate parent is the full-screen overlay). `open` works with mounted or
 * conditionally mounted dialogs. Callbacks are kept in refs, so typing never re-registers.
 * Initial focus defaults to the first control; closes restore focus without scrolling.
 */
export function useModal({ open, dialogRef, onClose, initialFocusRef }) {
  const registry = useContext(ModalContext)
  const id = useRef(Symbol('modal')).current
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const register = registry?.register
  useLayoutEffect(() => {
    if (!open || !register || !dialogRef.current) return
    return register({ id, dialogRef, initialFocusRef, onCloseRef })
  }, [open, register, dialogRef, initialFocusRef, id])
  return { isTopModal: registry?.topId === id }
}

export function useModalState() {
  const registry = useContext(ModalContext)
  return { hasModal: (registry?.count || 0) > 0 }
}
