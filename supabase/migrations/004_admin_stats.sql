-- Агрегированная сводка для админ-панели одним запросом (SECURITY DEFINER,
-- отдаёт данные только админу — иначе NULL). Считает по всей таблице profiles.
create or replace function public.admin_dashboard_stats() returns json
  language sql security definer stable set search_path = public as $$
  select json_build_object(
    'total',       (select count(*) from public.profiles),
    'passed',      (select count(*) from public.profiles where (diagnostic_data->'progress'->>'pct')::int >= 100),
    'new7',        (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'with_report', (select count(*) from public.profiles where diagnostic_data->'profile'->'ai_report' is not null),
    'links',       (select count(*) from public.family_links),
    'by_role',     (select coalesce(json_object_agg(r, c), '{}'::json)
                      from (select coalesce(role,'—') r, count(*) c from public.profiles group by role) t)
  )
  where public.is_admin();
$$;
grant execute on function public.admin_dashboard_stats() to authenticated;
