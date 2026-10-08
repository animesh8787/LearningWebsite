/* Request validation for /api/chat. Pure: no I/O. */
const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LIMITS = { message: 2000, context: 3500, code: 2500, history: 8, historyItem: 2000, lessonId: 60 };

const isStr = v => typeof v === 'string';
const clip = (s, n) => (s.length > n ? s.slice(0, n) : s);
// strip control characters except tab and newline
const clean = s => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');

function validate(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, error: 'Send a JSON object.' };

  if (!isStr(body.message) || !body.message.trim()) return { ok: false, error: 'Type a question first.' };
  if (body.message.length > LIMITS.message) return { ok: false, error: `Questions can be up to ${LIMITS.message} characters.` };

  const level = body.level === undefined ? 'intermediate' : body.level;
  if (!LEVELS.includes(level)) return { ok: false, error: 'Unknown explanation level.' };

  let lessonId = '';
  if (body.lessonId !== undefined && body.lessonId !== null && body.lessonId !== '') {
    if (!isStr(body.lessonId) || !/^[a-z0-9-]{1,60}$/i.test(body.lessonId)) return { ok: false, error: 'Bad lesson id.' };
    lessonId = body.lessonId;
  }

  const optional = (v, max) => (isStr(v) ? clean(clip(v, max)) : '');

  const history = [];
  if (body.history !== undefined) {
    if (!Array.isArray(body.history)) return { ok: false, error: 'History must be a list.' };
    for (const h of body.history.slice(-LIMITS.history)) {
      if (!h || (h.role !== 'user' && h.role !== 'assistant') || !isStr(h.content)) return { ok: false, error: 'Bad history entry.' };
      const content = clean(clip(h.content, LIMITS.historyItem));
      if (content.trim()) history.push({ role: h.role, content });
    }
  }

  return {
    ok: true,
    value: {
      message: clean(body.message).trim(),
      level,
      lessonId,
      context: optional(body.context, LIMITS.context),
      code: optional(body.code, LIMITS.code),
      history,
    },
  };
}

module.exports = { validate, LEVELS, LIMITS };
