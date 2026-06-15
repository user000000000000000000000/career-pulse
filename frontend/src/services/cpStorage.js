/**
 * CareerPulse — Storage Abstraction Layer (React port)
 * ====================================================
 * Порт cp-storage.js из прототипа «Сайт V3».
 * Единый интерфейс хранения результатов диагностики.
 *
 * Сейчас: localStorage (демо-режим, как в исходных HTML-блоках).
 * Supabase-адаптер можно добавить позже — API менять не придётся,
 * блоки вызывают те же CP.saveBlockResult() / CP.getBlockResult().
 *
 * Использование из любого блока:
 *   import CP from '../../services/cpStorage'
 *   await CP.saveBlockResult(2, { answers, scores, durationSec })
 *   const r = await CP.getBlockResult(2)
 *   const p = await CP.getProgress()
 */

const STORAGE_PREFIX = 'cp_'
const DATA_VERSION = '1.0'

// Мета-данные блоков (из diagnostics_architecture.md)
export const BLOCKS_META = {
  1:  { name: 'Анкета-контекст',           questions: 20, time: 7,  method: 'Synergystart + собств.',       hasAI: false, axis: 'НАДО' },
  2:  { name: 'Склонности в деятельности',  questions: 30, time: 10, method: 'Holland RIASEC + Голомшток',   hasAI: false, axis: 'ХОЧУ' },
  3:  { name: 'Жизненные ценности',         questions: 28, time: 10, method: 'Мотив. карта (адапт.)',        hasAI: false, axis: 'ХОЧУ' },
  4:  { name: 'Личностные качества',        questions: 44, time: 12, method: 'Big Five + EPI + Кеттелл',     hasAI: false, axis: 'КТО Я' },
  5:  { name: 'Когнитивный профиль',        questions: 40, time: 12, method: 'Гарднер + VARK + задачи',      hasAI: false, axis: 'МОГУ' },
  6:  { name: 'Проф. готовность',           questions: 32, time: 10, method: 'Вектор + JamSkills',           hasAI: true,  axis: 'МОГУ' },
  7:  { name: 'Самоэффективность',          questions: 39, time: 10, method: 'Бандура + JamSkills',          hasAI: false, axis: 'КТО Я' },
  8:  { name: 'Образ будущего',             questions: 16, time: 8,  method: 'Собственная',                  hasAI: true,  axis: 'ХОЧУ' },
  9:  { name: 'Социальный контекст',        questions: 25, time: 8,  method: 'Собственная',                  hasAI: true,  axis: 'КОНТЕКСТ' },
  10: { name: 'Письмо в будущее',           questions: 19, time: 25, method: 'Нарративная психология',       hasAI: true,  axis: 'КОНТЕКСТ' },
}

// Минимум для консультации: блоки 1, 2, 3, 4, 10
export const CONSULTATION_REQUIRED = [1, 2, 3, 4, 10]
export const TOTAL_BLOCKS = 10

// Рекомендуемый порядок прохождения: 1 → 2 → 3 → 4 → 10(письмо) → 5 → 6 → 7 → 8 → 9
const BLOCK_ORDER = [1, 2, 3, 4, 10, 5, 6, 7, 8, 9]

// ── низкоуровневые хелперы localStorage ──
function key(name) { return STORAGE_PREFIX + name }
function get(name) {
  try {
    const raw = localStorage.getItem(key(name))
    return raw ? JSON.parse(raw) : null
  } catch (e) { console.warn('CP Storage read error:', e); return null }
}
function set(name, data) {
  try { localStorage.setItem(key(name), JSON.stringify(data)); return true }
  catch (e) { console.warn('CP Storage write error:', e); return false }
}
function remove(name) { localStorage.removeItem(key(name)) }

function deepMerge(target, source) {
  const result = { ...target }
  for (const k of Object.keys(source)) {
    if (source[k] && typeof source[k] === 'object' && !Array.isArray(source[k]) &&
        result[k] && typeof result[k] === 'object' && !Array.isArray(result[k])) {
      result[k] = deepMerge(result[k], source[k])
    } else {
      result[k] = source[k]
    }
  }
  return result
}

