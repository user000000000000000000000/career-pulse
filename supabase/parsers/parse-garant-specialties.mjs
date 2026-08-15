#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// Парсер перечня направлений подготовки бакалавриата с base.garant.ru
// (утверждённый перечень специальностей/направлений — таблица код+название).
//
// Зависимостей нет (только встроенный fetch/TextDecoder) — страница простая
// и стабильная по разметке, поднимать cheerio/puppeteer ради неё избыточно.
//
// Формат страницы (проверено на 70480868/53f89421bbdaf741eb2d1ecc4ddb4c33):
//   - кодировка windows-1251
//   - таблица <tr><td>код</td><td>название</td><td>квалификация</td></tr>
//   - строки-заголовки укрупнённых групп (colspan=3 или квалификация пустая) — пропускаем
//   - нужны только строки с квалификацией "Бакалавр" и кодом вида NN.NN.NN
//
// Использование:
//   node parse-garant-specialties.mjs                          — скачать с указанного URL
//   node parse-garant-specialties.mjs --cache ./garant.html     — распарсить локальный файл (офлайн/повтор)
//   node parse-garant-specialties.mjs --url <другой-url>
//
// Результат: supabase/parsers/output/specialties_bachelor.json, .csv, .sql
// ════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_URL = 'https://base.garant.ru/70480868/53f89421bbdaf741eb2d1ecc4ddb4c33/'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')

const ENTITY_MAP = { '&quot;': '"', '&#34;': '"', '&lt;': '<', '&gt;': '>', '&amp;': '&', '&nbsp;': ' ' }

function decodeEntities(s) {
  return s.replace(/&[a-zA-Z#0-9]+;/g, m => ENTITY_MAP[m] ?? m)
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CareerPulseDataBot/1.0)' } })
  if (!res.ok) throw new Error(`HTTP ${res.status} при загрузке ${url}`)
  const buf = new Uint8Array(await res.arrayBuffer())
  return new TextDecoder('windows-1251').decode(buf)
}

/**
 * @param {string} html
 * @returns {Array<{code:string,name:string,level:'bachelor',group:string|null}>}
 */
export function parseSpecialties(html) {
  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(m => m[1])
  const results = []
  let groupCode = null, groupName = null

  for (const row of rows) {
    if (/colspan/.test(row)) {
      // строка-заголовок раздела ("МАТЕМАТИЧЕСКИЕ И ЕСТЕСТВЕННЫЕ НАУКИ" и т.п.) — не группа, пропускаем
      continue
    }
    const tds = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map(m => stripTags(m[1]))
    if (tds.length !== 3) continue

    const [codeCell, nameCell, qualCell] = tds
    const code = codeCell.trim()

    // строка укрупнённой группы направлений: код NN.00.00, квалификация пустая
    if (/^\d{2}\.00\.00$/.test(code)) {
      groupCode = code
      groupName = nameCell
      continue
    }

    if (!qualCell.startsWith('Бакалавр')) continue
    if (!/^\d{2}\.\d{2}\.\d{2}$/.test(code)) continue

    results.push({ code, name: nameCell, level: 'bachelor', group_code: groupCode, group_name: groupName })
  }
  return results
}

function toCsv(rows) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = 'code,name,level,group_code,group_name'
  const lines = rows.map(r => [r.code, r.name, r.level, r.group_code, r.group_name].map(esc).join(','))
  return [header, ...lines].join('\n')
}

function toSql(rows) {
  const esc = v => `'${String(v).replace(/'/g, "''")}'`
  const nullable = v => (v == null || v === '') ? 'null' : esc(v)
  const lines = rows.map(r =>
    `insert into public.specialties (code, name, level, group_code, group_name, ege_required, ege_choose_one_of) ` +
    `values (${esc(r.code)}, ${esc(r.name)}, 'bachelor', ${nullable(r.group_code)}, ${nullable(r.group_name)}, '{}', '{}') ` +
    `on conflict (code) do update set name = excluded.name, group_code = excluded.group_code, group_name = excluded.group_name;`
  )
  return [
    '-- Сгенерировано parse-garant-specialties.mjs — коды и названия направлений бакалавриата.',
    '-- ege_required/ege_choose_one_of оставлены пустыми: в этом документе их нет,',
    '-- нужен отдельный источник (см. supabase/CAREER_TRACK_DATA_GUIDE.md).',
    ...lines,
  ].join('\n')
}

async function main() {
  const args = process.argv.slice(2)
  const cacheIdx = args.indexOf('--cache')
  const urlIdx = args.indexOf('--url')
  const url = urlIdx >= 0 ? args[urlIdx + 1] : DEFAULT_URL

  const html = cacheIdx >= 0
    ? new TextDecoder('windows-1251').decode(readFileSync(args[cacheIdx + 1]))
    : await fetchHtml(url)

  const rows = parseSpecialties(html)
  if (!rows.length) {
    console.error('Не найдено ни одной строки бакалавриата — вероятно, разметка страницы изменилась, нужно поправить парсер.')
    process.exit(1)
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(join(OUT_DIR, 'specialties_bachelor.json'), JSON.stringify(rows, null, 2), 'utf-8')
  writeFileSync(join(OUT_DIR, 'specialties_bachelor.csv'), toCsv(rows), 'utf-8')
  writeFileSync(join(OUT_DIR, 'specialties_bachelor.sql'), toSql(rows), 'utf-8')

  const groups = new Set(rows.map(r => r.group))
  console.log(`Готово: ${rows.length} направлений бакалавриата, ${groups.size} укрупнённых групп.`)
  console.log(`Файлы: ${OUT_DIR}/specialties_bachelor.{json,csv,sql}`)
  console.log('\nПример первых 5 строк:')
  rows.slice(0, 5).forEach(r => console.log(`  ${r.code}  ${r.name}  [${r.group}]`))
}

main().catch(err => { console.error(err); process.exit(1) })
