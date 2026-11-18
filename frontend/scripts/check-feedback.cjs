// Optional Chrome QA for the local feedback chat. Each scenario uses fresh,
// isolated browser storage; no signed-in Chrome profile or production API is used.
// PLAYWRIGHT_MODULE points to an existing Playwright installation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const base = 'http://127.0.0.1:5174/career-pulse/'
const out = path.resolve('design-preview/feedback-chat')
const errors = [], backendRequests = [], checks = []
const categories = [['bug', 'Ошибка'], ['idea', 'Идея'], ['other', 'Другое']]

async function entries(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('demo_feedback') || '[]'))
}

async function waitUntil(page, predicate, message) {
  await page.waitForFunction(predicate, null, { timeout: 5000 }).catch(error => {
    throw new Error(message + ': ' + error.message)
  })
}

async function assertNoOverflow(page, { allowTall = false } = {}) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'No horizontal overflow')
  const box = await page.locator('.feedback-chat').boundingBox()
  const viewport = page.viewportSize()
  assert.ok(box && box.x >= -1 && box.x + box.width <= viewport.width + 1, 'Chat fits viewport horizontally')
  if (!allowTall) assert.ok(box.y >= -1 && box.y + box.height <= viewport.height + 1, 'Chat stays within viewport')
}

async function openChat(page, options) {
  await page.locator('.fb-fab').click()
  const dialog = page.locator('.feedback-chat[role="dialog"]')
  await dialog.waitFor({ state: 'visible' })
  assert.equal(await dialog.getAttribute('aria-modal'), 'true')
  assert.ok(await dialog.getAttribute('aria-labelledby'), 'Dialog has an accessible title')
  await waitUntil(page, () => document.querySelector('.feedback-chat')?.contains(document.activeElement), 'Initial focus enters dialog')
  await waitUntil(page, () => {
    const header = document.querySelector('.site-header')
    const css = getComputedStyle(header)
    return header.inert && header.getAttribute('aria-hidden') === 'true' && css.visibility === 'hidden' && Number(css.opacity) === 0
  }, 'Header is hidden and excluded from keyboard/screen-reader navigation')
  await assertNoOverflow(page, options)
  return dialog
}

async function closeChat(page, keyboard = false) {
  if (keyboard === 'backdrop') await page.locator('.feedback-overlay').click({ position: { x: 2, y: 120 } })
  else if (keyboard) await page.keyboard.press('Escape')
  else await page.getByRole('button', { name: 'Закрыть окно обратной связи', exact: true }).click()
  await page.locator('.feedback-overlay').waitFor({ state: 'detached' })
  await waitUntil(page, () => document.activeElement?.classList.contains('fb-fab'), 'Focus returns to floating trigger')
  await waitUntil(page, () => {
    const header = document.querySelector('.site-header')
    const css = getComputedStyle(header)
    return !header.inert && header.getAttribute('aria-hidden') !== 'true' && css.visibility === 'visible' && Number(css.opacity) === 1
  }, 'Header is visible and interactive again')
}

async function fillChat(page, category, message, email = '') {
  const [, label] = categories.find(([value]) => value === category)
  const button = page.locator('.feedback-chat').getByRole('button', { name: label, exact: true })
  await button.click()
  assert.equal(await button.getAttribute('aria-pressed'), 'true', 'Selected category exposed accessibly')
  assert.equal(await page.locator('.feedback-chat [aria-pressed="true"]').count(), 1)
  await page.locator('#feedback-message').fill(message)
  await page.locator('#feedback-email').fill(email)
}

async function assertStored(page, before, category, message, email) {
  await page.locator('.feedback-success').waitFor()
  const list = await entries(page)
  assert.equal(list.length, before.length + 1, 'Exactly one real local API record was saved')
  const saved = list[0]
  assert.equal(saved.category, category)
  assert.equal(saved.message, message.trim())
  assert.equal(saved.email, email)
  assert.equal(saved.status, 'new')
  assert.equal(saved.page_url, page.url())
  assert.ok(/^[0-9a-f-]{36}$/i.test(saved.id), 'API generated a record UUID')
  assert.ok(Number.isFinite(Date.parse(saved.created_at)), 'API generated timestamp')
  assert.ok((await page.locator('.feedback-success').innerText()).includes('браузер'), 'Success describes actual local demo storage')
  assert.deepEqual(list.slice(1), before, 'Existing local feedback is preserved')
}

