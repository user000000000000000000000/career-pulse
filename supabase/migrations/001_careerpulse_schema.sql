-- ════════════════════════════════════════════════════════════════
--  CareerPulse — схема базы данных (Supabase / PostgreSQL)
--  Применение:
--    supabase db push            (через Supabase CLI)
--    либо вставьте этот файл в SQL Editor проекта Supabase.
-- ════════════════════════════════════════════════════════════════

-- ── Расширения ──────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Функция автообновления updated_at ───────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════
--  PROFILES — профиль пользователя (1:1 с auth.users)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  role            text default 'specialist'
                    check (role in ('student','specialist','entrepreneur','hr')),
  has_passed_test boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Автосоздание профиля при регистрации пользователя
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'specialist')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- ════════════════════════════════════════════════════════════════
--  TEST_RESULTS — результаты диагностики
-- ════════════════════════════════════════════════════════════════
create table if not exists public.test_results (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  scores                   jsonb not null default '{}'::jsonb,
  strengths                jsonb not null default '[]'::jsonb,
  weaknesses               jsonb not null default '[]'::jsonb,
  recommended_professions  jsonb not null default '[]'::jsonb,
  full_report              text,
  created_at               timestamptz not null default now()
);

create index if not exists idx_test_results_user on public.test_results(user_id, created_at desc);

alter table public.test_results enable row level security;

drop policy if exists "results_select_own" on public.test_results;
create policy "results_select_own" on public.test_results
  for select using (auth.uid() = user_id);

drop policy if exists "results_insert_own" on public.test_results;
create policy "results_insert_own" on public.test_results
  for insert with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════
--  PROFESSIONS — справочник профессий
-- ════════════════════════════════════════════════════════════════
create table if not exists public.professions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text,
  description text,
  created_at  timestamptz not null default now()
);

alter table public.professions enable row level security;

drop policy if exists "professions_read_all" on public.professions;
create policy "professions_read_all" on public.professions
  for select using (true);

-- ════════════════════════════════════════════════════════════════
--  TEST_ANSWERS — сырые ответы пользователя на вопросы теста
--  Одна запись на пользователя (upsert при повторном прохождении).
-- ════════════════════════════════════════════════════════════════
create table if not exists public.test_answers (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  answers    jsonb not null default '[]'::jsonb,
  scores     jsonb not null default '{}'::jsonb,
  saved_at   timestamptz not null default now()
);

alter table public.test_answers enable row level security;

drop policy if exists "answers_all_own" on public.test_answers;
create policy "answers_all_own" on public.test_answers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════
--  PROFESSIONS — справочник профессий
-- ════════════════════════════════════════════════════════════════

insert into public.professions (name, category) values
  ('Product Director', 'Управление'),
  ('EdTech Founder', 'Предпринимательство'),
  ('Аналитик данных', 'IT и аналитика'),
  ('HR-менеджер', 'Управление персоналом'),
  ('Программист Full-stack', 'IT и аналитика'),
  ('UX/UI Дизайнер', 'Дизайн'),
  ('Маркетолог', 'Маркетинг'),
  ('Продакт-менеджер', 'Управление'),
  ('Финансовый аналитик', 'Финансы'),
  ('Бизнес-аналитик', 'IT и аналитика'),
  ('Карьерный консультант', 'Консалтинг'),
  ('Data Scientist', 'IT и аналитика'),
  ('DevOps инженер', 'IT и аналитика'),
  ('Digital-маркетолог', 'Маркетинг'),
  ('SMM-менеджер', 'Маркетинг'),
  ('Бренд-менеджер', 'Маркетинг'),
  ('PR-менеджер', 'Коммуникации'),
  ('Юрист (корпоративный)', 'Юриспруденция'),
  ('Логист', 'Логистика'),
  ('Руководитель отдела продаж', 'Продажи'),
  ('Системный аналитик', 'IT и аналитика'),
  ('Контент-менеджер', 'Медиа'),
  ('Копирайтер', 'Медиа'),
  ('Бухгалтер', 'Финансы'),
  ('HR-бизнес-партнёр', 'Управление персоналом'),
  ('IT-архитектор', 'IT и аналитика')
on conflict do nothing;
