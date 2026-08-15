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

-- ════════════════════════════════════════════════════════════
-- Карьерный трек: специальности (Минобрнауки), вузы/колледжи, программы
-- и связка "профессия атласа → специальность". Справочные таблицы,
-- читает любой (даже анонимный) пользователь. Заполняются вручную/парсером —
-- см. supabase/CAREER_TRACK_DATA_GUIDE.md. Обновление — раз в год перед
-- приёмной кампанией (правила приёма меняются ежегодно).
-- ════════════════════════════════════════════════════════════

-- ── Специальности (официальные коды ОКСО/ФГОС) ──
create table if not exists public.specialties (
  code text primary key,                            -- напр. '09.03.01'
  name text not null,                                -- напр. 'Информатика и вычислительная техника'
  level text not null check (level in ('bachelor','master','specialist','college')),
  group_code text,                                   -- код укрупнённой группы, напр. '09.00.00'
  group_name text,                                   -- напр. 'ИНФОРМАТИКА И ВЫЧИСЛИТЕЛЬНАЯ ТЕХНИКА'
  ege_required text[] not null default '{}',         -- всегда нужны, напр. {russian, math_profile}
  ege_choose_one_of text[] not null default '{}',    -- выбрать один из, напр. {informatics, physics}
  updated_at timestamptz not null default now()
);
-- на случай, если таблица уже была создана без этих колонок
alter table public.specialties
  add column if not exists group_code text,
  add column if not exists group_name text;
create index if not exists idx_specialties_group on public.specialties(group_code);

alter table public.specialties enable row level security;
drop policy if exists "specialties_read_all" on public.specialties;
create policy "specialties_read_all" on public.specialties for select using (true);

-- ── Профессия атласа (id из frontend/src/data/professions.js) → специальность ──
create table if not exists public.profession_specialty_map (
  id uuid primary key default gen_random_uuid(),
  profession_id integer not null,
  specialty_code text not null references public.specialties(code) on delete cascade,
  relevance text not null default 'primary' check (relevance in ('primary','secondary')),
  unique (profession_id, specialty_code)
);

alter table public.profession_specialty_map enable row level security;
drop policy if exists "profession_specialty_map_read_all" on public.profession_specialty_map;
create policy "profession_specialty_map_read_all" on public.profession_specialty_map for select using (true);

-- ── Вузы и колледжи ──
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,                                -- краткое, напр. 'МГТУ им. Баумана'
  full_name text,                                     -- официальное полное название
  type text not null check (type in ('university','college')),
  city text not null,
  region text,
  website text,
  -- контакты
  admissions_email text,                             -- почта приёмной комиссии
  phone_main text,                                    -- телефон вуза
  phone_admissions text,                              -- телефон приёмной комиссии
  vk_url text,
  telegram_url text,
  max_url text,                                       -- канал в мессенджере MAX
  -- классификация (см. supabase/CAREER_TRACK_DATA_GUIDE.md — две независимые оси)
  ownership_type text check (ownership_type in ('state','private')),          -- государственный/негосударственный
  subject_area text check (subject_area in                                   -- предметная область (профиль)
    ('medical','technical','humanities','economic','creative','multidisciplinary')),
  department_affiliation text,                        -- ведомственная принадлежность, напр. 'Минобрнауки России'
                                                       -- словарь значений — см. Статистика_ВПО-1_2025.xlsx (разбивка по 751 организации)
  vpo1_category text,                                  -- прямая ссылка на строку из Статистика_ВПО-1_2025.xlsx (аудит источника)
  -- обработанная сводка отзывов (одна версия на вуз, см. institution_feedback ниже —
  -- там сырые ответы; здесь — их обобщение, перегенерируется по мере роста сырых данных)
  feedback_summary_student text,
  feedback_summary_parent text,
  feedback_summary_teacher text,
  feedback_summary_career_counselor text,
  feedback_summary_alumnus text,
  feedback_positive_highlights text[] not null default '{}',
  feedback_negative_highlights text[] not null default '{}',
  feedback_based_on_count integer not null default 0,  -- сколько строк institution_feedback легло в основу сводки
  feedback_generated_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_institutions_city on public.institutions(city);
create index if not exists idx_institutions_region on public.institutions(region);
create unique index if not exists uq_institutions_name_city on public.institutions(name, city);

