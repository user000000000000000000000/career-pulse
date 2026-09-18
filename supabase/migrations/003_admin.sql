-- ════════════════════════════════════════════════════════════════
-- Админ-доступ. Отдельная таблица admins (не role в профиле — ту юзер
-- меняет сам). Запись только через psql/service_role. Чтение всех
-- профилей админом — через RLS + SECURITY DEFINER is_admin().
-- ════════════════════════════════════════════════════════════════

create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;
-- юзер видит только свою строку (чтобы фронт понял, админ ли он); запись — только service_role.
drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins for select using (auth.uid() = user_id);

-- Проверка админа без рекурсии по RLS (definer читает admins напрямую).
create or replace function public.is_admin() returns boolean
  language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

-- Админ читает ВСЕ профили (имя, почта, телефон, has_passed_test, diagnostic_data).
drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin" on public.profiles for select using (public.is_admin());

-- Публичный счётчик пользователей для лендинга («с нами уже N»).
create or replace function public.public_user_count() returns integer
  language sql security definer stable set search_path = public as $$
  select count(*)::int from public.profiles;
$$;
grant execute on function public.public_user_count() to anon, authenticated;

-- ── ВЫДАТЬ АДМИНКУ (замени email, выполни отдельно на каждого): ──
-- insert into public.admins (user_id)
--   select id from auth.users where email = 'you@example.com'
--   on conflict do nothing;
