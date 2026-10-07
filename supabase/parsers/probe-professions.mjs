// Пробник структуры профессий postupi.online. Запуск у СЕБЯ (не в сэндбоксе —
// postupi режет датацентровые IP): node supabase/parsers/probe-professions.mjs
// Выведет: какие URL каталога открываются, сколько профессий, и разбор 2 страниц.
// Вставь весь вывод обратно в чат — по нему напишу полноценный скрапер.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
const DEC = new TextDecoder('windows-1251')

async function get(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ru-RU,ru;q=0.9' } })
    const ab = r.ok ? await r.arrayBuffer() : null
    // postupi — cp1251; но на всякий случай пробуем и utf-8, берём где больше кириллицы
    let html = ''
    if (ab) {
      const cp = DEC.decode(ab); const utf = new TextDecoder('utf-8').decode(ab)
      const cyr = (s) => (s.match(/[а-яё]/gi) || []).length
      html = cyr(cp) >= cyr(utf) ? cp : utf
    }
    return { status: r.status, html }
  } catch (e) { return { status: 'ERR ' + e.message, html: '' } }
}

const strip = (s) => (s || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

// 1) какие URL каталога отдаются
const catalogCandidates = [
  'https://postupi.online/professii/',
  'https://postupi.online/vuz/professii/',
  'https://postupi.online/professiya/',
]
console.log('=== КАТАЛОГ ===')
let catalogHtml = ''
for (const u of catalogCandidates) {
  const r = await get(u)
  console.log(r.status, '\t', u)
  if (r.status === 200 && !catalogHtml) catalogHtml = r.html
}

// 2) ссылки на профессии
let profUrls = []
if (catalogHtml) {
  profUrls = [...new Set([...catalogHtml.matchAll(/href="(https?:\/\/postupi\.online\/professiya\/[^"#?]+?\/)"/g)].map(m => m[1]))]
  console.log('\nнайдено ссылок на профессии:', profUrls.length)
  console.log(profUrls.slice(0, 20).join('\n'))
}

// 3) разбор 2 страниц профессий
for (const u of profUrls.slice(0, 2)) {
  const r = await get(u)
  console.log('\n=== ПРОФЕССИЯ', u, '(', r.status, ', len', r.html.length, ') ===')
  if (r.status !== 200) continue
  const h1 = strip((r.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1])
  const metaDesc = (r.html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || ''
  console.log('H1:', h1)
  console.log('META:', metaDesc.slice(0, 200))
  // первые абзацы
  const paras = [...r.html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map(m => strip(m[1])).filter(t => t.length > 40)
  console.log('ПЕРВЫЕ АБЗАЦЫ:'); paras.slice(0, 3).forEach(p => console.log('  •', p.slice(0, 180)))
  // связанные направления/специальности/вузы
  const napr = [...new Set([...r.html.matchAll(/href="https?:\/\/postupi\.online\/(napravlenie|specialnost|vuz|programma)[^"]*"[^>]*>([^<]{3,})</g)].map(m => m[1] + ': ' + strip(m[2])))]
  console.log('СВЯЗАННЫЕ ССЫЛКИ (образец):'); napr.slice(0, 12).forEach(x => console.log('  →', x))
  // какие вообще разделы на странице (по заголовкам h2/h3)
  const heads = [...new Set([...r.html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)].map(m => strip(m[1])).filter(Boolean))]
  console.log('ЗАГОЛОВКИ РАЗДЕЛОВ:', heads.slice(0, 12).join(' | '))
}
console.log('\n=== КОНЕЦ. Скопируй весь вывод в чат. ===')
