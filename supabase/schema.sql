-- ════════════════════════════════════════════════════════════
-- CareerPulse — схема БД (источник правды).
-- Идемпотентно: можно выполнять повторно. Применять в Supabase → SQL Editor
-- (на текущем облаке И на новом self-host инстансе при переносе).
-- ════════════════════════════════════════════════════════════

-- ── Профили пользователей ──
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text default 'specialist',
  phone text,
  avatar_url text,
  has_passed_test boolean default false,
  diagnostic_data jsonb,                 -- синхронизация результатов диагностики
  diagnostic_updated_at timestamptz,
  created_at timestamptz default now()
);
-- на случай, если таблица уже была без новых колонок
alter table public.profiles
  add column if not exists diagnostic_data jsonb,
  add column if not exists diagnostic_updated_at timestamptz;

alter table public.profiles enable row level security;
grant select, insert, update, delete on public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- ── Заявки на консультацию ──
create table if not exists public.consultation_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  contact text not null,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

alter table public.consultation_requests enable row level security;
grant insert, select on public.consultation_requests to authenticated;

drop policy if exists "consult_insert_own" on public.consultation_requests;
create policy "consult_insert_own" on public.consultation_requests
  for insert with check (auth.uid() = user_id);

drop policy if exists "consult_select_own" on public.consultation_requests;
create policy "consult_select_own" on public.consultation_requests
  for select using (auth.uid() = user_id);
