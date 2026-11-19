// Local regression check. Run against `vite --mode demo`; no production account is used.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5174/career-pulse/'
;(async () => {
  fs.mkdirSync('design-preview/handoff', { recursive: true })
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const errors = [], backendRequests = [], routes = [], checks = []
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' })
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => {
      if (new URL(request.url()).origin !== new URL(base).origin && /supabase|oauth\.vk|functions\/v1/.test(request.url())) backendRequests.push(request.url())
    })
    await page.addInitScript(() => localStorage.setItem('cp_tour_seen', '1'))
    for (const width of [1440, 820, 390]) {
      await page.setViewportSize({ width, height: 1000 })
      for (const route of ['', 'dashboard', 'diagnostic', 'roadmap', 'profile', 'atlas', 'professions', 'vuzy', 'login', 'register', 'legal', 'legal/privacy', 'proba/result', ...Array.from({length:10}, (_,i) => 'test/'+(i+1))]) {
        await page.goto(base + route)
        await page.waitForFunction(() => document.body.innerText.length > 30)
        await page.waitForTimeout(200)
        const edit = page.getByRole('button', {name:'Изменить ответы',exact:true})
        if (await edit.isVisible()) { await edit.click(); await page.waitForTimeout(200) }
        const state = await page.evaluate(() => ({ overflow:document.documentElement.scrollWidth > innerWidth, error:/Что-то пошло не так|Что-то сломалось/.test(document.body.innerText), text:document.body.innerText.length }))
        assert.equal(state.error, false, `Error boundary: ${route} at ${width}`)
        assert.equal(state.overflow, false, `Overflow: ${route} at ${width}`)
        assert.ok(state.text > 30, `Empty route: ${route}`)
        routes.push({width, route:route || '/', ...state})
        if (['dashboard','diagnostic','roadmap','test/10'].includes(route) && width !== 820) await page.screenshot({path:`design-preview/handoff/${route.replace('/','-')}-${width}.png`})
      }
    }
    await page.goto(base+'profile')
    await page.locator('#p-name').fill('Проверка интеграции')
    await page.getByRole('button',{name:'Сохранить профиль',exact:true}).click()
    await page.reload()
    await page.locator('#p-name').waitFor()
    assert.equal(await page.locator('#p-name').inputValue(),'Проверка интеграции')
    checks.push('Profile persists after reload')
    await page.goto(base+'roadmap')
    await page.evaluate(async () => {
      const {CP}=await import('/career-pulse/src/shared/api/index.js')
      await CP.updateProfile({roadmap:null,chosen_professions:[]})
    })
    await page.reload()
    await page.locator('.prof-opt').first().click()
    await page.locator('.prof-opt').nth(1).click()
    await page.getByRole('button',{name:/^Построить маршрут/}).click()
    await page.locator('.rm-task').first().waitFor()
    await page.locator('.rm-task').first().click()
    assert.equal(await page.locator('.rm-task input').first().isChecked(),true)
    await page.reload()
    await page.locator('.rm-task').first().waitFor()
    assert.equal(await page.locator('.rm-task input').first().isChecked(),true)
    await page.locator('.rm-task').first().click()
    await page.reload()
    await page.locator('.rm-task').first().waitFor()
    assert.equal(await page.locator('.rm-task input').first().isChecked(),false)
    checks.push('Employer curated route builds; checklist checks and unchecks persist')
    await page.screenshot({path:'design-preview/handoff/curated-route-390.png',fullPage:true})
    await page.evaluate(async () => {
      const {CP}=await import('/career-pulse/src/shared/api/index.js')
      await CP.updateProfile({roadmap:{goal:'Сохранённый маршрут',steps:[{n:1,title:'Изучить профессию',desc:'Первый шаг',completed:false}]},chosen_professions:['Дизайнер','Аналитик']})
    })
    await page.reload()
    const step = page.locator('.roadmap-journey__complete').first()
    await step.click()
    await page.reload()
    await page.locator('.roadmap-journey__step.is-complete').waitFor()
    checks.push('Existing personalized route and completion state retained')
    await page.goto(base+'diagnostic')
    await page.evaluate(() => { window.print=()=>{window.__printed=true} })
    await page.getByRole('button',{name:/Скачать отчёт/}).click()
    await page.waitForFunction(()=>window.__printed)
    checks.push('PDF print action renders and invokes browser printing')
    await page.goto(base+'dashboard')
    const resultButton=page.locator('.block-card').filter({has:page.locator('button')}).first().locator('button').first()
    if (await resultButton.count()) {
      await resultButton.click()
      await page.waitForTimeout(200)
    }
    assert.deepEqual(errors,[])
    assert.deepEqual(backendRequests,[])
    console.log(JSON.stringify({routes:routes.length,checks,errors,backendRequests}))
  } finally {
    fs.writeFileSync('design-preview/handoff/report.json',JSON.stringify({routes,checks,errors,backendRequests},null,2))
    await browser.close()
  }
})().catch(error => {console.error(error);process.exitCode=1})
