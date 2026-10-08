/* The /api/chat request handler, with its dependencies injected so it can be tested without network access. */
const { validate } = require('./validate');
const { buildMessages } = require('./prompt');
const { sseText, open } = require('./provider');

const send = (res, status, error, extra) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ error: Object.assign({ message: error.message, code: error.code }, extra || {}) }));
};

function originAllowed(req, allowed) {
  const origin = req.headers.origin;
  if (!origin) return false;
  let host;
  try { host = new URL(origin).host; } catch (_) { return false; }
  return host === req.headers.host || allowed.includes(origin) || /^localhost(:\d+)?$/.test(host);
}

/**
 * deps: { verifyToken(token) -> uid | null, quota, provider: {fetch, baseUrl, key, models}, allowedOrigins }
 */
function makeHandler(deps) {
  return async function handler(req, res) {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { code: 'method', message: 'Use POST.' }); }
    if (!originAllowed(req, deps.allowedOrigins || [])) return send(res, 403, { code: 'origin', message: 'Not allowed from this site.' });
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) return send(res, 415, { code: 'type', message: 'Send JSON.' });

    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token) return send(res, 401, { code: 'signin', message: 'Sign in to ask questions.' });
    let uid = null;
    try { uid = await deps.verifyToken(token); } catch (e) {
      if (e && e.code === 'config') return send(res, 503, { code: 'unconfigured', message: 'The assistant is not set up yet.' });
      uid = null;
    }
    if (!uid) return send(res, 401, { code: 'signin', message: 'Your sign-in has expired. Sign in again.' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (_) { body = null; } }
    const v = validate(body);
    if (!v.ok) return send(res, 400, { code: 'invalid', message: v.error });

    if (!deps.provider || !deps.provider.key) return send(res, 503, { code: 'unconfigured', message: 'The assistant is not set up yet.' });

    let q;
    try { q = await deps.quota.take(uid); } catch (_) { return send(res, 503, { code: 'quota', message: 'The assistant is unavailable right now. Try again soon.' }); }
    if (!q.ok) {
      return send(res, 429, q.reason === 'global'
        ? { code: 'busy', message: 'The assistant is very busy today. Try again tomorrow.' }
        : { code: 'limit', message: 'You have used today\'s questions. They reset at midnight UTC.' }, { resetAt: q.resetAt });
    }

    const ctl = new AbortController();
    res.on('close', () => { if (!res.writableEnded) ctl.abort(); });
    const timer = setTimeout(() => ctl.abort(), deps.timeoutMs || 25000);
    let wrote = false;
    try {
      const r = await open(Object.assign({}, deps.provider, { messages: buildMessages(v.value), signal: ctl.signal }));
      if (!r.ok) {
        await deps.quota.refund(uid).catch(() => { });
        const busy = r.status === 429;
        return send(res, busy ? 503 : 502, { code: busy ? 'provider-busy' : 'provider', message: busy ? 'The AI is busy. Wait a few seconds and ask again.' : 'The AI could not answer. Try again.' });
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Accel-Buffering', 'no');
      res.setHeader('X-Quota-Remaining', String(q.remaining));
      for await (const piece of sseText(r.body)) { wrote = true; res.write(piece); }
      if (!wrote) { await deps.quota.refund(uid).catch(() => { }); res.write('The AI returned an empty answer. Please ask again.'); }
      res.end();
    } catch (e) {
      if (!wrote) await deps.quota.refund(uid).catch(() => { });
      if (res.headersSent) { try { res.write('\n\n(The answer was cut off. Ask again.)'); res.end(); } catch (_) { } }
      else if (!res.writableEnded) send(res, 504, { code: 'timeout', message: 'The AI took too long. Try again.' });
    } finally {
      clearTimeout(timer);
    }
  };
}

module.exports = { makeHandler, originAllowed };
