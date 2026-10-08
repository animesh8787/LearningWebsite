/* Tiny persisted store. Every localStorage access is guarded: it can throw or be empty. */
(function () {
  const P = 'czs:';
  const mem = {};
  const subs = {};

  function get(key, fallback) {
    if (key in mem) return mem[key];
    try {
      const raw = localStorage.getItem(P + key);
      if (raw != null) return (mem[key] = JSON.parse(raw));
    } catch (e) { /* storage unavailable */ }
    return fallback;
  }
  function set(key, value) {
    mem[key] = value;
    try { localStorage.setItem(P + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
    (subs[key] || []).forEach(fn => fn(value));
  }
  function on(key, fn) { (subs[key] = subs[key] || []).push(fn); }

  const Store = {
    get, set, on,
    isDone: id => !!(get('done', {})[id]),
    markDone(id, v = true) {
      const d = Object.assign({}, get('done', {}));
      if (v) d[id] = Date.now(); else delete d[id];
      set('done', d);
    },
    visit(id) { set('last', id); },
    reset() { mem.done = {}; set('done', {}); },

    /* ----- whole-state snapshot, used by export/import and by cloud sync ----- */
    SYNC_KEYS: ['profile', 'done', 'stats', 'notes', 'bookmarks', 'badges'],
    snapshot() {
      const base = window.ProfileCore ? ProfileCore.emptyState() : {};
      const o = { v: 1 };
      Store.SYNC_KEYS.forEach(k => { o[k] = get(k, base[k]); });
      o.settings = { theme: get('theme', null), level: get('level', null), sbMode: get('sb.mode', null), updated: get('settings.updated', 0) };
      return JSON.parse(JSON.stringify(o));
    },
    restore(o) {
      if (!o || typeof o !== 'object') return;
      Store.SYNC_KEYS.forEach(k => { if (o[k] !== undefined) set(k, o[k]); });
      const st = o.settings || {};
      if (st.theme) { set('theme', st.theme); document.documentElement.dataset.theme = st.theme; }
      if (st.level) set('level', st.level);
      if (st.sbMode) set('sb.mode', st.sbMode);
      set('settings.updated', st.updated || 0);
    },
    touchSettings() { set('settings.updated', Date.now()); },
    exportJSON() { return JSON.stringify(Object.assign({ app: 'cpp-stl-course', exportedAt: new Date().toISOString() }, Store.snapshot()), null, 2); },
    importJSON(text) {
      const o = JSON.parse(text);
      if (!o || o.app !== 'cpp-stl-course') throw new Error('This file is not a course export.');
      Store.restore(o);
    },
  };
  window.Store = Store;
  // Motion is off if the OS asks for it or the learner turned it off in Settings.
  window.REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches || !!get('rm', false);
  if (window.REDUCED) document.documentElement.dataset.motion = 'reduced';
})();
