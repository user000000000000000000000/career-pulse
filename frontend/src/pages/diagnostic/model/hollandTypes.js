/**
 * Единый источник представлений Holland RIASEC-типа (R/I/A/S/E/C).
 * Раньше этот же словарь в трёх разных формах жил отдельно в
 * DiagResults.jsx, Block2Holland.jsx и diagnosticAPI.js — если бы
 * потребовалось поправить название типа, легко было забыть одно из мест.
 *
 * full  — полное прилагательное (заголовки, разбор результата)
 * short — форма для тесных UI-мест (радар-чарт, подписи в DiagResults);
 *         не всегда сокращение — где влезает целиком, оставлено полностью
 * noun  — персона/существительное для текста AI-разбора («ты — практик»)
 */
export const HOLLAND_TYPES = {
  R: { full: 'Реалистичный',        short: 'Реалистичный', noun: 'практик' },
  I: { full: 'Исследовательский',   short: 'Исследоват.',   noun: 'исследователь' },
  A: { full: 'Артистичный',         short: 'Артистичный',   noun: 'творец' },
  S: { full: 'Социальный',          short: 'Социальный',    noun: 'коммуникатор' },
  E: { full: 'Предпринимательский', short: 'Предприимч.',   noun: 'лидер' },
  C: { full: 'Конвенциональный',    short: 'Конвенц.',      noun: 'систематизатор' },
}

function pick(field) {
  return Object.fromEntries(Object.entries(HOLLAND_TYPES).map(([code, v]) => [code, v[field]]))
}

export const HOLLAND_FULL = pick('full')
export const HOLLAND_SHORT = pick('short')
export const HOLLAND_NOUN = pick('noun')
