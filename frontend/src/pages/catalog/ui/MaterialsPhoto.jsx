import Icon from '../../../shared/ui/Icon.jsx'
import { useEffect, useRef } from 'react'

// The user's original can be placed here without inventing a replacement image.
const photos = import.meta.glob('../materials-hero/materials-campus.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' })
const photo = Object.values(photos)[0]

export default function MaterialsPhoto() {
  const photoRef = useRef(null)
  useEffect(() => {
    const frame = photoRef.current
    if (!frame) return
    let visible = true
    const update = () => { frame.dataset.motionActive = String(visible && !document.hidden) }
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      update()
    }) : null
    observer?.observe(frame)
    document.addEventListener('visibilitychange', update)
    update()
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update) }
  }, [])
  return <figure ref={photoRef} className="materials-photo">
    <span className="materials-photo__shadow" aria-hidden="true" />
    <svg className="materials-photo__orbit" viewBox="0 0 800 600" fill="none" aria-hidden="true" focusable="false"><path d="M110 90C320-35 720 5 770 225S540 620 240 525" stroke="currentColor" strokeWidth="1" strokeDasharray="3 9" /><circle cx="110" cy="90" r="5" fill="currentColor" /></svg>
    <div className="materials-photo__float">{photo
      ? <img src={photo} width="1448" height="1086" alt="Птица-маскот в студенческой шапке летит над университетским кампусом" fetchpriority="high" />
      : <div className="materials-photo__placeholder"><Icon name="graduation" size={36} /><span>Иллюстрация раздела</span></div>}</div>
    <Icon name="sparkles" className="materials-photo__spark materials-photo__spark--near" size={26} />
    <Icon name="sparkles" className="materials-photo__spark materials-photo__spark--far" size={17} />
    <span className="materials-photo__diamond" aria-hidden="true" />
  </figure>
}
