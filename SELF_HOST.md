# Self-host Supabase на Yandex Cloud (РФ, под 152-ФЗ)

## ✅ Чеклист ПЕРЕД переносом
1. **Применить `supabase/schema.sql`** на текущем облаке (SQL Editor) — чтобы дамп был полным и схема воспроизводима. Это источник правды по таблицам/политикам.
2. **Задеплоить все edge-функции** (финальные версии): `vk-auth`, `analyze-diagnostic`, `analyze-test`, `career-roadmap`, `delete-account`.
   `npx supabase functions deploy` (все сразу).
3. **Прогнать полный сценарий** на текущем сетапе как «эталон»: регистрация → подтверждение почты → вход → ВК-вход → диагностика → синхронизация → запись на консультацию → удаление аккаунта.
4. **Инвентарь секретов** (понадобятся на self-host, значения НЕ хранить в git):
   - функции: `AI_API_KEY` (или `YANDEX_API_KEY`), `YANDEX_FOLDER_ID`, `AI_PROVIDER=yandex`, `VK_CLIENT_SECRET`
   - авто: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
   - SMTP (почта): host/port/user/pass
5. **Решить по данным:** реальных аккаунтов мало → можно стартовать с чистой БД (только `schema.sql`), без переноса `auth`. Иначе — дамп `public`+`auth`.
6. **Готовая строка подключения** к текущей БД (Supabase → Project Settings → Database) для `pg_dump`.
7. **Влить `dev` → `main`** — чтобы прод-фронт соответствовал.

---



Цель: перенести БД + Auth + Storage + Edge Functions с облачного Supabase
на собственный сервер в РФ. Код фронтенда и SDK **не меняются** — меняются только
адрес и ключи в `.env`.

---

## Фаза 0. Сервер
Yandex Cloud → Compute Cloud → создать ВМ:
- ОС: **Ubuntu 22.04 LTS**
- vCPU/RAM: **2–4 vCPU / 8 ГБ** (Supabase поднимает ~10 контейнеров, на 4 ГБ тесно)
- Диск: SSD **40–60 ГБ**
- Публичный IP: да
- SSH-ключ: добавить свой

Файрвол (Security Group): открыть **22 (SSH)** и **443 (HTTPS)**. Порт 8000 (Kong) и 5432 (Postgres) наружу **НЕ** открывать — только через reverse-proxy.

## Фаза 1. Docker + Supabase
```bash
# на сервере
sudo apt update && sudo apt install -y docker.io docker-compose-plugin git
sudo usermod -aG docker $USER   # перелогиниться

git clone --depth 1 https://github.com/supabase/supabase
cd supabase/docker
cp .env.example .env
```

В `.env` обязательно поменять (сгенерировать свои!):
- `POSTGRES_PASSWORD` — длинный пароль БД
- `JWT_SECRET` — 40+ случайных символов
- `ANON_KEY`, `SERVICE_ROLE_KEY` — JWT, подписанные твоим `JWT_SECRET`
  (генератор — в офиц. доке Supabase Self-Hosting → «Generate API keys»)
- `DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD` — доступ к Studio
- `SITE_URL=https://user000000000000000000000.github.io/career-pulse/`
- `ADDITIONAL_REDIRECT_URLS` — наш прод + локалка + (позже) careerpulse.ru, со звёздочками
- SMTP (для писем подтверждения/сброса): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
  `SMTP_PASS`, `SMTP_SENDER_NAME` — Яндекс 360 SMTP или Resend/Brevo
- `ENABLE_EMAIL_SIGNUP=true`, `ENABLE_EMAIL_AUTOCONFIRM=false` (подтверждение нужно)

Запуск:
```bash
docker compose pull
docker compose up -d
docker compose ps   # все healthy
```

## Фаза 2. Домен + HTTPS
1. Завести поддомен, напр. **api.careerpulse.ru** → A-запись на IP сервера.
2. Caddy (проще всего, авто-TLS) перед Kong (8000):
```
# /etc/caddy/Caddyfile
api.careerpulse.ru {
    reverse_proxy localhost:8000
}
```
   `sudo apt install caddy` → `sudo systemctl restart caddy`. Сертификат Let's Encrypt поднимется сам.
3. Итог: API доступно по `https://api.careerpulse.ru`.

## Фаза 3. Перенос данных со старого Supabase
На старом проекте (Project Settings → Database → Connection string) берём строку подключения.
```bash
# дамп нужных схем со старого облака
pg_dump "postgresql://postgres:PWD@db.gsxpapwpchbtyoxipuwf.supabase.co:5432/postgres" \
  --schema=public --schema=auth --no-owner --no-privileges -f cp_dump.sql

# восстановление в self-host (порт проброшен внутри docker-сети)
psql "postgresql://postgres:НОВЫЙ_PWD@localhost:5432/postgres" -f cp_dump.sql
```
- `public` тянет наши таблицы + RLS-политики (profiles, consultation_requests, diagnostic_data).
- `auth` тянет пользователей (хэши паролей переедут, т.к. GoTrue тот же bcrypt).
- **Альтернатива для MVP:** реальных аккаунтов мало → можно не тащить `auth`, а попросить перерегистрироваться. Тогда дампим только `public`.

## Фаза 4. Edge Functions
Наши функции (`vk-auth`, `analyze-diagnostic`, `analyze-test`, `career-roadmap`) кладём в
том функций self-host (`supabase/docker/volumes/functions/<имя>/index.ts`) и задаём секреты
для контейнера функций:
- `AI_API_KEY`, `YANDEX_FOLDER_ID`, `AI_PROVIDER=yandex`
- `VK_CLIENT_SECRET`, `VITE_VK_APP_ID` (или как читает vk-auth)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (новые, локальные)

Перезапустить: `docker compose restart functions`.

## Фаза 5. Поменять во фронтенде (это я сделаю в коде)
- `frontend/.env`:
  - `VITE_SUPABASE_URL=https://api.careerpulse.ru`
  - `VITE_SUPABASE_ANON_KEY=<новый ANON_KEY>`
- `.github/workflows/deploy.yml` — те же два значения.
- `VITE_VK_AUTH_URL` (если задан) → на новый адрес функции.
- Пересобрать и задеплоить фронт.

## Фаза 6. Проверка
Регистрация → письмо подтверждения → вход → ВК-вход → прохождение блока →
синхронизация результатов → запись на консультацию.

## Бэкапы (обязательно)
Cron на сервере: ежедневный `pg_dump` → в Yandex Object Storage (S3-совместимое).
```bash
0 3 * * * docker exec supabase-db pg_dump -U postgres postgres | gzip > /backups/cp_$(date +\%F).sql.gz
```

---

## Что помнить
- Это **ops-ответственность**: обновления Supabase, бэкапы, мониторинг, безопасность (только 443 наружу, сложный пароль Studio, fail2ban на SSH).
- Платится рублями за ВМ (~1.5–4 к ₽/мес) + Object Storage под бэкапы (копейки).
- Код приложения переезжать **не нужно** — только адрес/ключи.