async function freshPage(browser, viewport, options = {}) {
  const context = await browser.newContext({ viewport, reducedMotion: options.reducedMotion || 'no-preference' })
  const page = await context.newPage()
  page.on('pageerror', error => errors.push({ width: viewport.width, message: error.message, url: page.url() }))
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(base).origin && /supabase|oauth\.vk|id\.vk|functions\/v1/.test(request.url())) backendRequests.push(request.url())
  })
  // Delay only the original demo API's entry in one isolated scenario so its
  // busy state is observable. The original local save still runs unchanged.
  if (options.delayedApi) {
    await context.addInitScript(() => { window.__feedbackGate = true })
    await context.route(url => url.pathname.endsWith('/src/shared/api/feedback.js'), async route => {
      const response = await route.fetch()
      const source = await response.text()
      const signature = /(async function submitFeedback\([^)]*\)\s*\{)/
      assert.ok(signature.test(source), 'Original demo API function found for busy-state delay')
      const body = source.replace(signature, '$1\nwindow.__feedbackApiEntries = (window.__feedbackApiEntries || 0) + 1;\nif (window.__feedbackGate) await new Promise(resolve => { (window.__feedbackReleases ||= []).push(resolve) });\n')
      await route.fulfill({ response, body })
    })
  }
  await page.goto(base, { waitUntil: 'domcontentloaded' })
  await page.locator('.fb-fab').waitFor()
  assert.equal((await entries(page)).length, 0, 'Fresh context has no previous feedback')
  return { context, page }
}

async function layoutAndSubmit(browser, viewport, category, reducedMotion) {
  const { context, page } = await freshPage(browser, viewport, { reducedMotion })
  try {
    await page.evaluate(() => scrollTo({ top: 700, behavior: 'instant' }))
    await page.waitForTimeout(120)
    const initial = await page.evaluate(() => ({
      y: scrollY, header: document.querySelector('.site-header nav').getBoundingClientRect().x,
      overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow, gutter: document.documentElement.style.scrollbarGutter,
    }))
    const dialog = await openChat(page)
    const firstGreeting = await page.locator('#feedback-greeting').innerText()
    const locked = await page.evaluate(() => {
      const body = getComputedStyle(document.body), html = getComputedStyle(document.documentElement)
      return body.overflowY === 'hidden' || body.position === 'fixed' || html.overflowY === 'hidden'
    })
    assert.ok(locked, 'Background scrolling is locked while the chat is open')
    const lockedHeader = await page.locator('.site-header nav').evaluate(el => el.getBoundingClientRect().x)
    const headerStable = Math.abs(lockedHeader - initial.header) <= 1
    checks.push({ scenario: 'header geometry during modal scroll lock', viewport, before: initial.header, during: lockedHeader, passed: headerStable })
    if (!headerStable) console.error('ISSUE header moves during lock', initial.header, lockedHeader)
    const focusCount = await dialog.locator('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex="0"]').count()
    for (let i = 0; i < focusCount + 2; i++) {
      await page.keyboard.press('Tab')
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true, 'Tab remains in dialog')
    }
    for (let i = 0; i < focusCount + 2; i++) {
      await page.keyboard.press('Shift+Tab')
      assert.equal(await dialog.evaluate(el => el.contains(document.activeElement)), true, 'Shift+Tab remains in dialog')
    }
    await closeChat(page, true)
    const restored = await page.evaluate(() => ({
      y: scrollY, header: document.querySelector('.site-header nav').getBoundingClientRect().x,
      overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight,
      htmlOverflow: document.documentElement.style.overflow, gutter: document.documentElement.style.scrollbarGutter,
    }))
    assert.deepEqual(restored, initial, 'Escape restores scroll position, header and previous body styles')

    await openChat(page)
    assert.notEqual(await page.locator('#feedback-greeting').innerText(), firstGreeting, 'Adjacent openings do not repeat the greeting')
    const before = await entries(page)
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    assert.deepEqual(await entries(page), before, 'Empty message is never saved')
    assert.ok(await page.locator('#feedback-message').evaluate(el => el.validity.valueMissing || el.getAttribute('aria-invalid') === 'true') || await page.getByRole('alert').count() > 0, 'Empty message is explained or marked invalid')
    const message = `  Проверка мини-чата ${viewport.width} ${category}  `
    const email = `feedback-${viewport.width}@example.test`
    await fillChat(page, category, message, 'invalid-email')
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    assert.deepEqual(await entries(page), before, 'Invalid email is never saved')
    await page.locator('#feedback-email').fill(email)
    await page.screenshot({ path: path.join(out, `chat-${viewport.width}-${reducedMotion || 'motion'}.png`) })
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    await assertStored(page, before, category, message, email)
    await assertNoOverflow(page)
    await page.screenshot({ path: path.join(out, `success-${viewport.width}-${reducedMotion || 'motion'}.png`) })
    await page.locator('.feedback-success').getByRole('button', { name: 'Закрыть', exact: true }).click()
    await page.locator('.feedback-overlay').waitFor({ state: 'detached' })
    await waitUntil(page, () => document.activeElement?.classList.contains('fb-fab'), 'Success close restores trigger focus')
    await openChat(page)
    assert.equal(await page.locator('#feedback-message').inputValue(), '', 'New opening resets previous message')
    assert.equal(await page.locator('#feedback-email').inputValue(), '', 'New opening resets previous email')
    if (reducedMotion === 'reduce') {
      const activeAnimations = await dialog.evaluate(el => el.getAnimations({ subtree: true }).filter(a => a.playState === 'running' && a.effect?.getComputedTiming().activeDuration > 1).length)
      assert.equal(activeAnimations, 0, 'Reduced motion disables long-running chat animations')
    }
    await closeChat(page)
    checks.push({ scenario: 'layout, keyboard, validation, local submit and reopen', viewport, category, reducedMotion: reducedMotion || 'no-preference', passed: true })
    console.log('PASS feedback', viewport.width, category, reducedMotion || 'motion')
  } finally { await context.close() }
}

