/* Optional cloud sync with Firebase (Auth + Firestore).
   - Works fully without it: with no config, `Sync.enabled` is false and nothing else changes.
   - One document per learner, users/{uid}: { v, updatedAt, data: <Store.snapshot()> }.
   - On sign-in the local and cloud copies are MERGED (never overwritten), then kept in step.
   The logic lives in makeSync() with injected dependencies, so tools/test-sync.js can test it in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = { makeSync: factory };
  else root.__makeSync = factory;
})(typeof self !== 'undefined' ? self : this, function makeSync(deps) {
  const { firebase, db, auth, Store, ProfileCore, delay = 2000, online = () => true } = deps;
  const listeners = new Set();
  const st = { user: null, state: 'offline', last: 0 };
  let ref = null, unsub = null, timer = null, applying = false, lastPushed = '';

  const emit = () => listeners.forEach(fn => { try { fn(); } catch (_) { } });
  const set = (state, extra) => { st.state = state; if (extra) Object.assign(st, extra); emit(); };
  const stable = o => JSON.stringify(o);

  function apply(snapshot) {
    applying = true;
    try { Store.restore(snapshot); } finally { applying = false; }
    if (deps.onApplied) deps.onApplied();
  }

  async function push() {
    if (!ref) return;
    clearTimeout(timer); timer = null;
    const snap = Store.snapshot();
    const json = stable(snap);
    if (json === lastPushed) { set('idle'); return; }
    set('syncing');
    try {
      await ref.set({ v: 1, updatedAt: firebase.firestore.FieldValue.serverTimestamp(), data: snap });
      lastPushed = json;
      set(online() ? 'idle' : 'offline', { last: Date.now() });
    } catch (e) { set('error'); }
  }
  function schedule() { if (!ref || applying) return; clearTimeout(timer); timer = setTimeout(push, delay); }

  /** Merge a remote snapshot into local data; push back if local had something newer. */
  function reconcile(remoteData) {
    const local = Store.snapshot();
    const merged = remoteData ? ProfileCore.merge(local, remoteData) : local;
    if (stable(merged) !== stable(local)) apply(merged);
    if (!remoteData || stable(merged) !== stable(remoteData)) schedule();
    else lastPushed = stable(Store.snapshot());
  }

  async function attach(user) {
    ref = db.collection('users').doc(user.uid);
    set('syncing');
    try {
      const doc = await ref.get();
      reconcile(doc.exists ? (doc.data() || {}).data : null);
      if (!doc.exists) await push();
      unsub = ref.onSnapshot(s => {
        if (s.metadata && s.metadata.hasPendingWrites) return;      // our own write echoing back
        if (!s.exists) return;
        reconcile((s.data() || {}).data);
        set('idle', { last: Date.now() });
      }, () => set('error'));
      set(online() ? 'idle' : 'offline', { last: Date.now() });
    } catch (e) { set('error'); }
  }
  function detach() {
    if (unsub) { unsub(); unsub = null; }
    clearTimeout(timer); timer = null; ref = null; lastPushed = '';
  }

  auth.onAuthStateChanged(user => {
    detach();
    st.user = user ? { uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL } : null;
    if (!user) { set('offline', { last: 0 }); return; }
    attach(user);
  });

  // push whenever syncable data changes
  [...Store.SYNC_KEYS, 'settings.updated'].forEach(k => Store.on(k, schedule));

  return {
    enabled: true,
    status: () => Object.assign({}, st),
    onChange: fn => { listeners.add(fn); return () => listeners.delete(fn); },
    syncNow: async () => { if (!ref) return; const doc = await ref.get(); reconcile(doc.exists ? (doc.data() || {}).data : null); await push(); },
    flush: push,
    setOnline: ok => { if (st.user) set(ok ? (st.state === 'offline' ? 'idle' : st.state) : 'offline'); if (ok) schedule(); },
    deleteCloud: async () => { if (!ref) throw new Error('Sign in first.'); clearTimeout(timer); await ref.delete(); lastPushed = ''; },
  };
});

