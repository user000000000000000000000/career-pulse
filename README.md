# CareerPulse

Платформа персональной карьерной диагностики для подростков и абитуриентов: психодиагностический тест из **10 блоков**, ИИ-разбор профиля и подбор профессий с карьерным маршрутом и живым наставником.

**Стек:** React 18 + Vite 5 + React Router + Supabase (Auth / PostgreSQL / Edge Functions) + Recharts. ИИ-разбор — через Edge Function (по умолчанию **YandexGPT**, ключ серверный).

Архитектура — **Feature-Sliced Design (FSD)**. Дизайн — светлая пастельная лавандово-голубая тема (+ тёмная по переключателю), шрифт заголовков Unbounded.

---

## Что внутри

- **Диагностика из 10 блоков** (`/test/:n`) — анкета-контекст, склонности (Holland RIASEC), ценности, личность (Big Five), когнитивный профиль, проф. готовность, самоэффективность, образ будущего, социальный контекст, письмо в будущее. Ведёт по тесту маскот-лиса 🦊.
- **Результаты** (`/diagnostic`) — агрегированный профиль, радары/диаграммы, ИИ-разбор и подходящие профессии.
- **Карьерный маршрут** (`/roadmap`), **Атлас профессий** (`/atlas`), **личный кабинет** (`/dashboard`), **профиль** (`/profile`).
- **Авторизация:** email/пароль, вход через **VK ID** (+ страница согласия `/vk-consent`), плюс **демо-режим** без бэкенда.
- **Правовые страницы** (`/legal/*`), переключатель **светлой/тёмной темы**.

---

## Архитектура (Feature-Sliced Design)

```
frontend/src/
├─ app/              # точка входа, роутинг, навбар, layout, ErrorBoundary
├─ pages/            # каждая страница = слайс с сегментами ui/ model/ api/ + index.js
│  ├─ landing/  login/  register/  reset-password/  vk-consent/
│  ├─ dashboard/  atlas/  profile/  result/
│  ├─ diagnostic/   # большой слайс: 10 блоков + результаты + roadmap + маскот + скоринг
│  └─ legal/        # все 6 правовых страниц в одном слайсе
├─ entities/
│  └─ profession/   # сущность «профессия» (используется в diagnostic/atlas/result)
├─ shared/          # переиспользуемая инфраструктура
│  ├─ ui/    (Button, Card, Input, Dialog, Header, ProgressBar, RadioGroup, ThemeToggle…)
│  ├─ api/   (supabase, edgeFunction, cpStorage, consult, roadmapAPI, careerTrackAPI)
│  ├─ auth/  (auth.js, vk.js)
│  ├─ config/ (config.js — все env-переменные в одном месте)
│  └─ lib/   (storageKeys.js)
└─ legacy/test/     # старая система теста, изолирована (её ещё использует /result)

supabase/
├─ schema.sql · migrations/001_careerpulse_schema.sql   # БД (profiles, consultation_requests, RLS)
└─ functions/  analyze-diagnostic · career-roadmap · vk-auth · delete-account · analyze-test(legacy)
```

**Правила FSD:** импорт между слайсами — только через публичный `index.js`; `shared/` не знает про `entities/`/`pages/`; вышестоящий слой импортирует нижестоящий, не наоборот. Соблюдение проверяется линтером **steiger** (`npm run check:arch` → должно быть `No problems found!`).

---

## Быстрый старт (демо-режим)

Приложение запускается сразу, **без бэкенда**: пока не задан anon-ключ Supabase, авторизация и результаты живут в `localStorage`, а ИИ-разбор генерируется локально.

```bash
cd frontend
npm install
npm run dev
```

Откроется `http://localhost:5173`. Вход/регистрация принимают любой email и пароль (в демо не проверяются).

---

## Подключение Supabase (Auth + БД)

