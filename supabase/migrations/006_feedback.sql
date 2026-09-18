-- Обратная связь / сообщения о проблемах.
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  email      text,                       -- контакт для ответа (необязательно)
  category   text default 'other',       -- bug | idea | other
  message    text not null,
  page_url   text,
  user_agent text,
  status     text default 'new',         -- new | read | done
  created_at timestamptz default now()
);
alter table public.feedback enable row level security;

-- Оставить отзыв может кто угодно (в т.ч. неавторизованный).
drop policy if exists "feedback_insert_any" on public.feedback;
create policy "feedback_insert_any" on public.feedback for insert to anon, authenticated with check (true);

-- Читают и меняют статус только админы.
drop policy if exists "feedback_select_admin" on public.feedback;
create policy "feedback_select_admin" on public.feedback for select using (public.is_admin());
drop policy if exists "feedback_update_admin" on public.feedback;
create policy "feedback_update_admin" on public.feedback for update using (public.is_admin());
