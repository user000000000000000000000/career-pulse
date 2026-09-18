// Фильтр образовательного пути под ответы анкеты (Блок 1):
//  — тип заведения (вуз/колледж) по классу/курсу и планам после школы;
//  — готовность к переезду (город пользователя vs город программы).
// Чистые функции — прогоняются тестом (demo() ниже) без React.

/**
 * Дефолтный тип заведения по контексту анкеты.
 * Явный план (V1) главнее класса: выбрал «колледж» — показываем колледжи.
 * Иначе по классу: 10–11 и уже-в-колледже → вузы; 8–9 и прочее → всё.
 * @returns {'university'|'college'|'all'}
 */
export function defaultInstitutionType(ctx = {}) {
  const v1 = ctx.plans_after_school
  if (v1 === 'university') return 'university'
  if (v1 === 'college') return 'college'
  const g = ctx.grade
  if (g === '10' || g === '11' || g === 'college1' || g === 'college2') return 'university'
  return 'all' // 8, 9, other, не указано
}

const norm = (s) => String(s || '').trim().toLowerCase()

/**
 * Отфильтровать программы одной специальности под тип и переезд.
 * relocationReady 'no' → только город пользователя; если в городе ничего нет,
 * возвращаем всё с флагом cityFallback (UI покажет пометку), а не пустоту.
 * 'maybe'/'yes' → без гео-фильтра (порядок задаёт API: город → бюджет → алфавит).
 * @returns {{ programs: Array, cityFallback: boolean }}
 */
export function filterPrograms(programs = [], { typeFilter = 'all', relocationReady = 'maybe', userCity = '' } = {}) {
  let list = programs
  if (typeFilter !== 'all') list = list.filter(p => (p.institution_type || 'university') === typeFilter)

  let cityFallback = false
  if (relocationReady === 'no' && userCity) {
    const inCity = list.filter(p => norm(p.city) === norm(userCity))
    if (inCity.length) list = inCity
    else cityFallback = true // в городе нет — показываем все, но честно помечаем
  }
  return { programs: list, cityFallback }
}

// ── self-check: node frontend/src/pages/diagnostic/model/careerTrackFilter.js ──
export function demo() {
  const assert = (c, m) => { if (!c) throw new Error('FAIL: ' + m) }
  // дефолт типа
  assert(defaultInstitutionType({ plans_after_school: 'college' }) === 'college', 'план колледж')
  assert(defaultInstitutionType({ grade: '11' }) === 'university', '11 класс → вуз')
  assert(defaultInstitutionType({ grade: '9' }) === 'all', '9 класс → всё')
  assert(defaultInstitutionType({ grade: '11', plans_after_school: 'college' }) === 'college', 'план главнее класса')
  assert(defaultInstitutionType({}) === 'all', 'пусто → всё')
  // фильтр типа
  const progs = [
    { institution_name: 'A', institution_type: 'university', city: 'Москва' },
    { institution_name: 'B', institution_type: 'college', city: 'Москва' },
    { institution_name: 'C', institution_type: 'university', city: 'Казань' },
  ]
  assert(filterPrograms(progs, { typeFilter: 'college' }).programs.length === 1, 'только колледж')
  assert(filterPrograms(progs, { typeFilter: 'all' }).programs.length === 3, 'все типы')
  // переезд «нет» + есть в городе
  let r = filterPrograms(progs, { relocationReady: 'no', userCity: 'москва' })
  assert(r.programs.length === 2 && !r.cityFallback, 'нет переезда → только Москва (регистр не важен)')
  // переезд «нет» + в городе пусто → fallback на всё
  r = filterPrograms(progs, { relocationReady: 'no', userCity: 'Сочи' })
  assert(r.programs.length === 3 && r.cityFallback, 'нет в городе → fallback + флаг')
  // «если нужно» → без фильтра
  assert(filterPrograms(progs, { relocationReady: 'maybe', userCity: 'Сочи' }).programs.length === 3, 'maybe → все')
  console.log('careerTrackFilter: OK')
}

if (typeof process !== 'undefined' && process.argv?.[1] && process.argv[1].endsWith('careerTrackFilter.js')) demo()