// ── публичный API ──
const CP = {
  BLOCKS: BLOCKS_META,
  TOTAL_BLOCKS,
  CONSULTATION_REQUIRED,

  async getUser() { return get('user') },

  async saveUser(userData) {
    const existing = get('user') || {}
    const merged = { ...existing, ...userData, lastActive: new Date().toISOString() }
    set('user', merged)
    return merged
  },

  async saveBlockResult(blockNum, data) {
    const result = {
      blockNum,
      status: 'completed',
      startedAt: data.startedAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationSec: data.durationSec || 0,
      answers: data.answers || [],
      scores: data.scores || {},
      openAnswers: data.openAnswers || [],
      meta: { version: DATA_VERSION, savedAt: new Date().toISOString() },
    }
    set('block_' + blockNum, result)

    const progress = get('progress') || { completed: [] }
    if (!progress.completed.includes(blockNum)) {
      progress.completed.push(blockNum)
      progress.completed.sort((a, b) => a - b)
    }
    progress.lastCompleted = { blockNum, timestamp: result.completedAt }
    progress.pct = Math.round((progress.completed.length / TOTAL_BLOCKS) * 100)
    progress.readyForConsultation = CONSULTATION_REQUIRED.every(n => progress.completed.includes(n))
    set('progress', progress)

    // Любое (пере)прохождение блока инвалидирует производные данные —
    // разбор нейросети и маршрут пересоберутся заново на основе нового профиля.
    const prof = get('profile')
    if (prof && (prof.ai_report || prof.roadmap)) {
      prof.ai_report = null
      prof.roadmap = null
      set('profile', prof)
    }

    return result
  },

  async getBlockResult(blockNum) { return get('block_' + blockNum) },

  async getAllResults() {
    const results = {}
    for (let i = 1; i <= TOTAL_BLOCKS; i++) {
      const r = get('block_' + i)
      if (r) results[i] = r
    }
    return results
  },

  async getProgress() {
    const p = get('progress') || { completed: [], pct: 0, readyForConsultation: false }
    p.total = TOTAL_BLOCKS
    p.remaining = TOTAL_BLOCKS - p.completed.length
    return p
  },

  async getProfile() { return get('profile') || {} },

  async updateProfile(partialData) {
    const merged = deepMerge(get('profile') || {}, partialData)
    merged._updatedAt = new Date().toISOString()
    set('profile', merged)
    return merged
  },

  async getExpertData() { return get('expert_data') || { flags: [], riskMap: {} } },

  async updateExpertData(partialData) {
    const merged = deepMerge(get('expert_data') || { flags: [], riskMap: {} }, partialData)
    set('expert_data', merged)
    return merged
  },

  async saveLetter(letterData) {
    set('letter', { ...letterData, savedAt: new Date().toISOString() })
    return true
  },
  async getLetter() { return get('letter') },

  async clearAll() {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k)
    }
    keys.forEach(k => localStorage.removeItem(k))
    return true
  },

  async clearBlock(blockNum) {
    remove('block_' + blockNum)
    const progress = get('progress') || { completed: [] }
    progress.completed = progress.completed.filter(n => n !== blockNum)
    progress.pct = Math.round((progress.completed.length / TOTAL_BLOCKS) * 100)
    progress.readyForConsultation = CONSULTATION_REQUIRED.every(n => progress.completed.includes(n))
    set('progress', progress)
    return true
  },

  /** Таймер прохождения блока: const t = CP.startTimer(); ... t.stop() → секунды */
  startTimer() {
    const start = Date.now()
    return {
      stop() { return Math.round((Date.now() - start) / 1000) },
      elapsed() { return Math.round((Date.now() - start) / 1000) },
    }
  },

  async isBlockDone(blockNum) {
    const r = get('block_' + blockNum)
    return Boolean(r && r.status === 'completed')
  },

  /** Следующий рекомендуемый блок по порядку 1→2→3→4→10→5→6→7→8→9 */
  async getNextBlock() {
    const progress = await this.getProgress()
    for (const n of BLOCK_ORDER) {
      if (!progress.completed.includes(n)) return n
    }
    return null
  },
}

export default CP
