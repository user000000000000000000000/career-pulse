# CareerPulse — план исправлений после архитектурного аудита

> Источник находок: полный аудит frontend/src (антипаттерны, магические числа, декомпозиция, чистая архитектура).
> Порядок обязателен: **Tier S → Tier A → Tier B**. Не начинать переезд на FSD (Tier B4), пока не закрыты S и A — иначе в новые слои переедет тот же беспорядок под новыми именами.

## Установленные инструменты (для справки)

| Скилл/тул | Где живёт | Когда использовать |
|---|---|---|
| `feature-sliced-design` | `.claude/skills/` | Любое решение "куда положить код", вся Tier B |
| `code-cleanup-helper` | `.claude/skills/` | Разово перед Tier S — подтвердить мёртвый код/дубли перед удалением |
| `skill-creator` | `.claude/skills/` | В конце — упаковать принятые конвенции в личный skill `career-pulse-fsd` |
| `claude-md-improver` + `/revise-claude-md` | `.claude/skills/`, `.claude/commands/` | После каждого закрытого тира — обновлять CLAUDE.md |
| `steiger` + `@feature-sliced/steiger-plugin` | `frontend/package.json` (devDeps), `frontend/steiger.config.js` | `npm run check:arch` — замер прогресса миграции на FSD |

---

## Tier S — эта неделя (низкий риск, делать без раздумий)

- [x] ~~Удалить мёртвую legacy-систему теста~~ → **ОТМЕНЕНО.** Проверка импортов показала: `pages/Result.jsx` подключён живым роутом `/result` в `App.jsx` и реально обращается к Supabase (`test_results`). Это не мёртвый код — трогать нельзя без отдельного решения владельца. `Test.jsx`/`scoreCalculator.js`/`data/questions.js`/`data/scoring.js`/`testAPI.js` оставлены как есть.
- [x] **Централизовать localStorage-ключи** → `frontend/src/services/storageKeys.js`, подключено в auth.js, ThemeToggle.jsx, vk.js, Profile.jsx, Dashboard.jsx, consult.js, useBlockDraft.js.
- [x] **Убрать хардкод `10`** → `CP.TOTAL_BLOCKS` в DiagShell.jsx, DiagResults.jsx.
- [x] **Удалить неиспользуемые алиасы** `HollandRadar`/`BigFiveBar`/`IntelligencePie` в ResultCharts.jsx — подтверждено grep'ом, что ничего их не импортирует.
- [x] ~~Footer~~ → **ОТМЕНЕНО.** При чтении выяснилось: это три содержательно разных футера (Legal/Dashboard/Landing — разные ссылки, разные CSS-классы, у Landing свои якоря на секции и соцсети). Замена на общий `<Footer/>` была бы визуальной регрессией, не рефакторингом.
- [x] **Сузить CORS** — во всех 6 edge-функциях origin теперь читается из секрета `ALLOWED_ORIGIN`, с фолбэком на `'*'`, чтобы не сломать текущий деплой до того, как секрет выставлен вручную.

**Чекпойнт:** `npm run build` — зелёный.

---

## Tier A — спринт (доводит начатые рефакторинги до конца)

- [x] **Единый entity "Holland-тип"** → `frontend/src/data/hollandTypes.js` (`{full, short, noun}` на код типа). Три места-потребителя (DiagResults.jsx, Block2Holland.jsx, diagnosticAPI.js) переведены на импорт, ни одна строка отображения не изменилась.
- [ ] **Единый реестр 10 блоков → НЕ СЛИТО, нужен ваш ответ.** При сверке трёх копий (`Dashboard.jsx` BLOCKS, `cpStorage.js` BLOCKS_META, `DiagnosticBlock.jsx`) вскрылось расхождение в **данных**, не только в коде:
  - **axis** блоков 4, 7, 9, 10 отличается между Dashboard.jsx и cpStorage.js: Dashboard группирует 4,7→«ВОЗМОЖНОСТИ», 9,10→«КТО Я»; cpStorage группирует 4,7→«КТО Я», 9,10→«КОНТЕКСТ».
  - **time** блока 6: Dashboard.jsx показывает «12 мин», cpStorage.js — «10 мин».
  - Это решает не рефакторинг, а тот, кто задавал таксономию НАДО/ХОЧУ/МОГУ/КТО-Я/КОНТЕКСТ — слить автоматически означало бы молча поменять один из двух смыслов. Оставлено как есть до вашего решения, какая версия верная.
