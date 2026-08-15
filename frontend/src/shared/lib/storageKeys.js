/**
 * Единый реестр ключей localStorage. Раньше строковые литералы ('cp_user',
 * 'cp_tour_seen', 'vk_verifier'...) были разбросаны по auth.js/vk.js/
 * cpStorage.js/Profile.jsx/Dashboard.jsx/consult.js/useBlockDraft.js —
 * при переименовании легко было забыть один из файлов.
 *
 * ВАЖНО: 'cp_user' пишут и читают одновременно auth.js (сессия demo-режима)
 * и CP.saveUser()/CP.getUser() из cpStorage.js (обогащение имени из анкеты,
 * см. Block1Anketa.jsx) — это намеренно общий ключ, не дублирование по ошибке.
 */
export const STORAGE_KEYS = {
  prefix: 'cp_',
  user: 'cp_user',
  tourSeen: 'cp_tour_seen',
  theme: 'cp_theme',
  consultRequests: 'cp_consult_requests',
  vkVerifier: 'vk_verifier',
  vkState: 'vk_state',
  blockDraft: (blockNum) => 'cp_draft_block' + blockNum,
}
