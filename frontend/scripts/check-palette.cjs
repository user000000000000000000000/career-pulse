const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')
const fs = require('node:fs')
const assert = require('node:assert/strict')
const phase = process.argv.includes('--before') ? 'before' : 'after'
const base = 'http://127.0.0.1:5174/career-pulse/'
const routes = ['', 'dashboard', 'professions', 'diagnostic', 'profile', 'admin', 'proba/result', 'legal/privacy', 'login']
const allRoutes = [...new Set([...routes, 'register', 'reset-password', 'vk-consent', 'atlas', 'vuzy', 'roadmap', 'result', 'proba/2', 'proba/4', 'proba/5', 'r/demo', 'child/demo', 't/invalid', 'legal', 'legal/terms', 'legal/consent', 'legal/adconsent', 'legal/recomm', ...Array.from({length:10},(_,i)=>'test/'+(i+1))])]
;(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true})
 const page=await browser.newPage()
 const errors=[], report=[]
 page.on('pageerror',e=>errors.push(e.message))
 fs.mkdirSync(`design-preview/palette-${phase}`,{recursive:true})
 for(const width of (phase==='before' ? [1440,390] : [1440,820,390])) for(const route of (phase==='before' ? routes : allRoutes)) {
  await page.setViewportSize({width,height:1000})
  await page.goto(base+route)
  await page.locator('.site-header nav').waitFor()
  await page.waitForTimeout(routes.includes(route) ? 900 : 350)
  const state=await page.evaluate(()=>{
   const bad=[]
   const allowed=(value)=>{
    const m=value.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/)
    if(!m || Number(m[4]??1)===0) return true
    const [r,g,b]=m.slice(1,4).map(Number)
    return (r===g && g===b && (r===0 || r===255)) || (b>=r && b>=g && b>r)
   }
   for(const el of document.querySelectorAll('body *')) {
    if(!el.getClientRects().length || ['IMG','VIDEO','CANVAS'].includes(el.tagName)) continue
    const c=getComputedStyle(el)
    if(c.visibility==='hidden' || c.opacity==='0') continue
    for(const prop of ['color','backgroundColor','borderTopColor','fill','stroke']) {
     if(!allowed(c[prop])) bad.push({tag:el.tagName,cls:String(el.className?.baseVal??el.className).slice(0,75),prop,value:c[prop]})
    }
    for(const pseudo of [null,'::before','::after']) {
     const style=pseudo ? getComputedStyle(el,pseudo) : c
     if(pseudo && (style.content==='none' || style.content==='normal')) continue
     for(const prop of ['backgroundImage','boxShadow','textShadow']) for(const color of style[prop].match(/rgba?\([^)]*\)/g)||[]) {
      if(!allowed(color)) bad.push({tag:el.tagName,cls:String(el.className?.baseVal??el.className).slice(0,75),prop:prop+(pseudo||''),value:color})
     }
    }
   }
   return {overflow:document.documentElement.scrollWidth>innerWidth,bad:bad.slice(0,30)}
  })
  report.push({route:route||'/',width,...state})
  if(routes.includes(route) && width!==820) await page.screenshot({path:`design-preview/palette-${phase}/${route.replaceAll('/','-')||'home'}-${width}.png`})
 }
 fs.writeFileSync(`design-preview/palette-${phase}/report.json`,JSON.stringify({report,errors},null,2))
 await browser.close()
 console.log(JSON.stringify({phase,checks:report.length,overflow:report.filter(r=>r.overflow),offPalette:report.filter(r=>r.bad.length),errors},null,2))
 if(phase==='after') { assert.equal(errors.length,0); assert.equal(report.filter(r=>r.overflow||r.bad.length).length,0) }
})().catch(e=>{console.error(e);process.exitCode=1})
