import { useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/** Page-specific navigation shares the main header on every screen size. */
export default function HeaderContext({ children }) {
  const [host, setHost] = useState(null)
  useLayoutEffect(() => { setHost(document.getElementById('site-header-status-slot')) }, [])
  return host ? createPortal(children, host) : null
}
