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

import { supabase, isSupabaseConfigured } from './supabase'
import { BLOCKS_META, BLOCK_ORDER, TOTAL_BLOCKS, CONSULTATION_REQUIRED } from '../config/blocks'

const STORAGE_PREFIX = 'cp_'
const DATA_VERSION = '1.0'

// Реестр блоков вынесен в единый источник правды — shared/config/blocks.js
// (там же исправлены оси 4/6/7/9/10 и время блока 6). Ре-экспортируем имена,
// которые исторически импортировали из cpStorage.
export { BLOCKS_META, TOTAL_BLOCKS, CONSULTATION_REQUIRED }

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

// ── синхронизация с Supabase (зеркало localStorage ↔ profiles.diagnostic_data) ──
function collectState() {
  const state = {}
  for (const name of ['profile', 'progress', 'expert_data', 'letter']) {
    const v = get(name); if (v != null) state[name] = v
  }
  for (let i = 1; i <= TOTAL_BLOCKS; i++) {
    const v = get('block_' + i); if (v != null) state['block_' + i] = v
  }
  return state
}
function applyState(state) {
  if (!state || typeof state !== 'object') return
  for (const [k, v] of Object.entries(state)) set(k, v)
}

let _pushTimer = null
function pushRemote() {
  if (!isSupabaseConfigured) return
  clearTimeout(_pushTimer)
  _pushTimer = setTimeout(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user) return
      await supabase.from('profiles')
        .update({ diagnostic_data: collectState(), diagnostic_updated_at: new Date().toISOString() })
        .eq('id', user.id)
    } catch (e) { console.warn('CP sync push:', e?.message || e) }
  }, 800)
}

let _hydrated = false
async function hydrateFromRemote() {
  if (!isSupabaseConfigured || _hydrated) return false
  _hydrated = true
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user) return false
    const { data } = await supabase.from('profiles').select('diagnostic_data').eq('id', user.id).maybeSingle()
    const remote = data?.diagnostic_data
    if (!remote) return false
    const localCount = (get('progress')?.completed || []).length
    const remoteCount = (remote.progress?.completed || []).length
    // тянем с сервера только если там прогресс «свежее» — чтобы не затереть локальную работу
    if (remoteCount > localCount) { applyState(remote); return true }
  } catch (e) { console.warn('CP sync pull:', e?.message || e) }
  return false
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

    pushRemote()
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
    pushRemote()
    return merged
  },

  async getExpertData() { return get('expert_data') || { flags: [], riskMap: {} } },

  async updateExpertData(partialData) {
    const merged = deepMerge(get('expert_data') || { flags: [], riskMap: {} }, partialData)
    set('expert_data', merged)
    pushRemote()
    return merged
  },

  async saveLetter(letterData) {
    set('letter', { ...letterData, savedAt: new Date().toISOString() })
    pushRemote()
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
    pushRemote()
    return true
  },

  /** Подтянуть состояние диагностики из Supabase в localStorage (один раз за загрузку). */
  hydrateFromRemote,

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
