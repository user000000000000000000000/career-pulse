// Шаринг результата мини-теста без БД и регистрации: три результата блоков
// (2/4/5) кодируются прямо в URL-безопасную строку. Ссылку /t/<data> можно
// открыть с любого устройства — вся информация в самой ссылке.

export function encodeProba(data) {
  const json = JSON.stringify(data)
  // utf8 → base64 → url-safe
  const b64 = btoa(unescape(encodeURIComponent(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeProba(str) {
  try {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(decodeURIComponent(escape(atob(b64))))
  } catch {
    return null
  }
}

// demo(): node -e "import('./probaShare.js').then(m=>m.demo())" — круговая проверка
export function demo() {
  const src = { 2: { career_archetype: 'Аналитик-творец', profile_clarity: 71 }, 4: { archetype: 'Исследователь', sincerity: 88 }, 5: { archetype: 'Стратег' } }
  const round = decodeProba(encodeProba(src))
  if (JSON.stringify(round) !== JSON.stringify(src)) throw new Error('proba encode/decode mismatch')
  if (decodeProba('!!!not-base64') !== null) throw new Error('bad input must decode to null')
  console.log('probaShare demo ok')
}
