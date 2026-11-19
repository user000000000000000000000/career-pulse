import { useEffect } from 'react'

const SCENES = '.dashboard-artwork, .diagnostic-overview__art, .results-hero__art, .results-empty > .diagnostic-mascot, .roadmap-journey__guide, .auth-scene__illustration, .materials-photo, .section-decor__star, .section-decor__orb, .section-decor__circle, .section-decor__line'

/** Keep the livelier scenes asleep outside the viewport and in hidden tabs. */
export function useInteriorSceneMotion(rootRef, pageKey) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !window.IntersectionObserver) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scenes = new Map()
    const update = () => scenes.forEach((visible, scene) => {
      scene.dataset.interiorMotionActive = String(visible && !document.hidden && !reduced.matches)
    })
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (scenes.has(entry.target)) scenes.set(entry.target, entry.isIntersecting) })
      update()
    }, { rootMargin: '80px 0px', threshold: .02 })
    const scan = () => {
      scenes.forEach((_, scene) => {
        if (!root.contains(scene)) { observer.unobserve(scene); scenes.delete(scene) }
      })
      root.querySelectorAll(SCENES).forEach(scene => {
        if (scenes.has(scene)) return
        scenes.set(scene, false)
        scene.dataset.interiorMotionActive = 'false'
        observer.observe(scene)
      })
    }
    scan()
    const mutations = new MutationObserver(scan)
    mutations.observe(root, { childList: true, subtree: true })
    document.addEventListener('visibilitychange', update)
    reduced.addEventListener('change', update)
    return () => {
      observer.disconnect(); mutations.disconnect()
      document.removeEventListener('visibilitychange', update)
      reduced.removeEventListener('change', update)
      scenes.forEach((_, scene) => { delete scene.dataset.interiorMotionActive })
    }
  }, [rootRef, pageKey])
}
