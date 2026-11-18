// Optional browser QA: PLAYWRIGHT_MODULE points to an existing Playwright install.
// No production account or backend is used. Run against `npm run preview:demo`.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('fs')
const path = require('path')
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5174/career-pulse/'
const out = path.resolve('design-preview/unified-demo')
const routes = ['', 'login', 'register', 'reset-password', 'vk-consent', 'dashboard', 'profile', 'admin', 'atlas', 'professions', 'vuzy', 'diagnostic', 'roadmap', 'result', 'proba/2', 'proba/4', 'proba/5', 'proba/result', 'r/demo', 'child/demo', 't/invalid', 'legal', 'legal/privacy', 'legal/terms', 'legal/consent', 'legal/adconsent', 'legal/recomm', ...Array.from({ length: 10 }, (_, i) => 'test/' + (i + 1))]

;(async () => {
  fs.mkdirSync(out, { recursive: true })
  const browser = await chromium.launch({ headless: true, channel: 'chrome' })
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = [], backendRequests = [], results = []
  page.on('pageerror', error => errors.push({ url: page.url(), message: error.message }))
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(base).origin && /supabase|oauth\.vk|id\.vk|functions\/v1/.test(request.url())) backendRequests.push(request.url()) })
  page.on('dialog', dialog => dialog.accept())
  for (const width of [1440, 820, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of routes) {
      await page.goto(base + route, { waitUntil: 'domcontentloaded' })
      // Completed diagnostics can immediately open a choice dialog; the common
      // header now correctly stays hidden until that dialog has been answered.
      await page.locator('.site-header nav').waitFor({ state: 'attached' })
      await page.waitForTimeout(route === 'vuzy' ? 600 : 120)
      if (route.startsWith('test/')) {
        const edit = page.getByRole('button', { name: 'Изменить ответы', exact: true })
        if (await edit.isVisible()) await edit.click()
        await page.locator('.block-title').waitFor()
      }
      await page.locator('.site-header nav').waitFor({ state: 'visible' })
      const state = await page.evaluate(() => ({
        path: location.pathname, overflow: document.documentElement.scrollWidth > innerWidth,
        navTop: document.querySelector('.site-header nav').getBoundingClientRect().top,
        errorScreen: document.body.innerText.includes('Что-то пошло не так'),
        heading: document.querySelector('.app-interior h1, .block-title, .p-title, .rm-title, .wb-text h2')?.textContent,
      }))
      results.push({ width, route: route || '/', ...state })
      if (state.overflow || state.errorScreen) console.log('ISSUE', width, route, state)
      if (['dashboard', 'login', 'register', 'profile', 'diagnostic', 'roadmap', 'professions', 'vuzy', 'admin', 'legal/privacy', 'test/1', 'test/2', 'r/demo', 'proba/result'].includes(route) && width !== 820) {
        await page.waitForTimeout(800)
        await page.screenshot({ path: path.join(out, route.replaceAll('/', '-') + '-' + width + '.png'), fullPage: false })
      }
    }
  }
  // A real filter operation; verify the result set responds to user input.
  await page.goto(base + 'professions')
  await page.locator('.cat-card').first().waitFor()
  const before = await page.locator('.cat-card').count()
  await page.locator('.cat-input').fill('дизайнер')
  const after = await page.locator('.cat-card').count()
  const functions = { professionSearch: before > after && after > 0 }
  await page.goto(base + 'vuzy')
  await page.locator('.cat-card').first().waitFor()
  await page.getByPlaceholder('Город', { exact: true }).fill('Казань')
  await page.waitForTimeout(600)
  functions.institutionSearch = await page.locator('.cat-card').count() === 2
  await page.goto(base + 'proba/result')
  await page.getByRole('button', { name: 'Поделиться', exact: true }).click()
  const shareLink = await page.locator('.p-link-row input').inputValue()
  await page.goto(shareLink)
  await page.locator('.p-title').waitFor()
  functions.miniTestSharing = shareLink.startsWith(base + 't/') && (await page.locator('.p-title').innerText()) === 'Результат мини-теста'
  await page.goto(base + 'profile')
  await page.locator('.profile-card').waitFor()
  functions.profileVisible = await page.locator('input').count() > 0
  await page.locator('#p-name').fill('Соколова Анна Демо')
  await page.getByRole('button', { name: 'Сохранить профиль', exact: true }).click()
  await page.waitForTimeout(150)
  functions.profileSave = await page.evaluate(() => JSON.parse(localStorage.getItem('cp_user')).name === 'Соколова Анна Демо')
  await page.evaluate(() => scrollTo(0, 900))
  functions.fixedHeader = await page.locator('.site-header nav').evaluate(el => el.getBoundingClientRect().top === 12)
  await page.goto(base + 'roadmap')
  await page.locator('.prof-opt').first().waitFor()
  await page.locator('.prof-opt').nth(0).click()
  await page.locator('.prof-opt').nth(1).click()
  await page.getByRole('button', { name: /^Построить маршрут(?: →)?$/ }).click()
  await page.locator('.rm-task').first().waitFor()
  functions.roadmapBuild = await page.locator('.rm-task').count() >= 5
  await page.screenshot({ path: path.join(out, 'roadmap-built-390.png') })
  await page.goto(base + 'admin')
  await page.locator('.adm-user-name').first().waitFor()
  await page.getByPlaceholder('Поиск: имя, email или телефон').fill('Анна')
  await page.getByPlaceholder('Поиск: имя, email или телефон').press('Enter')
  await page.waitForTimeout(150)
  functions.adminSearch = await page.locator('.adm-user-name').count() === 1
  await page.getByRole('button', { name: 'Сообщить о проблеме', exact: true }).click()
  await page.getByPlaceholder('Что случилось? Что делали перед этим?').fill('Проверка демонстрационной формы')
  await page.getByRole('button', { name: 'Отправить', exact: true }).click()
  await page.waitForTimeout(150)
  functions.feedbackLocal = await page.evaluate(() => JSON.parse(localStorage.getItem('demo_feedback') || '[]').length > 0)
  await page.getByRole('dialog').getByRole('button', { name: 'Закрыть', exact: true }).click()
  await page.goto(base + 'login')
  await page.locator('#login-email').fill('anna@example.test')
  await page.locator('#login-pass').fill('demo12345')
  await page.getByRole('button', { name: /^Войти(?: →)?$/ }).click()
  await page.waitForURL(base)
  functions.localLogin = await page.evaluate(() => JSON.parse(localStorage.getItem('cp_user')).email === 'anna@example.test')
  await page.goto(base + 'reset-password')
  await page.locator('#rp-pass').fill('demo12345')
  await page.locator('#rp-confirm').fill('demo12345')
  await page.locator('.cp-btn').click()
  await page.waitForTimeout(150)
  functions.passwordForm = !(await page.locator('#rp-pass').count())
  await page.goto(base + 'register')
  await page.locator('#reg-name').fill('Тестовый Пользователь')
  await page.locator('#reg-email').fill('reviewer@example.test')
  await page.locator('#reg-pass').fill('demo12345')
  await page.locator('.auth-wrap input[type="checkbox"]').nth(0).check()
  await page.locator('.auth-wrap input[type="checkbox"]').nth(1).check()
  await page.getByRole('button', { name: /^Начать диагностику(?: →)?$/ }).click()
  await page.waitForURL(base)
  functions.registration = await page.evaluate(() => JSON.parse(localStorage.getItem('cp_user')).email === 'reviewer@example.test')
  await page.goto(base + 'dashboard')
  await page.locator('.demo-toggle').click()
  await page.getByRole('button', { name: 'Начать новую диагностику', exact: true }).click()
  await page.waitForURL(base + 'test/1')
  await page.getByRole('button', { name: /^Начать анкету(?: →)?$/ }).click()
  await page.waitForTimeout(150)
  functions.questionnaire = await page.locator('.q-area input').count() > 0
  await page.getByPlaceholder('Например: Алина').fill('Анна')
  await page.waitForTimeout(700)
  await page.reload()
  await page.getByPlaceholder('Например: Алина').waitFor()
  functions.draftPersistence = await page.getByPlaceholder('Например: Алина').inputValue() === 'Анна'
  await page.screenshot({ path: path.join(out, 'questionnaire-390.png') })
  await page.locator('.demo-toggle').click()
  await page.getByRole('button', { name: 'Восстановить пример профиля', exact: true }).click()
  await page.waitForURL(base + 'dashboard')
  functions.restoreDemo = await page.evaluate(() => JSON.parse(localStorage.getItem('cp_progress')).pct === 100)
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify({ routes: results, functions, errors, backendRequests }, null, 2))
  console.log(JSON.stringify({ checked: results.length, issues: results.filter(r => r.overflow || r.errorScreen), functions, errors, backendRequests }, null, 2))
  await browser.close()
  if (errors.length || backendRequests.length || results.some(r => r.overflow || r.errorScreen) || Object.values(functions).some(v => !v)) process.exitCode = 1
})().catch(error => { console.error(error); process.exit(1) })