async function storageErrorAndRetry(browser) {
  const { context, page } = await freshPage(browser, { width: 1440, height: 1000 })
  try {
    await openChat(page)
    await fillChat(page, 'idea', 'Черновик должен остаться после ошибки записи', 'retry@example.test')
    await page.evaluate(() => {
      const original = Storage.prototype.setItem
      window.__restoreFeedbackStorage = () => { Storage.prototype.setItem = original }
      Storage.prototype.setItem = function (key, value) {
        if (key === 'demo_feedback') throw new DOMException('Недостаточно места для сохранения сообщения', 'QuotaExceededError')
        return original.call(this, key, value)
      }
    })
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    await page.getByRole('alert').waitFor()
    assert.ok((await page.getByRole('alert').innerText()).length > 0)
    assert.equal((await entries(page)).length, 0, 'Failed local save never claims success')
    assert.equal(await page.locator('.feedback-success').count(), 0)
    assert.equal(await page.locator('#feedback-message').inputValue(), 'Черновик должен остаться после ошибки записи')
    assert.ok(await page.getByRole('button', { name: 'Отправить', exact: true }).isEnabled(), 'Can retry after error')
    await page.screenshot({ path: path.join(out, 'storage-error.png') })
    await page.evaluate(() => window.__restoreFeedbackStorage())
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    await assertStored(page, [], 'idea', 'Черновик должен остаться после ошибки записи', 'retry@example.test')
    await closeChat(page, true)
    checks.push({ scenario: 'real local-storage failure preserves draft, successful retry', passed: true })
    console.log('PASS feedback local-storage failure and retry')
  } finally { await context.close() }
}

async function busyAndDuplicateSubmit(browser) {
  const { context, page } = await freshPage(browser, { width: 390, height: 844 }, { delayedApi: true })
  try {
    await openChat(page)
    await fillChat(page, 'other', 'Реальное сохранение после задержки для проверки busy', '')
    await page.getByRole('button', { name: 'Отправить', exact: true }).click()
    const sending = page.getByRole('button', { name: 'Отправляем…', exact: true })
    await sending.waitFor()
    assert.ok(await sending.isDisabled(), 'Send is disabled while API is pending')
    assert.equal(await page.locator('.feedback-chat form').getAttribute('aria-busy'), 'true')
    assert.equal((await entries(page)).length, 0)
    // Native form events must also respect the busy guard, not just the disabled button.
    await page.locator('.feedback-chat form').evaluate(form => form.requestSubmit())
    await page.waitForTimeout(120)
    assert.equal(await page.evaluate(() => window.__feedbackApiEntries), 1, 'Busy guard prevents another API invocation')
    await page.screenshot({ path: path.join(out, 'busy-390.png') })
    await closeChat(page, true)
    assert.equal((await entries(page)).length, 0, 'Closing a pending chat does not prematurely save a record')
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden', 'Closing pending chat releases background scroll lock')
    await openChat(page)
    assert.equal(await page.locator('#feedback-message').inputValue(), 'Реальное сохранение после задержки для проверки busy', 'Pending draft survives closing/reopening')
    assert.equal(await page.locator('.feedback-chat [data-category="other"]').getAttribute('aria-pressed'), 'true', 'Pending category survives reopening')
    assert.ok(await page.locator('#feedback-message').isDisabled())
    assert.ok(await sending.isDisabled(), 'Reopened chat remains busy while original request is pending')
    assert.equal(await page.locator('.feedback-chat form').getAttribute('aria-busy'), 'true')
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden', 'Reopening pending chat restores scroll lock')
    await page.locator('.feedback-chat form').evaluate(form => form.requestSubmit())
    await page.waitForTimeout(80)
    assert.equal(await page.evaluate(() => window.__feedbackApiEntries), 1, 'Reopening cannot trigger a second pending API call')
    await page.evaluate(() => { window.__feedbackGate = false; window.__feedbackReleases.forEach(release => release()) })
    await assertStored(page, [], 'other', 'Реальное сохранение после задержки для проверки busy', '')
    await page.waitForTimeout(120)
    assert.equal((await entries(page)).length, 1, 'Repeated submit while pending does not create duplicates')
    await closeChat(page, true)
    checks.push({ scenario: 'busy close/reopen retains draft/category/lock, duplicate guard, original demo save', passed: true })
    console.log('PASS feedback delayed original demo API, pending close/reopen and duplicate prevention')
  } finally { await context.close() }
}

