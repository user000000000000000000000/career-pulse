#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// Обобщённая версия scrape-postupi-spb.mjs — тот же проверенный метод
// (сайтмап конкретного города postupi.online → карточка вуза → страница
// программ бакалавриата), но параметризовано по городу/поддомену, чтобы
// не плодить отдельный файл на каждый регион России.
//
// Список URL вузов города должен быть заранее выгружен из его сайтмапа в
// input/<slug>_vuz_urls.txt (по одному URL на строку) — см. README ниже
// в комментарии main(). Это отдельный шаг ("вежливый" обход сайтмапа),
// который делается один раз на город перед запуском самого скрейпера.
//
// Использование:
//   node scrape-postupi-city.mjs --slug msk --city "Москва" --region "Москва" [--limit N] [--delay-ms 700]
// ════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')

const UA = 'CareerPulseBot/1.0 (+education data collection for career guidance; contact: careerpulse.ru)'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Сайт отдаёт windows-1251 (см. комментарий в исходной spb-версии) — Fetch API
// всегда декодирует .text() как UTF-8 независимо от заголовка, поэтому декодируем вручную.
const CP1251_DECODER = new TextDecoder('windows-1251')

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'ru-RU,ru;q=0.9' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = await res.arrayBuffer()
  return CP1251_DECODER.decode(buf)
}

function slugFromUrl(url) {
  const m = url.match(/\/vuz\/([a-z0-9_-]+)\/?$/)
  return m ? m[1] : null
}

function parseVuzPage(html, url, city) {
  const h1 = html.match(/<h1[^>]*id="prTitle"[^>]*>([^<]+)<\/h1>/)
  const fullName = h1 ? h1[1].trim() : null

  const siteA = html.match(/class="contact-icon site">\s*<a href="([^"]+)"/)
  const website = siteA ? siteA[1].trim() : null

  const addrSpan = html.match(/class="contact-icon address">([^<]+)</)
  const address = addrSpan ? addrSpan[1].trim() : null

  const mailA = html.match(/class="contact-icon mail">\s*<a href="mailto:([^"]+)"/)
  const admissionsEmail = mailA ? mailA[1].trim() : null

  const phoneSpan = html.match(/class="contact-icon phone">([^<]+)</)
  const phoneMain = phoneSpan ? phoneSpan[1].trim() : null

  // Как и на карточках СПб — своих VK/Telegram/MAX на странице вуза нет.
  const vkUrl = null, telegramUrl = null, maxUrl = null

  return {
    name: fullName, full_name: fullName, type: 'university', city, region: city,
    website, address, admissions_email: admissionsEmail, phone_main: phoneMain, phone_admissions: null,
    vk_url: vkUrl, telegram_url: telegramUrl, max_url: maxUrl, source_url: url,
  }
}

function extractScoreLabels(block) {
  const wrapStart = block.indexOf('list__score-wrap')
  if (wrapStart < 0) return []
  const wrapEnd = block.indexOf('list__btn', wrapStart)
  const wrap = block.slice(wrapStart, wrapEnd > 0 ? wrapEnd : undefined)
  const pairs = []
  const re = /<span class="visible-mid">([^<]+)<\/span>[\s\S]{0,120}?<b>\s*(\d+)\s*<\/b>/g
  let m
  while ((m = re.exec(wrap))) pairs.push([m[1].trim(), Number(m[2])])
  return pairs
}

