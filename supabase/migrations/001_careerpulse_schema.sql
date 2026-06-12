-- ════════════════════════════════════════════════════════════════
--  CareerPulse — схема базы данных (Supabase / PostgreSQL)
--  Применение: вставьте в SQL Editor проекта Supabase.
-- ════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ════════════════════════════════════════════════════════════════
--  PROFILES
-- ════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text,
  full_name       text,
  phone           text,
  avatar_url      text,
  role            text default 'specialist'
                    check (role in ('student','parent','specialist','entrepreneur','hr')),
  has_passed_test boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- добавляем колонки если таблица уже существует
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;

drop trigger if exists trg_profiles_updated on public.profiles;
create trigger trg_profiles_updated
  before update on public.profiles
  for each row execute function public.set_updated_at();

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
--  TEST_RESULTS
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
--  STORAGE: бакет для аватаров
-- ════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "avatars_select_all" on storage.objects;
create policy "avatars_select_all" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own" on storage.objects
  for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own" on storage.objects
  for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ════════════════════════════════════════════════════════════════
--  PROFESSIONS — справочник профессий (105 штук)
-- ════════════════════════════════════════════════════════════════
create table if not exists public.professions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text,
  description text,
  holland     text[],
  created_at  timestamptz not null default now()
);

alter table public.professions enable row level security;

drop policy if exists "professions_read_all" on public.professions;
create policy "professions_read_all" on public.professions
  for select using (true);
