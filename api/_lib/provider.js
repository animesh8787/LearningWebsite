/* Talks to an OpenAI-compatible chat API (Groq by default) and turns its event stream into text. */

/** Parse a server-sent-event body into text pieces. */
async function* sseText(body) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') return;
        try {
          const piece = JSON.parse(data).choices[0].delta.content;
          if (piece) yield piece;
        } catch (_) { /* keep-alive or partial line */ }
      }
    }
  } finally {
    try { reader.releaseLock(); } catch (_) { }
  }
}

/**
 * Open a streaming completion, trying each model in order when one is busy or down.
 * Resolves { ok:true, body, model } or { ok:false, status }.
 */
async function open({ fetch, baseUrl, key, models, messages, signal, maxTokens = 700, temperature = 0.3 }) {
  let status = 502;
  for (const model of models) {
    let res;
    try {
      res = await fetch(baseUrl.replace(/\/$/, '') + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({ model, messages, stream: true, max_tokens: maxTokens, temperature }),
        signal,
      });
    } catch (e) {
      if (signal && signal.aborted) throw e;
      status = 502; continue;
    }
    if (res.ok && res.body) return { ok: true, body: res.body, model };
    status = res.status;
    if (res.status !== 429 && res.status < 500) break;   // a real client/config error: another model will not help
  }
  return { ok: false, status };
}

module.exports = { sseText, open };
