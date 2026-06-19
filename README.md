# CareerPulse
всем привет
Платформа персональной карьерной диагностики: психодиагностический тест из 250 вопросов, анализ через DeepSeek и рекомендации профессий. Стек: **React 18 + Vite + React Router + Supabase (Auth/PostgreSQL) + DeepSeek (через Edge Function)**.

> Каркас собран из предоставленных HTML-макетов: лендинг, личный кабинет и правовые страницы перенесены в React с сохранением исходного дизайна (тёмная неоновая тема, шрифты Bebas Neue / Manrope / JetBrains Mono).

---

## Структура

```
career-pulse/
├─ frontend/                  # React + Vite приложение
│  ├─ src/
│  │  ├─ pages/               # Landing, Register, Login, Dashboard, Test, Result, Legal/*
│  │  ├─ components/          # UI/, Layout/, Test/
│  │  ├─ services/            # supabase.js, auth.js, testAPI.js
│  │  ├─ data/                # questions.js (банк), professions.js, scoring.js
│  │  ├─ utils/               # scoreCalculator.js
│  │  └─ styles/              # CSS макетов (заскоуплены под .cp-landing / .cp-dashboard / .cp-legal)
│  ├─ .env.example
│  └─ package.json
└─ supabase/
   ├─ migrations/001_careerpulse_schema.sql
   └─ functions/analyze-test/index.js     # Edge Function (DeepSeek, серверный ключ)
```

---

## Быстрый старт (демо-режим)

Приложение запускается сразу, **без бэкенда** — авторизация и сессия работают на `localStorage`, анализ возвращает демо-отчёт.

```bash
cd frontend
npm install
npm run dev
```

Откроется `http://localhost:5173`.

---

## Подключение Supabase (Auth + БД)

1. Создайте проект на [supabase.com](https://supabase.com).
2. Примените схему: откройте **SQL Editor** и выполните `supabase/migrations/001_careerpulse_schema.sql`
   (или через CLI: `supabase db push`).
3. Скопируйте `.env.example` → `.env` в папке `frontend/` и заполните:

```
VITE_SUPABASE_URL=https://<ваш-проект>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-ключ>
```

Перезапустите `npm run dev`. Теперь регистрация/вход идут через Supabase Auth, результаты сохраняются в таблицу `test_results`.

---

## Подключение DeepSeek (анализ теста)

⚠️ **Ключ DeepSeek не хранится во фронтенде.** Любая переменная с префиксом `VITE_` попадает в клиентский бандл и видна всем. Ключ задаётся как секрет Edge Function и читается через `Deno.env`.

```bash
# Установите Supabase CLI, затем:
supabase functions deploy analyze-test
supabase secrets set DEEPSEEK_API_KEY=sk-...
```

`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` доступны функции автоматически. Фронтенд вызывает функцию по адресу `<VITE_SUPABASE_URL>/functions/v1/analyze-test`.

---

## Банк из 250 вопросов

Сейчас в `frontend/src/data/questions.js` лежат **временные примеры** (20 шт.), чтобы тест проходился целиком. Замените массив `QUESTION_BANK` на полный банк из 250 вопросов, соблюдая структуру (см. комментарий в начале файла):

```js
{
  id: "interests_01",
  block: "interests",                  // interests|personality|abilities|behavior|values
  text: "Текст вопроса?",
  options: [ { text: "...", scores: { T: 2 } }, ... ]
}
```

Подсчёт баллов (`utils/scoreCalculator.js`) и шкалы (`data/scoring.js`) уже готовы — после замены банка ничего менять не нужно.

---

## Скрипты

| Команда           | Назначение                |
|-------------------|---------------------------|
| `npm run dev`     | Дев-сервер (Vite)         |
| `npm run build`   | Прод-сборка в `dist/`     |
| `npm run preview` | Локальный просмотр сборки |

---

## Что стоит проверить перед публикацией

- **Правовые документы.** HTML-страницы оформлены на `careerpulse.ru` / Никита Соколов (самозанятый). Загруженные PDF (оферта, согласие на ПД) — на другое лицо (ООО «Системы будущего», `synergystart.ru`). Перед запуском приведите все документы к одному оператору.
- **250 вопросов** — заменить плейсхолдеры на реальный банк.
- **Ключи** — `DEEPSEEK_API_KEY` только в секретах Edge Function, не во фронтенде.
