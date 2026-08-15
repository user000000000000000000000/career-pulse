-- Этап A, пачка 2/7 — контакты/соцсети/классификация с официальных сайтов.

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
