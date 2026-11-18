const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('fs')
const path = require('path')
const base = 'http://127.0.0.1:5174/career-pulse/'
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const report = []
  for (const route of ['', 'login', 'register', 'dashboard', 'profile', 'admin', 'atlas', 'professions', 'vuzy', 'diagnostic', 'roadmap', 'result', 'proba/2', 'proba/result', 'legal', 'legal/privacy', 'test/1', 'test/2', 'test/10']) {
    await page.goto(base + route, { waitUntil: 'domcontentloaded' })
    await page.locator('.site-header nav').waitFor()
    await page.waitForTimeout(500)
    await page.evaluate(() => document.fonts.ready)
    const state = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('h1,h2,h3,.auth-title,.adm-title,.cat-title,.atlas-title,.res-title,.block-title,.p-title,.rm-title,.appnav-logo,.legal-meta,.auth-eyebrow,.adm-eyebrow,.heading-accent,.lv-hero-title .accent'))
        .filter(el => el.getBoundingClientRect().width && el.getBoundingClientRect().height)
        .map(el => ({ tag: el.tagName, class: el.className, text: el.textContent.slice(0, 90), font: getComputedStyle(el).fontFamily, size: getComputedStyle(el).fontSize }))
      return { bodyFont: getComputedStyle(document.body).fontFamily, items }
    })
    report.push({ route: route || '/', ...state })
  }
  // Isolated render exercises the actual fallback component without forcing an
  // application failure or touching any local profile/progress records.
  const errorState = await page.evaluate(async () => {
    const reactModule = await import('/career-pulse/node_modules/.vite/deps/react.js')
    const React = reactModule.default || reactModule
    const rootModule = await import('/career-pulse/node_modules/.vite/deps/react-dom_client.js')
    const { createRoot } = rootModule.default || rootModule
    const { default: ErrorBoundary } = await import('/career-pulse/src/app/ErrorBoundary.jsx')
    const host = document.createElement('div')
    document.body.append(host)
    const boundary = React.createRef()
    const root = createRoot(host)
    root.render(React.createElement(ErrorBoundary, { ref: boundary }, React.createElement('span', null, 'QA')))
    while (!boundary.current) await new Promise(resolve => requestAnimationFrame(resolve))
    boundary.current.setState({ error: new Error('Isolated visual check') })
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    const fallback = host.firstElementChild
    const title = fallback.children[1]
    const actual = { body: getComputedStyle(fallback).fontFamily, title: getComputedStyle(title).fontFamily, background: getComputedStyle(fallback).backgroundColor, color: getComputedStyle(fallback).color, button: getComputedStyle(fallback.querySelector('button')).fontFamily }
    root.unmount()
    host.remove()
    return actual
  })
  const issues = report.flatMap(r => r.items.filter(i => /^(?:['\"]?)(?:Bebas|Golos|Arial|Times)/.test(i.font)).map(item => ({ route: r.route, ...item })))
  if (errorState.background === errorState.color || !errorState.body.startsWith('Manrope') || !errorState.title.startsWith('Unbounded')) issues.push({ errorState })
  fs.mkdirSync(path.resolve('design-preview'), { recursive: true })
  fs.writeFileSync(path.resolve('design-preview/typography-report.json'), JSON.stringify({ routes: report, errorState, issues }, null, 2))
  console.log(JSON.stringify({ routes: report.length, families: [...new Set(report.flatMap(r => r.items.map(i => i.font)))], errorState, issues }, null, 2))
  if (issues.length) process.exitCode = 1
  await browser.close()
})().catch(error => { console.error(error); process.exit(1) })
