// Расширение атласа профессий из HH.ru API (#7a). Фетчит роли, дедупит против
// текущего атласа, размечает по карте HH-категория → {atlas-категория, Holland, ОКСО-группа}.
// Выводит сэмпл для ревизии. Запуск из сэндбокса: node expand-atlas-hh.mjs
import { PROFESSIONS } from '../../frontend/src/entities/profession/model.js'

// HH-категория → [atlasCategory, [hollandCodes], oksoGroup(2 цифры, primary направление)]
// null oksoGroup = в основном СПО/без вузовского эквивалента (связь не ставим).
const CAT = {
  'Автомобильный бизнес':          ['Транспорт', ['R','C'], '23'],
  'Административный персонал':      ['Управление', ['C','S'], '38'],
  'Безопасность':                  ['IT', ['C','R'], '10'],
  'Высший и средний менеджмент':   ['Управление', ['E','C'], '38'],
  'Добыча сырья':                  ['Инженерия', ['R','I'], '21'],
  'Домашний, обслуживающий персонал': ['Социальная сфера', ['S','R'], null],
  'Закупки':                       ['Логистика', ['E','C'], '38'],
  'Информационные технологии':     ['IT', ['R','I'], '09'],
  'Искусство, развлечения, массмедиа': ['Творчество', ['A'], '52'],
  'Маркетинг, реклама, PR':        ['Маркетинг', ['E','A'], '42'],
  'Медицина, фармацевтика':        ['Медицина', ['I','S'], '31'],
  'Наука, образование':            ['Образование', ['I','S'], '44'],
  'Продажи, обслуживание клиентов':['Продажи', ['E','S'], '38'],
  'Производство, сервисное обслуживание': ['Инженерия', ['R','I'], '15'],
  'Рабочий персонал':              ['Инженерия', ['R'], null],
  'Розничная торговля':            ['Продажи', ['E','C'], '38'],
  'Сельское хозяйство':            ['Сельское хозяйство', ['R','I'], '35'],
  'Спортивные клубы, фитнес, салоны красоты': ['Спорт', ['S','R'], '49'],
  'Стратегия, инвестиции, консалтинг': ['Консалтинг', ['E','I'], '38'],
  'Страхование':                   ['Финансы', ['C','E'], '38'],
  'Строительство, недвижимость':   ['Инженерия', ['R','C'], '08'],
  'Транспорт, логистика, перевозки': ['Логистика', ['C','R'], '23'],
  'Туризм, гостиницы, рестораны':  ['Продажи', ['S','E'], '43'],
  'Управление персоналом, тренинги': ['HR', ['S','E'], '38'],
  'Финансы, бухгалтерия':          ['Финансы', ['C','I'], '38'],
  'Юристы':                        ['Право', ['I','C'], '40'],
  'Другое':                        ['Социальная сфера', ['S'], null],
}

const norm = (s) => s.toLowerCase().replace(/[^а-яёa-z0-9]/gi, '')
const existing = new Set(PROFESSIONS.map(p => norm(p.name)))

const r = await fetch('https://api.hh.ru/professional_roles', { headers: { 'User-Agent': 'CareerPulseBot/1.0' } })
const data = await r.json()

let maxId = Math.max(...PROFESSIONS.map(p => p.id))
const added = []
const skippedDup = []
for (const c of data.categories) {
  const meta = CAT[c.name]
  if (!meta) { console.log('НЕТ КАРТЫ для категории:', c.name); continue }
  for (const role of c.roles) {
    if (existing.has(norm(role.name))) { skippedDup.push(role.name); continue }
    existing.add(norm(role.name))
    added.push({ id: ++maxId, name: role.name, category: meta[0], holland: meta[1], okso: meta[2], hhCat: c.name })
  }
}

console.log('=== ИТОГО ===')
console.log('в атласе было:', PROFESSIONS.length, '| HH ролей:', data.categories.reduce((s,c)=>s+c.roles.length,0))
console.log('дубликатов (уже есть):', skippedDup.length)
console.log('НОВЫХ к добавлению:', added.length, '→ атлас станет', PROFESSIONS.length + added.length)
console.log('\n=== СЭМПЛ 25 НОВЫХ (name | category | holland | okso-группа) ===')
added.slice(0, 25).forEach(p => console.log(`#${p.id}  ${p.name}  —  ${p.category} | [${p.holland}] | ОКСО:${p.okso||'СПО/нет'}  (из «${p.hhCat}»)`))
console.log('\n=== распределение новых по категориям ===')
const byCat = {}; added.forEach(p => byCat[p.category] = (byCat[p.category]||0)+1)
Object.entries(byCat).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`  ${k}: ${v}`))
console.log('\nбез вузовской связи (СПО/null):', added.filter(p=>!p.okso).length)
