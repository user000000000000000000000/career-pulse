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
