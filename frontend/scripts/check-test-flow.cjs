const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5174/career-pulse/'
const sample = 'Это тестовый ответ для проверки интерфейса в изолированной локальной сессии. Я изучаю разные занятия и хочу попробовать новое.'
const stateFile = 'design-preview/test-flow-browser-state.json'
const resume = process.argv.includes('--resume') && fs.existsSync(stateFile)
const only = Number(process.argv.find(arg => arg.startsWith('--only='))?.split('=')[1])
const selectedBlocks = only ? [only] : Array.from({ length: 10 }, (_, i) => i + 1)
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 }, ...(resume ? { storageState: stateFile } : {}) })
    const page = await context.newPage()
    const errors = [], external = [], completed = []
    page.on('pageerror', e => { errors.push(e.message); console.error(e.stack || e.message) })
    page.on('request', req => { if (new URL(req.url()).origin !== new URL(base).origin && /supabase|functions\/v1|oauth\.vk/.test(req.url())) external.push(req.url()) })
    page.on('dialog', dialog => dialog.accept())
    await page.goto(base + 'dashboard')
    if (!resume) {
      await page.locator('.demo-toggle').click()
      await page.getByRole('button', { name: 'Начать новую диагностику', exact: true }).click()
      await page.waitForURL(base + 'test/1')
    } else {
      const saved = await page.evaluate(async () => {
        const { CP } = await import('/career-pulse/src/shared/api/index.js')
        return (await CP.getProgress()).completed
      })
      completed.push(...saved)
    }
    const active = () => page.locator('.question-stage__content:not(.question-stage__ghost)')
    const key = () => page.evaluate(() => {
      const root = document.querySelector('.question-stage__content:not(.question-stage__ghost)')
      return root ? [...root.querySelectorAll('.q-counter, .q-text, .q-prompt, .step-title')].map(e => e.textContent).join('|') : null
    })
    const settle = () => page.waitForTimeout(420)
    for (let n = 1; n <= 10; n++) {
      if (!selectedBlocks.includes(n)) continue
      if (completed.includes(n)) continue
      if (n !== 1 || resume) await page.goto(base + 'test/' + n)
      await page.locator('.question-stage').waitFor()
      await settle()
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
      if (n === 1) {
        await page.getByRole('button', { name: /^Начать анкету(?: →)?$/ }).click()
        await settle()
        await active().locator('input.q-input').first().fill('Тест интерфейса')
        await page.waitForTimeout(500)
        await page.reload()
        await active().locator('input.q-input').first().waitFor()
        assert.equal(await active().locator('input.q-input').first().inputValue(), 'Тест интерфейса')
        for (let step = 1; step <= 4; step++) {
          // Exercise actual form controls. No answers/results are injected.
          for (let pass = 0; pass < 2; pass++) {
            const groups = active().locator('.q-group:not(.hidden)')
            for (let g = 0; g < await groups.count(); g++) {
              const group = groups.nth(g)
              for (const input of await group.locator('input.q-input').all()) if (await input.isVisible()) await input.fill('Тест интерфейса')
              for (const select of await group.locator('select').all()) if (await select.isVisible()) await select.selectOption({ index: 1 })
              for (const textarea of await group.locator('textarea').all()) if (await textarea.isVisible()) await textarea.fill(sample)
              if (await group.locator('.scale-btn').count()) await group.locator('.scale-btn').nth(2).click()
              if (await group.locator('.opt-card').count()) await group.locator('.opt-card').first().click()
              if (await group.locator('.chip').count() && !(await group.locator('.chip.selected, .chip.sel').count())) await group.locator('.chip').first().click()
            }
          }
          const previous = await key()
          await active().locator('.nav-row .btn-accent').click()
          await settle()
          if (step < 4) assert.notEqual(await key(), previous, 'Questionnaire advances with valid controls')
        }
      } else {
        let steps = 0
        while (!(await page.locator('.cp-diag .result').count())) {
          assert.ok(steps++ < 110, 'Flow limit block ' + n)
          const before = await key()
          if (before === null) {
            await page.locator('.cp-diag .result, .question-stage').first().waitFor()
            if (await page.locator('.cp-diag .result').count()) break
            continue
          }
          const root = active()
          if (await root.locator('.ii-btn').count()) await root.locator('.ii-btn').nth(1).click()
          else if (await root.locator('.scale-btn').count()) await root.locator('.scale-btn').nth(2).click()
          else if (await root.locator('.opt-card').count()) await root.locator('.opt-card').first().click()
          else if (await root.locator('.mat-card').count()) await root.locator('.mat-card').first().click()
          else if (await root.locator('.int-btn').count()) await root.locator('.int-btn').first().click()
          else if (await root.locator('.pair-card[role="button"]').count()) await root.locator('.pair-card[role="button"]').first().press('Enter')
          else if (await root.locator('.chip').count()) {
            const hint = await root.locator('.chip-hint').textContent()
            const limit = Number(hint.match(/\/\s*(\d+)/)?.[1] || 2)
            for (let i = 0; i < limit; i++) await root.locator('.chip').nth(i).click()
          } else if (await root.locator('textarea').count()) await root.locator('textarea').fill(sample)
          else throw new Error('Unhandled question in block ' + n + ': ' + before)
          await settle()
          if (await page.locator('.cp-diag .result').count()) break
          if (await key() === before) {
            const next = root.locator('.nav-row .btn-accent, .nav-row .btn-gold')
            if (await next.count()) { assert.equal(await next.last().isEnabled(), true); await next.last().click(); await settle() }
          }
          if (steps === 1 && n >= 2 && n <= 9) {
            // Verify back/forward keep the stored selection and real progress.
            const second = await key()
            const back = active().locator('.qnav-back')
            if (await back.count() && await back.isEnabled()) {
              await back.click(); await settle()
              assert.equal(await key(), before)
              assert.ok(await active().locator('[aria-pressed="true"]').count(), 'Saved answer visible after back in block ' + n)
              const secondNumber = Number(second.match(/^\s*(\d+)/)?.[1] || 2)
              await active().getByRole('button', { name: new RegExp(`^Вопрос ${secondNumber}(?:,|$)`) }).click(); await settle()
              assert.equal(await key(), second)
            }
          }
          if (steps === 2) {
            await page.screenshot({ path: `design-preview/test-flow-${n}-390.png` })
            const expected = Number(await page.locator('.question-stage__track').getAttribute('aria-valuenow'))
            assert.ok(expected >= 0 && expected <= 100)
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
          }
        }
      }
      await page.locator('.cp-diag .result').waitFor()
      const saved = await page.evaluate(async n => {
        const { CP } = await import('/career-pulse/src/shared/api/index.js')
        return { result: await CP.getBlockResult(n), progress: await CP.getProgress() }
      }, n)
      assert.ok(saved.result?.answers, 'Answers persisted after real completion block ' + n)
      assert.ok(saved.progress.completed.includes(n))
      completed.push(n)
      await context.storageState({ path: stateFile })
      console.log('PASS completed block', n)
    }
    const final = await page.evaluate(async blocks => {
      const { CP } = await import('/career-pulse/src/shared/api/index.js')
      const records = await Promise.all(blocks.map(n => CP.getBlockResult(n)))
      return { valid: records.every(record => record?.answers && record?.scores), progress: await CP.getProgress() }
    }, selectedBlocks)
    assert.equal(final.valid, true)
    assert.equal(final.progress.completed.length, selectedBlocks.length)
    if (!only) assert.equal(final.progress.pct, 100)
    assert.deepEqual(errors, [])
    assert.deepEqual(external, [])
    fs.writeFileSync('design-preview/test-flow-report.json', JSON.stringify({ completed, final, errors, external }, null, 2))
    console.log('PASS: selected blocks completed through real controls; persistence, back/forward, selection, no external backend requests')
  } catch (error) {
    const page = browser.contexts()[0]?.pages()[0]
    if (page) {
      console.error(await page.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(-2000) })))
      await page.screenshot({ path: 'design-preview/test-flow-error.png' })
    }
    await browser.contexts()[0]?.storageState({ path: stateFile })
    throw error
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
