/* ════════════════════════════════════════════════════════════════
   БАНК ВОПРОСОВ CareerPulse — v2.0
   ────────────────────────────────────────────────────────────────
   Методология: Никита Соколов / CareerPulse 2026
   10 блоков · 242 вопроса (закрытые) + 25 открытых

   Структура:
     id:      "<block_id>_NN"
     block:   "context" | "holland" | "values" | "personality" |
              "intelligence" | "readiness" | "self_efficacy" |
              "future" | "social" | "letter"
     type:    "single" | "pair" | "scale" | "multi" | "open"
     text:    строка вопроса
     options: массив { text, scores:{...} }
   ════════════════════════════════════════════════════════════════ */

export const QUESTION_BANK = [

  // ══════════════════════════════════════════════════════════════
  // БЛОК 1 — АНКЕТА-КОНТЕКСТ (20 вопросов, ось НАДО)
  // ══════════════════════════════════════════════════════════════

  { id:'context_01', block:'context', type:'single',
    text:'В каком ты сейчас классе / на каком этапе?',
    options:[
      {text:'8 класс', scores:{grade:8}},
      {text:'9 класс', scores:{grade:9}},
      {text:'10 класс', scores:{grade:10}},
      {text:'11 класс', scores:{grade:11}},
      {text:'Колледж', scores:{grade:12}},
      {text:'Студент вуза', scores:{grade:13}},
    ]
  },
  { id:'context_02', block:'context', type:'single',
    text:'Что планируешь делать после окончания школы / текущего этапа?',
    options:[
      {text:'Поступить в вуз', scores:{plan:'university'}},
      {text:'Поступить в колледж', scores:{plan:'college'}},
      {text:'Сразу работать', scores:{plan:'work'}},
      {text:'Пока не знаю', scores:{plan:'unknown'}},
    ]
  },
  { id:'context_03', block:'context', type:'multi',
    text:'Какие ЕГЭ планируешь сдавать? (выбери все подходящие)',
    options:[
      {text:'Математика (профиль)', scores:{ege:'math_adv'}},
      {text:'Математика (база)', scores:{ege:'math_base'}},
      {text:'Физика', scores:{ege:'physics'}},
      {text:'Химия', scores:{ege:'chemistry'}},
      {text:'Биология', scores:{ege:'biology'}},
      {text:'Информатика', scores:{ege:'cs'}},
      {text:'История', scores:{ege:'history'}},
      {text:'Обществознание', scores:{ege:'social'}},
      {text:'Русский язык', scores:{ege:'russian'}},
      {text:'Литература', scores:{ege:'literature'}},
      {text:'Иностранный язык', scores:{ege:'language'}},
      {text:'Ещё не решил(а)', scores:{ege:'unknown'}},
    ]
  },
  { id:'context_04', block:'context', type:'single',
    text:'Есть ли у тебя идеи насчёт профессии или сферы?',
    options:[
      {text:'Да, уже есть конкретная идея', scores:{career_clarity:3}},
      {text:'Есть 2–3 варианта, но не уверен(а)', scores:{career_clarity:2}},
      {text:'Смутные ощущения, без конкретики', scores:{career_clarity:1}},
      {text:'Нет вообще никаких идей', scores:{career_clarity:0}},
    ]
  },
  { id:'context_05', block:'context', type:'scale',
    text:'Насколько ты сейчас тревожишься из-за выбора профессии или будущего?',
    options:[
      {text:'1 — совсем не тревожусь', scores:{anxiety:1}},
      {text:'2', scores:{anxiety:2}},
      {text:'3 — умеренно', scores:{anxiety:3}},
      {text:'4', scores:{anxiety:4}},
      {text:'5 — очень сильно тревожусь', scores:{anxiety:5}},
    ]
  },
  { id:'context_06', block:'context', type:'scale',
    text:'Насколько родители влияют на твой выбор профессии?',
    options:[
      {text:'1 — совсем не влияют, выбираю сам(а)', scores:{parent_pressure:1}},
      {text:'2', scores:{parent_pressure:2}},
      {text:'3 — советуются, но не давят', scores:{parent_pressure:3}},
      {text:'4', scores:{parent_pressure:4}},
      {text:'5 — сильно давят, хотят конкретного', scores:{parent_pressure:5}},
    ]
  },
  { id:'context_07', block:'context', type:'single',
    text:'Какая у тебя главная боль сейчас?',
    options:[
      {text:'Не понимаю, что мне вообще интересно', scores:{pain:'no_interest'}},
      {text:'Интересов много, не знаю что выбрать', scores:{pain:'too_many'}},
      {text:'Хочу одно, родители хотят другого', scores:{pain:'conflict'}},
      {text:'Боюсь ошибиться с выбором вуза', scores:{pain:'university_fear'}},
      {text:'Нет уверенности в себе', scores:{pain:'confidence'}},
    ]
  },
  { id:'context_08', block:'context', type:'single',
    text:'Кто в итоге принимает решение о твоей профессии?',
    options:[
      {text:'Я сам(а)', scores:{decision:'self'}},
      {text:'Вместе с родителями', scores:{decision:'family'}},
      {text:'В основном родители', scores:{decision:'parents'}},
      {text:'Пока не знаю', scores:{decision:'unknown'}},
    ]
  },
  { id:'context_09', block:'context', type:'single',
    text:'Готов(а) ли ты переехать в другой город ради учёбы?',
    options:[
      {text:'Да, готов(а) переехать', scores:{mobility:'yes'}},
      {text:'Возможно, если будет хороший вариант', scores:{mobility:'maybe'}},
      {text:'Нет, хочу остаться в своём городе', scores:{mobility:'no'}},
    ]
  },
  { id:'context_10', block:'context', type:'single',
    text:'Какой бюджет на обучение?',
    options:[
      {text:'Только бюджет (бесплатно)', scores:{budget:'free'}},
      {text:'До 100 000 ₽ в год', scores:{budget:'low'}},
      {text:'100 000–300 000 ₽ в год', scores:{budget:'mid'}},
      {text:'Любой, если оно того стоит', scores:{budget:'any'}},
    ]
  },
  { id:'context_11', block:'context', type:'single',
    text:'Какой твой средний балл в школе?',
    options:[
      {text:'Ниже 3,5', scores:{gpa:'low'}},
      {text:'3,5 – 4,0', scores:{gpa:'mid_low'}},
      {text:'4,0 – 4,5', scores:{gpa:'mid'}},
      {text:'4,5 – 5,0', scores:{gpa:'high'}},
    ]
  },
  { id:'context_12', block:'context', type:'multi',
    text:'Какие предметы тебе нравятся больше всего? (выбери до 3)',
    options:[
      {text:'Математика', scores:{subj:'math'}},
      {text:'Физика', scores:{subj:'physics'}},
      {text:'Химия', scores:{subj:'chemistry'}},
      {text:'Биология', scores:{subj:'biology'}},
      {text:'Информатика', scores:{subj:'cs'}},
      {text:'История', scores:{subj:'history'}},
      {text:'Литература', scores:{subj:'literature'}},
      {text:'Иностранный язык', scores:{subj:'language'}},
      {text:'ИЗО / черчение / дизайн', scores:{subj:'art'}},
      {text:'Физкультура / спорт', scores:{subj:'pe'}},
    ]
  },
  { id:'context_13', block:'context', type:'single',
    text:'Как ты учишься — по расписанию или в последний момент?',
    options:[
      {text:'Планирую и делаю заранее', scores:{study_style:'planned'}},
      {text:'По-разному, зависит от предмета', scores:{study_style:'mixed'}},
      {text:'Чаще оставляю на последний момент', scores:{study_style:'last_minute'}},
    ]
  },
  { id:'context_14', block:'context', type:'scale',
    text:'Насколько ты загружен(а) прямо сейчас (учёба, кружки, обязательства)?',
    options:[
      {text:'1 — очень мало нагрузки', scores:{load:1}},
      {text:'2', scores:{load:2}},
      {text:'3 — нормально', scores:{load:3}},
      {text:'4', scores:{load:4}},
      {text:'5 — перегружен(а)', scores:{load:5}},
    ]
  },
  { id:'context_15', block:'context', type:'single',
    text:'Есть ли у тебя опыт подработки, стажировки или серьёзного проекта?',
    options:[
      {text:'Да, работал(а) официально или по договору', scores:{work_exp:'formal'}},
      {text:'Да, небольшие проекты или разовые задачи', scores:{work_exp:'informal'}},
      {text:'Участвовал(а) в школьных / волонтёрских проектах', scores:{work_exp:'volunteer'}},
      {text:'Нет, пока не было опыта', scores:{work_exp:'none'}},
    ]
  },
  { id:'context_16', block:'context', type:'single',
    text:'Участвовал(а) ли ты в олимпиадах или конкурсах?',
    options:[
      {text:'Да, побеждал(а) или занимал(а) призовые места', scores:{olympics:'winner'}},
      {text:'Да, участвовал(а), без призов', scores:{olympics:'participant'}},
      {text:'Нет, не участвовал(а)', scores:{olympics:'none'}},
    ]
  },
  { id:'context_17', block:'context', type:'single',
    text:'Есть ли у тебя хобби, которым занимаешься 2+ года?',
    options:[
      {text:'Да, серьёзное и постоянное увлечение', scores:{hobby:'serious'}},
      {text:'Да, но периодически бросаю и возвращаюсь', scores:{hobby:'on_off'}},
      {text:'Много разных, ни на чём не останавливаюсь', scores:{hobby:'scattered'}},
      {text:'Нет особых увлечений', scores:{hobby:'none'}},
    ]
  },
  { id:'context_18', block:'context', type:'single',
    text:'Есть ли у тебя взрослый человек (не родитель), которому ты доверяешь?',
    options:[
      {text:'Да, есть такой человек', scores:{mentor_presence:1}},
      {text:'Есть, но общаемся редко', scores:{mentor_presence:0.5}},
      {text:'Нет, такого человека нет', scores:{mentor_presence:0}},
    ]
  },
  { id:'context_19', block:'context', type:'single',
    text:'Как ты относишься к длинному пути (6–7 лет учёбы до профессии)?',
    options:[
      {text:'Готов(а), если дело важное', scores:{long_path:'ready'}},
      {text:'Хотел(а) бы побыстрее, но понимаю', scores:{long_path:'reluctant'}},
      {text:'Хочу скорее начать зарабатывать', scores:{long_path:'no'}},
    ]
  },
  { id:'context_20', block:'context', type:'single',
    text:'Что для тебя важнее в будущей профессии на первом месте?',
    options:[
      {text:'Интерес и смысл работы', scores:{priority:'meaning'}},
      {text:'Хороший доход', scores:{priority:'income'}},
      {text:'Стабильность и надёжность', scores:{priority:'stability'}},
      {text:'Статус и признание', scores:{priority:'status'}},
      {text:'Свобода и гибкость', scores:{priority:'freedom'}},
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 2 — СКЛОННОСТИ HOLLAND (30 пар + доп. модули, ось ХОЧУ)
  // Формат: pair — выбор А или Б, затем интенсивность 1/2/3
  // ══════════════════════════════════════════════════════════════

  { id:'holland_01', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Починить сломанный велосипед своими руками', scores:{R:1}},
      {text:'Б — Разобраться, почему велосипед сломался, изучив его устройство', scores:{I:1}},
    ]
  },
  { id:'holland_02', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Собрать мебель или конструктор по схеме', scores:{R:1}},
      {text:'Б — Придумать и нарисовать постер для школьного мероприятия', scores:{A:1}},
    ]
  },
  { id:'holland_03', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Работать на свежем воздухе — в саду, мастерской, на площадке', scores:{R:1}},
      {text:'Б — Работать с людьми — консультировать, обучать, помогать', scores:{S:1}},
    ]
  },
  { id:'holland_04', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Управлять техникой или механизмом (станок, дрон, 3D-принтер)', scores:{R:1}},
      {text:'Б — Управлять командой людей и направлять их к цели', scores:{E:1}},
    ]
  },
  { id:'holland_05', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Работать физически — на природе, в мастерской, в поле', scores:{R:1}},
      {text:'Б — Работать с информацией — вводить, проверять, систематизировать', scores:{C:1}},
    ]
  },
  { id:'holland_06', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Провести эксперимент и записать результаты', scores:{I:1}},
      {text:'Б — Написать рассказ или снять короткое видео', scores:{A:1}},
    ]
  },
  { id:'holland_07', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Самостоятельно изучить новую тему в интернете', scores:{I:1}},
      {text:'Б — Провести урок или мастер-класс для других', scores:{S:1}},
    ]
  },
  { id:'holland_08', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Провести исследование и написать отчёт о результатах', scores:{I:1}},
      {text:'Б — Представить идею и убедить других в её ценности', scores:{E:1}},
    ]
  },
  { id:'holland_09', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Найти закономерность в данных и сделать выводы', scores:{I:1}},
      {text:'Б — Внести данные в систему точно и без ошибок', scores:{C:1}},
    ]
  },
  { id:'holland_10', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Читать научные статьи и искать новые знания', scores:{I:1}},
      {text:'Б — Работать руками — ремонтировать, строить, конструировать', scores:{R:1}},
    ]
  },
  { id:'holland_11', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Участвовать в творческом проекте — театр, музыка, кино', scores:{A:1}},
      {text:'Б — Помочь однокласснику разобраться в сложной теме', scores:{S:1}},
    ]
  },
  { id:'holland_12', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Создать что-то художественное — музыку, текст, иллюстрацию', scores:{A:1}},
      {text:'Б — Продать идею или продукт, договориться о сотрудничестве', scores:{E:1}},
    ]
  },
  { id:'holland_13', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Оформить проект красиво и нестандартно', scores:{A:1}},
      {text:'Б — Структурировать информацию по разделам и категориям', scores:{C:1}},
    ]
  },
  { id:'holland_14', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Написать музыку, текст песни или стихотворение', scores:{A:1}},
      {text:'Б — Собрать устройство или починить технику', scores:{R:1}},
    ]
  },
  { id:'holland_15', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Создавать визуальные образы — снимать, рисовать, оформлять', scores:{A:1}},
      {text:'Б — Исследовать явления и объяснять, как они устроены', scores:{I:1}},
    ]
  },
  { id:'holland_16', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Выслушать друга, у которого проблемы, и поддержать его', scores:{S:1}},
      {text:'Б — Организовать командное мероприятие и взять роль лидера', scores:{E:1}},
    ]
  },
  { id:'holland_17', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Заботиться о людях — пожилых, детях, больных', scores:{S:1}},
      {text:'Б — Вести учёт, документацию, базы данных', scores:{C:1}},
    ]
  },
  { id:'holland_18', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Работать волонтёром — помогать людям в трудной ситуации', scores:{S:1}},
      {text:'Б — Придумать оригинальное название или визуальный образ', scores:{A:1}},
    ]
  },
  { id:'holland_19', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Напрямую помогать людям решать их проблемы', scores:{S:1}},
      {text:'Б — Анализировать поведение людей с научной точки зрения', scores:{I:1}},
    ]
  },
  { id:'holland_20', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Работать в команде, поддерживать и вдохновлять коллег', scores:{S:1}},
      {text:'Б — Работать самостоятельно в мастерской, лаборатории, на площадке', scores:{R:1}},
    ]
  },
  { id:'holland_21', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Убедить группу попробовать новый способ решения задачи', scores:{E:1}},
      {text:'Б — Составить чёткий план и распределить задачи по шагам', scores:{C:1}},
    ]
  },
  { id:'holland_22', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Придумать бизнес-идею и найти людей для её реализации', scores:{E:1}},
      {text:'Б — Сделать что-то своими руками — построить, вырастить, смастерить', scores:{R:1}},
    ]
  },
  { id:'holland_23', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Основать собственное дело или проект', scores:{E:1}},
      {text:'Б — Провести глубокое исследование в интересной теме', scores:{I:1}},
    ]
  },
  { id:'holland_24', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Выступать перед аудиторией и вдохновлять людей', scores:{E:1}},
      {text:'Б — Выступать как автор — режиссёр, писатель, художник', scores:{A:1}},
    ]
  },
  { id:'holland_25', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Вести переговоры и добиваться нужного результата', scores:{E:1}},
      {text:'Б — Поддерживать людей в трудные моменты', scores:{S:1}},
    ]
  },
  { id:'holland_26', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Аккуратно заполнить таблицу с данными и проверить ошибки', scores:{C:1}},
      {text:'Б — Собрать модель или конструктор по схеме', scores:{R:1}},
    ]
  },
  { id:'holland_27', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Работать по чёткой инструкции и проверять соблюдение правил', scores:{C:1}},
      {text:'Б — Решать сложные логические задачи, где правил ещё нет', scores:{I:1}},
    ]
  },
  { id:'holland_28', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Проверить документ на ошибки и привести его в порядок', scores:{C:1}},
      {text:'Б — Искать нестандартные образные решения', scores:{A:1}},
    ]
  },
  { id:'holland_29', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Работать с цифрами, таблицами, отчётами', scores:{C:1}},
      {text:'Б — Работать с людьми — слушать, поддерживать, помогать', scores:{S:1}},
    ]
  },
  { id:'holland_30', block:'holland', type:'pair',
    text:'Что тебе ближе?',
    options:[
      {text:'А — Тщательно готовиться и действовать по проверенному плану', scores:{C:1}},
      {text:'Б — Принимать быстрые решения в условиях неопределённости', scores:{E:1}},
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 3 — ЖИЗНЕННЫЕ ЦЕННОСТИ (28 дилемм, ось ХОЧУ)
  // KR=Креативность, AK=Контакты, RZ=Развитие, DU=Духовное
  // PR=Престиж, MB=Материальное, DO=Достижения, IN=Индивидуальность
  // ══════════════════════════════════════════════════════════════

  { id:'values_01', block:'values', type:'pair',
    text:'Тебе предлагают два проекта на лето:',
    options:[
      {text:'А — Создать авторский блог или канал в своём стиле', scores:{KR:1}},
      {text:'Б — Стать организатором молодёжного фестиваля, работать с людьми', scores:{AK:1}},
    ]
  },
  { id:'values_02', block:'values', type:'pair',
    text:'У тебя есть свободный месяц:',
    options:[
      {text:'А — Сделать собственный творческий проект — фильм, книгу, игру', scores:{KR:1}},
      {text:'Б — Пройти интенсивный курс по новому навыку', scores:{RZ:1}},
    ]
  },
  { id:'values_03', block:'values', type:'pair',
    text:'Ты выбираешь между двумя направлениями:',
    options:[
      {text:'А — Работа с постоянным творчеством, но непонятно кому нужная', scores:{KR:1}},
      {text:'Б — Работа, совпадающая с ценностями, но мало пространства для идей', scores:{DU:1}},
    ]
  },
  { id:'values_04', block:'values', type:'pair',
    text:'Ты можешь представить проект на конкурсе:',
    options:[
      {text:'А — Экспериментальный нестандартный, может не понравиться жюри', scores:{KR:1}},
      {text:'Б — Проверенный, точно произведёт впечатление и принесёт награду', scores:{PR:1}},
    ]
  },
  { id:'values_05', block:'values', type:'pair',
    text:'Ты выбираешь между двумя подработками:',
    options:[
      {text:'А — Творческий проект мечты, но платят мало', scores:{KR:1}},
      {text:'Б — Менее интересная работа, но доход в два раза выше', scores:{MB:1}},
    ]
  },
  { id:'values_06', block:'values', type:'pair',
    text:'Ты работаешь над задачей:',
    options:[
      {text:'А — Хочешь найти необычное решение, даже если займёт больше времени', scores:{KR:1}},
      {text:'Б — Хочешь сделать быстро и качественно, получить лучший результат', scores:{DO:1}},
    ]
  },
  { id:'values_07', block:'values', type:'pair',
    text:'Ты придумал(а) идею для проекта:',
    options:[
      {text:'А — Она творческая и яркая, но придётся работать в чужом формате', scores:{KR:1}},
      {text:'Б — Она проще, зато полностью твоя — делаешь как считаешь нужным', scores:{IN:1}},
    ]
  },
  { id:'values_08', block:'values', type:'pair',
    text:'У тебя свободный вечер:',
    options:[
      {text:'А — Провести время с друзьями, помочь кому-то, пообщаться', scores:{AK:1}},
      {text:'Б — Остаться одному и разобраться в новой теме', scores:{RZ:1}},
    ]
  },
  { id:'values_09', block:'values', type:'pair',
    text:'Тебе предлагают две роли в волонтёрской организации:',
    options:[
      {text:'А — Координатор: много общения, встреч, организации людей', scores:{AK:1}},
      {text:'Б — Работа один на один с теми, кому нужна помощь — глубоко и осмысленно', scores:{DU:1}},
    ]
  },
  { id:'values_10', block:'values', type:'pair',
    text:'На школьном мероприятии ты можешь:',
    options:[
      {text:'А — Быть ведущим — общаться с залом, создавать атмосферу', scores:{AK:1}},
      {text:'Б — Быть главным организатором — не на сцене, но все знают, что это твоя заслуга', scores:{PR:1}},
    ]
  },
  { id:'values_11', block:'values', type:'pair',
    text:'Тебе предлагают два варианта лета:',
    options:[
      {text:'А — Волонтёрский лагерь: люди, знакомства, помощь другим, без дохода', scores:{AK:1}},
      {text:'Б — Оплачиваемая стажировка: работа самостоятельная, зато к осени будут деньги', scores:{MB:1}},
    ]
  },
  { id:'values_12', block:'values', type:'pair',
    text:'Ты капитан команды. Впереди финал:',
    options:[
      {text:'А — Важнее, чтобы все чувствовали себя частью команды, даже если снизит шансы', scores:{AK:1}},
      {text:'Б — Важнее победить, даже если придётся принять непопулярные решения', scores:{DO:1}},
    ]
  },
  { id:'values_13', block:'values', type:'pair',
    text:'В компании друзей разгорается спор:',
    options:[
      {text:'А — Стараешься примирить стороны и сохранить хорошие отношения', scores:{AK:1}},
      {text:'Б — Говоришь то, что думаешь, даже если вызовет напряжение', scores:{IN:1}},
    ]
  },
  { id:'values_14', block:'values', type:'pair',
    text:'Ты выбираешь, как провести выходные:',
    options:[
      {text:'А — Пройти мастер-класс по интересной теме — вырасти как профессионал', scores:{RZ:1}},
      {text:'Б — Провести день в тишине — гулять, думать, перезагрузиться', scores:{DU:1}},
    ]
  },
  { id:'values_15', block:'values', type:'pair',
    text:'Тебе предлагают две программы обучения:',
    options:[
      {text:'А — Интенсивный курс от сильного преподавателя — реальные знания, но никто не узнает', scores:{RZ:1}},
      {text:'Б — Программа известного университета — знания послабее, зато в резюме строчка', scores:{PR:1}},
    ]
  },
  { id:'values_16', block:'values', type:'pair',
    text:'После школы ты выбираешь:',
    options:[
      {text:'А — Поступить на сложную специальность с сильным образованием, но перспективы неясны', scores:{RZ:1}},
      {text:'Б — Пойти туда, где точно высокий доход через 4 года', scores:{MB:1}},
    ]
  },
  { id:'values_17', block:'values', type:'pair',
    text:'Ты работаешь над проектом:',
    options:[
      {text:'А — Хочешь разобраться максимально глубоко ради знаний, даже если не успеешь к дедлайну', scores:{RZ:1}},
      {text:'Б — Хочешь закончить вовремя и показать результат — ради победы', scores:{DO:1}},
    ]
  },
  { id:'values_18', block:'values', type:'pair',
    text:'Ты узнал(а), что есть новый подход, противоречащий твоему мнению:',
    options:[
      {text:'А — С интересом изучишь и, если он лучше, изменишь мнение', scores:{RZ:1}},
      {text:'Б — Останешься при своём — твоя позиция проверена опытом', scores:{IN:1}},
    ]
  },
  { id:'values_19', block:'values', type:'pair',
    text:'Тебе предлагают должность:',
    options:[
      {text:'А — Работа, полностью совпадающая с твоими ценностями, но мало кто о ней слышал', scores:{DU:1}},
      {text:'Б — Престижная позиция, которую уважают все, но работа без внутреннего отклика', scores:{PR:1}},
    ]
  },
  { id:'values_20', block:'values', type:'pair',
    text:'Ты выбираешь между двумя путями:',
    options:[
      {text:'А — Жить по своим ценностям, даже если это означает более скромный уровень жизни', scores:{DU:1}},
      {text:'Б — Обеспечить себе и близким комфортную жизнь, даже если работа не вдохновляет', scores:{MB:1}},
    ]
  },
  { id:'values_21', block:'values', type:'pair',
    text:'Ты достиг(ла) цели, но способ вызывает сомнения:',
    options:[
      {text:'А — Важнее, чтобы путь был честным и осмысленным, даже если результат скромнее', scores:{DU:1}},
      {text:'Б — Важнее результат — главное, что цель достигнута', scores:{DO:1}},
    ]
  },
  { id:'values_22', block:'values', type:'pair',
    text:'Твои ценности отличаются от ценностей близкого круга:',
    options:[
      {text:'А — Стараешься найти общие смыслы и прийти к пониманию', scores:{DU:1}},
      {text:'Б — Остаёшься при своём — важнее быть собой, чем быть понятым', scores:{IN:1}},
    ]
  },
  { id:'values_23', block:'values', type:'pair',
    text:'Тебе предлагают две позиции:',
    options:[
      {text:'А — Должность с громким названием и высоким статусом, но зарплата средняя', scores:{PR:1}},
      {text:'Б — Обычная должность без статуса, но зарплата значительно выше', scores:{MB:1}},
    ]
  },
  { id:'values_24', block:'values', type:'pair',
    text:'Ты завершил(а) проект:',
    options:[
      {text:'А — Важнее, чтобы другие это оценили и признали', scores:{PR:1}},
      {text:'Б — Важнее, что ты сам(а) знаешь — результат достигнут', scores:{DO:1}},
    ]
  },
  { id:'values_25', block:'values', type:'pair',
    text:'Ты можешь выбрать стиль поведения:',
    options:[
      {text:'А — Быть человеком, которого уважают и слушают — ради этого иногда подстраиваться', scores:{PR:1}},
      {text:'Б — Быть собой и жить по своим правилам, даже если это не вызывает восхищения', scores:{IN:1}},
    ]
  },
  { id:'values_26', block:'values', type:'pair',
    text:'Тебе предлагают два проекта:',
    options:[
      {text:'А — Проект с гарантированным доходом, но без амбициозной цели', scores:{MB:1}},
      {text:'Б — Амбициозный проект с возможностью большой победы, но финансово рискованный', scores:{DO:1}},
    ]
  },
  { id:'values_27', block:'values', type:'pair',
    text:'Тебе предлагают высокооплачиваемую работу, но с жёсткими правилами:',
    options:[
      {text:'А — Соглашаешься — деньги дают свободу в остальном', scores:{MB:1}},
      {text:'Б — Отказываешься — не готов(а) жить по чужим правилам ради денег', scores:{IN:1}},
    ]
  },
  { id:'values_28', block:'values', type:'pair',
    text:'Ты участвуешь в конкурсе:',
    options:[
      {text:'А — Готов(а) адаптировать свой проект под требования жюри, чтобы победить', scores:{DO:1}},
      {text:'Б — Сделаешь по-своему, даже если уменьшит шансы на победу', scores:{IN:1}},
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 4 — ЛИЧНОСТНЫЕ КАЧЕСТВА (35 вопросов, ось КТО Я)
  // Шкала 1–5: AG=Дружелюбие, CO=Добросовестность, EX=Экстраверсия
  //             OP=Открытость, ES=Эмоц.стабильность, AN=Тревожность
  //             SC=Самоконтроль
  // ══════════════════════════════════════════════════════════════

  { id:'personality_01', block:'personality', type:'scale',
    text:'Я стараюсь помочь другим, даже когда мне самому(ой) трудно.',
    options:[{text:'1 — совсем не про меня',scores:{AG:1}},{text:'2',scores:{AG:2}},{text:'3 — частично',scores:{AG:3}},{text:'4',scores:{AG:4}},{text:'5 — это точно про меня',scores:{AG:5}}]
  },
  { id:'personality_02', block:'personality', type:'scale',
    text:'Я предпочитаю быть в компании людей, а не наедине с собой.',
    options:[{text:'1',scores:{EX:1}},{text:'2',scores:{EX:2}},{text:'3',scores:{EX:3}},{text:'4',scores:{EX:4}},{text:'5',scores:{EX:5}}]
  },
  { id:'personality_03', block:'personality', type:'scale',
    text:'Я люблю пробовать новые занятия, жанры, форматы.',
    options:[{text:'1',scores:{OP:1}},{text:'2',scores:{OP:2}},{text:'3',scores:{OP:3}},{text:'4',scores:{OP:4}},{text:'5',scores:{OP:5}}]
  },
  { id:'personality_04', block:'personality', type:'scale',
    text:'Я всегда довожу начатое дело до конца, даже если стало скучно.',
    options:[{text:'1',scores:{CO:1}},{text:'2',scores:{CO:2}},{text:'3',scores:{CO:3}},{text:'4',scores:{CO:4}},{text:'5',scores:{CO:5}}]
  },
  { id:'personality_05', block:'personality', type:'scale',
    text:'Я остаюсь спокойным(ой), когда что-то идёт не по плану.',
    options:[{text:'1',scores:{ES:1}},{text:'2',scores:{ES:2}},{text:'3',scores:{ES:3}},{text:'4',scores:{ES:4}},{text:'5',scores:{ES:5}}]
  },
  { id:'personality_06', block:'personality', type:'scale',
    text:'Я часто беспокоюсь о том, что может пойти не так.',
    options:[{text:'1',scores:{AN:1}},{text:'2',scores:{AN:2}},{text:'3',scores:{AN:3}},{text:'4',scores:{AN:4}},{text:'5',scores:{AN:5}}]
  },
  { id:'personality_07', block:'personality', type:'scale',
    text:'Я умею контролировать свои порывы и не делать лишнего.',
    options:[{text:'1',scores:{SC:1}},{text:'2',scores:{SC:2}},{text:'3',scores:{SC:3}},{text:'4',scores:{SC:4}},{text:'5',scores:{SC:5}}]
  },
  { id:'personality_08', block:'personality', type:'scale',
    text:'Мне нравится быть в центре внимания на вечеринках и встречах.',
    options:[{text:'1',scores:{EX:1}},{text:'2',scores:{EX:2}},{text:'3',scores:{EX:3}},{text:'4',scores:{EX:4}},{text:'5',scores:{EX:5}}]
  },
  { id:'personality_09', block:'personality', type:'scale',
    text:'Я сочувствую людям и стараюсь понять их чувства.',
    options:[{text:'1',scores:{AG:1}},{text:'2',scores:{AG:2}},{text:'3',scores:{AG:3}},{text:'4',scores:{AG:4}},{text:'5',scores:{AG:5}}]
  },
  { id:'personality_10', block:'personality', type:'scale',
    text:'Меня увлекают сложные и нестандартные идеи.',
    options:[{text:'1',scores:{OP:1}},{text:'2',scores:{OP:2}},{text:'3',scores:{OP:3}},{text:'4',scores:{OP:4}},{text:'5',scores:{OP:5}}]
  },
  { id:'personality_11', block:'personality', type:'scale',
    text:'Я планирую свои дела заранее и придерживаюсь плана.',
    options:[{text:'1',scores:{CO:1}},{text:'2',scores:{CO:2}},{text:'3',scores:{CO:3}},{text:'4',scores:{CO:4}},{text:'5',scores:{CO:5}}]
  },
  { id:'personality_12', block:'personality', type:'scale',
    text:'Я легко могу разозлиться или расстроиться из-за мелочей.',
    options:[{text:'1',scores:{ES:5}},{text:'2',scores:{ES:4}},{text:'3',scores:{ES:3}},{text:'4',scores:{ES:2}},{text:'5',scores:{ES:1}}]
  },
  { id:'personality_13', block:'personality', type:'scale',
    text:'Перед важным событием я долго не могу успокоиться.',
    options:[{text:'1',scores:{AN:1}},{text:'2',scores:{AN:2}},{text:'3',scores:{AN:3}},{text:'4',scores:{AN:4}},{text:'5',scores:{AN:5}}]
  },
  { id:'personality_14', block:'personality', type:'scale',
    text:'Я действую обдуманно и не бросаюсь в дела сгоряча.',
    options:[{text:'1',scores:{SC:1}},{text:'2',scores:{SC:2}},{text:'3',scores:{SC:3}},{text:'4',scores:{SC:4}},{text:'5',scores:{SC:5}}]
  },
  { id:'personality_15', block:'personality', type:'scale',
    text:'После общения с людьми я чувствую прилив сил, а не усталость.',
    options:[{text:'1',scores:{EX:1}},{text:'2',scores:{EX:2}},{text:'3',scores:{EX:3}},{text:'4',scores:{EX:4}},{text:'5',scores:{EX:5}}]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 5 — ТИП ИНТЕЛЛЕКТА (28 вопросов, ось МОГУ)
  // VB=Языковой, LM=Логико-матем, SP=Простр-визуал, BK=Телесный
  // MS=Музыкальный, IP=Интерперсональный, IA=Интраперсональный
  // ══════════════════════════════════════════════════════════════

  { id:'intelligence_01', block:'intelligence', type:'scale',
    text:'Мне легко объяснять сложные вещи простыми словами.',
    options:[{text:'1',scores:{VB:1}},{text:'2',scores:{VB:2}},{text:'3',scores:{VB:3}},{text:'4',scores:{VB:4}},{text:'5',scores:{VB:5}}]
  },
  { id:'intelligence_02', block:'intelligence', type:'scale',
    text:'Я люблю решать задачи, где нужно найти закономерность.',
    options:[{text:'1',scores:{LM:1}},{text:'2',scores:{LM:2}},{text:'3',scores:{LM:3}},{text:'4',scores:{LM:4}},{text:'5',scores:{LM:5}}]
  },
  { id:'intelligence_03', block:'intelligence', type:'scale',
    text:'Мне легко представить, как выглядит объект с другой стороны.',
    options:[{text:'1',scores:{SP:1}},{text:'2',scores:{SP:2}},{text:'3',scores:{SP:3}},{text:'4',scores:{SP:4}},{text:'5',scores:{SP:5}}]
  },
  { id:'intelligence_04', block:'intelligence', type:'scale',
    text:'Я лучше запоминаю информацию, когда делаю что-то руками.',
    options:[{text:'1',scores:{BK:1}},{text:'2',scores:{BK:2}},{text:'3',scores:{BK:3}},{text:'4',scores:{BK:4}},{text:'5',scores:{BK:5}}]
  },
  { id:'intelligence_05', block:'intelligence', type:'scale',
    text:'Я хорошо чувствую ритм и замечаю музыкальные детали.',
    options:[{text:'1',scores:{MS:1}},{text:'2',scores:{MS:2}},{text:'3',scores:{MS:3}},{text:'4',scores:{MS:4}},{text:'5',scores:{MS:5}}]
  },
  { id:'intelligence_06', block:'intelligence', type:'scale',
    text:'Я хорошо понимаю, что чувствуют люди вокруг меня.',
    options:[{text:'1',scores:{IP:1}},{text:'2',scores:{IP:2}},{text:'3',scores:{IP:3}},{text:'4',scores:{IP:4}},{text:'5',scores:{IP:5}}]
  },
  { id:'intelligence_07', block:'intelligence', type:'scale',
    text:'Я часто анализирую свои мысли, чувства и мотивы.',
    options:[{text:'1',scores:{IA:1}},{text:'2',scores:{IA:2}},{text:'3',scores:{IA:3}},{text:'4',scores:{IA:4}},{text:'5',scores:{IA:5}}]
  },
  { id:'intelligence_08', block:'intelligence', type:'scale',
    text:'Мне нравится читать и писать — это даётся легко.',
    options:[{text:'1',scores:{VB:1}},{text:'2',scores:{VB:2}},{text:'3',scores:{VB:3}},{text:'4',scores:{VB:4}},{text:'5',scores:{VB:5}}]
  },
  { id:'intelligence_09', block:'intelligence', type:'scale',
    text:'Мне легко считать в уме и работать с числами.',
    options:[{text:'1',scores:{LM:1}},{text:'2',scores:{LM:2}},{text:'3',scores:{LM:3}},{text:'4',scores:{LM:4}},{text:'5',scores:{LM:5}}]
  },
  { id:'intelligence_10', block:'intelligence', type:'scale',
    text:'Мне нравится рисовать, фотографировать, создавать визуальное.',
    options:[{text:'1',scores:{SP:1}},{text:'2',scores:{SP:2}},{text:'3',scores:{SP:3}},{text:'4',scores:{SP:4}},{text:'5',scores:{SP:5}}]
  },
  { id:'intelligence_11', block:'intelligence', type:'scale',
    text:'Я занимаюсь спортом или танцами и тело слушается меня хорошо.',
    options:[{text:'1',scores:{BK:1}},{text:'2',scores:{BK:2}},{text:'3',scores:{BK:3}},{text:'4',scores:{BK:4}},{text:'5',scores:{BK:5}}]
  },
  { id:'intelligence_12', block:'intelligence', type:'scale',
    text:'Я могу подобрать мелодию на слух или легко воспроизвести её.',
    options:[{text:'1',scores:{MS:1}},{text:'2',scores:{MS:2}},{text:'3',scores:{MS:3}},{text:'4',scores:{MS:4}},{text:'5',scores:{MS:5}}]
  },
  { id:'intelligence_13', block:'intelligence', type:'scale',
    text:'Я умею убеждать, вести за собой и вдохновлять группу.',
    options:[{text:'1',scores:{IP:1}},{text:'2',scores:{IP:2}},{text:'3',scores:{IP:3}},{text:'4',scores:{IP:4}},{text:'5',scores:{IP:5}}]
  },
  { id:'intelligence_14', block:'intelligence', type:'scale',
    text:'Я хорошо знаю свои сильные и слабые стороны.',
    options:[{text:'1',scores:{IA:1}},{text:'2',scores:{IA:2}},{text:'3',scores:{IA:3}},{text:'4',scores:{IA:4}},{text:'5',scores:{IA:5}}]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 6 — ПРОФЕССИОНАЛЬНАЯ ГОТОВНОСТЬ (20 вопросов, ось МОГУ)
  // HH=Человек-Человек, HT=Человек-Техника, HZ=Человек-Знак
  // HO=Человек-Образ, HP=Человек-Природа
  // ══════════════════════════════════════════════════════════════

  { id:'readiness_01', block:'readiness', type:'scale',
    text:'Мне нравится помогать другим людям решать их проблемы.',
    options:[{text:'1',scores:{HH:1}},{text:'2',scores:{HH:2}},{text:'3',scores:{HH:3}},{text:'4',scores:{HH:4}},{text:'5',scores:{HH:5}}]
  },
  { id:'readiness_02', block:'readiness', type:'scale',
    text:'Мне нравится разбираться в том, как работают технические устройства.',
    options:[{text:'1',scores:{HT:1}},{text:'2',scores:{HT:2}},{text:'3',scores:{HT:3}},{text:'4',scores:{HT:4}},{text:'5',scores:{HT:5}}]
  },
  { id:'readiness_03', block:'readiness', type:'scale',
    text:'Мне легко работать с текстами, формулами, кодом, символами.',
    options:[{text:'1',scores:{HZ:1}},{text:'2',scores:{HZ:2}},{text:'3',scores:{HZ:3}},{text:'4',scores:{HZ:4}},{text:'5',scores:{HZ:5}}]
  },
  { id:'readiness_04', block:'readiness', type:'scale',
    text:'Мне нравится создавать красивое — рисовать, фотографировать, писать тексты.',
    options:[{text:'1',scores:{HO:1}},{text:'2',scores:{HO:2}},{text:'3',scores:{HO:3}},{text:'4',scores:{HO:4}},{text:'5',scores:{HO:5}}]
  },
  { id:'readiness_05', block:'readiness', type:'scale',
    text:'Мне нравится наблюдать за природой, работать с животными или растениями.',
    options:[{text:'1',scores:{HP:1}},{text:'2',scores:{HP:2}},{text:'3',scores:{HP:3}},{text:'4',scores:{HP:4}},{text:'5',scores:{HP:5}}]
  },
  { id:'readiness_06', block:'readiness', type:'scale',
    text:'Меня легко понимают, когда я объясняю что-то сложное.',
    options:[{text:'1',scores:{HH:1}},{text:'2',scores:{HH:2}},{text:'3',scores:{HH:3}},{text:'4',scores:{HH:4}},{text:'5',scores:{HH:5}}]
  },
  { id:'readiness_07', block:'readiness', type:'scale',
    text:'Я умею починить или настроить технику лучше большинства одноклассников.',
    options:[{text:'1',scores:{HT:1}},{text:'2',scores:{HT:2}},{text:'3',scores:{HT:3}},{text:'4',scores:{HT:4}},{text:'5',scores:{HT:5}}]
  },
  { id:'readiness_08', block:'readiness', type:'scale',
    text:'Я хорошо нахожу ошибки в тексте или в расчётах.',
    options:[{text:'1',scores:{HZ:1}},{text:'2',scores:{HZ:2}},{text:'3',scores:{HZ:3}},{text:'4',scores:{HZ:4}},{text:'5',scores:{HZ:5}}]
  },
  { id:'readiness_09', block:'readiness', type:'scale',
    text:'Мои творческие работы отмечают учителя или друзья.',
    options:[{text:'1',scores:{HO:1}},{text:'2',scores:{HO:2}},{text:'3',scores:{HO:3}},{text:'4',scores:{HO:4}},{text:'5',scores:{HO:5}}]
  },
  { id:'readiness_10', block:'readiness', type:'scale',
    text:'Я хорошо замечаю изменения в природе, разбираюсь в биологии или экологии.',
    options:[{text:'1',scores:{HP:1}},{text:'2',scores:{HP:2}},{text:'3',scores:{HP:3}},{text:'4',scores:{HP:4}},{text:'5',scores:{HP:5}}]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 7 — САМОЭФФЕКТИВНОСТЬ (25 вопросов, ось КТО Я)
  // SE=Самоэффективность, DEC=Стиль решений
  // ══════════════════════════════════════════════════════════════

  { id:'self_efficacy_01', block:'self_efficacy', type:'scale',
    text:'Если я поставлю цель, то добьюсь её, даже если это займёт много времени.',
    options:[{text:'1',scores:{SE:1}},{text:'2',scores:{SE:2}},{text:'3',scores:{SE:3}},{text:'4',scores:{SE:4}},{text:'5',scores:{SE:5}}]
  },
  { id:'self_efficacy_02', block:'self_efficacy', type:'scale',
    text:'Когда что-то не получается, я нахожу другой способ, а не бросаю дело.',
    options:[{text:'1',scores:{SE:1}},{text:'2',scores:{SE:2}},{text:'3',scores:{SE:3}},{text:'4',scores:{SE:4}},{text:'5',scores:{SE:5}}]
  },
  { id:'self_efficacy_03', block:'self_efficacy', type:'scale',
    text:'Я верю, что справлюсь с трудными задачами в своей будущей профессии.',
    options:[{text:'1',scores:{SE:1}},{text:'2',scores:{SE:2}},{text:'3',scores:{SE:3}},{text:'4',scores:{SE:4}},{text:'5',scores:{SE:5}}]
  },
  { id:'self_efficacy_04', block:'self_efficacy', type:'scale',
    text:'Когда нужно принять важное решение, я обычно собираю информацию и взвешиваю варианты.',
    options:[{text:'1',scores:{DEC_A:1}},{text:'2',scores:{DEC_A:2}},{text:'3',scores:{DEC_A:3}},{text:'4',scores:{DEC_A:4}},{text:'5',scores:{DEC_A:5}}]
  },
  { id:'self_efficacy_05', block:'self_efficacy', type:'scale',
    text:'Я часто принимаю решения быстро, опираясь на интуицию.',
    options:[{text:'1',scores:{DEC_I:1}},{text:'2',scores:{DEC_I:2}},{text:'3',scores:{DEC_I:3}},{text:'4',scores:{DEC_I:4}},{text:'5',scores:{DEC_I:5}}]
  },
  { id:'self_efficacy_06', block:'self_efficacy', type:'scale',
    text:'Я откладываю важные решения как можно дольше.',
    options:[{text:'1',scores:{DEC_AV:1}},{text:'2',scores:{DEC_AV:2}},{text:'3',scores:{DEC_AV:3}},{text:'4',scores:{DEC_AV:4}},{text:'5',scores:{DEC_AV:5}}]
  },
  { id:'self_efficacy_07', block:'self_efficacy', type:'scale',
    text:'Прежде чем решить, я советуюсь с близкими или авторитетными людьми.',
    options:[{text:'1',scores:{DEC_D:1}},{text:'2',scores:{DEC_D:2}},{text:'3',scores:{DEC_D:3}},{text:'4',scores:{DEC_D:4}},{text:'5',scores:{DEC_D:5}}]
  },
  { id:'self_efficacy_08', block:'self_efficacy', type:'scale',
    text:'Я верю, что могу освоить любую профессию, если постараюсь.',
    options:[{text:'1',scores:{SE:1}},{text:'2',scores:{SE:2}},{text:'3',scores:{SE:3}},{text:'4',scores:{SE:4}},{text:'5',scores:{SE:5}}]
  },
  { id:'self_efficacy_09', block:'self_efficacy', type:'scale',
    text:'Ошибки и неудачи меня мотивируют стараться больше.',
    options:[{text:'1',scores:{SE:1}},{text:'2',scores:{SE:2}},{text:'3',scores:{SE:3}},{text:'4',scores:{SE:4}},{text:'5',scores:{SE:5}}]
  },
  { id:'self_efficacy_10', block:'self_efficacy', type:'scale',
    text:'Мне тяжело принять решение без чёткого понимания всех последствий.',
    options:[{text:'1',scores:{DEC_A:1}},{text:'2',scores:{DEC_A:2}},{text:'3',scores:{DEC_A:3}},{text:'4',scores:{DEC_A:4}},{text:'5',scores:{DEC_A:5}}]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 8 — ОБРАЗ БУДУЩЕГО (10 вопросов, ось ХОЧУ)
  // ══════════════════════════════════════════════════════════════

  { id:'future_01', block:'future', type:'scale',
    text:'Насколько чётко ты представляешь себя через 5 лет?',
    options:[{text:'1 — совсем не представляю',scores:{future_clarity:1}},{text:'2',scores:{future_clarity:2}},{text:'3 — есть смутный образ',scores:{future_clarity:3}},{text:'4',scores:{future_clarity:4}},{text:'5 — очень чётко',scores:{future_clarity:5}}]
  },
  { id:'future_02', block:'future', type:'single',
    text:'Что для тебя важнее в жизни?',
    options:[
      {text:'Стабильность и предсказуемость', scores:{future_type:'stable'}},
      {text:'Постоянное развитие и новые вызовы', scores:{future_type:'growth'}},
      {text:'Баланс: и стабильность, и развитие', scores:{future_type:'balance'}},
    ]
  },
  { id:'future_03', block:'future', type:'scale',
    text:'Насколько ты готов(а) к неопределённости в работе и жизни?',
    options:[{text:'1 — очень плохо переношу неопределённость',scores:{uncertainty:1}},{text:'2',scores:{uncertainty:2}},{text:'3',scores:{uncertainty:3}},{text:'4',scores:{uncertainty:4}},{text:'5 — легко работаю с неопределённостью',scores:{uncertainty:5}}]
  },
  { id:'future_04', block:'future', type:'single',
    text:'Хочешь работать в команде или самостоятельно?',
    options:[
      {text:'В большой команде', scores:{team_pref:'big_team'}},
      {text:'В малой команде или паре', scores:{team_pref:'small_team'}},
      {text:'Самостоятельно', scores:{team_pref:'solo'}},
      {text:'Неважно, главное интересные задачи', scores:{team_pref:'any'}},
    ]
  },
  { id:'future_05', block:'future', type:'single',
    text:'Насколько для тебя важна физическая активность в работе?',
    options:[
      {text:'Очень важна — не хочу сидеть в офисе', scores:{physical:3}},
      {text:'Не против небольшой активности', scores:{physical:2}},
      {text:'Предпочитаю сидячую работу', scores:{physical:1}},
    ]
  },
  { id:'future_06', block:'future', type:'single',
    text:'Отношение к риску в профессии:',
    options:[
      {text:'Избегаю риска — хочу надёжности', scores:{risk:'avoid'}},
      {text:'Нейтрально — если риск оправдан', scores:{risk:'neutral'}},
      {text:'Принимаю риск — интереснее так', scores:{risk:'accept'}},
    ]
  },
  { id:'future_07', block:'future', type:'scale',
    text:'Важно ли тебе признание от других людей?',
    options:[{text:'1 — совсем не важно',scores:{recognition:1}},{text:'2',scores:{recognition:2}},{text:'3',scores:{recognition:3}},{text:'4',scores:{recognition:4}},{text:'5 — очень важно',scores:{recognition:5}}]
  },
  { id:'future_08', block:'future', type:'single',
    text:'Готов(а) ли много учиться после школы (курсы, университет, практика)?',
    options:[
      {text:'Да, готов(а) вложить годы в обучение', scores:{learning_readiness:3}},
      {text:'Готов(а) учиться, но хочу быстрее к практике', scores:{learning_readiness:2}},
      {text:'Хочу меньше учиться и скорее работать', scores:{learning_readiness:1}},
    ]
  },
  { id:'future_09', block:'future', type:'single',
    text:'Важен ли для тебя баланс работы и личной жизни?',
    options:[
      {text:'Очень важен — работа не должна занимать всё время', scores:{balance:3}},
      {text:'Важен, но готов(а) работать много ради интересного дела', scores:{balance:2}},
      {text:'Готов(а) полностью посвятить себя любимому делу', scores:{balance:1}},
    ]
  },
  { id:'future_10', block:'future', type:'single',
    text:'Готов(а) ли ты к длинному пути (7–10 лет подготовки) ради серьёзной профессии?',
    options:[
      {text:'Да, если дело того стоит', scores:{long_path_ready:1}},
      {text:'Желательно побыстрее, но понимаю', scores:{long_path_ready:0.5}},
      {text:'Нет, хочу быстрее', scores:{long_path_ready:0}},
    ]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 9 — СОЦИАЛЬНЫЙ КОНТЕКСТ (20 вопросов)
  // ══════════════════════════════════════════════════════════════

  { id:'social_01', block:'social', type:'single',
    text:'Знаешь ли ты, кем работают твои родители и чем именно занимаются?',
    options:[{text:'Да, хорошо знаю', scores:{family_awareness:3}},{text:'В общих чертах', scores:{family_awareness:2}},{text:'Нет, не интересовался(ась)', scores:{family_awareness:1}}]
  },
  { id:'social_02', block:'social', type:'single',
    text:'Хотел(а) бы ты работать в той же сфере, что и родители?',
    options:[{text:'Да, это интересно', scores:{family_path:'yes'}},{text:'Возможно, если понравится', scores:{family_path:'maybe'}},{text:'Нет, хочу своё', scores:{family_path:'no'}}]
  },
  { id:'social_03', block:'social', type:'scale',
    text:'Насколько родители поддерживают твой выбор профессии?',
    options:[{text:'1 — не поддерживают',scores:{family_support:1}},{text:'2',scores:{family_support:2}},{text:'3',scores:{family_support:3}},{text:'4',scores:{family_support:4}},{text:'5 — полностью поддерживают',scores:{family_support:5}}]
  },
  { id:'social_04', block:'social', type:'single',
    text:'Есть ли конфликты дома из-за учёбы или будущего?',
    options:[{text:'Часто', scores:{family_conflict:3}},{text:'Иногда', scores:{family_conflict:2}},{text:'Нет', scores:{family_conflict:1}}]
  },
  { id:'social_05', block:'social', type:'scale',
    text:'Насколько легко тебе общаться с новыми людьми?',
    options:[{text:'1 — очень сложно',scores:{social_ease:1}},{text:'2',scores:{social_ease:2}},{text:'3',scores:{social_ease:3}},{text:'4',scores:{social_ease:4}},{text:'5 — очень легко',scores:{social_ease:5}}]
  },
  { id:'social_06', block:'social', type:'scale',
    text:'Как ты себя чувствуешь в группе или команде?',
    options:[{text:'1 — некомфортно, лучше один(а)',scores:{group_comfort:1}},{text:'2',scores:{group_comfort:2}},{text:'3 — нейтрально',scores:{group_comfort:3}},{text:'4',scores:{group_comfort:4}},{text:'5 — отлично, мне нравится',scores:{group_comfort:5}}]
  },
  { id:'social_07', block:'social', type:'single',
    text:'Участвуешь ли ты в секциях, кружках, клубах, волонтёрстве?',
    options:[{text:'Да, активно участвую в нескольких', scores:{extracurricular:'active'}},{text:'Есть одно постоянное занятие', scores:{extracurricular:'one'}},{text:'Иногда, нерегулярно', scores:{extracurricular:'sometimes'}},{text:'Нет, не участвую', scores:{extracurricular:'none'}}]
  },
  { id:'social_08', block:'social', type:'single',
    text:'Был(а) ли у тебя реальный опыт подработки, стажировки или серьёзного проекта?',
    options:[{text:'Да, работал(а) по договору или официально', scores:{work_exp:3}},{text:'Да, небольшие проекты или разовые задачи', scores:{work_exp:2}},{text:'Волонтёрство или школьные проекты', scores:{work_exp:1.5}},{text:'Нет, пока не было', scores:{work_exp:0}}]
  },
  { id:'social_09', block:'social', type:'single',
    text:'Участвовал(а) ли в олимпиадах или конкурсах по любым предметам?',
    options:[{text:'Да, побеждал(а)', scores:{competition:3}},{text:'Да, без призов', scores:{competition:2}},{text:'Нет', scores:{competition:0}}]
  },
  { id:'social_10', block:'social', type:'single',
    text:'Читаешь ли ты про какую-то сферу сам(а), без задания?',
    options:[{text:'Да, регулярно и много', scores:{self_learning:3}},{text:'Иногда', scores:{self_learning:2}},{text:'Нет, только по учёбе', scores:{self_learning:1}}]
  },
  { id:'social_11', block:'social', type:'single',
    text:'Есть ли у тебя серьёзное хобби (2+ года)?',
    options:[{text:'Да', scores:{serious_hobby:1}},{text:'Нет', scores:{serious_hobby:0}}]
  },
  { id:'social_12', block:'social', type:'single',
    text:'Хотел(а) бы связать хобби с профессией?',
    options:[{text:'Да, мечтаю об этом', scores:{hobby_to_career:3}},{text:'Не против, если получится', scores:{hobby_to_career:2}},{text:'Нет, хобби — отдельно', scores:{hobby_to_career:1}}]
  },
  { id:'social_13', block:'social', type:'single',
    text:'Есть ли человек, который верит в тебя и поддерживает?',
    options:[{text:'Да, и это очень важно для меня', scores:{support:3}},{text:'Да, но общаемся редко', scores:{support:2}},{text:'Нет такого человека', scores:{support:0}}]
  },
  { id:'social_14', block:'social', type:'single',
    text:'Насколько важно тебе мнение друзей о выборе профессии?',
    options:[{text:'Очень важно — хочу, чтобы уважали выбор', scores:{peer_pressure:3}},{text:'Прислушиваюсь, но решаю сам(а)', scores:{peer_pressure:2}},{text:'Не важно совсем', scores:{peer_pressure:1}}]
  },
  { id:'social_15', block:'social', type:'single',
    text:'Есть ли финансовые ограничения в твоих образовательных планах?',
    options:[{text:'Да, сильные ограничения', scores:{financial_limit:3}},{text:'Есть, но родители помогут', scores:{financial_limit:2}},{text:'Нет ограничений', scores:{financial_limit:1}}]
  },

  // ══════════════════════════════════════════════════════════════
  // БЛОК 10 — ПИСЬМО В БУДУЩЕЕ (19 открытых вопросов)
  // ══════════════════════════════════════════════════════════════

  { id:'letter_01', block:'letter', type:'open',
    text:'Опиши свой обычный день — что ты делаешь, с кем взаимодействуешь, что тебя заряжает, а что забирает энергию?',
    options:[], answer: ''
  },
  { id:'letter_02', block:'letter', type:'open',
    text:'Чем ты сейчас занимаешься — учёба, хобби, дела? Что из этого приносит удовольствие, а что кажется не твоим?',
    options:[], answer: ''
  },
  { id:'letter_03', block:'letter', type:'open',
    text:'Напиши 5–7 слов, которые описывают тебя сегодня. Без цензуры, первое что приходит в голову.',
    options:[], answer: ''
  },
  { id:'letter_04', block:'letter', type:'open',
    text:'Что тебя сейчас тревожит или удерживает? Назови это прямо.',
    options:[], answer: ''
  },
  { id:'letter_05', block:'letter', type:'open',
    text:'Представь: прошло 5 лет. Утро понедельника. Где ты и что делаешь? Опиши этот день подробно. Пиши в настоящем времени.',
    options:[], answer: ''
  },
  { id:'letter_06', block:'letter', type:'open',
    text:'Кем ты стал(а) профессионально через 5 лет? Какую роль занимаешь, в чём эксперт?',
    options:[], answer: ''
  },
  { id:'letter_07', block:'letter', type:'open',
    text:'Что ты создал(а) или построил(а) за эти 5 лет? Что существует в мире благодаря тебе?',
    options:[], answer: ''
  },
  { id:'letter_08', block:'letter', type:'open',
    text:'Как изменилось твоё окружение — люди, команда, среда? Кто есть рядом?',
    options:[], answer: ''
  },
  { id:'letter_09', block:'letter', type:'open',
    text:'Что говорят о тебе люди, чьё мнение тебе важно? Напиши 2–3 фразы от их лица.',
    options:[], answer: ''
  },
  { id:'letter_10', block:'letter', type:'open',
    text:'Ради чего всё это? Что для тебя по-настоящему важно в жизни и работе?',
    options:[], answer: ''
  },
  { id:'letter_11', block:'letter', type:'open',
    text:'Какой след хочешь оставить — через 5 лет, через 20 лет?',
    options:[], answer: ''
  },
  { id:'letter_12', block:'letter', type:'open',
    text:'Что для тебя означает «успех»? Дай своё определение, не чужое.',
    options:[], answer: ''
  },
  { id:'letter_13', block:'letter', type:'open',
    text:'Чем готов(а) пожертвовать ради желаемого будущего? А чем — нет?',
    options:[], answer: ''
  },
  { id:'letter_14', block:'letter', type:'open',
    text:'Что нужно сделать в ближайшие 12 месяцев, чтобы двигаться в нужную сторону? Назови 3–5 шагов.',
    options:[], answer: ''
  },
  { id:'letter_15', block:'letter', type:'open',
    text:'Что нужно освоить, изучить или развить? Какие навыки и знания?',
    options:[], answer: ''
  },
  { id:'letter_16', block:'letter', type:'open',
    text:'Что мешает прямо сейчас? Назови главный барьер — внешний и внутренний.',
    options:[], answer: ''
  },
  { id:'letter_17', block:'letter', type:'open',
    text:'Что хочешь сказать себе-будущему? Напутствие, поддержка, разрешение.',
    options:[], answer: ''
  },
  { id:'letter_18', block:'letter', type:'open',
    text:'О чём хочешь спросить себя, когда будешь читать это письмо через год?',
    options:[], answer: ''
  },
  { id:'letter_19', block:'letter', type:'open',
    text:'Чем ты сейчас гордишься — то, что легко забываешь в повседневности?',
    options:[], answer: ''
  },
]

/** Вопросы блока по его id */
export function getBlockQuestions(blockId) {
  return QUESTION_BANK.filter(q => q.block === blockId)
}

/** Все блоки */
export const BLOCKS_META = [
  { id:'context',       num:'01', title:'Анкета-контекст',           questions:20, time:7,  axis:'НАДО'    },
  { id:'holland',       num:'02', title:'Склонности (Holland)',       questions:30, time:15, axis:'ХОЧУ'    },
  { id:'values',        num:'03', title:'Жизненные ценности',        questions:28, time:15, axis:'ХОЧУ'    },
  { id:'personality',   num:'04', title:'Личностные качества',       questions:15, time:12, axis:'КТО Я'   },
  { id:'intelligence',  num:'05', title:'Тип интеллекта',            questions:14, time:12, axis:'МОГУ'    },
  { id:'readiness',     num:'06', title:'Профессиональная готовность',questions:10, time:10, axis:'МОГУ'   },
  { id:'self_efficacy', num:'07', title:'Самоэффективность',         questions:10, time:10, axis:'КТО Я'   },
  { id:'future',        num:'08', title:'Образ будущего',            questions:10, time:8,  axis:'ХОЧУ'    },
  { id:'social',        num:'09', title:'Социальный контекст',       questions:15, time:8,  axis:'КОНТЕКСТ'},
  { id:'letter',        num:'10', title:'Письмо в будущее',          questions:19, time:25, axis:'ХОЧУ', special:true },
]

export const TOTAL_QUESTIONS = QUESTION_BANK.length