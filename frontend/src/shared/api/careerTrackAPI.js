import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Карьерный трек: профессия → специальность (ЕГЭ) → программы вузов/колледжей.
 * Источник данных — таблицы specialties/profession_specialty_map/institutions/
 * institution_programs (см. supabase/schema.sql и supabase/CAREER_TRACK_DATA_GUIDE.md).
 *
 * Работает корректно и при пустых/незаполненных таблицах — тогда возвращает
 * status: 'empty', и UI показывает нейтральное «эта часть ещё заполняется»
 * вместо ошибки или пустого экрана.
 */

export const EGE_SUBJECT_NAMES = {
  russian: 'Русский язык', math_base: 'Математика (база)', math_profile: 'Математика (профиль)',
  physics: 'Физика', informatics: 'Информатика', history: 'История', biology: 'Биология',
  chemistry: 'Химия', english: 'Английский язык', literature: 'Литература',
  geography: 'География', social_science: 'Обществознание',
}

/**
 * @param {number} professionId  id профессии из frontend/src/data/professions.js
 * @param {string} userCity      город пользователя (Block1 context.city) — для приоритета вузов
 * @returns {Promise<{status: 'ready'|'empty'|'unavailable', specialties: Array}>}
 */
export async function getCareerTrack(professionId, userCity = '') {
  if (!isSupabaseConfigured) return { status: 'unavailable', specialties: [] }

  const { data: mapRows, error: mapErr } = await supabase
    .from('profession_specialty_map')
    .select('specialty_code, relevance')
    .eq('profession_id', professionId)
    .order('relevance', { ascending: true }) // 'primary' раньше 'secondary'

  if (mapErr || !mapRows || !mapRows.length) return { status: 'empty', specialties: [] }

  const codes = mapRows.map(m => m.specialty_code)

  const [{ data: specialtyRows }, { data: programRows }] = await Promise.all([
    supabase.from('specialties').select('*').in('code', codes),
    supabase.from('institution_programs')
      .select('*, institutions(name, full_name, type, city, region, website)')
      .in('specialty_code', codes),
  ])

  const specialties = (specialtyRows || []).map(sp => {
    const programs = (programRows || [])
      .filter(p => p.specialty_code === sp.code)
      .map(p => ({
        institution_name: p.institutions?.name || '—',
        institution_type: p.institutions?.type,
        city: p.institutions?.city,
        program_name: p.program_name || sp.name,
        form: p.form,
        has_budget_places: p.has_budget_places,
        min_score_last_year: p.min_score_last_year,
        admission_year: p.admission_year,
        link: p.link || p.institutions?.website,
      }))
      // приоритет: город пользователя → есть бюджетные места → по алфавиту
      .sort((a, b) => {
        const cityA = userCity && a.city === userCity ? 0 : 1
        const cityB = userCity && b.city === userCity ? 0 : 1
        if (cityA !== cityB) return cityA - cityB
        const budA = a.has_budget_places ? 0 : 1
        const budB = b.has_budget_places ? 0 : 1
        if (budA !== budB) return budA - budB
        return (a.institution_name || '').localeCompare(b.institution_name || '', 'ru')
      })

    return {
      code: sp.code, name: sp.name, level: sp.level,
      ege_required: (sp.ege_required || []).map(k => EGE_SUBJECT_NAMES[k] || k),
      ege_choose_one_of: (sp.ege_choose_one_of || []).map(k => EGE_SUBJECT_NAMES[k] || k),
      programs,
    }
  })

  return { status: specialties.length ? 'ready' : 'empty', specialties }
}

/** То же самое сразу для нескольких рекомендованных профессий (для финального экрана). */
export async function getCareerTracksForProfessions(professionIds = [], userCity = '') {
  const results = await Promise.all(professionIds.map(id => getCareerTrack(id, userCity)))
  return professionIds.map((id, i) => ({ professionId: id, ...results[i] }))
}
