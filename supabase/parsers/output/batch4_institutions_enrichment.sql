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
