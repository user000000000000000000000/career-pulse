#!/usr/bin/env node
// ════════════════════════════════════════════════════════════════
// Парсер перечня специальностей СПО (среднего профессионального
// образования — колледжи/техникумы). Формат: TSV (табуляция),
// некоторые ячейки обёрнуты в кавычки (там, где в названии есть запятая).
//
// Строки:
//   служебные заголовки (первые 3 строки) — пропускаем
//   "НАЗВАНИЕ РАЗДЕЛА"                      — 1 непустая ячейка, пропускаем
//   NN.00.00 \t НАЗВАНИЕ ГРУППЫ \t          — код укрупнённой группы
//   NN.02.NNNN \t Название \t Квалификация  — специальность СПО
//   \t \t доп. квалификация                 — продолжение предыдущей строки
//
// Файл на входе обычно приходит в кодировке Windows-1251 — сначала
// перекодируйте (см. spo_raw_utf8.txt рядом, либо passthrough, если
// уже UTF-8: скрипт сам определяет по наличию непечатных символов).
//
// Использование: node parse-spo-tsv.mjs <input.txt>
// ════════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')

const GROUP_RE = /^\d{2}\.00\.00$/
const SPEC_RE = /^\d{2}\.02\.\d{3,4}$/

function stripQuotes(s) {
  const t = (s || '').trim()
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1).trim()
  return t
}

export function parseSpoTsv(text) {
  // при двойном мис-кодировании (cp1251, прочитанный как latin1/utf-8) появляются replacement-символы —
  // считаем это признаком испорченного файла и явно предупреждаем, а не молча парсим мусор
  if (/�{3,}/.test(text.slice(0, 2000))) {
    throw new Error('Похоже, файл не в UTF-8 (много U+FFFD). Перекодируйте из Windows-1251 перед запуском.')
  }

  const lines = text.split(/\r?\n/)
  const results = []
  let groupCode = null, groupName = null
  let last = null

  for (const raw of lines) {
    if (!raw.trim()) continue
    const cols = raw.split('\t').map(stripQuotes)
    const [c1, c2, c3] = cols

    if (!c1 && !c2 && c3) { // продолжение квалификации предыдущей специальности
      if (last) last.qualification = last.qualification ? `${last.qualification}; ${c3}` : c3
      continue
    }
    if (!c1) continue // пустая/служебная строка

    if (GROUP_RE.test(c1)) { groupCode = c1; groupName = c2; continue }
    if (SPEC_RE.test(c1)) {
      const row = { code: c1, name: c2, qualification: c3 || '', level: 'college', group_code: groupCode, group_name: groupName }
      results.push(row)
      last = row
      continue
    }
    // всё остальное (служебные заголовки таблицы, заголовки укрупнённых разделов типа
    // "ИНЖЕНЕРНОЕ ДЕЛО, ТЕХНОЛОГИИ И ТЕХНИЧЕСКИЕ НАУКИ") — не код, пропускаем
    last = null
  }
  return results
}

function toCsv(rows) {
  const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const header = 'code,name,level,group_code,group_name,qualification'
  const body = rows.map(r => [r.code, r.name, r.level, r.group_code, r.group_name, r.qualification].map(esc).join(','))
  return [header, ...body].join('\n')
}

function toSql(rows) {
  const esc = v => `'${String(v ?? '').replace(/'/g, "''")}'`
  const nullable = v => (v == null || v === '') ? 'null' : esc(v)
  const body = rows.map(r =>
    `insert into public.specialties (code, name, level, group_code, group_name, ege_required, ege_choose_one_of) ` +
    `values (${esc(r.code)}, ${esc(r.name)}, ${esc(r.level)}, ${nullable(r.group_code)}, ${nullable(r.group_name)}, '{}', '{}') ` +
    `on conflict (code) do update set name = excluded.name, level = excluded.level, group_code = excluded.group_code, group_name = excluded.group_name;`
  )
  return ['-- Сгенерировано parse-spo-tsv.mjs (level=college). ege_* оставлены пустыми.', ...body].join('\n')
}

async function main() {
  const inputFile = process.argv[2]
  if (!inputFile) { console.error('Использование: node parse-spo-tsv.mjs <input.txt>'); process.exit(1) }

  const text = readFileSync(inputFile, 'utf-8')
  const rows = parseSpoTsv(text)
  if (!rows.length) { console.error('Не найдено ни одной строки — проверьте кодировку и формат входного файла.'); process.exit(1) }

  mkdirSync(OUT_DIR, { recursive: true })
  const stem = 'specialties_college'
  writeFileSync(join(OUT_DIR, `${stem}.json`), JSON.stringify(rows, null, 2), 'utf-8')
  writeFileSync(join(OUT_DIR, `${stem}.csv`), toCsv(rows), 'utf-8')
  writeFileSync(join(OUT_DIR, `${stem}.sql`), toSql(rows), 'utf-8')

  const groups = new Set(rows.map(r => r.group_code))
  console.log(`Готово: ${rows.length} специальностей СПО, ${groups.size} укрупнённых групп.`)
  console.log(`Файлы: ${OUT_DIR}/${stem}.{json,csv,sql}`)
  console.log('\nПример первых 5 строк:')
  rows.slice(0, 5).forEach(r => console.log(`  ${r.code}  ${r.name}  [${r.qualification}]`))
}

main().catch(err => { console.error(err.message); process.exit(1) })
