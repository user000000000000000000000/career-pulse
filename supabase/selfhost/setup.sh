#!/usr/bin/env bash
# Разворачивает self-host Supabase на свежей Ubuntu 22.04 VM в Yandex Cloud.
# Запускать на самой VM (SSH), от пользователя с sudo.
# Соответствует Фазам 0-1 из ../../SELF_HOST.md — БД пустая, auth не переносим.
set -euo pipefail

sudo apt update
sudo apt install -y docker.io docker-compose-plugin git caddy
sudo usermod -aG docker "$USER"

if [ ! -d supabase ]; then
  git clone --depth 1 https://github.com/supabase/supabase
fi
cd supabase/docker
[ -f .env ] || cp .env.example .env

echo
echo "Дальше вручную:"
echo "1) Отредактируй supabase/docker/.env: POSTGRES_PASSWORD, JWT_SECRET,"
echo "   ANON_KEY/SERVICE_ROLE_KEY (сгенерировать по JWT_SECRET),"
echo "   SITE_URL, ADDITIONAL_REDIRECT_URLS, SMTP_*,"
echo "   ENABLE_EMAIL_SIGNUP=true, ENABLE_EMAIL_AUTOCONFIRM=false"
echo "2) docker compose pull && docker compose up -d"
echo "3) docker compose ps -- дождаться healthy у всех контейнеров"
echo "4) Накатить схему: psql \"postgresql://postgres:PWD@localhost:5432/postgres\" -f ../../schema.sql"
echo "4b) Справочные данные careerTrack (ОБЯЗАТЕЛЬНО, иначе 'Вузы/ЕГЭ' пустые):"
echo "    cd ../../to_upload && PG=\"postgresql://postgres:PWD@localhost:5432/postgres\""
echo "    for f in 02_specialties_bachelor 03_specialties_master 04_specialties_specialist \\"
echo "             05_specialties_college 06_missing_specialties 07_profession_specialty_map \\"
echo "             08_institutions_and_programs 09_feedback; do \\"
echo "      psql \"\$PG\" -v ON_ERROR_STOP=1 -f \"\$f.sql\"; done"
echo "5) Скопировать supabase/functions/* сюда в volumes/functions/<имя>/index.ts,"
echo "   прописать секреты (AI_API_KEY, YANDEX_FOLDER_ID, AI_PROVIDER=yandex,"
echo "   VK_CLIENT_SECRET) и docker compose restart functions"
echo "6) Настроить Caddyfile (см. supabase/selfhost/Caddyfile) и sudo systemctl restart caddy"
