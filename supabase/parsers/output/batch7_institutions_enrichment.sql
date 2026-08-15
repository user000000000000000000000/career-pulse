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