/* ---------------- browser glue ---------------- */
(function () {
  if (typeof window === 'undefined' || typeof module === 'object') return;
  const cfg = window.FIREBASE_CONFIG;
  const configured = !!(cfg && cfg.apiKey);
  const BASE = window.BASE || '';

  // A stable facade: pages bind to it once, the Firebase SDK loads lazily behind it.
  const listeners = new Set();
  let impl = null, ready = null;
  const emit = () => listeners.forEach(fn => { try { fn(); } catch (_) { } });
  window.Sync = {
    enabled: configured,
    status: () => (impl ? impl.status() : { user: null, state: 'offline', last: 0 }),
    onChange: fn => { listeners.add(fn); return () => listeners.delete(fn); },
    syncNow: async () => { if (impl) await impl.syncNow(); },
    deleteCloud: async () => { if (!impl) throw new Error('Sign in first.'); await impl.deleteCloud(); },
    flush: async () => { if (impl) await impl.flush(); },
    /** A fresh Firebase ID token for the signed-in learner (used to call the AI tutor), or null. */
    getToken: async () => { if (!configured) return null; await boot(); const u = impl && firebase.auth().currentUser; return u ? u.getIdToken() : null; },
  };
  window.Auth = { open() { }, signOut() { } };
  if (!configured) return;

  const load = src => new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error('Could not load ' + src)); document.head.appendChild(el); });
  function boot() {
    if (ready) return ready;
    ready = (async () => {
      await load(BASE + 'vendor/firebase-app-compat.js');
      await Promise.all([load(BASE + 'vendor/firebase-auth-compat.js'), load(BASE + 'vendor/firebase-firestore-compat.js')]);
      firebase.initializeApp(cfg);
      const db = firebase.firestore();
      db.enablePersistence({ synchronizeTabs: true }).catch(() => { });
      impl = window.__makeSync({
        firebase, db, auth: firebase.auth(), Store, ProfileCore, online: () => navigator.onLine,
        onApplied: () => { if (window.Profile) Profile.emit(); if (window.Sidebar) { Sidebar.refresh(); Sidebar.refreshProfile(); } },
      });
      impl.onChange(() => { emit(); chip(); if (impl.status().user) close(); });
      addEventListener('online', () => impl.setOnline(true));
      addEventListener('offline', () => impl.setOnline(false));
      addEventListener('pagehide', () => impl.flush());
      document.addEventListener('visibilitychange', () => { if (document.hidden) impl.flush(); });
      emit();
    })().catch(e => { console.warn('Cloud sync disabled:', e); ready = null; });
    return ready;
  }
  // Start loading once the browser is idle, so it never delays the first paint.
  (window.requestIdleCallback || (f => setTimeout(f, 800)))(() => boot());

  function chip() {
    const u = impl && impl.status().user, av = document.getElementById('sbAvatar'); if (!av) return;
    if (u && u.photoURL) av.innerHTML = `<img src="${u.photoURL}" alt="" referrerpolicy="no-referrer">`;
    else av.textContent = ((Profile.profile.name || (u && (u.displayName || u.email)) || 'L').trim().charAt(0) || 'L').toUpperCase();
  }

  /* ---------- sign-in dialog ---------- */
  const ERR = {
    'auth/invalid-credential': 'That email or password is not right.', 'auth/wrong-password': 'That email or password is not right.',
    'auth/user-not-found': 'No account uses that email.', 'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
    'auth/weak-password': 'Use at least 6 characters for your password.', 'auth/invalid-email': 'That email address does not look right.',
    'auth/popup-closed-by-user': '', 'auth/cancelled-popup-request': '', 'auth/network-request-failed': 'You appear to be offline.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.', 'auth/unauthorized-domain': 'This domain is not authorised for sign-in yet. Add it in the Firebase console.',
  };
  let wrap = null, mode = 'in';
  function build() {
    wrap = document.createElement('div'); wrap.className = 'auth-wrap'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'authTitle');
    wrap.innerHTML = `<div class="auth-card">
      <div class="eyebrow"><b>/</b> Account</div><h2 id="authTitle"></h2><p id="authSub"></p>
      <button class="provider" data-p="google">Continue with Google</button>
      <button class="provider" data-p="github">Continue with GitHub</button>
      <div class="or">or use email</div>
      <form id="authForm" novalidate>
        <label class="fld"><span>Email</span><input type="email" id="authEmail" autocomplete="email" required></label>
        <label class="fld"><span>Password</span><input type="password" id="authPass" autocomplete="current-password" required></label>
        <p class="auth-err" id="authErr" role="alert"></p>
        <button class="btn" type="submit" style="--h:46px;width:100%;justify-content:center" id="authGo"></button>
      </form>
      <div class="wnav" style="margin-top:16px"><button class="link-btn" id="authSwitch"></button><button class="link-btn" id="authForgot">Forgot password?</button></div>
      <div class="wnav" style="margin-top:6px"><span></span><button class="link-btn" id="authClose">Close</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('mousedown', e => { if (e.target === wrap) close(); });
    wrap.querySelector('#authClose').addEventListener('click', close);
    wrap.querySelectorAll('[data-p]').forEach(b => b.addEventListener('click', () => provider(b.dataset.p)));
    wrap.querySelector('#authSwitch').addEventListener('click', () => { mode = mode === 'in' ? 'up' : 'in'; paint(); });
    wrap.querySelector('#authForgot').addEventListener('click', forgot);
    wrap.querySelector('#authForm').addEventListener('submit', submit);
    wrap.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }
  const $ = s => wrap.querySelector(s);
  const fail = e => {
    let msg;
    if (ERR[e.code] !== undefined) msg = ERR[e.code];
    else if (/api-key/.test(e.code || '')) msg = 'Sign-in is not set up correctly for this site yet.';
    else msg = /^Firebase:/.test(e.message || '') ? 'Could not sign in. Please try again.' : (e.message || 'Something went wrong.');
    $('#authErr').textContent = msg;
  };
  function paint() {
    $('#authTitle').textContent = mode === 'in' ? 'Sign in' : 'Create your account';
    $('#authSub').textContent = 'Sync your progress, notes and bookmarks across devices. Your data stays private to you.';
    $('#authGo').textContent = mode === 'in' ? 'Sign in' : 'Create account';
    $('#authSwitch').textContent = mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in';
    $('#authPass').autocomplete = mode === 'in' ? 'current-password' : 'new-password';
    $('#authForgot').style.visibility = mode === 'in' ? 'visible' : 'hidden';
    $('#authErr').textContent = '';
  }
  async function provider(name) {
    $('#authErr').textContent = '';
    const p = name === 'google' ? new firebase.auth.GoogleAuthProvider() : new firebase.auth.GithubAuthProvider();
    try { await firebase.auth().signInWithPopup(p); close(); } catch (e) { fail(e); }
  }
  async function submit(e) {
    e.preventDefault(); $('#authErr').textContent = '';
    const email = $('#authEmail').value.trim(), pass = $('#authPass').value;
    if (!email || !pass) { $('#authErr').textContent = 'Enter your email and password.'; return; }
    $('#authGo').disabled = true;
    try {
      if (mode === 'in') await firebase.auth().signInWithEmailAndPassword(email, pass);
      else await firebase.auth().createUserWithEmailAndPassword(email, pass);
      close();
    } catch (err) { fail(err); } finally { $('#authGo').disabled = false; }
  }
  async function forgot() {
    const email = $('#authEmail').value.trim();
    if (!email) { $('#authErr').textContent = 'Type your email above first, then choose “Forgot password?”.'; return; }
    try { await firebase.auth().sendPasswordResetEmail(email); $('#authErr').style.color = 'var(--good)'; $('#authErr').textContent = 'Check your inbox for a reset link.'; }
    catch (err) { $('#authErr').style.color = ''; fail(err); }
  }
  let opener = null;
  function open() { if (!wrap) build(); opener = document.activeElement; mode = 'in'; paint(); wrap.classList.add('open'); $('#authErr').style.color = ''; setTimeout(() => $('#authEmail').focus(), 30); }
  function close() { if (!wrap) return; wrap.classList.remove('open'); if (opener && opener.focus) opener.focus(); }
  window.Auth = { open: async () => { await boot(); if (impl) open(); }, signOut: async () => { await boot(); if (impl) firebase.auth().signOut(); } };
})();
