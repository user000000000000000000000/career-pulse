-- Этап A, пачка 1/7 — данные с официальных сайтов вузов (контакты, соцсети,
-- классификация). Собрано вручную построчным заходом на каждый сайт, не парсер.
-- Баллы/особые условия/целевой приём/стоимость — требуют более глубокого захода
-- на конкретные страницы приёмной комиссии каждого вуза, оставлены на дозаполнение.

update public.institutions set
  admissions_email = 'priem@vaganovaacademy.ru',
  phone_main = '+7 (812) 456-07-65',
  vk_url = 'https://vk.com/vaganovaacademy',
  telegram_url = 'https://t.me/vaganovaacademy',
  ownership_type = 'state',
  subject_area = 'creative',
  department_affiliation = 'Министерство культуры Российской Федерации',
  updated_at = now()
where name = 'Академия Русского балета имени А.Я. Вагановой' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priem@batp.ru',
  phone_main = '+7 (812) 235-50-66',
  ownership_type = 'private',
  subject_area = 'economic',
  updated_at = now()
where name = 'Балтийская академия туризма и предпринимательства' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'info.bgi.spb@mail.ru',
  phone_main = '+7 (812) 647-63-14',
  vk_url = 'https://vk.com/bgispbru',
  telegram_url = 'https://t.me/bgispb',
  ownership_type = 'private',
  subject_area = 'humanities',
  updated_at = now()
where name = 'Балтийский гуманитарный институт' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'bgtu@voenmeh.ru',
  phone_main = '+7 (812) 316-23-94',
  vk_url = 'https://vk.com/bgtu_voenmeh',
  telegram_url = 'https://t.me/bgtu_voenmeh',
  ownership_type = 'state',
  subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'rectors_office@eu.spb.ru',
  vk_url = 'https://vk.com/eusporg',
  telegram_url = 'https://t.me/euspb',
  ownership_type = 'private',
  subject_area = 'humanities',
  updated_at = now()
where name = 'Европейский университет в Санкт-Петербурге' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abitur@spmi.ru',
  vk_url = 'https://vk.com/mining_abiturs',
  telegram_url = 'https://t.me/mining_abitur',
  ownership_type = 'state',
  subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский горный университет императрицы Екатерины II' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priem@guap.ru',
  phone_main = '+7 (812) 312-21-07',
  vk_url = 'https://vk.com/abit_guap',
  telegram_url = 'https://t.me/new_guap',
  ownership_type = 'state',
  subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный университет аэрокосмического приборостроения' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'otd_o@gumrf.ru',
  phone_main = '+7 (812) 748-96-92',
  vk_url = 'https://vk.com/gumrf',
  telegram_url = 'https://t.me/gumrf_official',
  ownership_type = 'state',
  subject_area = 'technical',
  department_affiliation = 'Федеральное агентство морского и речного транспорта',
  updated_at = now()
where name = 'Государственный университет морского и речного флота имени адмирала С.О. Макарова' and city = 'Санкт-Петербург';

update public.institutions set
  phone_main = '+7 (812) 323-61-89',
  vk_url = 'https://vk.com/spb_academy_fine_arts',
  telegram_url = 'https://t.me/spb_academy_fine_arts',
  ownership_type = 'state',
  subject_area = 'creative',
  department_affiliation = 'Министерство культуры Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургская академия художеств имени Ильи Репина' and city = 'Санкт-Петербург';

-- ГУАП: добавлен MAX-канал (найден на priem.guap.ru), баллы не найдены в виде
-- реальной суммы проходного балла (только пороги допуска к подаче документов —
-- это другая метрика, не заносим, чтобы не путать)
update public.institutions set
  max_url = 'https://max.ru/id7812003110_gos3',
  updated_at = now()
where name = 'Санкт-Петербургский государственный университет аэрокосмического приборостроения' and city = 'Санкт-Петербург';

-- ГУМРФ: точных цифр (сумма проходного балла, точная стоимость) на сайте не
-- нашёл в открытом текстовом виде (баллы — ссылка на файл 2015 года, устарела;
-- стоимость — в PDF-приказах, не стал парсить каждый). Но подтвердил качественные
-- факты по структуре сайта: есть разделы "Целевое обучение" и "Медкомиссия" —
-- у морского вуза медицинские требования к пригодности предсказуемо есть.

