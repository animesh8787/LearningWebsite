// Tests the sync logic with fake Firebase, two simulated devices and a shared fake Firestore.
// Run: node test-sync.js
const assert = require('assert');
const PC = require('../js/profile-core.js');
const { makeSync } = require('../js/sync.js');

let passed = 0;
const tests = [];
const t = (name, fn) => tests.push([name, fn]);
const tick = (ms = 20) => new Promise(r => setTimeout(r, ms));

/* ---------- fakes ---------- */
function fakeCloud() {
  const docs = {}, watchers = {};
  return {
    docs,
    db: {
      collection: () => ({
        doc: id => ({
          get: async () => ({ exists: id in docs, data: () => docs[id] }),
          set: async v => { docs[id] = JSON.parse(JSON.stringify(v)); (watchers[id] || []).forEach(w => w.cb({ exists: true, metadata: { hasPendingWrites: w.owner === w.lastWriter }, data: () => docs[id] })); },
          delete: async () => { delete docs[id]; },
          onSnapshot: cb => { const w = { cb, owner: null }; (watchers[id] = watchers[id] || []).push(w); return () => { watchers[id] = watchers[id].filter(x => x !== w); }; },
        }),
      }),
    },
    notifyOthers(id, from) { (watchers[id] || []).forEach(w => w !== from && w.cb({ exists: true, metadata: {}, data: () => docs[id] })); },
  };
}
const FV = { firestore: { FieldValue: { serverTimestamp: () => 'ts' } } };

function fakeDevice(cloud) {
  const mem = {}, subs = {};
  const Store = {
    SYNC_KEYS: ['profile', 'done', 'stats', 'notes', 'bookmarks', 'badges'],
    get: (k, d) => (k in mem ? mem[k] : d),
    set: (k, v) => { mem[k] = JSON.parse(JSON.stringify(v)); (subs[k] || []).forEach(f => f(v)); },
    on: (k, f) => { (subs[k] = subs[k] || []).push(f); },
    snapshot() { const b = PC.emptyState(); const o = { v: 1 }; this.SYNC_KEYS.forEach(k => { o[k] = JSON.parse(JSON.stringify(mem[k] !== undefined ? mem[k] : b[k])); }); o.settings = { theme: mem.theme || null, level: mem.level || null, sbMode: null, updated: mem['settings.updated'] || 0 }; return o; },
    restore(o) { this.SYNC_KEYS.forEach(k => { if (o[k] !== undefined) mem[k] = JSON.parse(JSON.stringify(o[k])); }); const s = o.settings || {}; if (s.theme) mem.theme = s.theme; if (s.level) mem.level = s.level; mem['settings.updated'] = s.updated || 0; },
  };
  let authCb = null;
  const auth = { onAuthStateChanged: cb => { authCb = cb; } };
  const sync = makeSync({ firebase: FV, db: cloud.db, auth, Store, ProfileCore: PC, delay: 5 });
  return { Store, sync, signIn: uid => authCb({ uid, displayName: 'T', email: 't@x', photoURL: null }), signOut: () => authCb(null), mem };
}

/* ---------- tests ---------- */
t('first sign-in with no cloud copy uploads the local data', async () => {
  const cloud = fakeCloud(), a = fakeDevice(cloud);
  a.Store.set('done', { l1: 100 });
  a.signIn('u1'); await tick(60);
  assert.deepEqual(cloud.docs.u1.data.done, { l1: 100 });
  assert.equal(a.sync.status().state, 'idle');
});

t('first sign-in on a new device merges, and never loses local progress', async () => {
  const cloud = fakeCloud();
  const a = fakeDevice(cloud); a.Store.set('done', { l1: 100, l2: 200 }); a.signIn('u1'); await tick(60);
  const b = fakeDevice(cloud); b.Store.set('done', { l3: 300 }); b.Store.set('notes', { l3: { text: 'mine', updated: 5 } });
  b.signIn('u1'); await tick(80);
  assert.deepEqual(Object.keys(b.Store.get('done')).sort(), ['l1', 'l2', 'l3']);
  assert.deepEqual(Object.keys(cloud.docs.u1.data.done).sort(), ['l1', 'l2', 'l3']);        // pushed back up
  assert.equal(cloud.docs.u1.data.notes.l3.text, 'mine');
});

t('local changes are pushed after the debounce', async () => {
  const cloud = fakeCloud(), a = fakeDevice(cloud);
  a.signIn('u1'); await tick(60);
  a.Store.set('bookmarks', { l9: { on: true, t: 1 } }); await tick(60);
  assert.equal(cloud.docs.u1.data.bookmarks.l9.on, true);
});

t('remote changes from another device are merged in', async () => {
  const cloud = fakeCloud();
  const a = fakeDevice(cloud), b = fakeDevice(cloud);
  a.signIn('u1'); b.signIn('u1'); await tick(80);
  a.Store.set('done', { x: 1 }); await tick(80);
  assert.ok('x' in b.Store.get('done', {}), 'device B should have received lesson x');
});

t('signing out stops syncing; signing in as someone else does not leak data', async () => {
  const cloud = fakeCloud(), a = fakeDevice(cloud);
  a.signIn('u1'); await tick(50); a.signOut(); await tick(20);
  a.Store.set('done', { secret: 1 }); await tick(60);
  assert.ok(!('secret' in (cloud.docs.u1.data.done || {})), 'nothing pushed while signed out');
  assert.equal(a.sync.status().user, null);
});

t('deleteCloud removes the document but keeps local data', async () => {
  const cloud = fakeCloud(), a = fakeDevice(cloud);
  a.Store.set('done', { l1: 1 }); a.signIn('u1'); await tick(60);
  await a.sync.deleteCloud();
  assert.equal(cloud.docs.u1, undefined);
  assert.deepEqual(a.Store.get('done'), { l1: 1 });
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); passed++; } catch (e) { console.error('FAIL', name, '\n ', e.message); process.exitCode = 1; }
  }
  console.log(passed + '/' + tests.length + ' sync tests passed');
})();
