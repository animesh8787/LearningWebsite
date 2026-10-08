/* User-controlled sidebar:
   state  = open | rail | closed
   mode   = pinned (pushes content) | overlay (floats + backdrop) | auto (hidden, reveals on left-edge hover)
   plus drag-to-resize, focus mode, collapsible modules, per-module progress rings. */
(function () {
  const body = document.body;
  const MIN = 232, MAX = 440, DEF = 300;
  const isMobile = () => matchMedia('(max-width: 900px)').matches;
  const ico = d => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

  let state = isMobile() ? 'closed' : Store.get('sb.state', 'open');
  let mode = Store.get('sb.mode', 'pinned');
  let width = Store.get('sb.w', DEF);
  let focus = false;
  const openMods = new Set(Store.get('sb.mods', []));
  let currentId = null;

  const sb = document.getElementById('sidebar');

  function apply() {
    if (isMobile() && state === 'rail') state = 'closed';
    body.dataset.sb = state;
    body.dataset.mode = mode;
    body.dataset.focus = focus ? '1' : '0';
    body.style.setProperty('--sb-w', width + 'px');
    body.classList.remove('peek');
    document.querySelectorAll('[data-sb-toggle]').forEach(b => b.setAttribute('aria-expanded', state === 'open'));
    // off-screen sidebar must not be reachable by keyboard or screen readers
    sb.inert = (state === 'closed' || focus) && !body.classList.contains('peek');
    document.querySelectorAll('[data-mode-opt]').forEach(b => b.classList.toggle('on', b.dataset.modeOpt === mode));
    const f = document.querySelector('[data-focus-toggle]'); if (f) f.classList.toggle('on', focus);
    if (!isMobile()) Store.set('sb.state', state);
    Store.set('sb.mode', mode); Store.set('sb.w', width);
  }

  /* ---------- build ---------- */
  function build() {
    const nav = document.getElementById('sbNav');
    let h = '<div class="sb-continue-slot"></div>';
    COURSE.parts.forEach(p => {
      h += `<div class="part-label eyebrow"><b>${p.id === 'cpp' ? 'PART 1' : 'PART 2'}</b> ${p.name}</div>`;
      p.modules.forEach(m => {
        h += `<div class="mod" data-mod="${m.id}"><button class="mod-head" aria-expanded="false">
          <span class="num">${String(m.no).padStart(2, '0')}</span><span class="t">${m.title}</span><span class="count" data-count="${m.id}"></span>
          <svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></button>
          <div class="mod-body">${m.lessons.map(l => `<a class="lesson-link${l.ready ? '' : ' soon'}" data-id="${l.id}" href="#/lesson/${l.id}"><span class="dot"></span><span>${l.title}</span>${l.ready ? '' : '<span class="tag">soon</span>'}</a>`).join('')}</div></div>`;
      });
    });
    nav.innerHTML = h;

    const rail = document.getElementById('sbRail');
    rail.innerHTML = COURSE.modules.map(m => `<button class="rail-item" data-rail="${m.id}" data-tip="${m.title}" aria-label="${m.title}">
      <svg viewBox="0 0 42 42"><circle class="trk" cx="21" cy="21" r="19"/><circle class="prg" cx="21" cy="21" r="19" stroke-dasharray="119.4" stroke-dashoffset="119.4"/></svg>${String(m.no).padStart(2, '0')}</button>`).join('');

    nav.addEventListener('click', e => {
      const head = e.target.closest('.mod-head');
      if (head) { toggleMod(head.parentElement.dataset.mod); return; }
      const a = e.target.closest('.lesson-link');
      if (a && (isMobile() || mode !== 'pinned')) setState('closed');
    });
    rail.addEventListener('click', e => {
      const r = e.target.closest('.rail-item'); if (!r) return;
      openMods.add(r.dataset.rail); setState('open'); syncMods();
      document.querySelector(`.mod[data-mod="${r.dataset.rail}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
    syncMods();
  }

  function toggleMod(id) { openMods.has(id) ? openMods.delete(id) : openMods.add(id); syncMods(); }
  function syncMods() {
    document.querySelectorAll('.mod').forEach(m => {
      const on = openMods.has(m.dataset.mod);
      m.classList.toggle('open', on);
      m.querySelector('.mod-head').setAttribute('aria-expanded', on);
    });
    Store.set('sb.mods', [...openMods]);
  }

  /* ---------- progress + active ---------- */
  function refresh(id) {
    if (id !== undefined) currentId = id;
    const done = Store.get('done', {});
    let total = 0, got = 0;
    COURSE.modules.forEach(m => {
      const n = m.lessons.length, d = m.lessons.filter(l => done[l.id]).length;
      total += n; got += d;
      const c = document.querySelector(`[data-count="${m.id}"]`); if (c) c.textContent = `${d}/${n}`;
      const ring = document.querySelector(`[data-rail="${m.id}"] .prg`); if (ring) ring.style.strokeDashoffset = 119.4 * (1 - d / n);
    });
    document.querySelectorAll('.lesson-link').forEach(a => {
      a.classList.toggle('done', !!done[a.dataset.id]);
      a.classList.toggle('active', a.dataset.id === currentId);
      if (a.dataset.id === currentId) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    document.getElementById('sbBar').style.width = (got / total * 100) + '%';
    document.getElementById('sbPct').textContent = `${got}/${total} lessons`;
    if (currentId) { const l = COURSE.byId[currentId]; if (l) { openMods.add(l.mod.id); syncMods(); } }

    // continue card
    const last = Store.get('last', null);
    const next = (last && COURSE.byId[last] && COURSE.flat[COURSE.flat.indexOf(COURSE.byId[last]) + (done[last] ? 1 : 0)]) || COURSE.flat.find(l => l.ready) || COURSE.flat[0];
    const slot = document.querySelector('.sb-continue-slot');
    if (slot && next) slot.innerHTML = `<a class="sb-continue" href="#/lesson/${next.id}"><span class="eyebrow">${last ? 'Continue' : 'Start here'}</span><strong>${next.title}</strong></a>`;
  }
  function scrollActive() { document.querySelector('.lesson-link.active')?.scrollIntoView({ block: 'nearest' }); }

  /* ---------- state controls ---------- */
  function setState(s) { state = s; apply(); }
  function setMode(m) { mode = m; if (m === 'auto') state = 'closed'; else if (state === 'closed' && !isMobile()) state = 'open'; apply(); }
  function toggle() { setState(state === 'open' ? 'closed' : 'open'); }
  function toggleFocus() { focus = !focus; apply(); }

  /* ---------- resize ---------- */
  function initResize() {
    const h = document.getElementById('sbResize');
    h.addEventListener('pointerdown', e => {
      e.preventDefault(); h.setPointerCapture(e.pointerId); body.classList.add('resizing');
      const mv = ev => { width = Math.max(MIN, Math.min(MAX, ev.clientX)); body.style.setProperty('--sb-w', width + 'px'); };
      const up = () => { h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); body.classList.remove('resizing'); Store.set('sb.w', width); };
      h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up);
    });
    h.addEventListener('dblclick', () => { width = DEF; apply(); });
  }

  /* ---------- auto-hide peek ---------- */
  function initPeek() {
    const edge = document.getElementById('sbEdge');
    let t;
    const open = () => { if (mode === 'auto' && state === 'closed') { clearTimeout(t); body.classList.add('peek'); sb.inert = false; } };
    const close = () => { clearTimeout(t); t = setTimeout(() => { body.classList.remove('peek'); sb.inert = state === 'closed' || focus; }, 280); };
    edge.addEventListener('pointerenter', open);
    sb.addEventListener('pointerenter', () => { if (body.classList.contains('peek')) clearTimeout(t); });
    sb.addEventListener('pointerleave', () => { if (body.classList.contains('peek')) close(); });
  }

  function init() {
    build(); initResize(); initPeek();
    document.querySelectorAll('[data-sb-toggle]').forEach(b => b.addEventListener('click', toggle));
    document.querySelectorAll('[data-sb-rail]').forEach(b => b.addEventListener('click', () => setState(state === 'rail' ? 'open' : 'rail')));
    document.querySelectorAll('[data-mode-opt]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.modeOpt)));
    document.querySelectorAll('[data-focus-toggle]').forEach(b => b.addEventListener('click', toggleFocus));
    document.getElementById('sbBackdrop').addEventListener('click', () => setState('closed'));
    document.addEventListener('keydown', e => {
      const typing = /input|textarea|select/i.test(e.target.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); toggle(); }
      else if (!typing && !e.ctrlKey && !e.metaKey && e.key.toLowerCase() === 'f') toggleFocus();
      else if (e.key === 'Escape') {
        if (focus) toggleFocus();
        else if (state === 'open' && (mode !== 'pinned' || isMobile())) setState('closed');
      }
    });
    matchMedia('(max-width: 900px)').addEventListener('change', apply);
    apply(); refresh(); refreshProfile();
    Store.on('done', () => refresh());
    if (window.Profile) Profile.on(refreshProfile);
  }

  function setPage(name) { document.querySelectorAll('.sb-primary a').forEach(a => a.classList.toggle('active', a.dataset.page === name)); }
  function refreshProfile() {
    if (!window.Profile) return;
    const p = Profile.profile, lv = Profile.level(), st = Profile.liveStreak();
    const chip = document.getElementById('sbWho'); if (!chip) return;
    chip.innerHTML = `<b>${UI.esc(p.name || 'Learner')}</b><small>Level ${lv.level}${st ? ' · ' + st + '-day streak' : ''}</small>`;
    const av = document.getElementById('sbAvatar'); if (av && !av.querySelector('img')) av.textContent = (p.name || 'L').trim().charAt(0).toUpperCase();
  }
  window.Sidebar = { init, refresh, scrollActive, setState, toggle, toggleFocus, setMode, getMode: () => mode, setPage, refreshProfile, get focus() { return focus; } };
})();