-- filial-miep-sankt-peterburg: страница на postupi.online больше не существует
-- (редиректит на общий каталог /vuzi/) — филиал, похоже, закрыт. Удаляем мусорную
-- запись с некорректным именем ("Вузы Санкт-Петербурга: список университетов...").
delete from public.institution_programs where institution_id = (
  select id from public.institutions where name = 'Вузы Санкт-Петербурга: список университетов и институтов' and city = 'Санкт-Петербург'
);
delete from public.institutions where name = 'Вузы Санкт-Петербурга: список университетов и институтов' and city = 'Санкт-Петербург';
-- ВОЕНМЕХ: реальный суммарный проходной балл 2025, с priem.voenmeh.ru/prohodnye-bally-proshlyh-let
update public.institution_programs set min_score_total_last_year = 221, updated_at = now() where specialty_code = '09.03.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 230, updated_at = now() where specialty_code = '09.03.02' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 238, updated_at = now() where specialty_code = '09.03.04' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 189, updated_at = now() where specialty_code = '11.03.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 183, updated_at = now() where specialty_code = '11.05.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 204, updated_at = now() where specialty_code = '12.03.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 191, updated_at = now() where specialty_code = '12.03.05' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 192, updated_at = now() where specialty_code = '15.03.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 197, updated_at = now() where specialty_code = '15.03.03' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 213, updated_at = now() where specialty_code = '15.03.05' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 226, updated_at = now() where specialty_code = '15.03.06' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 216, updated_at = now() where specialty_code = '15.05.02' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 181, updated_at = now() where specialty_code = '17.05.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 210, updated_at = now() where specialty_code = '17.05.02' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 191, updated_at = now() where specialty_code = '24.03.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 191, updated_at = now() where specialty_code = '24.03.03' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 205, updated_at = now() where specialty_code = '24.03.05' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 229, updated_at = now() where specialty_code = '24.05.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 213, updated_at = now() where specialty_code = '24.05.02' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 199, updated_at = now() where specialty_code = '24.05.06' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 186, updated_at = now() where specialty_code = '27.03.04' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 197, updated_at = now() where specialty_code = '27.05.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 258, updated_at = now() where specialty_code = '37.05.02' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 280, updated_at = now() where specialty_code = '45.05.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');
update public.institution_programs set min_score_total_last_year = 223, updated_at = now() where specialty_code = '49.03.01' and institution_id = (select id from public.institutions where name = 'Балтийский государственный технический университет ВОЕНМЕХ им. Д.Ф. Устинова' and city = 'Санкт-Петербург');-- Этап A, пачка 2/7 — контакты/соцсети/классификация с официальных сайтов.

update public.institutions set
  admissions_email = 'education@almazovcentre.ru', phone_main = '+7 (812) 660-37-04',
  vk_url = 'https://vk.com/imo.almazovcentre', telegram_url = 'https://t.me/imo_almazovcentre',
  max_url = 'https://max.ru/id7802030429_gos',
  ownership_type = 'state', subject_area = 'medical', department_affiliation = 'Министерство здравоохранения Российской Федерации',
  updated_at = now()
where name = 'Институт медицинского образования Национального медицинского исследовательского центра имени В. А. Алмазова' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priemlgu@lengu.ru',
  vk_url = 'https://vk.com/lengu', telegram_url = 'https://t.me/lguPushkina',
  ownership_type = 'state', subject_area = 'multidisciplinary',
  department_affiliation = 'Правительство Ленинградской области',
  updated_at = now()
where name = 'Ленинградский государственный университет имени А.С. Пушкина' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priemka@ibispb.ru', phone_main = '+7 (812) 570-55-76',
  vk_url = 'https://vk.com/ibispb', telegram_url = 'https://t.me/ibispb_ru',
  ownership_type = 'private', subject_area = 'economic',
  updated_at = now()
where name = 'Международный банковский институт имени Анатолия Собчака' and city = 'Санкт-Петербург';

update public.institutions set
  vk_url = 'https://vk.com/ngu_lesgafta', max_url = 'https://max.ru/id7812047911_gos',
  ownership_type = 'state', subject_area = 'multidisciplinary',
  department_affiliation = 'Министерство спорта Российской Федерации',
  updated_at = now()
