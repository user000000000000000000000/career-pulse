// Классификатор ошибок для UI.
// Серверные/технические (RLS, JWT, сеть, 5xx, SQL и т.п.) → общий дружелюбный
// текст, чтобы не пугать пользователя. Понятные пользователю сообщения
// (валидация ввода) отдаём как есть.

const SERVER_PATTERNS = /(row-level security|row level security|violates|policy|permission|jwt|unauthorized|forbidden|invalid token|network|networkerror|failed to fetch|load failed|timeout|timed out|\b5\d\d\b|duplicate key|does not exist|column|syntax error|\brls\b|internal|cors|not configured|econn|fetch)/i

const DEFAULT_MSG = 'Что-то пошло не так на нашей стороне. Мы уже разбираемся — попробуйте позже.'

/**
 * @param {Error|string} err  ошибка или её текст
 * @param {string} [fallback] что показать, если ошибка похожа на серверную
 * @returns {string} текст для пользователя
 */
export function friendlyError(err, fallback = DEFAULT_MSG) {
  const msg = (err && err.message) ? err.message : String(err || '')
  if (!msg) return fallback
  if (SERVER_PATTERNS.test(msg)) return fallback
  return msg
}
