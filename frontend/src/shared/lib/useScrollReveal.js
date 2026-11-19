import { useEffect } from 'react'

const SELECTOR = [
  '.reveal > .lv-eyebrow', '.reveal > .lv-h2', '.reveal > .lv-lead',
  '.lv-vstep', '.lv-prof-card', '.lv-mcard', '.lv-stat', '.lv-diff',
  '.lv-role', '.lv-infocard', '.lv-subhead', '.lv-ctaband-inner > h2',
  '.lv-ctaband-inner > p', '.lv-ctaband-btn', '.lv-foot-brand', '.lv-foot-col',
  '.section-decor__star',
].join(', ')

/** Fail open: elements are always visible in CSS; only animate on intersection. */
export function useScrollReveal(rootRef, selector = SELECTOR, pageKey = '', preset = 'default') {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !('IntersectionObserver' in window) || !Element.prototype.animate) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations = new Map()
    const observed = new WeakSet()
    let mutations
    let observer
    try {
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const element = entry.target
          observer.unobserve(element)
          // Filters/route changes can remove a card before its queued entry runs.
          if (!element.isConnected || !element.parentElement || !root.contains(element)) continue
          if (reduced.matches || element.contains(document.activeElement)) continue
          const isHeading = element.matches('h1, h2, .block-title, .lv-h2, .lv-subhead')
          const isDecor = element.matches('.section-decor__star')
          const sibling = Math.max(0, [...element.parentElement.children].indexOf(element))
          try {
            const resting = getComputedStyle(element)
            const transform = resting.transform === 'none' ? '' : resting.transform
            const interior = preset === 'interior'
            const animation = element.animate([
              { opacity: 0, transform: `translateY(${isDecor ? 15 : isHeading ? 26 : interior ? 24 : 20}px) ${transform}`.trim() },
              { opacity: Number(resting.opacity), transform: transform || 'none' },
            ], {
              duration: isHeading ? 650 : isDecor ? 450 : 560,
              delay: isDecor ? 0 : Math.min(sibling, interior ? 4 : 3) * (interior ? 60 : 65),
              easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'backwards',
            })
            animations.set(element, animation)
            animation.onfinish = () => animations.delete(element)
          } catch { /* no inline opacity to recover: the content remains visible */ }
        }
      }, { threshold: 0.04, rootMargin: '0px 0px 45px 0px' })
      const scan = () => root.querySelectorAll(selector).forEach(element => {
        if (observed.has(element)) return
        // Do not animate both a card and its nested heading independently.
        const parentTarget = element.parentElement?.closest(selector)
        if (parentTarget && root.contains(parentTarget)) return
        observed.add(element)
        observer.observe(element)
      })
      scan()
      // Lazy routes, filters and result screens can mount after the shell.
      mutations = new MutationObserver(scan)
      mutations.observe(root, { childList: true, subtree: true })
    } catch { observer?.disconnect(); return }

    const cancel = () => { animations.forEach(a => a.cancel()); animations.clear() }
    const focus = event => {
      animations.forEach((animation, element) => {
        if (element.contains(event.target)) { animation.cancel(); animations.delete(element) }
      })
    }
    reduced.addEventListener('change', cancel)
    root.addEventListener('focusin', focus)
    return () => {
      observer.disconnect(); mutations?.disconnect(); cancel()
      reduced.removeEventListener('change', cancel)
      root.removeEventListener('focusin', focus)
    }
  }, [rootRef, selector, pageKey, preset])
}