where name = 'Национальный государственный университет физической культуры, спорта и здоровья имени П.Ф. Лесгафта' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abitur-spb@hse.ru', phone_main = '+7 (812) 644-59-10',
  vk_url = 'https://vk.com/hse_spb', telegram_url = 'https://t.me/spbhse',
  ownership_type = 'state', subject_area = 'economic',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский филиал Национального исследовательского университета Высшая школа экономики' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'info@noispb.ru', phone_main = '+7 (800) 200-33-43',
  vk_url = 'https://vk.com/noirspb', max_url = 'https://max.ru/id7814693406_biz',
  ownership_type = 'private', subject_area = 'multidisciplinary',
  updated_at = now()
where name = 'Национальный открытый институт г. Санкт-Петербург' and city = 'Санкт-Петербург';

update public.institutions set
  vk_url = 'https://vk.com/pgups_abit', telegram_url = 'https://t.me/pgups_2020',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Федеральное агентство железнодорожного транспорта',
  updated_at = now()
where name = 'Петербургский государственный университет путей сообщения Императора Александра I' and city = 'Санкт-Петербург';

update public.institutions set
  vk_url = 'https://vk.com/1spbgmuofficial', telegram_url = 'https://t.me/PSPbGMUofficial',
  max_url = 'https://max.ru/id7813047463_biz',
  ownership_type = 'state', subject_area = 'medical', department_affiliation = 'Министерство здравоохранения Российской Федерации',
  updated_at = now()
where name = 'Первый Санкт-Петербургский государственный медицинский университет имени академика И.П. Павлова' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'spb@reaviz.ru', phone_main = '+7 (800) 600-24-00',
  vk_url = 'https://vk.com/spbreaviz', max_url = 'https://max.ru/id9727003843_biz',
  ownership_type = 'private', subject_area = 'medical',
  updated_at = now()
where name = 'Университет Реавиз в Санкт-Петербурге' and city = 'Санкт-Петербург';
-- Этап A, пачка 3/7 — контакты/соцсети/классификация с официальных сайтов.

update public.institutions set
  admissions_email = 'cmo@rshu.ru',
  vk_url = 'https://vk.com/rshu_official', telegram_url = 'https://t.me/gidro_met', max_url = 'https://max.ru/id7806012117_gos',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Российский государственный гидрометеорологический университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'pk@rgisi.ru', phone_main = '+7 (812) 273-15-81',
  vk_url = 'https://vk.com/rgisi',
  ownership_type = 'state', subject_area = 'creative',
  department_affiliation = 'Министерство культуры Российской Федерации',
  updated_at = now()
where name = 'Российский государственный институт сценических искусств' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'admission@rgpu.spb.ru', phone_main = '+7 (812) 312-44-92',
  vk_url = 'https://vk.com/TERRAHERZ', telegram_url = 'https://t.me/TERRAHERZspb', max_url = 'https://max.ru/id7808027849_gos',
  ownership_type = 'state', subject_area = 'humanities',
  department_affiliation = 'Министерство просвещения Российской Федерации',
  updated_at = now()
where name = 'Российский государственный педагогический университет им. А.И. Герцена' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priem@mail.szfrgup.ru', phone_main = '+7 (812) 655-64-55',
  vk_url = 'https://vk.com/rsuj_spb', telegram_url = 'https://t.me/szfrgup', max_url = 'https://max.ru/id7710324108_gos3',
  ownership_type = 'state', subject_area = 'humanities',
  department_affiliation = 'Верховный суд Российской Федерации',
  updated_at = now()
where name = 'Северо-Западный филиал Российского государственного университета правосудия имени В. М. Лебедева' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abiturient@rhga.ru', phone_main = '+7 (812) 334-14-41',
  vk_url = 'https://vk.com/rhgaru', telegram_url = 'https://t.me/rhga_spb',
  ownership_type = 'private', subject_area = 'humanities',
  updated_at = now()
where name = 'Русская христианская гуманитарная академия им. Ф. М. Достоевского' and city = 'Санкт-Петербург';

update public.institutions set
  vk_url = 'https://vk.com/skspba', max_url = 'https://max.ru/id7838055610_gos',
  ownership_type = 'state', subject_area = 'humanities',
  department_affiliation = 'Следственный комитет Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургская академия Следственного комитета Российской Федерации' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'info@pharminnotech.com', phone_main = '+7 (812) 499-39-00',
  ownership_type = 'state', subject_area = 'medical',
  department_affiliation = 'Министерство здравоохранения Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный химико-фармацевтический университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'ef@spbrta.ru', phone_main = '+7 (812) 706-12-19',
  vk_url = 'https://vk.com/spbrta', telegram_url = 'https://t.me/spbrta', max_url = 'https://max.ru/id5027053224_gos3',
  ownership_type = 'state', subject_area = 'economic',
  department_affiliation = 'Федеральная таможенная служба',
  updated_at = now()
