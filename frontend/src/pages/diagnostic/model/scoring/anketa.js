// Скоринг Блока 1 (Анкета-контекст). Вынесено из Block1Anketa.jsx, чтобы формулу
// можно было прогнать тестами и переиспользовать (напр. в будущем ИИ-анализе)
// независимо от React-компонента — по тому же принципу, что и utils/scoring/holland.js.

/**
 * @param {object} ans  собранные ответы анкеты (a + чипы B1/B2/B2a/B3/V4b)
 * @returns {{ scores: object, flags: Array, context: object }}
 */
export function scoreAnketa(ans) {
  const scores = {}
  scores.career_anxiety = ans.G1
  const g2 = ans.G2 || 3
  const g4enc = ans.G4 === 'parents' ? 5 : ans.G4 === 'together' ? 3 : ans.G4 === 'unaware' ? 3 : 1
  scores.external_pressure_index = Math.round(((g2 + g4enc) / 2) * 10) / 10
  let cc = ans.V4 === 'specific' ? 'high' : ans.V4 === 'several' ? 'medium' : ans.V4 === 'vague' ? 'low' : 'none'
  if (ans.V4a && ans.V4a <= 2 && cc === 'high') cc = 'uncertain_specific'
  scores.choice_clarity = cc
  if (ans.V4a) scores.choice_confidence = ans.V4a
  if (ans.V4b && ans.V4b.length) scores.idea_sources = ans.V4b
  if (ans.V4c) scores.talked_to_professional = ans.V4c
  if (ans.B2a && ans.B2a.length) scores.subject_motivation = ans.B2a

  const flags = []
  if (ans.G1 >= 4 && scores.external_pressure_index >= 4) flags.push({ code: 'anxiety_plus_pressure', level: 'critical' })
  if (ans.G4 === 'parents' && ans.V4 === 'specific') flags.push({ code: 'parents_decide', level: 'warning' })
  if (ans.V4 === 'none' && ans.G1 >= 4) flags.push({ code: 'lost_and_anxious', level: 'warning' })
  if (ans.V4c === 'no' && ans.V4a >= 4) flags.push({ code: 'confident_without_exposure', level: 'info' })
  const age = parseInt(ans.A2, 10); if (age && age < 14) flags.push({ code: 'minor_user', level: 'info' })
  if (ans.V4b && ans.V4b.length === 1 && ans.V4b[0] === 'parents') flags.push({ code: 'idea_only_from_parents', level: 'info' })
  if (ans.V4b && ans.V4b.includes('practice')) flags.push({ code: 'idea_tested_in_practice', level: 'info' })
  if (ans.B2a && ans.B2a.length === 1 && ans.B2a[0] === 'teacher') flags.push({ code: 'subject_interest_teacher_dependent', level: 'info' })

  const context = {
    name: ans.A1, age: ans.A2, grade: ans.A3, city: ans.A4, gender: ans.A5, education_format: ans.A6,
    plans_after_school: ans.V1, ege_subjects: ans.B1, favorite_subjects: ans.B2, subject_motivation: ans.B2a,
    disliked_subjects: ans.B3, avg_grade: ans.B4, relocation_ready: ans.V2, budget: ans.V3,
    main_concern: ans.G3, decision_maker: ans.G4,
  }

  return { scores, flags, context }
}