async function shortViewport(browser, viewport) {
  const { context, page } = await freshPage(browser, viewport)
  try {
    await openChat(page, { allowTall: true })
    const firstGreeting = await page.locator('#feedback-greeting').innerText()
    const overlay = page.locator('.feedback-overlay')
    const dimensions = await overlay.evaluate(el => ({ height: el.clientHeight, scrollHeight: el.scrollHeight, overflowY: getComputedStyle(el).overflowY }))
    assert.ok(dimensions.scrollHeight > dimensions.height, 'Short viewport uses a vertically scrollable overlay')
    assert.equal(dimensions.overflowY, 'auto')
    const close = page.getByRole('button', { name: 'Закрыть окно обратной связи', exact: true })
    await close.scrollIntoViewIfNeeded()
    assert.ok(await close.evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }), 'Top close control can be brought fully into view')
    await fillChat(page, 'idea', `Проверка короткого экрана ${viewport.width}x${viewport.height}`, '')
    const submit = page.getByRole('button', { name: 'Отправить', exact: true })
    await submit.scrollIntoViewIfNeeded()
    assert.ok(await submit.evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight }), 'Submit remains reachable in a short/landscape viewport')
    assert.ok(await overlay.evaluate(el => el.scrollTop > 0), 'Overlay scrolls to reach the lower form controls')
    await assertNoOverflow(page, { allowTall: true })
    await page.screenshot({ path: path.join(out, `short-${viewport.width}x${viewport.height}.png`) })
    await submit.click()
    await assertStored(page, [], 'idea', `Проверка короткого экрана ${viewport.width}x${viewport.height}`, '')
    await assertNoOverflow(page, { allowTall: true })
    await closeChat(page, 'backdrop')
    assert.notEqual(await page.evaluate(() => getComputedStyle(document.body).overflowY), 'hidden', 'Backdrop close releases scrolling')
    await openChat(page, { allowTall: true })
    assert.notEqual(await page.locator('#feedback-greeting').innerText(), firstGreeting, 'Short-viewport reopening uses a different greeting')
    await close.scrollIntoViewIfNeeded()
    await closeChat(page)
    checks.push({ scenario: 'short viewport scrolls overlay, submit/close reachable, backdrop closes, greeting varies', viewport, passed: true })
    console.log('PASS feedback short viewport and backdrop', viewport.width, viewport.height)
  } finally { await context.close() }
}

;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    await layoutAndSubmit(browser, { width: 1440, height: 1000 }, 'bug')
    await layoutAndSubmit(browser, { width: 390, height: 844 }, 'idea')
    await layoutAndSubmit(browser, { width: 320, height: 740 }, 'other', 'reduce')
    await storageErrorAndRetry(browser)
    await busyAndDuplicateSubmit(browser)
    await shortViewport(browser, { width: 320, height: 568 })
    await shortViewport(browser, { width: 844, height: 390 })
    assert.deepEqual(errors, [], 'No JavaScript errors')
    assert.deepEqual(backendRequests, [], 'No production/backend requests')
    assert.ok(checks.every(check => check.passed), 'All recorded visual and functional checks pass')
    console.log('PASS: isolated Chrome contexts, no backend requests or JavaScript errors')
  } finally {
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ checks, errors, backendRequests }, null, 2))
    await browser.close()
  }
})().catch(error => { console.error(error); process.exitCode = 1 })