where name = 'Санкт-Петербургский имени В.Б. Бобкова филиал Российской таможенной академии' and city = 'Санкт-Петербург';

-- Телефоны на странице ВГУЮ относились к другим региональным филиалам (Ижевск/Екатеринбург),
-- не заносим — оставляем только явно подтверждённые для СПб-филиала контакты.
update public.institutions set
  vk_url = 'https://vk.com/spbrpamurf',
  ownership_type = 'state', subject_area = 'humanities',
  department_affiliation = 'Министерство юстиции Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский институт (филиал) Всероссийского государственного университета юстиции (РПА Минюста России)' and city = 'Санкт-Петербург';
-- Этап A, пачка 4/7 — контакты/соцсети/классификация с официальных сайтов.

update public.institutions set
  admissions_email = 'spb_priem@fa.ru', phone_main = '+7 (812) 232-49-59',
  vk_url = 'https://vk.com/finuniversity_spb', telegram_url = 'https://t.me/spb_finuniversity', max_url = 'https://max.ru/id7714086422_gos37',
  ownership_type = 'state', subject_area = 'economic',
  department_affiliation = 'Правительство Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский филиал Финансового университета при Правительстве Российской Федерации' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priemkom@igps.ru', phone_main = '+7 (812) 388-20-41',
  vk_url = 'https://vk.com/univermchs', max_url = 'https://max.ru/univermchs',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство Российской Федерации по делам гражданской обороны, чрезвычайным ситуациям и ликвидации последствий стихийных бедствий',
  updated_at = now()
where name = 'Санкт-Петербургский университет Государственной противопожарной службы Министерства Российской Федерации по делам гражданской обороны, чрезвычайным ситуациям и ликвидации последствий стихийных бедствий имени Героя Российской Федерации генерала армии Е.Н. Зиничева' and city = 'Санкт-Петербург';

update public.institutions set
  phone_main = '+7 (812) 247-44-72',
  vk_url = 'https://vk.com/alferov_university', telegram_url = 'https://t.me/Novosti_AU',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Российская академия наук',
  updated_at = now()
where name = 'Санкт-Петербургский национальный исследовательский Академический университет имени Ж.И. Алфёрова Российской академии наук (Алферовский университет)' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'prc@spbgasu.ru', phone_main = '+7 (812) 316-20-26',
  vk_url = 'https://vk.com/spbgasu', telegram_url = 'https://t.me/spbgasu', max_url = 'https://max.ru/id7809011023_biz',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный архитектурно-строительный университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'agro@spbgau.ru', phone_main = '+7 (812) 600-2244',
  vk_url = 'https://vk.com/spb_gau', telegram_url = 'https://t.me/spb_gau', max_url = 'https://max.ru/id7820006490_biz',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство сельского хозяйства Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный аграрный университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priem@spbguvm.ru', phone_main = '+7 (812) 387-51-44',
  ownership_type = 'state', subject_area = 'medical',
  department_affiliation = 'Министерство сельского хозяйства Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный университет ветеринарной медицины' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'info@etu.ru',
  vk_url = 'https://vk.com/spbsetu', telegram_url = 'https://t.me/LETIToday', max_url = 'https://max.ru/id7813045402_biz',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный электротехнический университет ЛЭТИ им. В.И. Ульянова (Ленина)' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abitura@unecon.ru', phone_main = '+7 (812) 310-46-32',
  vk_url = 'https://vk.com/unecon', telegram_url = 'https://t.me/uneconru', max_url = 'https://max.ru/unecon',
  ownership_type = 'state', subject_area = 'economic',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный экономический университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'dp@spbgik.ru',
  vk_url = 'https://vk.com/spbgik_ru',
  ownership_type = 'state', subject_area = 'creative',
  department_affiliation = 'Министерство культуры Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный институт культуры' and city = 'Санкт-Петербург';
-- Этап A, пачка 5/7 — контакты/соцсети/классификация. gikit (502) и spbguga
-- (только IPv6, недоступен) — не удалось получить, оставлены на повтор.