function parseProgramsPage(html, level) {
  const blocks = html.split('<li class="list">').slice(1)
  const rows = []
  for (const block of blocks) {
    const codeM = block.match(/<span>\d\.(\d{2}\.\d{2}\.\d{2})<\/span>/)
    const nameM = block.match(/class="list__h"><a[^>]*>([^<]+)<\/a>/)
    if (!codeM || !nameM) continue

    // Баллы с этой страницы не используем (postupi.online считает балл за
    // ОДИН экзамен, не сумму) — реальный суммарный балл берём с офиц. сайта вуза.
    const labels = extractScoreLabels(block)
    const budgetSeats = labels.find(([l]) => /бюджетных мест/i.test(l))
    const paidSeats = labels.find(([l]) => /платных мест/i.test(l))
    const yearSrc = budgetSeats || paidSeats
    const yearMatch = yearSrc ? yearSrc[0].match(/\d{4}/) : null

    rows.push({
      specialty_code: codeM[1],
      program_name: nameM[1].trim(),
      level,
      form: null,
      has_budget_places: budgetSeats ? (budgetSeats[1] > 0) : (paidSeats ? null : null),
      budget_places_count: budgetSeats ? budgetSeats[1] : null,
      paid_places_count: paidSeats ? paidSeats[1] : null,
      admission_year: yearMatch ? Number(yearMatch[0]) : null,
    })
  }
  return rows
}

function toCsv(rows, columns) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = columns.join(',')
  const body = rows.map(r => columns.map(c => esc(r[c])).join(','))
  return [header, ...body].join('\n')
}

function argVal(args, name, def) {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : def
}

async function main() {
  const args = process.argv.slice(2)
  const slug = argVal(args, '--slug')
  const city = argVal(args, '--city')
  const region = argVal(args, '--region', city)
  if (!slug || !city) {
    console.error('Использование: node scrape-postupi-city.mjs --slug msk --city "Москва" [--region "..."] [--limit N] [--delay-ms 700]')
    process.exit(1)
  }
  const limit = Number(argVal(args, '--limit', Infinity))
  const delayMs = Number(argVal(args, '--delay-ms', 700))

  const urlsFile = join(__dirname, 'input', `${slug}_vuz_urls.txt`)
  const urls = readFileSync(urlsFile, 'utf-8').split(/\r?\n/).filter(Boolean).slice(0, limit)
  console.log(`[${city}] Вузов к обходу: ${urls.length} (пауза между запросами: ${delayMs}мс)`)

  const institutions = []
  const programs = []
  const parsedAt = new Date().toISOString()

  for (const [i, url] of urls.entries()) {
    const vslug = slugFromUrl(url)
    process.stdout.write(`[${i + 1}/${urls.length}] ${vslug} ... `)
    try {
      const vuzHtml = await fetchHtml(url)
      const inst = parseVuzPage(vuzHtml, url, city)
      inst.region = region
      inst.parsed_at = parsedAt
      institutions.push(inst)
      await sleep(delayMs)

      const progUrl = `${url}specialnosti/bakalavr/`
      const progHtml = await fetchHtml(progUrl)
      const rows = parseProgramsPage(progHtml, 'bachelor')
      rows.forEach(r => { r.institution_name = inst.name; r.link = progUrl; r.source_url = progUrl; r.parsed_at = parsedAt })
      programs.push(...rows)
      console.log(`ok (${rows.length} программ)`)
      await sleep(delayMs)
    } catch (err) {
      console.log(`ОШИБКА: ${err.message}`)
    }
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, `institutions_${slug}.csv`),
    toCsv(institutions, ['name', 'full_name', 'type', 'city', 'region', 'website', 'admissions_email', 'phone_main', 'phone_admissions', 'vk_url', 'telegram_url', 'max_url', 'address', 'source_url', 'parsed_at']), 'utf-8')
  writeFileSync(join(OUT_DIR, `institution_programs_${slug}.csv`),
    toCsv(programs, ['institution_name', 'specialty_code', 'program_name', 'level', 'form', 'has_budget_places', 'budget_places_count', 'paid_places_count', 'admission_year', 'link', 'source_url', 'parsed_at']), 'utf-8')

  console.log(`\n[${city}] Готово: ${institutions.length} вузов, ${programs.length} программ бакалавриата.`)
  console.log(`Файлы: ${OUT_DIR}/institutions_${slug}.csv, ${OUT_DIR}/institution_programs_${slug}.csv`)
}

main().catch(err => { console.error(err); process.exit(1) })
