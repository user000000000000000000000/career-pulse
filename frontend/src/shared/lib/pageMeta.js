import { useEffect } from 'react'

const BASE = 'CareerPulse'
const DEFAULT_DESC = 'Профориентационная диагностика из 10 блоков с ИИ-разбором и карьерным маршрутом. Узнай свои сильные стороны и подходящие профессии.'

/**
 * Ставит <title> и <meta description> под конкретную страницу. Google исполняет JS,
 * поэтому подхватывает эти значения в выдаче. При размонтировании возвращает дефолт.
 * @param {string} title  заголовок страницы (без « — CareerPulse»)
 * @param {string} [description]
 */
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — профориентация и карьерная диагностика`
    if (description) {
      let tag = document.querySelector('meta[name="description"]')
      if (!tag) { tag = document.createElement('meta'); tag.name = 'description'; document.head.appendChild(tag) }
      tag.setAttribute('content', description)
    }
    // Canonical на прод-домен (срезаем base /career-pulse у стейджа), без query/hash.
    const path = location.pathname.replace(/^\/career-pulse/, '') || '/'
    let link = document.querySelector('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.setAttribute('href', 'https://careerpulse.ru' + path)
    return () => {
      document.title = `${BASE} — профориентация и карьерная диагностика`
      const tag = document.querySelector('meta[name="description"]')
      if (tag) tag.setAttribute('content', DEFAULT_DESC)
    }
  }, [title, description])
}
