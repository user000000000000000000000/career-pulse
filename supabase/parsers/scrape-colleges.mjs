#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// Скрапер КОЛЛЕДЖЕЙ (СПО) с postupi.online — по образцу scrape-postupi-city.mjs,
// но раздел /ssuzy/ вместо /vuzy/. Селекторы карточки те же (h1#prTitle,
// .contact-icon site/address/mail/phone); программы — со страницы
// /ssuz/<slug>/programmy-obucheniya/ (блоки list__info: код + list__h).
//
// Источник кодировки cp1251 → декодируем через TextDecoder (Node ≥ 20 с full-ICU).
// На выходе — готовый SQL (specialties[college] + institutions + institution_programs)
// в output/colleges_<slug>.sql (или один общий файл при нескольких городах).
//
// Запуск (все 15 городов Тира 1):   node scrape-colleges.mjs
//        один город:                node scrape-colleges.mjs --slug kazan
//        свой список:               node scrape-colleges.mjs --slug msk,spb,nsk
// ════════════════════════════════════════════════════════════════
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')
const UA = 'CareerPulseBot/1.0 (+education data collection for career guidance; contact: careerpulse.ru)'
const DEC = new TextDecoder('windows-1251')
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

// slug postupi → [город, регион]. Тир 1 (15) + Тир 2 (40).
const CITIES = {
  // Тир 1
  msk: ['Москва', 'Москва'],
  spb: ['Санкт-Петербург', 'Санкт-Петербург'],
  nsk: ['Новосибирск', 'Новосибирская область'],
  ekaterinburg: ['Екатеринбург', 'Свердловская область'],
  kazan: ['Казань', 'Республика Татарстан'],
  nn: ['Нижний Новгород', 'Нижегородская область'],
  chelyabinsk: ['Челябинск', 'Челябинская область'],
  samara: ['Самара', 'Самарская область'],
  omsk: ['Омск', 'Омская область'],
  rostov: ['Ростов-на-Дону', 'Ростовская область'],
  ufa: ['Уфа', 'Республика Башкортостан'],
  krasnoyarsk: ['Красноярск', 'Красноярский край'],
  perm: ['Пермь', 'Пермский край'],
  voronezh: ['Воронеж', 'Воронежская область'],
  volgograd: ['Волгоград', 'Волгоградская область'],
  // Тир 2
  arhangelsk: ['Архангельск', 'Архангельская область'],
  astrahan: ['Астрахань', 'Астраханская область'],
  barnaul: ['Барнаул', 'Алтайский край'],
  belgorod: ['Белгород', 'Белгородская область'],
  bryansk: ['Брянск', 'Брянская область'],
  cheboksary: ['Чебоксары', 'Чувашская Республика'],
  habarovsk: ['Хабаровск', 'Хабаровский край'],
  irkutsk: ['Иркутск', 'Иркутская область'],
  ivanovo: ['Иваново', 'Ивановская область'],
  izhevsk: ['Ижевск', 'Удмуртская Республика'],
  kaliningrad: ['Калининград', 'Калининградская область'],
  kaluga: ['Калуга', 'Калужская область'],
  kemerovo: ['Кемерово', 'Кемеровская область'],
  kostroma: ['Кострома', 'Костромская область'],
  krasnodar: ['Краснодар', 'Краснодарский край'],
  kursk: ['Курск', 'Курская область'],
  magnitogorsk: ['Магнитогорск', 'Челябинская область'],
  murmansk: ['Мурманск', 'Мурманская область'],
  'naberezhnye-chelny': ['Набережные Челны', 'Республика Татарстан'],
  orel: ['Орёл', 'Орловская область'],
  orenburg: ['Оренбург', 'Оренбургская область'],
  penza: ['Пенза', 'Пензенская область'],
  pskov: ['Псков', 'Псковская область'],
  ryazan: ['Рязань', 'Рязанская область'],
  saratov: ['Саратов', 'Саратовская область'],
  smolensk: ['Смоленск', 'Смоленская область'],
  sochi: ['Сочи', 'Краснодарский край'],
  stavropol: ['Ставрополь', 'Ставропольский край'],
  surgut: ['Сургут', 'Ханты-Мансийский АО'],
  syktyvkar: ['Сыктывкар', 'Республика Коми'],
  tambov: ['Тамбов', 'Тамбовская область'],
  tomsk: ['Томск', 'Томская область'],
  tula: ['Тула', 'Тульская область'],
  tver: ['Тверь', 'Тверская область'],
  tyumen: ['Тюмень', 'Тюменская область'],
  ulyanovsk: ['Ульяновск', 'Ульяновская область'],
  vladimir: ['Владимир', 'Владимирская область'],
  vladivostok: ['Владивосток', 'Приморский край'],
  vologda: ['Вологда', 'Вологодская область'],
  yaroslavl: ['Ярославль', 'Ярославская область'],
}
// Города Тир 2 (для запуска без --slug добора остатка)
const TIER2 = ['arhangelsk','astrahan','barnaul','belgorod','bryansk','cheboksary','habarovsk','irkutsk','ivanovo','izhevsk','kaliningrad','kaluga','kemerovo','kostroma','krasnodar','kursk','magnitogorsk','murmansk','naberezhnye-chelny','orel','orenburg','penza','pskov','ryazan','saratov','smolensk','sochi','stavropol','surgut','syktyvkar','tambov','tomsk','tula','tver','tyumen','ulyanovsk','vladimir','vladivostok','vologda','yaroslavl']

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ru-RU,ru;q=0.9' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return DEC.decode(await res.arrayBuffer())
}
const clean = (s) => s ? s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : null
const q = (s) => s == null ? 'null' : "'" + String(s).replace(/'/g, "''") + "'"

// Собрать все URL колледжей города из sitemap_ssuzy(.xml, _1.xml, …).
async function collegeUrls(slug) {
  const urls = new Set()
  for (let i = 0; i <= 12; i++) {
    const name = i === 0 ? 'sitemap_ssuzy.xml' : `sitemap_ssuzy_${i}.xml`
    const url = `https://${slug}.postupi.online/postupi_sitemap/${slug}/${name}`
    let xml
    try { xml = await fetchHtml(url) } catch { break } // нет следующего файла — заканчиваем
    for (const m of xml.matchAll(new RegExp(`<loc>(https://${slug}\\.postupi\\.online/ssuz/[a-z0-9_-]+/)</loc>`, 'g'))) urls.add(m[1])
    await sleep(200)
  }
  return [...urls]
}

function parseCard(html) {
  return {
    name: clean((html.match(/<h1[^>]*id="prTitle"[^>]*>([^<]+)</) || [])[1]),
    site: (html.match(/class="contact-icon site">\s*<a href="([^"]+)"/) || [])[1] || null,
    mail: (html.match(/class="contact-icon mail">\s*<a href="mailto:([^"]+)"/) || [])[1] || null,
    phone: clean((html.match(/class="contact-icon phone">([^<]+)</) || [])[1]),
  }
}
function parsePrograms(html) {
  const out = []
  for (const b of html.split('class="list__info"').slice(1)) {
    const code = (b.match(/specialnosti\/spo[^>]*>([\d.]+)</) || [])[1]
    const name = clean((b.match(/class="list__h"[^>]*>\s*<a[^>]*>([^<]+)</) || [])[1])
    if (code && /^\d{2}\.02\.\d{2}$/.test(code)) out.push({ code, name })
  }
  return [...new Map(out.map(p => [p.code, p])).values()]
}

async function scrapeCity(slug) {
  const [city, region] = CITIES[slug] || [slug, null]
  const urls = await collegeUrls(slug)
  const colleges = [], specs = {}
  process.stdout.write(`\n[${slug}] колледжей в sitemap: ${urls.length}\n`)
  let n = 0
  for (const u of urls) {
    try {
      const card = parseCard(await fetchHtml(u)); await sleep(150)
      const programs = parsePrograms(await fetchHtml(u.replace(/\/$/, '') + '/programmy-obucheniya/')); await sleep(150)
      for (const p of programs) if (p.name && !specs[p.code]) specs[p.code] = p.name
      const slugC = (u.match(/\/ssuz\/([a-z0-9_-]+)\//) || [])[1]
      colleges.push({ slugC, ...card, programs, link: u.replace(/\/$/, '') + '/programmy-obucheniya/' })
      process.stdout.write(`  ${++n}/${urls.length} ${card.name || slugC}\r`)
    } catch (e) { process.stdout.write(`\n  ! ${u}: ${String(e).slice(0, 50)}\n`) }
  }
  return { slug, city, region, colleges, specs }
}

function toSql(cityData) {
  const { city, region, colleges, specs } = cityData
  const L = [`-- КОЛЛЕДЖИ: ${city}`]
  for (const [code, name] of Object.entries(specs))
    L.push(`insert into public.specialties (code, name, level, ege_required, ege_choose_one_of) values (${q(code)}, ${q(name)}, 'college', '{}', '{}') on conflict (code) do update set name=excluded.name, level='college';`)
  for (const c of colleges)
    L.push(`insert into public.institutions (name, full_name, type, city, region, website, admissions_email, phone_main) values (${q(c.name)}, ${q(c.name)}, 'college', ${q(city)}, ${q(region)}, ${q(c.site)}, ${q(c.mail)}, ${q(c.phone)}) on conflict (name, city) do update set website=excluded.website, admissions_email=excluded.admissions_email, phone_main=excluded.phone_main, type='college';`)
  for (const c of colleges) for (const p of c.programs)
    L.push(`insert into public.institution_programs (institution_id, specialty_code, program_name, level, has_budget_places, admission_year, link) select id, ${q(p.code)}, ${q(p.name)}, 'college', true, 2026, ${q(c.link)} from public.institutions where name=${q(c.name)} and city=${q(city)} on conflict (institution_id, specialty_code) do update set program_name=excluded.program_name;`)
  return L.join('\n')
}

async function main() {
  const i = process.argv.indexOf('--slug')
  const arg = (process.argv.find(a => a.startsWith('--slug=')) || '').split('=')[1]
    || (i !== -1 ? process.argv[i + 1] : '')
  const slugs = arg === 'tier2' ? TIER2
    : arg ? arg.split(',').map(s => s.trim()).filter(Boolean)
    : Object.keys(CITIES)
  mkdirSync(OUT_DIR, { recursive: true })
  const parts = []
  let totC = 0, totP = 0
  for (const slug of slugs) {
    const data = await scrapeCity(slug)
    parts.push(toSql(data))
    totC += data.colleges.length
    totP += data.colleges.reduce((s, c) => s + c.programs.length, 0)
  }
  const outFile = join(OUT_DIR, slugs.length === 1 ? `colleges_${slugs[0]}.sql` : (arg === 'tier2' ? 'colleges_tier2.sql' : 'colleges_batch.sql'))
  writeFileSync(outFile, parts.join('\n\n'))
  process.stdout.write(`\n\nГотово: ${totC} колледжей, ${totP} программ → ${outFile}\n`)
}
main()