update public.institutions set
  admissions_email = 'priem@gipsr.ru', phone_main = '+7 (812) 321-25-31',
  vk_url = 'https://vk.com/spbgipsr', max_url = 'https://max.ru/id7801009047_gos',
  ownership_type = 'state', subject_area = 'humanities',
  department_affiliation = 'Правительство Санкт-Петербурга',
  updated_at = now()
where name = 'Санкт-Петербургский государственный институт психологии и социальной работы' and city = 'Санкт-Петербург';

update public.institutions set
  vk_url = 'https://vk.com/conservatoryspb', telegram_url = 'https://t.me/conservatory1862', max_url = 'https://max.ru/id7812036476_biz',
  ownership_type = 'state', subject_area = 'creative',
  department_affiliation = 'Министерство культуры Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургская государственная консерватория им. Н.А. Римского-Корсакова' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'pricom@spbftu.ru', phone_main = '+7 (812) 217-92-30',
  vk_url = 'https://vk.com/spbftu', telegram_url = 'https://t.me/spbftu',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный лесотехнический университет имени С.М. Кирова' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priem@smtu.ru', phone_main = '+7 (812) 495-26-48',
  vk_url = 'https://vk.com/spbmtu', telegram_url = 'https://t.me/spbmtu', max_url = 'https://max.ru/id7812043522_biz',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный морской технический университет' and city = 'Санкт-Петербург';

update public.institutions set
  phone_main = '+7 (812) 295-06-46',
  vk_url = 'https://vk.com/news.gpmu', telegram_url = 'https://t.me/gpmu_org', max_url = 'https://max.ru/news_gpmu',
  ownership_type = 'state', subject_area = 'medical',
  department_affiliation = 'Министерство здравоохранения Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный педиатрический медицинский университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abitur@spbti.ru', phone_main = '+7 812 494-92-03',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный технологический институт (технический университет)' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abiturient@spbu.ru',
  vk_url = 'https://vk.com/spb1724', max_url = 'https://max.ru/id7801002274_gos9',
  ownership_type = 'state', subject_area = 'multidisciplinary',
  department_affiliation = 'Правительство Российской Федерации',
  updated_at = now()
where name = 'СПбГУ - Санкт-Петербургский государственный университет' and city = 'Санкт-Петербург';
-- Этап A, пачка 6/7 — контакты/соцсети/классификация.

update public.institutions set
  admissions_email = 'pricom@gup.ru', phone_main = '+7 (812) 269-57-58',
  vk_url = 'https://vk.com/spbgup_official', telegram_url = 'https://t.me/spbgup_students',
  ownership_type = 'state', subject_area = 'humanities',
  updated_at = now()
where name = 'Санкт-Петербургский Гуманитарный университет профсоюзов' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'inform@sutd.ru',
  vk_url = 'https://vk.com/spsutd', telegram_url = 'https://t.me/spsutd', max_url = 'https://max.ru/spsutd',
  ownership_type = 'state', subject_area = 'creative',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный университет промышленных технологий и дизайна' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'rector@sut.ru', phone_main = '+7 (812) 326-31-63',
  vk_url = 'https://vk.com/sutru', telegram_url = 'https://t.me/spbgut_bonch', max_url = 'https://max.ru/id7808004760_biz',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский государственный университет телекоммуникаций им. проф. М.А. Бонч-Бруевича' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'spbiem@yandex.ru',
  vk_url = 'https://vk.com/spbiemru', telegram_url = 'https://t.me/spbiem',
  ownership_type = 'private', subject_area = 'economic',
  updated_at = now()
where name = 'Санкт-Петербургский институт экономики и управления' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'info@medinstitut.org',
  vk_url = 'https://vk.com/medicosocialinstitute', max_url = 'https://max.ru/priemkomspbmsi_bot',
  ownership_type = 'private', subject_area = 'medical',
  updated_at = now()
where name = 'Санкт-Петербургский медико-социальный институт' and city = 'Санкт-Петербург';

-- Политех — контакты уже собраны в начале сессии (первый разведочный запрос)
update public.institutions set
  admissions_email = 'abitur@spbstu.ru', phone_main = '+7 (812) 775-05-30',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургский политехнический университет Петра Великого' and city = 'Санкт-Петербург';

