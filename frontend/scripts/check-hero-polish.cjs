const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const base = 'http://127.0.0.1:5174/career-pulse/'
;(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try {
  fs.mkdirSync('design-preview/hero-polish',{recursive:true})
  const page=await browser.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  for(const width of [1440,820,390,320]) {
   await page.setViewportSize({width,height:1000})
   await page.goto(base)
   await page.locator('.lv-scene__float img').waitFor()
   await page.evaluate(()=>document.fonts.ready)
   await page.waitForTimeout(650)
   assert.equal(await page.evaluate(()=>scrollY),0)
   assert.ok(await page.locator('.lv-scene img').evaluate(img=>img.complete&&img.naturalWidth===1536))
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)
   assert.equal(await page.locator('.lv-scene img').count(),1,'Original scene remains a single image')
   const motion=await page.evaluate(()=>{
    const float=document.querySelector('.lv-scene__float'), img=float.querySelector('img')
    const floatAnimation=float.getAnimations()[0], sway=img.getAnimations()[0]
    const h1=document.querySelector('h1'), rect=h1.getBoundingClientRect().toJSON()
    floatAnimation.pause();sway.pause()
    const points=[0,1904,3808,5440,6800].map(time=>{
     floatAnimation.currentTime=time
     const m=new DOMMatrixReadOnly(getComputedStyle(float).transform)
     return {x:m.m41,y:m.m42}
    })
    floatAnimation.play();sway.play()
    return {points,rect,after:h1.getBoundingClientRect().toJSON(),durations:[floatAnimation.effect.getTiming().duration,sway.effect.getTiming().duration]}
   })
   assert.deepEqual(motion.rect,motion.after,'Animation does not move document layout')
   assert.deepEqual(motion.durations,[6800,11300])
   assert.ok(Math.min(...motion.points.map(p=>p.y))>=-10)
   assert.deepEqual(motion.points[0],motion.points.at(-1),'Loop joins without jump')
   await page.screenshot({path:`design-preview/hero-polish/hero-${width}.png`})
   await page.locator('#how').scrollIntoViewIfNeeded()
   await page.waitForTimeout(350)
   await page.locator('.lv-foot').scrollIntoViewIfNeeded()
   await page.waitForFunction(()=>document.querySelector('.cp-lv2').dataset.sceneAwake==='false')
   assert.equal(await page.locator('.lv-scene__float').evaluate(el=>getComputedStyle(el).animationPlayState),'paused')
   assert.equal(await page.locator('.lv-ctaband').evaluate(el=>getComputedStyle(el).backgroundImage),'none')
   assert.equal(await page.locator('.lv-ctaband').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(8, 124, 255)')
   assert.equal(await page.locator('.lv-foot').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(7, 5, 41)')
   await page.waitForTimeout(900)
   await page.screenshot({path:`design-preview/hero-polish/footer-${width}.png`})
   await page.reload()
   await page.locator('h1').waitFor()
   await page.waitForTimeout(300)
   assert.equal(await page.evaluate(()=>scrollY),0,'Reload starts at hero')
   await page.emulateMedia({reducedMotion:'reduce'})
   assert.equal(await page.locator('.lv-scene__float').evaluate(el=>getComputedStyle(el).animationName),'none')
   assert.equal(await page.locator('.lv-scene img').evaluate(el=>getComputedStyle(el).animationName),'none')
   await page.emulateMedia({reducedMotion:'no-preference'})
   console.log('PASS',width,'layout, bounded motion, seamless loop, footer, offscreen pause, reload, reduced motion')
  }
  await page.goto(base)
  await page.locator('.lv-foot a[href="#how"]').click()
  await page.waitForFunction(()=>{
   const target=document.querySelector('#how')
   const expected=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)+parseFloat(getComputedStyle(target).scrollMarginTop)
   return Math.abs(target.getBoundingClientRect().top-expected)<2
  })
  const destination=await page.locator('.lv-btn-primary').getAttribute('href')
  await page.locator('.lv-btn-primary').click()
  await page.waitForURL(base+destination.slice(1))
  assert.equal(errors.length,0)
  console.log('PASS hero CTA and anchor navigation, no JavaScript errors')
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
