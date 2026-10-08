-- 007: Публичный шаринг результатов по ссылке (токен). Любой с ссылкой видит
-- read-only результаты БЕЗ логина. Отдаём только имя + diagnostic_data,
-- без email/телефона/роли. Токен можно отозвать.

alter table public.profiles add column if not exists share_token uuid;
create unique index if not exists profiles_share_token_idx
  on public.profiles(share_token) where share_token is not null;

-- Включить шаринг: сгенерить токен (если ещё нет) и вернуть его.
create or replace function public.enable_result_sharing()
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_token uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select share_token into v_token from public.profiles where id = auth.uid();
  if v_token is null then
    v_token := gen_random_uuid();
    update public.profiles set share_token = v_token where id = auth.uid();
  end if;
  return v_token;
end; $$;

-- Отозвать ссылку.
create or replace function public.disable_result_sharing()
returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  update public.profiles set share_token = null where id = auth.uid();
end; $$;

-- Публичное чтение результатов по токену (anon). Только имя + результаты диагностики.
create or replace function public.public_shared_results(p_token uuid)
returns table(full_name text, diagnostic_data jsonb)
language sql security definer set search_path = public as $$
  select full_name, diagnostic_data
  from public.profiles
  where share_token = p_token
  limit 1;
$$;

grant execute on function public.enable_result_sharing() to authenticated;
grant execute on function public.disable_result_sharing() to authenticated;
grant execute on function public.public_shared_results(uuid) to anon, authenticated;