alter table public.institutions enable row level security;
drop policy if exists "institutions_read_all" on public.institutions;
create policy "institutions_read_all" on public.institutions for select using (true);

-- ── Программы конкретного вуза/колледжа по специальности ──
create table if not exists public.institution_programs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  specialty_code text not null references public.specialties(code) on delete cascade,
  program_name text,                                  -- название в этом вузе, если отличается от specialties.name
  full_name_with_level text,                          -- готовая строка для UI, напр. 'Бакалавриат по направлению «...»'
  level text,                                         -- денормализовано из specialties.level для удобства выборки
  duration_years numeric(3,1),                        -- 4, 5, 5.5 и т.п.
  form text check (form in ('full_time','part_time','evening')),

  -- места и конкурс
  has_budget_places boolean default true,
  budget_places_count integer,                        -- число бюджетных мест на приём
  paid_places_count integer,                           -- число платных мест на приём
  applications_count_last_year integer,                -- подано заявлений в прошлом году
  contest_ratio_last_year numeric generated always as  -- конкурс = заявки / бюджетные места (не хранится отдельно, считается)
    (case when budget_places_count > 0 then round(applications_count_last_year::numeric / budget_places_count, 2) end) stored,

  -- баллы (только сумма по всем экзаменам — "балл за один экзамен" сюда не заносим,
  -- источник приоритета — официальный сайт вуза, не агрегаторы вроде postupi.online)
  min_score_total_last_year integer,                   -- минимальный суммарный балл (сумма всех экзаменов) последнего зачисленного
  subject1_name text, min_score_subject1_last_year integer,
  subject2_name text, min_score_subject2_last_year integer,
  subject3_name text, min_score_subject3_last_year integer,

  -- особые условия
  has_additional_tests boolean default false,          -- ДВИ/внутренние испытания
  additional_tests_info text,                          -- напр. 'творческий экзамен, собеседование'
  has_interview boolean default false,
  has_medical_requirements boolean default false,       -- нужна мед.справка/книжка

  -- целевой приём и льготы
  has_target_program boolean default false,
  target_places_count integer,
  has_lte_places boolean default false,                 -- отдельная квота для лиц с ОВЗ/инвалидностью

  -- стоимость
  paid_cost_rub_last_year integer,                      -- стоимость платного обучения в год
  scholarship_info text,

  admission_year integer not null default extract(year from now())::int,
  link text,
  updated_at timestamptz not null default now()
);
create index if not exists idx_programs_specialty on public.institution_programs(specialty_code);
create index if not exists idx_programs_institution on public.institution_programs(institution_id);
create unique index if not exists uq_programs_institution_specialty on public.institution_programs(institution_id, specialty_code);

alter table public.institution_programs enable row level security;
drop policy if exists "institution_programs_read_all" on public.institution_programs;
create policy "institution_programs_read_all" on public.institution_programs for select using (true);

-- ── Отзывы о вузе ──
-- Одна строка = один отзыв одного человека. НЕ сворачиваем в колонки-агрегаты на
-- institutions — при массовом опросе таких отзывов на вуз будут сотни, плоские
-- текстовые поля их просто перезаписывали бы. Текст перед вставкой должен быть
-- обезличен (без ФИО/контактов респондента) — это публичные агрегированные данные.
create table if not exists public.institution_feedback (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  source_type text not null check (source_type in ('student','parent','teacher','career_counselor','alumnus')),
  sentiment text check (sentiment in ('positive','negative','neutral')),
  source_platform text,                                -- напр. 'vk', 'otzovik.com', 'опрос CareerPulse'
  text text not null,
  collected_at timestamptz not null default now()
);
create index if not exists idx_feedback_institution on public.institution_feedback(institution_id);
create index if not exists idx_feedback_source_type on public.institution_feedback(source_type);

alter table public.institution_feedback enable row level security;
drop policy if exists "institution_feedback_read_all" on public.institution_feedback;
create policy "institution_feedback_read_all" on public.institution_feedback for select using (true);
-- Обработанная сводка (feedback_summary_*, feedback_positive/negative_highlights) —
-- см. колонки прямо в institutions выше. Отдельной таблицы для неё нет: это 1:1
-- с вузом, лишняя таблица только ради этого не нужна.
