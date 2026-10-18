// Deploy-config checks: Vercel and Netlify send the same security headers, the CSP forbids inline scripts, no page uses one,
// and the Netlify function adapts the shared tutor handler correctly. Run: node test-config.js
const assert = require('assert'), fs = require('fs'), path = require('path');
const root = p => path.join(__dirname, '..', p);
let passed = 0, failed = 0;
const pending = [];
const test = (name, fn) => pending.push({ name, fn });

const vercel = JSON.parse(fs.readFileSync(root('vercel.json'), 'utf8'));
const toml = fs.readFileSync(root('netlify.toml'), 'utf8');
const vHeader = k => { for (const h of vercel.headers) for (const x of h.headers) if (x.key === k) return x.value; };
const nHeader = k => (toml.match(new RegExp('^\\s*' + k + ' = "(.*)"\\s*$', 'm')) || [])[1];

test('Vercel and Netlify send the same CSP and frame/type headers', () => {
  for (const k of ['Content-Security-Policy', 'X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy']) {
    assert(vHeader(k), 'vercel.json lacks ' + k); assert.strictEqual(nHeader(k), vHeader(k), k + ' differs');
  }
  assert.strictEqual(vHeader('X-Frame-Options'), 'DENY');
});
test('the CSP allows no inline or eval scripts and no framing', () => {
  const csp = vHeader('Content-Security-Policy');
  const script = csp.split(';').map(s => s.trim()).find(s => s.startsWith('script-src ')) || '';
  assert(script.startsWith("script-src 'self'") && !/unsafe-inline|unsafe-eval/.test(script), script);
  assert(/frame-ancestors 'none'/.test(csp) && /object-src 'none'/.test(csp));
});
test('no page has an inline script or inline event handler (the CSP would block it)', () => {
  for (const f of ['index.html', 'app/index.html']) {
    const html = fs.readFileSync(root(f), 'utf8');
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) assert(/\bsrc=/.test(m[1]) && !m[2].trim(), f + ' has an inline script');
    assert(!/\son[a-z]+\s*=\s*["']/i.test(html), f + ' has an inline event handler');
  }
});
test('vendor files are not cached as immutable (their names carry no version)', () => {
  assert(!JSON.stringify(vercel).includes('immutable')); assert(!/immutable/.test(toml));
});
test('.vercelignore keeps tools and markdown out of the deploy', () => {
  const v = fs.readFileSync(root('.vercelignore'), 'utf8').split(/\r?\n/);
  assert(v.includes('tools/') && v.includes('*.md'));
});
test('firestore rules check the document shape', () => {
  const r = fs.readFileSync(root('firestore.rules'), 'utf8');
  assert(/keys\(\)\.hasOnly\(\['v', 'updatedAt', 'data'\]\)/.test(r) && /data\.data is map/.test(r));
});
test('Netlify function: preflight and unauthenticated calls are answered by the shared handler', async () => {
  const { handler } = require('../netlify/functions/chat');
  const base = { host: 'site.example', origin: 'https://site.example', 'Content-Type': 'application/json' };
  let r = await handler({ httpMethod: 'OPTIONS', headers: Object.assign({}, base, { origin: 'https://evil.example' }) });
  assert.strictEqual(r.statusCode, 403);
  r = await handler({ httpMethod: 'OPTIONS', headers: base });
  assert.strictEqual(r.statusCode, 204);
  r = await handler({ httpMethod: 'POST', headers: base, body: JSON.stringify({ message: 'hi' }) });
  assert.strictEqual(r.statusCode, 401); assert.strictEqual(JSON.parse(r.body).error.code, 'signin');
  r = await handler({ httpMethod: 'GET', headers: base });
  assert.strictEqual(r.statusCode, 405);
});
test('Netlify adapter joins streamed chunks into one body and decodes base64 request bodies', async () => {
  const { adapt } = require('../netlify/functions/chat');
  let seen;
  const r = await adapt(async (req, res) => { seen = req; res.statusCode = 200; res.setHeader('X-A', 1); res.write('ab'); res.end('cd'); })(
    { httpMethod: 'POST', headers: { Host: 'h', 'Content-Type': 'application/json' }, isBase64Encoded: true, body: Buffer.from('{"a":1}').toString('base64') });
  assert.deepStrictEqual(r, { statusCode: 200, headers: { 'X-A': '1' }, body: 'abcd' });
  assert.strictEqual(seen.body, '{"a":1}'); assert.strictEqual(seen.headers.host, 'h'); assert.strictEqual(seen.headers['content-type'], 'application/json');
  const e = await adapt(async () => { throw new Error('boom'); })({ httpMethod: 'POST', headers: {} });
  assert.strictEqual(e.statusCode, 500);
});

(async () => {
  for (const { name, fn } of pending) {
    try { await fn(); passed++; } catch (e) { failed++; console.log('FAIL  ' + name + '\n      ' + (e && e.message)); }
  }
  console.log(failed ? `${passed} passed, ${failed} FAILED` : `${passed} config tests passed`);
  process.exit(failed ? 1 : 0);
})();
