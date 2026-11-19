// Registration accepts "Имя Фамилия", while the profile accepts "Фамилия Имя Отчество".
// Explicit first names and the questionnaire's preferred form of address take priority.
const GIVEN_NAMES = new Set(('Александр Алексей Анатолий Андрей Антон Артём Артем Артур Борис Вадим Валентин Валерий Василий Виктор Виталий Владимир Владислав Вячеслав Георгий Глеб Григорий Даниил Данил Денис Дмитрий Евгений Егор Иван Игорь Илья Кирилл Константин Лев Леонид Максим Марк Матвей Михаил Никита Николай Олег Павел Пётр Петр Роман Руслан Сергей Станислав Степан Тимофей Фёдор Федор Юрий Ярослав Алина Алиса Алёна Алена Александра Алла Анастасия Ангелина Анна Арина Валентина Валерия Варвара Василиса Вера Вероника Виктория Галина Дарья Диана Евгения Екатерина Елена Елизавета Жанна Зоя Инна Ирина Карина Кира Кристина Ксения Лариса Лидия Любовь Людмила Маргарита Марина Мария Милана Надежда Наталья Нина Оксана Олеся Ольга Полина Светлана София Софья Таисия Тамара Татьяна Ульяна Элина Юлия Яна').toLocaleLowerCase('ru').split(' '))

function splitFullName(value = '') {
  const parts = String(value).trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { given: '', family: '' }
  const lower = parts.map(part => part.toLocaleLowerCase('ru'))
  const surname = /(?:ов|ев|ёв|ин|ын|ский|цкий|ская|цкая|енко|чук|швили|дзе|ян)(?:а)?$/i
  const familyFirst = parts.length > 1 && !GIVEN_NAMES.has(lower[0]) && (
    GIVEN_NAMES.has(lower[1]) || surname.test(parts[0]) || (parts.length > 2 && /(?:ович|евич|овна|евна|ична)$/i.test(parts[2]))
  )
  return { given: parts[familyFirst ? 1 : 0], family: parts.length > 1 ? parts[familyFirst ? 0 : parts.length - 1] : '' }
}

export function greetingName({ name = '', first_name = '', given_name = '' } = {}, preferredName = '') {
  const full = splitFullName(name)
  const preferred = splitFullName(first_name || given_name || preferredName)
  return { given: preferred.given || full.given || 'Пользователь', family: full.family }
}