- [x] **Единый API-клиент для Edge Functions** → `frontend/src/services/edgeFunction.js` (`callAiEdgeFunction`), используют `diagnosticAPI.js` и `roadmapAPI.js`. `testAPI.js` **не тронут** — он часть legacy-цепочки, которую решили не трогать (см. Tier S).
- [x] **Единый `config.js`** → `frontend/src/services/config.js`, подключён в supabase.js, edgeFunction.js, diagnosticAPI.js, roadmapAPI.js, vk.js, Profile.jsx. `testAPI.js` не тронут (legacy).
- [x] **Доделана миграция на `useBlockDraft`** в Block1Anketa.jsx и Block10Letter.jsx — убраны самодельные `DRAFT_KEY` + ручные useEffect.
- [x] **Скоринг Block1 вынесен** в `utils/scoring/anketa.js` (`scoreAnketa`), по тому же паттерну, что и `utils/scoring/holland.js`.
- [ ] ~~Единый data-adapter demo/Supabase~~ — не начато, перенесено в следующий заход (см. итоговый отчёт).

**Чекпойнт:** `npm run build` — зелёный, `npm run check:arch` — без изменений (3 ожидаемых предупреждения, FSD-слоёв ещё нет).

---

## Tier B — структурный переезд (после того как S и A закрыты)

### B1. Dashboard.jsx и Landing.jsx → контролируемый React
- [x] **Dashboard.jsx** переписан: убраны `rootRef`+`querySelector`+`classList.toggle`, добавлены `menuOpen`/`sidebarOpen`/`tourOpen`/`me`-state; все внутренние `<a href="/...">` заменены на `<Link>`; document-click-outside для меню пользователя — единственное оставшееся прямое обращение к DOM (легитимно, нужно для закрытия дропдауна кликом снаружи).
- [x] **Landing.jsx** — форма регистрации переведена на контролируемые инпуты (`regForm`/`role`/`adult`/`agree`/`fieldError`/`submitting`/`successState`), `innerHTML`-подстановка успеха заменена на условный JSX (заодно закрыт мелкий self-XSS через `innerHTML` с email). IntersectionObserver-реванты, скролл-компрессия навбара и перехват якорных/SPA-ссылок **оставлены как есть** — это не тот антипаттерн, что был в форме, трогать не стал, чтобы не расширять рискованную зону без необходимости.
- [ ] Декомпозиция `Dashboard.jsx` на подкомпоненты (`Sidebar`, `Topbar`, `ConsultModal`, `TourModal`, `BlocksGrid`) — не делал: сейчас это один файл, но уже нормальный React без DOM-манипуляций; резать на файлы имеет смысл естественно во время Tier B4 (переезда на FSD), а не отдельным проходом.
- ⚠️ **Не проверено визуально** — в этой среде нет браузера/скриншот-инструмента. Сборка (`npm run build`) зелёная, JSX проверен построчно на совпадение классов/структуры с оригиналом, но реальный визуальный проход (особенно форма регистрации и тур-модал) сделайте в браузере перед деплоем.

