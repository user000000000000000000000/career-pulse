#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// Сбор вузов Санкт-Петербурга и их программ бакалавриата с postupi.online.
//
// Список вузов берём из официального sitemap (спокойный, разрешённый
// robots.txt способ обхода — сама пагинация листинга /vuzi/?page=N
// запрещена в robots.txt, поэтому НЕ используется).
//
// Источники по одному вузу:
//   https://spb.postupi.online/vuz/<slug>/                       — карточка вуза
//   https://spb.postupi.online/vuz/<slug>/specialnosti/bakalavr/ — список программ бакалавриата
//
// Из списка программ берём: код специальности, название программы в этом вузе,
// минимальный проходной балл прошлого приёма. Бюджетные места и форму обучения
// (очная/заочная) можно добрать отдельно со страницы конкретной программы —
// это отдельный, более медленный проход (см. TODO внизу).
//
// Вежливый обход: пауза между запросами, один воркер (не параллелим),
// свой User-Agent с контактом.
//
// Использование:
//   node scrape-postupi-spb.mjs [--limit N] [--delay-ms 700]
// ════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')
const URLS_FILE = join(__dirname, 'input', 'spb_vuz_sitemap_urls.txt')

const UA = 'CareerPulseBot/1.0 (+education data collection for career guidance; contact: careerpulse.ru)'
const CITY = 'Санкт-Петербург'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// Сайт отдаёт windows-1251 (подтверждено заголовком Content-Type и <meta charset>),
// но встроенный fetch().text() всегда декодирует как UTF-8 (так устроен спецификацией
// Fetch) — из-за этого без ручного decode весь кириллический текст превращается в кракозябры.
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

function parseVuzPage(html, url) {
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

  // На карточке вуза postupi.online нет его VK/Telegram/MAX — только сайт/почта/
  // телефон/адрес (проверено на нескольких вузах: единственные vk.com/t.me на
  // странице — это соцсети самого postupi.online в футере, не вуза). Оставляем
  // колонки пустыми под будущее заполнение из другого источника (сайт вуза напрямую).
  const vkUrl = null, telegramUrl = null, maxUrl = null

  // Короткая аббревиатура встречается в подписи ссылки на Яндекс.Карты, но та
  // конкретная атрибутная строка на сайте закодирована в UTF-8 отдельно от
  // остальной cp1251-страницы — при общем cp1251-декоде превращается в мусор
  // (двойное кодирование). Не рискуем: используем везде полное официальное имя.
  return {
    name: fullName, full_name: fullName, type: 'university', city: CITY, region: CITY,
    website, address, admissions_email: admissionsEmail, phone_main: phoneMain, phone_admissions: null,
    vk_url: vkUrl, telegram_url: telegramUrl, max_url: maxUrl, source_url: url,
  }
}

// Ярлыки в "list__score-wrap" различаются по вузам ("Мин./Ср. проходной балл
// вуза/бюджет <год>", "Бюджетных мест <год>", "Платных мест <год>", прогнозные
// "Проходной балл <год>"/"Целевой балл <год>") — вместо жёсткой фразы читаем
// ВСЕ пары ярлык→число внутри блока и уже по ним извлекаем нужное.
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
  const blocks = html.split('<li class="list">').slice(1) // первый элемент — всё до первого <li>, не блок
  const rows = []
  for (const block of blocks) {
    const codeM = block.match(/<span>\d\.(\d{2}\.\d{2}\.\d{2})<\/span>/)
    const nameM = block.match(/class="list__h"><a[^>]*>([^<]+)<\/a>/)
    if (!codeM || !nameM) continue

    const labels = extractScoreLabels(block)
    // Баллы (мин./средний) с этой страницы НЕ используем: postupi.online считает
    // их как "балл за один экзамен" (проходной балл / кол-во экзаменов), а не
    // сумму по всем предметам — см. supabase/CAREER_TRACK_DATA_GUIDE.md. Реальный
    // суммарный проходной балл (min_score_total_last_year) берём позже с
    // официального сайта вуза — это приоритетный источник для баллов.
    const budgetSeats = labels.find(([l]) => /бюджетных мест/i.test(l))
    const paidSeats = labels.find(([l]) => /платных мест/i.test(l))
    const yearSrc = budgetSeats || paidSeats
    const yearMatch = yearSrc ? yearSrc[0].match(/\d{4}/) : null

    rows.push({
      specialty_code: codeM[1],
      program_name: nameM[1].trim(),
      level,
      form: null, // требует отдельного прохода по странице конкретной программы (TODO)
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

async function main() {
  const args = process.argv.slice(2)
  const limitIdx = args.indexOf('--limit')
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : Infinity
  const delayIdx = args.indexOf('--delay-ms')
  const delayMs = delayIdx >= 0 ? Number(args[delayIdx + 1]) : 700

  const urls = readFileSync(URLS_FILE, 'utf-8').split(/\r?\n/).filter(Boolean).slice(0, limit)
  console.log(`Вузов к обходу: ${urls.length} (пауза между запросами: ${delayMs}мс)`)

  const institutions = []
  const programs = []
  const parsedAt = new Date().toISOString()

  for (const [i, url] of urls.entries()) {
    const slug = slugFromUrl(url)
    process.stdout.write(`[${i + 1}/${urls.length}] ${slug} ... `)
    try {
      const vuzHtml = await fetchHtml(url)
      const inst = parseVuzPage(vuzHtml, url)
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
  writeFileSync(join(OUT_DIR, 'institutions_spb.csv'),
    toCsv(institutions, ['name', 'full_name', 'type', 'city', 'region', 'website', 'admissions_email', 'phone_main', 'phone_admissions', 'vk_url', 'telegram_url', 'max_url', 'address', 'source_url', 'parsed_at']), 'utf-8')
  writeFileSync(join(OUT_DIR, 'institution_programs_spb.csv'),
    toCsv(programs, ['institution_name', 'specialty_code', 'program_name', 'level', 'form', 'has_budget_places', 'budget_places_count', 'paid_places_count', 'admission_year', 'link', 'source_url', 'parsed_at']), 'utf-8')

  console.log(`\nГотово: ${institutions.length} вузов, ${programs.length} программ бакалавриата.`)
  console.log(`Файлы: ${OUT_DIR}/institutions_spb.csv, ${OUT_DIR}/institution_programs_spb.csv`)
}

main().catch(err => { console.error(err); process.exit(1) })
