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
