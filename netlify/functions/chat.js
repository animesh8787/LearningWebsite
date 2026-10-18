/* Netlify wrapper for the AI tutor: the same handler as api/chat.js, adapted from Netlify's event format.
   The answer is sent when complete (not streamed), which the page handles fine. */
const handler = require('../../api/chat');

function adapt(fn) {
  return async event => {
    const headers = {};
    for (const [k, v] of Object.entries(event.headers || {})) headers[k.toLowerCase()] = v;
    const body = event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    const req = { method: event.httpMethod, headers, body };
    return new Promise(resolve => {
      const out = { headers: {}, chunks: [] };
      const res = {
        statusCode: 200, headersSent: false, writableEnded: false,
        setHeader: (k, v) => { out.headers[k] = String(v); },
        write: c => { res.headersSent = true; out.chunks.push(String(c)); return true; },
        end: c => {
          if (c) out.chunks.push(String(c));
          res.writableEnded = true; res.headersSent = true;
          resolve({ statusCode: res.statusCode, headers: out.headers, body: out.chunks.join('') });
        },
        on: () => { },
      };
      Promise.resolve(fn(req, res)).catch(() => {
        if (!res.writableEnded) { res.statusCode = 500; res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ error: { code: 'server', message: 'Something went wrong. Try again.' } })); }
      });
    });
  };
}

exports.adapt = adapt;
exports.handler = adapt(handler);