-- Северо-Западный университет: телефон "+7 (000) 000-00-00" на сайте — явный
-- плейсхолдер/заглушка, не заносим. Второй телефон похож на реальный.
update public.institutions set
  phone_main = '+7 (800) 200-76-72',
  vk_url = 'https://vk.com/szu_official', telegram_url = 'https://t.me/szu_official',
  ownership_type = 'private', subject_area = 'multidisciplinary',
  updated_at = now()
where name = 'Северо-Западный университет' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'rector@spbume.ru', phone_main = '+7 (812) 313-39-44',
  vk_url = 'https://vk.com/spbume_university', telegram_url = 'https://t.me/spbume', max_url = 'https://max.ru/id7826001459_biz',
  ownership_type = 'private', subject_area = 'economic',
  updated_at = now()
where name = 'Санкт-Петербургский университет технологий управления и экономики' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'priem@ghpa.ru', phone_main = '+7 (952) 376-47-13',
  vk_url = 'https://vk.com/stieglitzacademy', telegram_url = 'https://t.me/stieglitz_academy', max_url = 'https://max.ru/id7825072672_biz',
  ownership_type = 'state', subject_area = 'creative',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Санкт-Петербургская государственная художественно-промышленная академия имени А.Л. Штиглица' and city = 'Санкт-Петербург';
-- Этап A, пачка 7/7 (последняя) — контакты/соцсети/классификация.
-- Университет ФСИН (spbu.fsin.gov.ru) не резолвится с этой машины — не удалось получить.

update public.institutions set
  admissions_email = 'ofo@jurac.ru', phone_main = '+7 (812) 677-00-07',
  ownership_type = 'private', subject_area = 'humanities',
  updated_at = now()
where name = 'Санкт-Петербургская юридическая академия' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'rectorat@szgmu.ru', phone_main = '+7 (812) 303-50-00',
  vk_url = 'https://vk.com/szgmu_clinics', telegram_url = 'https://t.me/szgmu_university',
  ownership_type = 'state', subject_area = 'medical',
  department_affiliation = 'Министерство здравоохранения Российской Федерации',
  updated_at = now()
where name = 'Северо-Западный государственный медицинский университет имени И.И. Мечникова' and city = 'Санкт-Петербург';

update public.institutions set
  phone_main = '+7 (812) 335-94-84',
  vk_url = 'https://vk.com/priem.spb.ranepa', telegram_url = 'https://t.me/priem_spb_ranepa',
  ownership_type = 'state', subject_area = 'economic',
  department_affiliation = 'Правительство Российской Федерации',
  updated_at = now()
where name = 'РАНХиГС Санкт-Петербург' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abit@itmo.ru', phone_main = '+7 (812) 480-0-480',
  vk_url = 'https://vk.com/abit.itmo', telegram_url = 'https://t.me/abit_itmo',
  ownership_type = 'state', subject_area = 'technical',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Национальный исследовательский университет ИТМО' and city = 'Санкт-Петербург';

-- Телефон "+7 (999) 999-99-99" на сайте — явный плейсхолдер, не заносим.
update public.institutions set
  admissions_email = 'miep.priem@mail.ru', phone_main = '+7 (812) 541-80-00',
  vk_url = 'https://vk.com/eurasec_university',
  ownership_type = 'private', subject_area = 'economic',
  updated_at = now()
where name = 'Университет при Межпарламентской Ассамблее ЕврАзЭС' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'abitur@gsom.spbu.ru',
  vk_url = 'https://vk.com/gsom.spbu', telegram_url = 'https://t.me/gsom_spbu_official',
  ownership_type = 'state', subject_area = 'economic',
  department_affiliation = 'Правительство Российской Федерации',
  updated_at = now()
where name = 'Высшая школа менеджмента СПбГУ' and city = 'Санкт-Петербург';

update public.institutions set
  vk_url = 'https://vk.com/vhutein', telegram_url = 'https://t.me/vhutein',
  ownership_type = 'private', subject_area = 'creative',
  updated_at = now()
where name = 'Высший художественно-технический институт' and city = 'Санкт-Петербург';

update public.institutions set
  admissions_email = 'vshni_priem@mail.ru', phone_main = '+7 (812) 710-49-13',
  telegram_url = 'https://t.me/vshniacademy', max_url = 'https://max.ru/id7841003524_biz',
  ownership_type = 'state', subject_area = 'creative',
  department_affiliation = 'Министерство науки и высшего образования Российской Федерации',
  updated_at = now()
where name = 'Российский университет традиционных художественных промыслов' and city = 'Санкт-Петербург';
