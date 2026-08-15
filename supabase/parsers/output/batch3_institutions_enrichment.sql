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
