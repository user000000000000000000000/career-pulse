const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const base = 'http://127.0.0.1:5174/career-pulse/'
const baselineFile = 'design-preview/diagnostic-info-before.json'
const baselineMode = process.argv.includes('--baseline')
const normalize = text => text.replace(/\p{Extended_Pictographic}|\uFE0F/gu, '').trim()
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const page = await browser.newPage()
    const errors = [], captured = {}
    const baseline = baselineMode ? {} : JSON.parse(fs.readFileSync(baselineFile, 'utf8'))
    page.on('pageerror', e => errors.push(e.message))
    for (const width of baselineMode ? [1440] : [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      for (let n = 1; n <= 10; n++) {
        await page.goto(base + 'test/' + n)
        await page.locator('.block-meta, .site-dialog').first().waitFor()
        await page.waitForTimeout(300)
        const edit = page.getByRole('button', { name: 'Изменить ответы', exact: true })
        if (await edit.isVisible()) await edit.click()
        await page.locator('.block-meta').waitFor()
        await page.waitForTimeout(900)
        const state = await page.evaluate(() => ({
          title: document.querySelector('.block-title').textContent,
          desc: document.querySelector('.block-desc').textContent,
          meta: [...document.querySelectorAll('.diagnostic-info-card__value')].length
            ? [...document.querySelectorAll('.diagnostic-info-card__value')].map(e => e.textContent)
            : [...document.querySelector('.block-meta').children].map(e => e.textContent),
          question: document.querySelector('.q-area')?.innerHTML || '',
          overflow: document.documentElement.scrollWidth > innerWidth,
        }))
        state.meta = state.meta.map(normalize)
        if (baselineMode) captured[n] = state
        else {
          assert.equal(state.title.replace(/\u00ad/g, '').toLocaleLowerCase(), baseline[n].title.toLocaleLowerCase())
          assert.equal(state.desc, baseline[n].desc)
          assert.deepEqual(state.meta, baseline[n].meta, 'Individual metadata: block ' + n)
          const semantic = await page.evaluate(({ before, after }) => {
            const clean = html => {
              const root = document.createElement('div'); root.innerHTML = html
              root.querySelectorAll('[role], [tabindex], [aria-pressed]').forEach(el => {
                for (const attr of ['role', 'tabindex', 'aria-pressed']) el.removeAttribute(attr)
              })
              return root.innerHTML
            }
            return [clean(before), clean(after)]
          }, { before: baseline[n].question, after: state.question })
          assert.equal(semantic[1], semantic[0], 'Question content/controls unchanged: block ' + n)
          assert.equal(state.overflow, false, `${width}px overflow: block ${n}`)
          assert.equal(await page.locator('.diagnostic-info-card .ui-icon').count(), 3)
          await page.screenshot({ path: `design-preview/diagnostic-info-${n}-${width}.png` })
        }
      }
      console.log('PASS', width, baselineMode ? 'baseline for all 10 blocks' : 'all 10 overviews, metadata and question markup')
    }
    if (baselineMode) fs.writeFileSync(baselineFile, JSON.stringify(captured, null, 2))
    else {
      await page.goto(base + 'test/1')
      await page.waitForTimeout(300)
      const edit = page.getByRole('button', { name: 'Изменить ответы', exact: true })
      if (await edit.isVisible()) await edit.click()
      await page.getByRole('button', { name: 'Начать анкету →', exact: true }).click()
      await page.getByPlaceholder('Например: Алина').waitFor()
      await page.getByRole('button', { name: 'Вернуться', exact: false }).click()
      await page.waitForURL(base + 'dashboard')
      await page.emulateMedia({ reducedMotion: 'reduce' })
      for (const route of ['proba/2', 'proba/4', 'proba/5']) {
        await page.goto(base + route)
        await page.locator('.diagnostic-overview').waitFor()
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
        assert.equal(await page.locator('.diagnostic-overview__art-icon').evaluate(el => getComputedStyle(el).animationName), 'none')
      }
      console.log('PASS: questionnaire start, exit navigation, mini-test shared layout, reduced motion')
    }
    assert.deepEqual(errors, [])
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
