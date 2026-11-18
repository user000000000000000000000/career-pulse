const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const base = 'http://127.0.0.1:5174/career-pulse/'
;(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', e => errors.push(e.message))
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 })
      await page.goto(base + 'professions')
      await page.locator('.cat-card').first().waitFor()
      await page.waitForTimeout(1000)
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'Overflow at ' + width)
      const hero = await page.evaluate(() => {
        const shell = document.querySelector('.app-interior'), section = document.querySelector('.materials-hero')
        const nav = document.querySelector('.materials-back'), img = document.querySelector('.materials-photo img')
        const float = document.querySelector('.materials-photo__float'), animation = float.getAnimations()[0]
        const title = document.querySelector('h1'), before = title.getBoundingClientRect().toJSON()
        animation.pause(); animation.currentTime = 0
        const start = new DOMMatrixReadOnly(getComputedStyle(float).transform).m42
        animation.currentTime = 3200
        const peak = new DOMMatrixReadOnly(getComputedStyle(float).transform).m42
        animation.currentTime = 6400
        const end = new DOMMatrixReadOnly(getComputedStyle(float).transform).m42
        const after = title.getBoundingClientRect().toJSON()
        animation.play()
        return {
          shellBackground: getComputedStyle(shell).backgroundColor,
          rootBackground: getComputedStyle(document.querySelector('#root')).backgroundColor,
          heroBackground: getComputedStyle(section).backgroundColor,
          gradients: [shell,section,nav].map(el=>getComputedStyle(el).backgroundImage),
          miniLogoCount: document.querySelectorAll('.materials-page .nav-logo-link').length,
          separateWave: section.nextElementSibling.classList.contains('section-wave'),
          waveCount: section.querySelectorAll('.materials-hero__wave path').length,
          loaded: img.complete && img.naturalWidth===1448 && img.naturalHeight===1086,
          duration: animation.effect.getTiming().duration, start, peak, end, before, after,
        }
      })
      assert.equal(hero.rootBackground, 'rgb(234, 244, 255)')
      assert.equal(hero.shellBackground, hero.rootBackground)
      assert.equal(hero.heroBackground, hero.rootBackground)
      assert.deepEqual(hero.gradients, ['none','none','none'])
      assert.equal(hero.miniLogoCount,0)
      assert.equal(hero.separateWave,false)
      assert.equal(hero.waveCount,3)
      assert.equal(hero.loaded,true)
      assert.equal(hero.duration,6400)
      assert.equal(hero.start,hero.end)
      assert.equal(hero.peak,-9)
      assert.deepEqual(hero.before,hero.after,'Photo motion does not move text')
      const content = await page.evaluate(async () => {
        const { PROFESSIONS } = await import('/career-pulse/src/entities/profession/index.js')
        const rendered = [...document.querySelectorAll('.cat-card')].map(card => ({ name: card.querySelector('.cat-card-h').textContent, desc: card.querySelector('.cat-card-p').textContent }))
        return { expected: PROFESSIONS.map(({ name, desc }) => ({ name, desc })), rendered }
      })
      assert.deepEqual(content.rendered, content.expected, 'Every profession name/description is preserved')
      assert.equal(await page.locator('.cat-grid .cat-card').count(), 200)
      assert.equal(await page.locator('.site-header .brand-mark').evaluate(img => getComputedStyle(img).backgroundColor), 'rgba(0, 0, 0, 0)')
      await page.screenshot({ path: `design-preview/materials-hero-${width}.png` })
      await page.getByRole('link', { name: 'Исследовать профессии' }).click()
      await page.waitForTimeout(900)
      assert.ok(await page.evaluate(() => scrollY > 300))
      assert.ok(await page.locator('.site-header nav').evaluate(el => el.getBoundingClientRect().top >= 0))
      await page.locator('.cat-input').fill('дизайнер')
      assert.ok(await page.locator('.cat-card').count() > 0 && await page.locator('.cat-card').count() < 200)
      await page.locator('.cat-input').fill('несуществующаяпрофессия12345')
      assert.equal(await page.locator('.cat-card').count(), 0)
      assert.ok(await page.locator('.cat-empty').isVisible())
      await page.locator('.cat-input').fill('')
      await page.getByRole('button', { name: 'IT', exact: true }).click()
      assert.ok(await page.locator('.cat-card').count() > 0)
      assert.ok((await page.locator('.cat-card-cat').allTextContents()).every(t => t === 'IT'))
      await page.getByRole('button', { name: 'Все', exact: true }).click()
      const holland = page.locator('.materials-filter-group').nth(1).locator('button')
      for (let i = 0; i < 4; i++) await holland.nth(i).click()
      assert.equal(await page.locator('.materials-filter-group').nth(1).locator('[aria-pressed="true"]').count(), 3, 'Holland limit unchanged')
      for (let i = 0; i < 3; i++) await holland.nth(i).click()
      await page.locator('.cat-input').fill('Java')
      await page.locator('.cat-card').first().scrollIntoViewIfNeeded()
      await page.waitForTimeout(800)
      await page.screenshot({ path: `design-preview/materials-cards-${width}.png` })
      const footer = page.locator('.product-footer')
      await footer.scrollIntoViewIfNeeded()
      await page.waitForTimeout(500)
      assert.ok(await footer.locator('.brand-mark--white').evaluate(img => img.complete && img.naturalWidth > 0))
      const bottom = await page.evaluate(() => {
        const footer = document.querySelector('.product-footer')
        return {
          gap: document.documentElement.scrollHeight - (footer.getBoundingClientRect().bottom + scrollY),
          shellPadding: getComputedStyle(document.querySelector('.app-interior')).paddingBottom,
          railBackground: getComputedStyle(document.querySelector('#root'), '::after').backgroundColor,
        }
      })
      assert.ok(Math.abs(bottom.gap) < 1, 'Footer reaches the bottom at ' + width + ': ' + JSON.stringify(bottom))
      assert.equal(bottom.shellPadding, '0px')
      if (width <= 640) assert.equal(bottom.railBackground, 'rgb(7, 5, 41)')
      assert.equal(await page.locator('.materials-atlas').count(), 0)
      assert.equal(await page.locator('.materials-photo').count(), 1)
      await footer.screenshot({ path: `design-preview/materials-footer-${width}.png` })
      await footer.getByRole('link', { name: 'Конфиденциальность', exact: true }).click()
      await page.waitForURL(base + 'legal/privacy')
      console.log('PASS', width, 'all content, search, categories, Holland, anchor, header, footer links')
    }
    await page.goto(base + 'professions')
    await page.locator('.materials-cta a').click()
    await page.waitForURL(base + 'proba/2')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(base + 'professions')
    assert.equal(await page.locator('.materials-decor__ring').first().evaluate(el => getComputedStyle(el).animationName), 'none')
    assert.equal(await page.locator('.materials-photo__float').evaluate(el => getComputedStyle(el).animationName), 'none')
    assert.deepEqual(errors, [])
    console.log('PASS: test CTA, reduced motion; no JavaScript errors')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
