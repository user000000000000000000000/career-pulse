const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const base = 'http://127.0.0.1:5174/career-pulse/'

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const errors = []
  try {
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 1000 } })
      await context.addInitScript(() => localStorage.setItem('cp_tour_seen', '1'))
      const page = await context.newPage()
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(base + 'dashboard')
      await page.locator('.dashboard-workspace h1').waitFor()
      await page.evaluate(() => scrollTo({ top: 1500, behavior: 'instant' }))
      await page.waitForTimeout(400)
      const original = await page.evaluate(() => ({ y: scrollY, x: document.querySelector('.main').getBoundingClientRect().left, clearance: getComputedStyle(document.documentElement).getPropertyValue('--site-header-clearance') }))
      await page.locator('.fb-fab').click()
      const chat = page.locator('.feedback-chat')
      await chat.waitFor()
      await page.waitForTimeout(350)
      assert.equal(await page.locator('.site-header').getAttribute('aria-hidden'), 'true')
      assert.equal(await page.locator('.site-header').evaluate(el => el.inert), true)
      assert.equal(await page.evaluate(() => document.documentElement.style.overflow), 'hidden')
      assert.equal(await page.evaluate(() => scrollY), original.y, 'Opening a modal preserves page position')
      assert.equal(await page.locator('.main').evaluate(el => el.getBoundingClientRect().left), original.x, 'No horizontal layout jump')
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--site-header-clearance')), original.clearance)
      assert.equal(await chat.evaluate(el => el.contains(document.activeElement)), true)
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press(i % 3 ? 'Tab' : 'Shift+Tab')
        assert.equal(await chat.evaluate(el => el.contains(document.activeElement)), true, 'Focus stays within chat')
      }
      await page.locator('#feedback-message').fill('Local modal lifecycle check')
      assert.equal(await page.locator('#feedback-message').evaluate(el => el === document.activeElement), true, 'Typing does not register again or steal focus')
      await page.evaluate(async () => {
        // Reuse the exact dev-server module, including an HMR timestamp if present.
        const moduleUrl = performance.getEntriesByType('resource').find(entry => entry.name.includes('/src/shared/ui/Dialog.jsx'))?.name
        const { alertDialog } = await import(moduleUrl || '/career-pulse/src/shared/ui/Dialog.jsx')
        void alertDialog({ title: 'Nested dialog check', message: 'Local keyboard test' })
      })
      await page.locator('.site-dialog').waitFor()
      assert.ok(Number(await page.locator('.site-dialog-overlay').evaluate(el => el.style.zIndex)) > Number(await page.locator('.feedback-overlay').evaluate(el => el.style.zIndex)))
      await page.keyboard.press('Escape')
      await page.locator('.site-dialog').waitFor({ state: 'detached' })
      assert.equal(await chat.isVisible(), true, 'Escape only dismisses top dialog')
      assert.equal(await page.locator('.site-header').getAttribute('aria-hidden'), 'true')
      assert.equal(await chat.evaluate(el => el.contains(document.activeElement)), true, 'Focus returns to underlying modal')
      // A route modal opened after a global one must paint above it too.
      await page.locator('.btn-tour').evaluate(button => button.click())
      await page.locator('.modal-overlay.show').waitFor()
      assert.equal(await page.locator('.modal-overlay.show .modal-box').evaluate(el => {
        const box = el.getBoundingClientRect()
        return el.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
      }), true, 'Route modal escapes decorative isolation and paints on top')
      await page.keyboard.press('Escape')
      await page.locator('.modal-overlay.show').waitFor({ state: 'hidden' })
      assert.equal(await chat.isVisible(), true)
      await page.keyboard.press('Escape')
      await chat.waitFor({ state: 'detached' })
      await page.waitForTimeout(220)
      assert.equal(await page.locator('.site-header').getAttribute('aria-hidden'), null)
      assert.equal(await page.evaluate(() => document.documentElement.style.overflow), '')
      assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      assert.equal(await page.evaluate(() => scrollY), original.y)
      assert.equal(await page.locator('.fb-fab').evaluate(el => el === document.activeElement), true)

      // Success replaces the form and must move focus to the remaining close control.
      await page.locator('.fb-fab').click()
      await page.locator('#feedback-message').fill('Local success-focus check in isolated browser')
      await page.locator('.feedback-chat__submit').click()
      await page.locator('.feedback-success').waitFor()
      assert.equal(await chat.evaluate(el => el.contains(document.activeElement)), true, 'Form replacement retains focus')
      await page.keyboard.press('Escape')
      await chat.waitFor({ state: 'detached' })

      await page.locator('.btn-tour').click()
      await page.locator('.modal-overlay.show').waitFor()
      await page.keyboard.press('Escape')
      await page.locator('.modal-overlay.show').waitFor({ state: 'hidden' })
      await page.getByRole('button', { name: 'Записаться', exact: true }).click()
      await page.locator('#consult-dialog-title').waitFor()
      await page.keyboard.press('Escape')
      await page.locator('#consult-dialog-title').waitFor({ state: 'detached' })
      await page.locator('.bc-btn--result').first().click()
      await page.locator('.brm-card').waitFor()
      await page.keyboard.press('Escape')
      await page.locator('.brm-card').waitFor({ state: 'detached' })
      if (width < 1100) {
        await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
        await page.getByRole('button', { name: 'Меню кабинета', exact: true }).click()
        assert.equal(await page.locator('.site-header').getAttribute('aria-hidden'), null, 'Navigation drawer keeps header')
        await page.keyboard.press('Escape')
        assert.equal(await page.evaluate(() => document.body.style.overflow), '')
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      console.log('PASS', width, 'header fade/clearance, scroll lock, focus trap/restore, nested Escape, success focus, tour/consultation/results, drawer unaffected')
      await context.close()
    }
    assert.deepEqual(errors, [])
    console.log('PASS no JavaScript errors')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
