// Explicit source-only migration. Never processes bitmap assets, SVG files, URLs,
// scoring/data modules, IDs, routes or arbitrary string contents.
const fs = require('node:fs')
const path = require('node:path')
const root = path.resolve('src')
const report = { files: [], colors: {} }
function rgb(hex) {
  let h = hex.slice(1)
  if (h.length < 5) h = [...h].map(c => c + c).join('')
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16))
}
function convert(channels) {
  const [r, g, b] = channels.map(x => x / 255)
  const hi = Math.max(r,g,b), lo = Math.min(r,g,b), delta = hi-lo
  const light = (hi+lo)/2
  const sat = delta ? delta/(1-Math.abs(2*light-1)) : 0
  let hue = !delta ? 0 : hi===r ? ((g-b)/delta)%6 : hi===g ? (b-r)/delta+2 : (r-g)/delta+4
  hue = (hue*60+360)%360
  // Keep approved navy, genuine blue/cyan-blue, white and black.
  if ((hi===1 && lo===1) || hi===0 || (hue>=200 && hue<=225 && sat>=.22) || (light<.11 && b>r && b>g)) return channels
  // A finite blue ramp; match lightness so foreground/background roles survive.
  const ramp = [[.12,'#102e59'],[.23,'#17477d'],[.34,'#245e9e'],[.45,'#3378be'],[.56,'#418bdb'],[.67,'#70aceb'],[.78,'#a1ccf5'],[.87,'#c9e3fc'],[.94,'#e7f3ff'],[1,'#f6faff']]
  const target = ramp.find(([limit]) => light <= limit)[1]
  return rgb(target)
}
function hexColor(value) {
  const reviewed = {
    '#25205c': '#102e59', '#241f5c': '#102e59', '#1a1636': '#102e59',
    '#626f99': '#42658c', '#7c83ad': '#42658c', '#626185': '#42658c',
    '#77758f': '#42658c', '#82819b': '#42658c', '#63628a': '#42658c',
    '#7a82ad': '#42658c', '#606d9d': '#42658c', '#737ca5': '#42658c', '#69739c': '#42658c',
    '#ff4d6d': '#17477d', '#d63456': '#17477d', '#b42343': '#17477d',
    '#8b6fe8': '#245e9e', '#e0699b': '#3378be', '#e08a2e': '#17477d',
    '#16a085': '#087cff', '#22c55e': '#087cff', '#1a9d5c': '#087cff',
  }
  if (reviewed[value.toLowerCase()]) { report.colors[value] = reviewed[value.toLowerCase()]; return reviewed[value.toLowerCase()] }
  const old = rgb(value), next = convert(old)
  if (old.every((v,i)=>v===next[i])) return value
  let suffix = value.length===9 ? value.slice(7) : value.length===5 ? value[4]+value[4] : ''
  const out = '#'+next.map(v=>v.toString(16).padStart(2,'0')).join('')+suffix
  report.colors[value] = out
  return out
}
function functional(value) {
  const match = value.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)([\s\S]*)\)$/)
  if (!match) return value
  const old = match.slice(1,4).map(Number), next = convert(old)
  if (old.every((v,i)=>v===next[i])) return value
  const out = value.slice(0,value.indexOf('(')+1)+next.join(',')+match[4]+')'
  report.colors[value] = out
  return out
}
function migrate(text, css) {
  const colors = /#[\da-fA-F]{8}\b|#[\da-fA-F]{6}\b|#[\da-fA-F]{4}\b|#[\da-fA-F]{3}\b|rgba?\([^()]*\)/g
  if (css) {
    // Skip URLs and comments; only declaration values contain visual colors.
    return text.replace(/\/\*[\s\S]*?\*\/|url\([^)]*\)|(:[^;{}]*)(?=[;}])/g, (all, declaration) => declaration ? all.replace(colors, v=>v.startsWith('#')?hexColor(v):functional(v)) : all)
  }
  // JSX inline styles / SVG attributes / color arrays: exact color literals,
  // or a CSS value beginning with a recognized paint/gradient/shadow function.
  return text.replace(/(['"])([^'"\r\n]*)\1/g, (all, quote, value) => {
    if (!/^(#[\da-fA-F]{3,8}|rgba?\([^()]*\))$/.test(value) && !/^(?:linear-gradient|radial-gradient|\d+px\s)/.test(value)) return all
    return quote+value.replace(colors,v=>v.startsWith('#')?hexColor(v):functional(v))+quote
  })
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    const file=path.join(dir,entry.name)
    if(entry.isDirectory()) walk(file)
    else if(file.endsWith('.css') || file.endsWith('.jsx')) {
      const before=fs.readFileSync(file,'utf8'), after=migrate(before,file.endsWith('.css'))
      if(before!==after) { report.files.push(path.relative(root,file)); if(process.argv.includes('--apply')) fs.writeFileSync(file,after) }
    }
  }
}
walk(root)
fs.mkdirSync('design-preview',{recursive:true})
fs.writeFileSync('design-preview/palette-migration.json',JSON.stringify(report,null,2))
console.log(JSON.stringify(report,null,2))
