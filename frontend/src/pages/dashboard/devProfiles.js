/**
 * DEV-пресеты: мгновенно заполняют все 10 блоков диагностики в CP (localStorage)
 * под заданный архетип, чтобы быстро проверить кабинет и результаты без ручного
 * прохождения. Доступно только в режиме разработки (import.meta.env.DEV).
 */
import { CP } from '../../shared/api'

// helper: собрать объект holland-шкал из явных значений
const H = (R, I, A, S, E, C) => ({ R, I, A, S, E, C })

export const DEV_PROFILES = {
  programmer: {
    label: '👨‍💻 Программист',
    holland: H(47, 83, 30, 27, 20, 63), holland_top2: ['I', 'C'], holland_code: 'IC', career_archetype: 'Системный аналитик',
    profile_clarity: 84, interest_maturity: 70,
    values_top3: ['RZ', 'IN', 'DU'], motivation_type: 'spiritual', values_archetype: 'Исследователь роста', values_consistency: 80,
    personality: { agreeableness: 50, conscientiousness: 82, extraversion: 35, openness: 78, stress_resilience: 60, anxiety: 45, impulse_control: 65, ambiguity_tolerance: 58 },
    personality_archetype: 'Тихий аналитик', top3_strengths: ['conscientiousness', 'openness', 'impulse_control'], sincerity_index: 82,
    cognitive: { LANG: 70, MATH: 90, SPAT: 60, KINE: 45, MUSI: 30, SOC: 40, SYS: 88 }, cognitive_top3: ['MATH', 'SYS', 'LANG'], cognitive_archetype: 'Аналитик', vark: 'R',
    readiness_top2: ['HZ', 'HT'], career_maturity: 66,
    se_general: 70, decisiveness: 68, decision_style: 'analytical', career_execution: 70,
    context: { name: 'Демо Программист', age: '17', grade: '11', city: 'Санкт-Петербург', plans_after_school: 'university' },
    anxiety: 2, pressure: 2.0,
  },
  designer: {
    label: '🎨 Дизайнер',
    holland: H(58, 45, 85, 42, 38, 28), holland_top2: ['A', 'R'], holland_code: 'AR', career_archetype: 'Мастер-создатель',
    profile_clarity: 80, interest_maturity: 65,
    values_top3: ['KR', 'IN', 'DU'], motivation_type: 'spiritual', values_archetype: 'Свободный художник', values_consistency: 76,
    personality: { agreeableness: 70, conscientiousness: 55, extraversion: 62, openness: 88, stress_resilience: 50, anxiety: 55, impulse_control: 50, ambiguity_tolerance: 72 },
    personality_archetype: 'Исследователь возможностей', top3_strengths: ['openness', 'ambiguity_tolerance', 'agreeableness'], sincerity_index: 78,
    cognitive: { LANG: 72, MATH: 50, SPAT: 88, KINE: 70, MUSI: 55, SOC: 60, SYS: 55 }, cognitive_top3: ['SPAT', 'LANG', 'KINE'], cognitive_archetype: 'Визуал-создатель', vark: 'V',
    readiness_top2: ['HX', 'HH'], career_maturity: 60,
    se_general: 65, decisiveness: 60, decision_style: 'intuitive', career_execution: 64,
    context: { name: 'Демо Дизайнер', age: '17', grade: '11', city: 'Москва', plans_after_school: 'university' },
    anxiety: 3, pressure: 2.5,
  },
  manager: {
    label: '💼 Менеджер',
    holland: H(30, 40, 45, 70, 88, 55), holland_top2: ['E', 'S'], holland_code: 'ES', career_archetype: 'Лидер-наставник',
    profile_clarity: 86, interest_maturity: 75,
    values_top3: ['DO', 'PR', 'MB'], motivation_type: 'pragmatic', values_archetype: 'Лидер достижений', values_consistency: 82,
    personality: { agreeableness: 62, conscientiousness: 68, extraversion: 85, openness: 60, stress_resilience: 75, anxiety: 40, impulse_control: 60, ambiguity_tolerance: 70 },
    personality_archetype: 'Устойчивый лидер', top3_strengths: ['extraversion', 'stress_resilience', 'ambiguity_tolerance'], sincerity_index: 80,
    cognitive: { LANG: 80, MATH: 60, SPAT: 50, KINE: 45, MUSI: 40, SOC: 85, SYS: 70 }, cognitive_top3: ['SOC', 'LANG', 'SYS'], cognitive_archetype: 'Коммуникатор', vark: 'A',
    readiness_top2: ['HH', 'HZ'], career_maturity: 72,
    se_general: 82, decisiveness: 80, decision_style: 'analytical', career_execution: 80,
    context: { name: 'Демо Менеджер', age: '18', grade: '11', city: 'Санкт-Петербург', plans_after_school: 'university' },
    anxiety: 2, pressure: 1.5,
  },
}