1. Создайте проект на [supabase.com](https://supabase.com).
2. Примените схему: **SQL Editor** → выполните `supabase/schema.sql` (идемпотентно).
3. Скопируйте `frontend/.env.example` → `frontend/.env` и заполните публичные значения:

```
VITE_SUPABASE_URL=https://<ваш-проект>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-ключ>
```

Перезапустите `npm run dev` — регистрация/вход пойдут через Supabase Auth, результаты диагностики зеркалируются в `profiles.diagnostic_data`.

### Переменные окружения

Все читаются в одном месте — `shared/config/config.js`:

| Переменная | Назначение |
|---|---|
| `VITE_SUPABASE_URL` | URL проекта Supabase |
| `VITE_SUPABASE_ANON_KEY` | Публичный anon-ключ (пусто → демо-режим) |
| `VITE_VK_APP_ID` | ID приложения VK ID (публичный) |
| `VITE_VK_AUTH_URL` | (опц.) URL edge-функции обмена кода VK |
| `VITE_ANALYZE_DIAGNOSTIC_URL` | (опц.) URL функции ИИ-разбора; иначе вычисляется из Supabase URL |
| `VITE_ROADMAP_URL` | (опц.) URL функции карьерного маршрута |

> ⚠️ Всё с префиксом `VITE_` попадает в клиентский бандл. Сюда — **только публичные** значения.

---

## ИИ-разбор (Edge Functions)

Ключ нейросети **не хранится во фронтенде** — он задаётся секретом Edge Function и читается через `Deno.env`. Провайдер переключается секретом `AI_PROVIDER` (по умолчанию `yandex`; поддерживаются `deepseek`, `openai`).

```bash
supabase functions deploy analyze-diagnostic
supabase functions deploy career-roadmap
supabase functions deploy vk-auth
supabase secrets set AI_PROVIDER=yandex
supabase secrets set YANDEX_API_KEY=... YANDEX_FOLDER_ID=...
# CORS: ограничить источник (иначе фолбэк на '*')
supabase secrets set ALLOWED_ORIGIN=https://careerpulse.ru
```

`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` доступны функциям автоматически.

---

## Тема

Светлая — по умолчанию (независимо от темы ОС). Тёмная включается переключателем (`shared/ui/ThemeToggle`, атрибут `[data-theme="dark"]` на `<html>`), выбор запоминается в `localStorage`. Палитра и токены (`--radius-*`, `--shadow-*`, `--font-display`) — в `app/index.css`.

---

## Скрипты

| Команда | Назначение |
|---|---|
| `npm run dev` | Дев-сервер (Vite) |
| `npm run build` | Прод-сборка в `dist/` |
| `npm run preview` | Локальный просмотр сборки |
| `npm run check:arch` | Проверка FSD-архитектуры (steiger) |

---

## Что проверить перед публикацией

- **Расхождение в реестре 10 блоков** — между `pages/dashboard` и `shared/api/cpStorage.js` различаются **ось** блоков 4/7/9/10 (таксономия НАДО/ХОЧУ/МОГУ/КТО-Я/КОНТЕКСТ) и **время** блока 6 (12 vs 10 мин). Требуется решение владельца методики: авто-слияние молча поменяло бы один из смыслов. См. `.design/fsd-remediation-plan.md`.
- **Визуальная вычитка** — рефакторинг делался без браузера; пройдите глазами формы и модалки (регистрация, тур) перед деплоем.
- **Правовые документы** — HTML-страницы оформлены на `careerpulse.ru` / Никита Соколов (самозанятый), а загруженные PDF — на другое лицо (ООО «Системы будущего»). Приведите к одному оператору.
- **Ключи** — ключ нейросети только в секретах Edge Function, не во фронтенде.

---

## Документы проекта

- `.design/fsd-remediation-plan.md` — аудит кодовой базы и план миграции на FSD (по нему проведена переработка).
- `.design/portal-relaunch/` — дизайн-бриф.
- `preview.html` — статичное превью Главной без сервера.
