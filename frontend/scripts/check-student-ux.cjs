// Local Chrome regression checks for student-facing explanations and navigation.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const base = 'http://127.0.0.1:5174/career-pulse/'
const out = path.resolve('design-preview/student-ux')

;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const page = await browser.newPage()
    const errors = [], checks = []
    page.on('pageerror', error => errors.push(error.message))
    for (const width of [1440, 1024, 390]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(base)
      await page.locator('.lv-scene img').waitFor()
      await page.waitForFunction(() => {
        const img = document.querySelector('.lv-scene img')
        return img.complete && img.naturalWidth > 0
      })
      assert.match(await page.locator('.lv-scene img').evaluate(img => img.currentSrc),
        width === 1024 ? /balanced-tablet\.png$/ : /balanced\.png$/)
      await page.screenshot({ path: path.join(out, `landing-${width}.png`) })
      await page.goto(base + 'diagnostic')
      await page.locator('.result-profession').first().waitFor()
      assert.ok(await page.getByText('Что делать дальше', { exact: true }).isVisible())
      assert.ok((await page.locator('.result-profession__why').first().innerText()).includes('/100'))
      assert.ok(await page.getByText(/а не вероятность успеха или поступления/).count())
      await page.locator('.result-profession').first().scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(out, `recommendations-${width}.png`) })
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      const profession = await page.locator('.result-profession strong').first().innerText()
      await page.locator('.result-profession').first().focus()
      await page.keyboard.press('Enter')
      await page.waitForURL(base + 'atlas')
      assert.equal(await page.getByPlaceholder(/Поиск по профессии/).inputValue(), profession)
      checks.push({ width, heroVariant: true, explanation: true, keyboardToAtlas: true, overflow: false })
    }
    await page.evaluate(() => {
      localStorage.setItem('cp_progress', JSON.stringify({ completed: [1, 3], pct: 18 }))
    })
    await page.goto(base + 'dashboard')
    const next = page.getByRole('link', { name: 'Продолжить диагностику', exact: true })
    await next.waitFor()
    assert.equal(await next.getAttribute('href'), '/career-pulse/test/2')
    const milestones = page.locator('.pb-step')
    assert.ok((await milestones.nth(0).getAttribute('class')).includes('reached'))
    assert.ok(!(await milestones.nth(2).getAttribute('class')).includes('reached'))
    await page.evaluate(() => {
      localStorage.setItem('cp_profile', JSON.stringify({ context: { name: 'Анна' } }))
      localStorage.setItem('cp_progress', JSON.stringify({ completed: [1], pct: 8 }))
    })
    await page.goto(base + 'roadmap')
    await page.getByRole('button', { name: 'Перейти к блоку 2 →' }).click()
    await page.waitForURL(base + 'test/2')
    await page.goto(base + 'diagnostic')
    await page.getByText('Это часть профиля.', { exact: false }).waitFor()
    await page.evaluate(() => localStorage.setItem('cp_progress', JSON.stringify({ completed: [], pct: 0 })))
    await page.reload()
    await page.getByText('РЕЗУЛЬТАТОВ ПОКА НЕТ', { exact: true }).waitFor()
    await page.getByRole('button', { name: 'Начать диагностику →', exact: true }).click()
    await page.waitForURL(base + 'test/1')
    assert.deepEqual(errors, [])
    const report = { checks, partialProgress: true, emptyAndPartialResults: true, missingInterestsRecovery: true, errors }
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
    console.log(JSON.stringify(report, null, 2))
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
