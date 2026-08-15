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
