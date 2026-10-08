// Краткое человеческое описание по итогам блока (2–3 предложения, без ИИ).
// Генерится из result блока — мгновенно и бесплатно. Поля см. setResult(...) в каждом Block*.jsx.
// Всё защитно (|| fallback): не хватает поля — предложение просто короче, без падения.

const anxietyWord = (v) => (v >= 4 ? 'высокая' : v === 3 ? 'средняя' : 'спокойная')
const clarityWord = (c) => ({ high: 'высокая', medium: 'средняя', low: 'низкая', none: 'пока нет', uncertain_specific: 'есть идея, но без уверенности' }[c] || '—')
const motivWord = (m) => ({ meaning: 'смысловой — важнее «зачем», чем «сколько»', result: 'результативный — важнее достижение цели', mixed: 'смешанный' }[m] || 'смешанный')
const styleWord = (s) => ({ rational: 'рациональный', intuitive: 'интуитивный', dependent: 'опора на других', avoidant: 'избегающий', spontaneous: 'спонтанный' }[s] || 'смешанный')
const envWord = (e) => ({ stability: 'стабильная среда', growth: 'среда роста и развития', both: 'гибкая среда' }[e] || 'гибкая среда')
const ambWord = (a) => ({ calm: 'спокойная достойная жизнь', success: 'профессиональный успех', legacy: 'значимый след' }[a] || '—')

export function blockSummary(blockNum, r = {}) {
  switch (Number(blockNum)) {
    case 1:
      return `Контекст учтён: определённость с выбором — ${clarityWord(r.choice_clarity)}, тревога вокруг профессии — ${anxietyWord(r.career_anxiety)}. На этом настроены все следующие блоки под твою ситуацию.`
    case 2:
      return `Твой карьерный тип — «${r.career_archetype || '—'}»: именно такая деятельность тебе ближе всего. Ясность профиля ${r.profile_clarity ?? '—'}% показывает, насколько ярко выражены твои интересы.`
    case 3:
      return `В ценностях ведущий мотив — «${r.values_archetype || '—'}», тип мотивации ${motivWord(r.motivation_type)}. Это во многом определяет, что тебе будет важно в будущей работе.`
    case 4: {
      // поля отличаются в живом состоянии блока (archetype/sincerity) и в хранилище
      // (personality_archetype/sincerity_index) — читаем оба
      const arch = r.archetype || r.personality_archetype
      const sinc = r.sincerity ?? r.sincerity_index
      return `Как личность ты ближе к типу «${arch || '—'}». Индекс искренности ${sinc ?? '—'}% — насколько откровенно ты описывал(а) себя; на сильные стороны стоит опираться.`
    }
    case 5:
      return `Твой тип мышления — «${r.archetype || r.cognitive_archetype || '—'}». Один когнитивный стиль даётся тебе легче остальных — именно на него опирайся в учёбе и работе.`
    case 6: {
      const m = r.careerMaturity
      const mw = m >= 70 ? 'подтверждена опытом' : m >= 50 ? 'частично подтверждена' : 'пока на уровне интереса'
      return `Готовность собрана: карьерная зрелость ${mw}${m != null ? ` (${m}%)` : ''}. Видно, где у тебя уже есть реальный опыт, а где — зона роста.`
    }
    case 7:
      return `Твой стиль решений — ${styleWord(r.dominant_style)}. Общая уверенность в себе ${r.se_general ?? '—'}/100, решительность ${r.decisiveness ?? '—'}/100 — это про то, как ты превращаешь намерения в действия.`
    case 8:
      return `Образ будущего: тебе ближе ${envWord(r.work_profile?.stability_vs_growth)}, а в приоритете — ${ambWord(r.work_profile?.ambition_level)}. Ясность будущего ${r.career_clarity ?? '—'}/5.`
    case 9:
      return `Социальный контекст учтён: поддержка семьи ${r.family_support ?? '—'}%, окружения ${r.social_support ?? '—'}%, автономия ${r.autonomy ?? '—'}%. Это ресурсы, на которые можно опереться при выборе пути.`
    case 10:
      return `Письмо в будущее сохранено (${r.word_count ?? '—'} слов). ИИ увидит в нём мотивы, ценности и образ будущего — то, что закрытые тесты не показывают.`
    default:
      return ''
  }
}
