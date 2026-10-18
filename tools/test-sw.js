// Service worker checks: the precache list matches the real files, the version is current, and the install/activate/fetch logic behaves.
// Run: node test-sw.js   (if it reports a stale list, run: node build-sw.js)
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT, files, version } = require('./sw-manifest');

let passed = 0, failed = 0;
const pending = [];
const test = (name, fn) => pending.push({ name, fn });
const src = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');

/* load sw.js in a sandbox with fake Cache Storage */
function load(net) {
  const handlers = {}, store = {}, fetched = [];
  const cacheOf = n => store[n] || (store[n] = {});
  const sandbox = {
    URL, Request: class { constructor(u, o) { this.url = String(u); this.opts = o; } },
    location: { origin: 'https://site.example' },
    self: { registration: { scope: 'https://site.example/' }, addEventListener: (t, f) => { handlers[t] = f; }, skipWaiting: async () => { }, clients: { claim: async () => { } } },
    fetch: net || (async r => { fetched.push(r.url || r); return { ok: true, from: 'network' }; }),
    caches: {
      open: async n => ({ addAll: async reqs => { reqs.forEach(r => { cacheOf(n)[r.url] = { from: 'cache' }; }); } }),
      keys: async () => Object.keys(store), delete: async n => { delete store[n]; return true; },
      match: async req => { const u = (req.url || String(req)).split('?')[0]; for (const c of Object.values(store)) if (c[u]) return c[u]; return undefined; },
    },
  };
  vm.runInNewContext(src, sandbox);
  return { handlers, store, fetched };
}
const wait = (h, ev) => { let p; h({ waitUntil: x => { p = x; }, ...ev }); return p; };
const fetchEv = (url, over) => { let out; const e = Object.assign({ request: { url, method: 'GET', mode: 'cors' }, respondWith: p => { out = p; } }, over); return { e, get: () => out }; };

test('sw.js VERSION and PRECACHE are up to date (run node build-sw.js if not)', () => {
  const ctx = vm.runInNewContext(src.replace(/self\.addEventListener[\s\S]*$/, '').replace(/const CACHE[\s\S]*$/, '') + ';({VERSION,PRECACHE})', {});
  assert.strictEqual(JSON.stringify(ctx.PRECACHE), JSON.stringify(['./', 'app/'].concat(files())), 'precache list differs from the files on disk');
  assert.strictEqual(ctx.VERSION, version(), 'cache version is stale');
});
test('every precached file exists, and nothing is listed twice', () => {
  const list = files();
  list.forEach(f => assert(fs.existsSync(path.join(ROOT, f)), 'missing ' + f));
  assert.strictEqual(new Set(list).size, list.length);
});
test('every lesson, viz, vendor file, font and stylesheet the pages need is precached', () => {
  const set = new Set(files());
  for (const page of ['index.html', 'app/index.html']) {
    const dir = path.dirname(page), html = fs.readFileSync(path.join(ROOT, page), 'utf8');
    for (const m of html.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)) {
      if (/^https?:/.test(m[1])) continue;
      assert(set.has(path.posix.normalize(path.posix.join(dir, m[1]))), page + ' needs ' + m[1]);
    }
  }
  const fonts = fs.readFileSync(path.join(ROOT, 'assets/fonts/fonts.css'), 'utf8');
  for (const m of fonts.matchAll(/url\('\.\/([^']+)'\)/g)) assert(set.has('assets/fonts/' + m[1]), 'font ' + m[1]);
  for (const f of ['vendor/firebase-app-compat.js', 'vendor/firebase-auth-compat.js', 'vendor/firebase-firestore-compat.js']) assert(set.has(f), f);
  const lessons = fs.readdirSync(path.join(ROOT, 'content/cpp')).map(f => 'content/cpp/' + f).concat(fs.readdirSync(path.join(ROOT, 'content/stl')).map(f => 'content/stl/' + f));
  assert(lessons.length >= 50); lessons.forEach(l => assert(set.has(l), l));
});
test('the AI tutor, Firebase and other origins are never intercepted', () => {
  const { handlers } = load();
  for (const u of ['https://site.example/api/chat', 'https://site.example/.netlify/functions/chat', 'https://wandbox.org/api/compile.json', 'https://firestore.googleapis.com/x']) {
    const f = fetchEv(u); handlers.fetch(f.e); assert.strictEqual(f.get(), undefined, u);
  }
  const post = fetchEv('https://site.example/app/', { request: { url: 'https://site.example/app/', method: 'POST', mode: 'cors' } }); handlers.fetch(post.e); assert.strictEqual(post.get(), undefined);
});
test('install precaches, activate drops older versions, assets come from the cache', async () => {
  const { handlers, store } = load();
  store['czs-old'] = {}; store.unrelated = {};
  await wait(handlers.install);
  const name = Object.keys(store).find(k => k.startsWith('czs-') && k !== 'czs-old');
  assert(name && store[name]['https://site.example/js/app.js'], 'precached js/app.js');
  assert(store[name]['https://site.example/content/stl/vector.js'], 'precached a lesson');
  await wait(handlers.activate);
  assert(!('czs-old' in store) && 'unrelated' in store && name in store);
  const f = fetchEv('https://site.example/js/app.js?x=1'); handlers.fetch(f.e);
  assert.strictEqual((await f.get()).from, 'cache');
});
test('offline navigation falls back to the cached shell, online navigation uses the network', async () => {
  const off = load(async () => { throw new Error('offline'); }); await wait(off.handlers.install);
  const nav = (h, u) => { const f = fetchEv(u, { request: { url: u, method: 'GET', mode: 'navigate' } }); h.fetch(f.e); return f.get(); };
  assert.strictEqual(typeof (await nav(off.handlers, 'https://site.example/app/?x=1')).from, 'string');
  assert.strictEqual((await nav(off.handlers, 'https://site.example/app/lesson-that-is-not-cached')).from, 'cache');
  assert.strictEqual((await nav(off.handlers, 'https://site.example/')).from, 'cache');
  const on = load(); assert.strictEqual((await nav(on.handlers, 'https://site.example/app/')).from, 'network');
});

(async () => {
  for (const { name, fn } of pending) {
    try { await fn(); passed++; } catch (e) { failed++; console.log('FAIL  ' + name + '\n      ' + (e && e.message)); }
  }
  console.log(failed ? `${passed} passed, ${failed} FAILED` : `${passed} service worker tests passed`);
  process.exit(failed ? 1 : 0);
})();
