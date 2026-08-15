#!/usr/bin/env node
// Собирает institutions_spb.csv + institution_programs_spb.csv в один SQL-скрипт.
// institution_id программам не присваиваем напрямую (в CSV его нет, только имя) —
// используем подзапрос по (name, city), опираясь на уникальный индекс из schema.sql.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, 'output')

function parseCsv(text) {
  const lines = text.trim().split('\n')
  const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    // простой CSV-парсер под наш формат (все поля в кавычках, экранирование "")
    const cells = []
    let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQ) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++ }
        else if (ch === '"') inQ = false
        else cur += ch
      } else {
        if (ch === '"') inQ = true
        else if (ch === ',') { cells.push(cur); cur = '' }
        else cur += ch
      }
    }
    cells.push(cur)
    const row = {}
    header.forEach((h, i) => { row[h] = cells[i] ?? '' })
    return row
  })
}

const esc = v => `'${String(v ?? '').replace(/'/g, "''")}'`
const nullableStr = v => (v == null || v === '') ? 'null' : esc(v)
const nullableNum = v => (v == null || v === '') ? 'null' : Number(v)
const nullableBool = v => (v == null || v === '') ? 'null' : (v === 'true' ? 'true' : 'false')

function main() {
  const institutions = parseCsv(readFileSync(join(OUT_DIR, 'institutions_spb.csv'), 'utf-8'))
  const programs = parseCsv(readFileSync(join(OUT_DIR, 'institution_programs_spb.csv'), 'utf-8'))

  const lines = ['-- Сгенерировано generate-spb-sql.mjs. Идемпотентно (можно катить повторно).', '']

  lines.push('-- ── Вузы ──')
  for (const r of institutions) {
    lines.push(
      `insert into public.institutions (name, full_name, type, city, region, website, admissions_email, phone_main, phone_admissions, vk_url, telegram_url, max_url) ` +
      `values (${esc(r.name)}, ${nullableStr(r.full_name)}, ${esc(r.type)}, ${esc(r.city)}, ${nullableStr(r.region)}, ${nullableStr(r.website)}, ${nullableStr(r.admissions_email)}, ${nullableStr(r.phone_main)}, ${nullableStr(r.phone_admissions)}, ${nullableStr(r.vk_url)}, ${nullableStr(r.telegram_url)}, ${nullableStr(r.max_url)}) ` +
      `on conflict (name, city) do update set full_name = excluded.full_name, website = excluded.website, admissions_email = excluded.admissions_email, phone_main = excluded.phone_main, phone_admissions = excluded.phone_admissions, vk_url = excluded.vk_url, telegram_url = excluded.telegram_url, max_url = excluded.max_url, updated_at = now();`
    )
  }

  lines.push('', '-- ── Программы (специальность должна уже существовать в specialties — см. specialties_bachelor.sql) ──')
  for (const r of programs) {
    lines.push(
      `insert into public.institution_programs (institution_id, specialty_code, program_name, level, has_budget_places, budget_places_count, paid_places_count, admission_year, link) ` +
      `select id, ${esc(r.specialty_code)}, ${nullableStr(r.program_name)}, ${nullableStr(r.level)}, ${nullableBool(r.has_budget_places)}, ${nullableNum(r.budget_places_count)}, ${nullableNum(r.paid_places_count)}, ${nullableNum(r.admission_year) === 'null' ? 'extract(year from now())::int' : nullableNum(r.admission_year)}, ${nullableStr(r.link)} ` +
      `from public.institutions where name = ${esc(r.institution_name)} and city = 'Санкт-Петербург' ` +
      `on conflict (institution_id, specialty_code) do update set program_name = excluded.program_name, level = excluded.level, has_budget_places = excluded.has_budget_places, budget_places_count = excluded.budget_places_count, paid_places_count = excluded.paid_places_count, admission_year = excluded.admission_year, updated_at = now();`
    )
  }

  writeFileSync(join(OUT_DIR, 'spb_institutions_and_programs.sql'), lines.join('\n'), 'utf-8')
  console.log(`Готово: ${institutions.length} вузов + ${programs.length} программ -> ${OUT_DIR}/spb_institutions_and_programs.sql`)
}

main()
