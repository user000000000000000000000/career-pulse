#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// Парсер перечней специальностей, вставленных как обычный текст
// (копипаст из документа, не HTML) — магистратура, специалитет и т.п.
//
// Формат построчно (пустые строки игнорируются):
//   NN.00.00              — код укрупнённой группы
//   НАЗВАНИЕ ГРУППЫ       — может занимать несколько строк
//   NN.NN.NN               — код специальности/направления
//   Название специальности — одна строка
//   Квалификация            — одна или несколько строк (напр. "Магистр",
//                             или несколько альтернативных названий квалификации)
//
// Алгоритм: после кода читаем строки до следующего кода — первая идёт в name,
// остальное (если есть) — в qualification (это не хранится в БД, только для
// сверки при заливке). Групповые заголовки разделов (типа "ГУМАНИТАРНЫЕ НАУКИ")
// перед кодом NN.00.00 иногда попадают как шум в предыдущую qualification —
// это не влияет на code/name и не идёт в БД, поэтому оставлено как есть.
//
// Использование:
//   node parse-plaintext-specialties.mjs <input.txt> --level master|specialist|bachelor|college
// ════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')

const CODE_RE = /^(\d{2}\.\d{2}\.\d{2})\s*(\(\d+\))?$/
const isCode = line => CODE_RE.test(line)
const isGroupCode = line => { const m = line.match(CODE_RE); return !!m && m[1].endsWith('.00.00') }

/**
 * @param {string} text
 * @param {'bachelor'|'master'|'specialist'|'college'} level
 */
export function parsePlaintext(text, level) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  const results = []
  let groupCode = null, groupName = null
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!isCode(line)) { i++; continue } // раздел-заголовок или мусор — пропускаем

    const code = line.match(CODE_RE)[1]
    const isGroup = isGroupCode(line)
    i++

    const textParts = []
    while (i < lines.length && !isCode(lines[i])) { textParts.push(lines[i]); i++ }

    if (isGroup) {
      groupCode = code
      groupName = textParts.join(' ').trim()
      continue
    }

    results.push({
      code,
      name: textParts[0] || '',
      qualification: textParts.slice(1).join('; '),
      level,
      group_code: groupCode,
      group_name: groupName,
    })
  }
  return results
}

function toCsv(rows) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = 'code,name,level,group_code,group_name,qualification'
  const lines = rows.map(r => [r.code, r.name, r.level, r.group_code, r.group_name, r.qualification].map(esc).join(','))
  return [header, ...lines].join('\n')
}

function toSql(rows) {
  const esc = v => `'${String(v ?? '').replace(/'/g, "''")}'`
  const nullable = v => (v == null || v === '') ? 'null' : esc(v)
  const lines = rows.map(r =>
    `insert into public.specialties (code, name, level, group_code, group_name, ege_required, ege_choose_one_of) ` +
    `values (${esc(r.code)}, ${esc(r.name)}, ${esc(r.level)}, ${nullable(r.group_code)}, ${nullable(r.group_name)}, '{}', '{}') ` +
    `on conflict (code) do update set name = excluded.name, level = excluded.level, group_code = excluded.group_code, group_name = excluded.group_name;`
  )
  return [
    `-- Сгенерировано parse-plaintext-specialties.mjs (level=${rows[0]?.level}).`,
    '-- ege_required/ege_choose_one_of оставлены пустыми — нужен отдельный источник.',
    ...lines,
  ].join('\n')
}

async function main() {
  const args = process.argv.slice(2)
  const inputFile = args[0]
  const levelIdx = args.indexOf('--level')
  const level = levelIdx >= 0 ? args[levelIdx + 1] : 'master'
  if (!inputFile) { console.error('Использование: node parse-plaintext-specialties.mjs <input.txt> --level master|specialist|bachelor|college'); process.exit(1) }

  const text = readFileSync(inputFile, 'utf-8')
  const rows = parsePlaintext(text, level)
  if (!rows.length) { console.error('Не найдено ни одной строки — проверьте формат входного файла.'); process.exit(1) }

  mkdirSync(OUT_DIR, { recursive: true })
  const stem = basename(inputFile, extname(inputFile))
  writeFileSync(join(OUT_DIR, `${stem}.json`), JSON.stringify(rows, null, 2), 'utf-8')
  writeFileSync(join(OUT_DIR, `${stem}.csv`), toCsv(rows), 'utf-8')
  writeFileSync(join(OUT_DIR, `${stem}.sql`), toSql(rows), 'utf-8')

  const groups = new Set(rows.map(r => r.group_code))
  console.log(`Готово: ${rows.length} специальностей (${level}), ${groups.size} укрупнённых групп.`)
  console.log(`Файлы: ${OUT_DIR}/${stem}.{json,csv,sql}`)
  console.log('\nПример первых 5 строк:')
  rows.slice(0, 5).forEach(r => console.log(`  ${r.code}  ${r.name}  [${r.group_code} ${r.group_name}]`))
}

main().catch(err => { console.error(err); process.exit(1) })
