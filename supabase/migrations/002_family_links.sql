-- ════════════════════════════════════════════════════════════════
-- Семейная связка родитель ↔ ребёнок (кабинеты).
-- Модель: ребёнок генерит короткий код у себя → родитель вводит →
-- создаётся связь. Родитель получает ТОЛЬКО чтение профиля ребёнка.
-- ════════════════════════════════════════════════════════════════

-- 1. Короткоживущий код привязки на профиле ребёнка.
alter table public.profiles add column if not exists link_code text;
alter table public.profiles add column if not exists link_code_expires timestamptz;

-- 2. Таблица связей (M:N — у родителя несколько детей и наоборот).
create table if not exists public.family_links (
  parent_id  uuid not null references auth.users(id) on delete cascade,
  child_id   uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (parent_id, child_id),
  check (parent_id <> child_id)
);
alter table public.family_links enable row level security;

-- Обе стороны видят свои связи и могут их удалить (отвязка).
drop policy if exists "family_links_select_own" on public.family_links;
create policy "family_links_select_own" on public.family_links for select
  using (auth.uid() = parent_id or auth.uid() = child_id);
drop policy if exists "family_links_delete_own" on public.family_links;
create policy "family_links_delete_own" on public.family_links for delete
  using (auth.uid() = parent_id or auth.uid() = child_id);
-- INSERT напрямую закрыт (нет policy) — связь создаётся только через RPC ниже.

-- 3. Связанные стороны могут ЧИТАТЬ профиль друг друга (read-only).
--    Родителю это даёт результаты ребёнка; ребёнку — имя привязанного родителя.
drop policy if exists "profiles_select_linked_child" on public.profiles;
drop policy if exists "profiles_select_linked" on public.profiles;
create policy "profiles_select_linked" on public.profiles for select
  using (exists (
    select 1 from public.family_links fl
    where (fl.parent_id = auth.uid() and fl.child_id = profiles.id)
       or (fl.child_id  = auth.uid() and fl.parent_id = profiles.id)
  ));

-- 4. Обмен кода на связь. SECURITY DEFINER — обходит RLS ровно для этой операции
--    (родитель не может напрямую читать чужой профиль/код).
create or replace function public.link_child_by_code(p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_child uuid; v_name text;
begin
  -- нормализуем ввод: без регистра, дефисов и пробелов
  select id, full_name into v_child, v_name from public.profiles
    where link_code is not null
      and upper(link_code) = upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z0-9]', '', 'g'))
      and link_code_expires > now()
    order by link_code_expires desc limit 1;
  if v_child is null then
    return json_build_object('ok', false, 'error', 'Код неверный или истёк');
  end if;
  if v_child = auth.uid() then
    return json_build_object('ok', false, 'error', 'Нельзя привязать самого себя');
  end if;
  insert into public.family_links (parent_id, child_id)
    values (auth.uid(), v_child) on conflict do nothing;
  -- код одноразовый — гасим сразу после использования
  update public.profiles set link_code = null, link_code_expires = null where id = v_child;
  return json_build_object('ok', true, 'child_name', coalesce(nullif(v_name,''), 'Ребёнок'));
end $$;
grant execute on function public.link_child_by_code(text) to authenticated;