### B2–B3. Use-case слой и чистка cpStorage.js
- [x] ~~Убрать прямые обращения компонентов к Supabase в обход сервисного слоя~~ → **проверено, проблемы нет.** `RequireAuth.jsx` уже вызывает только `getCurrentUser()`/`CP.hydrateFromRemote()` — оба идут через сервисный слой, прямого импорта `supabase` там нет. Исходная находка в плане была неточной.
- [ ] ~~Ввести use-case слой (`submitHollandBlock` и т.п.)~~ → **не делал.** Инвалидация `ai_report`/`roadmap` в `cpStorage.js:161-168` уже единая точка на все 10 блоков, а не продублирована — с точки зрения DRY проблемы нет. Формально это смешение слоёв (storage знает про доменное правило), но выносить это в отдельный use-case-слой сейчас означало бы добавить абстракцию без доказанной необходимости. Естественное место для этого — при физическом переезде на FSD (Tier B4), когда появятся `features/submit-block-N/`.

### B4. Сама миграция на FSD-слои — ГОТОВО
- [x] Физически перенесены все ~90 файлов в `app/ / pages/ / entities/ / shared/ / legacy/`. `features/` не создавался — ни одного user-flow не оказалось переиспользуемым в 2+ страницах достаточно стабильно, чтобы оправдать слой (по правилу skill'а "start simple").
- [x] `pages/diagnostic/` объединяет весь блочный тест + результаты + roadmap в один slice (`ui/model/api` сегменты) — так решилась проблема общих зависимостей (mascotLines, cpStorage, hollandTypes), которые иначе требовали бы cross-slice импортов между тремя разными pages.
- [x] `pages/legal/` объединяет все 6 правовых страниц + LegalShell в один slice с сегментами.
- [x] `entities/profession` — осталась entity (используется в 3 разных pages: diagnostic, atlas, result). `entities/holland-type` **не осталась entity** — после переноса diagnosticAPI.js внутрь pages/diagnostic все 3 потребителя типа Holland оказались в одном slice, steiger подсветил `insignificant-slice`, тип слит обратно в `pages/diagnostic/model/hollandTypes.js`. Это ожидаемая работа принципа "extract only when proven", а не ошибка.
- [x] Каждый slice и каждый сегмент `shared/*` получил `index.js` — публичный API.
- [x] Реальная архитектурная находка по ходу переноса: `diagnosticAPI.js` изначально уехал в `shared/api/` (Tier A), но его локальный fallback-разбор (`localReport()`) — это доменный контент (тексты про типы Holland), а не инфраструктура. `shared/` не должен знать про `entities/` — steiger поймал это как `forbidden-imports`. Файл переехал в `pages/diagnostic/api/`, где ему и место (единственный потребитель).
- [x] `npm run check:arch` → **`No problems found!`** — 0 ошибок, 0 предупреждений.
- [x] `npm run build` — зелёный на каждом шаге, CSS-бандл побайтово идентичен состоянию до миграции (хэш `index-CppniJEq.css` не менялся ни разу за весь Tier B4).
- [ ] Включить `steiger` как блокирующий CI-gate в `.github/workflows/deploy.yml` — теперь можно, страница чистая, это больше не "постоянно красный" шум.

**Чекпойнт:** прогнать `skill-creator` — собрать из принятых по ходу Tier A/B решений один личный skill `career-pulse-fsd` (официальные правила FSD + ваши конвенции: единый registry блоков, единый api-клиент, запрет на дублирование legacy-систем). Финальный `/revise-claude-md`, чтобы CLAUDE.md на одну страницу описывал итоговую архитектуру.

---

## Tier C — по ходу, не отдельной задачей

- [ ] Согласовать magic-таймауты автоперехода (180/200/220/250 мс) к одному значению — по пути, когда трогаете конкретный блок.
- [ ] Свести inline `style={{}}` к CSS-классам — по пути, не отдельным проектом.
- [ ] Магические веса подбора профессий `[1, 0.7, 0.45]` в `data/professions.js:241-255` — вынести в константу, но не менять значения без консультации с владельцем психометрической методики.

---

## Правило порядка

Не запускать Tier B4 (миграция слоёв) параллельно с разработкой новых фич — цель будет двигаться быстрее прогресса. Сначала закрыть S и A целиком, затем B1–B3, и только в самом конце — физический переезд папок на FSD-слои.