/** Записать пресет во все 10 блоков CP + агрегированный профиль. */
export async function applyDevProfile(key) {
  const p = DEV_PROFILES[key]
  if (!p) return
  const blank = { answers: [], durationSec: 300 }

  // Синтез детальных данных для диаграмм результатов
  const readiness_scores = {}
  ;['HH', 'HT', 'HZ', 'HX', 'HP'].forEach(t => {
    const strong = p.readiness_top2.includes(t)
    const ability = strong ? 80 : 45
    const experience = strong ? 70 : 38
    readiness_scores[t] = { ability_pct: ability, experience_pct: experience, combined: Math.round(ability * 0.4 + experience * 0.6), gap: 'aligned' }
  })
  const se_confidence = {}, se_awareness = {}
  ;['S', 'I', 'A', 'E', 'C'].forEach(d => {
    se_confidence[d] = Math.min(95, Math.round((p.holland[d] || 40) * 0.9 + 10))
    se_awareness[d] = Math.min(90, Math.round((p.holland[d] || 40) * 0.8))
  })

  // Блок 1 — анкета
  await CP.saveBlockResult(1, { ...blank, scores: { career_anxiety: p.anxiety, external_pressure_index: p.pressure, choice_clarity: 'high', context: p.context, flags: [] } })
  await CP.saveUser({ name: p.context.name, role: 'student' })

  // Блок 2 — Holland
  await CP.saveBlockResult(2, { ...blank, scores: { ...p.holland, holland_top2: p.holland_top2, holland_code: p.holland_code, career_archetype: p.career_archetype, profile_clarity: p.profile_clarity, interest_maturity: p.interest_maturity, flags: [] } })

  // Блок 3 — ценности
  await CP.saveBlockResult(3, { ...blank, scores: { values_top3: p.values_top3, motivation_type: p.motivation_type, values_archetype: p.values_archetype, values_consistency: p.values_consistency, anti_values_chosen: [], flags: [] } })

  // Блок 4 — личность
  await CP.saveBlockResult(4, { ...blank, scores: { ...p.personality, personality_archetype: p.personality_archetype, top3_strengths: p.top3_strengths, sincerity_index: p.sincerity_index, flags: [] } })

  // Блок 5 — когнитивный
  await CP.saveBlockResult(5, { ...blank, scores: { ...p.cognitive, cognitive_top3: p.cognitive_top3, cognitive_archetype: p.cognitive_archetype, vark_dominant: p.vark, flags: [] } })

  // Блок 6 — готовность
  await CP.saveBlockResult(6, { ...blank, scores: { readiness_top2: p.readiness_top2, readiness_scores, career_maturity: p.career_maturity, flags: [] } })

  // Блок 7 — самоэффективность
  await CP.saveBlockResult(7, { ...blank, scores: { se_general: p.se_general, se_confidence, se_awareness, decisiveness: p.decisiveness, dominant_style: p.decision_style, career_execution: p.career_execution, flags: [] } })

  // Блок 8 — образ будущего
  await CP.saveBlockResult(8, { ...blank, scores: { work_profile: { stability_vs_growth: 'growth', ambition_level: 'success' }, career_clarity: 4, learning_readiness: 4, long_term_readiness: 4, flags: [] }, openAnswers: [{ questionId: 'role_model', text: 'демо' }, { questionId: 'mission', text: 'демо' }] })

  // Блок 9 — соц. контекст
  await CP.saveBlockResult(9, { ...blank, scores: { family_support: 70, social_support: 65, autonomy: 60, experience: 60, pressure: Math.round(p.pressure * 20), flags: [] }, openAnswers: [{ questionId: 'hobby', text: 'демо' }, { questionId: 'model', text: 'демо' }] })

  // Блок 10 — письмо
  await CP.saveBlockResult(10, { ...blank, scores: { word_count: 350, agency_markers: { active_count: 12, passive_count: 4, ratio: 0.75 }, ai_pending: true } })
  await CP.saveLetter({ blocks: [], fullText: 'демо-письмо', wordCount: 350, agencyRatio: 0.75 })

  // Агрегированный профиль
  await CP.updateProfile({
    context: p.context,
    holland_top2: p.holland_top2, holland_code: p.holland_code, career_archetype: p.career_archetype,
    holland_scores: p.holland, profile_clarity: p.profile_clarity, interest_maturity: p.interest_maturity,
    values_top3: p.values_top3, motivation_type: p.motivation_type, values_archetype: p.values_archetype,
    personality_scores: p.personality, personality_archetype: p.personality_archetype, sincerity_index: p.sincerity_index,
    cognitive_scores: p.cognitive, cognitive_top3: p.cognitive_top3, cognitive_archetype: p.cognitive_archetype, vark_style: p.vark,
    readiness_top2: p.readiness_top2, readiness_scores, career_maturity: p.career_maturity,
    se_general: p.se_general, se_confidence, se_awareness, decisiveness: p.decisiveness, decision_style: p.decision_style, career_execution: p.career_execution,
  })
}
