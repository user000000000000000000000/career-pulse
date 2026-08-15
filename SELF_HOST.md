# Self-host Supabase на Yandex Cloud (РФ, под 152-ФЗ)

> **Статус проекта:** облачного Supabase-проекта ещё не было, БД пустая — переноса данных (Фаза 3 / `pg_dump`) не требуется, стартуем сразу с `schema.sql` на self-host. Фронтенд сейчас на GitHub Pages, деплой автоматизирован в `.github/workflows/deploy.yml` — после смены `.env`-значений на self-host просто обновите Secrets репозитория (Settings → Secrets and variables → Actions): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VK_APP_ID`, `VITE_VK_AUTH_URL`.
>
> Готовые скрипты: `supabase/selfhost/setup.sh` (устанавливает Docker + Supabase на VM), `supabase/selfhost/Caddyfile` (reverse-proxy + авто-TLS).

## ✅ Чеклист ПЕРЕД переносом
1. Создать VM в Yandex Cloud (см. Фаза 0), зайти по SSH, скопировать туда `supabase/selfhost/setup.sh` и запустить — он ставит Docker/Caddy и клонирует репозиторий Supabase.
2. Заполнить `supabase/docker/.env` на VM (пароли, JWT_SECRET, SMTP) — см. Фаза 1.
3. Накатить `supabase/schema.sql` в поднятый Postgres (пустая БД, `auth`-схему разворачивает сам GoTrue-контейнер).
4. Скопировать `supabase/functions/*` в `volumes/functions/<имя>/index.ts` self-host стека и задать секреты функций.
5. Поднять `api.careerpulse.ru` через Caddy (Фаза 2), обновить DNS A-запись на IP VM.
6. Обновить GitHub Secrets репозитория новыми `VITE_SUPABASE_URL=https://api.careerpulse.ru` и `VITE_SUPABASE_ANON_KEY`, задеплоить фронт (workflow сам соберёт и выложит на Pages).
7. Прогнать сквозной сценарий (Фаза 6): регистрация → письмо подтверждения → вход → ВК-вход → диагностика → синхронизация → запись на консультацию → удаление аккаунта.

---



Цель: перенести БД + Auth + Storage + Edge Functions с облачного Supabase
на собственный сервер в РФ. Код фронтенда и SDK **не меняются** — меняются только
адрес и ключи в `.env`.

---

## Фаза 0. Сервер
Через консоль (Compute Cloud → создать ВМ) или через `yc` CLI:

```bash
# один раз: установить и авторизовать yc CLI
curl -sSL https://storage.yandexcloud.net/yandexcloud-yc/install.sh | bash
yc init   # выбрать/создать облако, каталог (folder), зону по умолчанию (ru-central1-a)

# сеть с публичным IP и группой безопасности (открыт только 22 и 443)
yc vpc network create --name careerpulse-net
yc vpc subnet create --name careerpulse-subnet \
  --network-name careerpulse-net --zone ru-central1-a --range 10.0.0.0/24
yc vpc security-group create --name careerpulse-sg --network-name careerpulse-net \
  --rule "direction=ingress,port=22,protocol=tcp,v4-cidrs=[0.0.0.0/0]" \
  --rule "direction=ingress,port=443,protocol=tcp,v4-cidrs=[0.0.0.0/0]" \
  --rule "direction=egress,port=any,protocol=any,v4-cidrs=[0.0.0.0/0]"

# сама ВМ: 4 vCPU / 8 ГБ RAM, SSD 50 ГБ, Ubuntu 22.04, публичный IP
yc compute instance create \
  --name careerpulse-vm \
  --zone ru-central1-a \
  --network-interface subnet-name=careerpulse-subnet,nat-ip-version=ipv4,security-group-ids=$(yc vpc security-group get careerpulse-sg --format json | grep '"id"' | head -1 | grep -o '"[a-z0-9]*"$' | tr -d '"') \
  --create-boot-disk image-folder-id=standard-images,image-family=ubuntu-2204-lts,size=50,type=network-ssd \
  --cores=4 --memory=8GB \
  --ssh-key ~/.ssh/id_rsa.pub

# узнать публичный IP для DNS A-записи и SSH
yc compute instance get careerpulse-vm --format json | grep -A2 "one_to_one_nat"
```

Дальше — по SSH на этот IP, дальнейшие шаги (Docker/Supabase) те же, что ниже.

Спецификация ВМ:
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

## Фаза 3. Схема БД (чистый старт — данных для переноса нет)
```bash
psql "postgresql://postgres:НОВЫЙ_PWD@localhost:5432/postgres" -f schema.sql
```
`auth`-схему создаёт сам GoTrue-контейнер при первом старте — руками её накатывать не нужно.
`public` получит наши таблицы + RLS-политики (profiles, consultation_requests, diagnostic_data) с нуля.

## Фаза 4. Edge Functions
Наши функции (`vk-auth`, `analyze-diagnostic`, `analyze-test`, `career-roadmap`) кладём в
том функций self-host (`supabase/docker/volumes/functions/<имя>/index.ts`) и задаём секреты
для контейнера функций:
- `AI_API_KEY`, `YANDEX_FOLDER_ID`, `AI_PROVIDER=yandex`
- `VK_CLIENT_SECRET`, `VITE_VK_APP_ID` (или как читает vk-auth)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (новые, локальные)

Перезапустить: `docker compose restart functions`.

## Фаза 5. Поменять во фронтенде
Код не трогаем — только GitHub Secrets репозитория (Settings → Secrets and variables → Actions),
которые читает `.github/workflows/deploy.yml`:
- `VITE_SUPABASE_URL=https://api.careerpulse.ru`
- `VITE_SUPABASE_ANON_KEY=<новый ANON_KEY>`
- `VITE_VK_APP_ID`, `VITE_VK_AUTH_URL=https://api.careerpulse.ru/functions/v1/vk-auth`

Локально для разработки — те же значения в `frontend/.env` (см. `.env.example`).
Пуш в `main` (или Actions → Run workflow) автоматически пересоберёт и задеплоит на GitHub Pages.
В настройках репозитория Pages → Source должен быть выставлен **GitHub Actions** (не "Deploy from a branch").

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
