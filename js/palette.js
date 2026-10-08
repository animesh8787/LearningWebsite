/* Ctrl/Cmd-K command palette: jump to any lesson or run an action. */
(function () {
  const wrap = document.getElementById('palette');
  const input = wrap.querySelector('input');
  const list = wrap.querySelector('.pal-list');
  let items = [], sel = 0;

  const actions = () => [
    { t: 'Dashboard', m: 'page', run: () => (location.hash = '#/') },
    { t: 'Notes and bookmarks', m: 'page', run: () => (location.hash = '#/notes') },
    { t: 'Achievements and stats', m: 'page', run: () => (location.hash = '#/achievements') },
    { t: 'Settings', m: 'page', run: () => (location.hash = '#/settings') },
    { t: 'Back to the home page', m: 'page', run: () => (location.href = '../') },
    { t: 'Toggle theme (dark / light)', m: 'action', run: () => App.toggleTheme() },
    { t: 'Toggle focus mode', m: 'F', run: () => Sidebar.toggleFocus() },
    { t: 'Toggle sidebar', m: 'Ctrl B', run: () => Sidebar.toggle() },
  ];

  const SYN = { 'unordered-map': 'hash hashmap dictionary', 'unordered-set': 'hash hashset', 'priority-queue': 'heap pq', 'set': 'bst tree sorted', 'map': 'dictionary tree', 'vector': 'dynamic array arraylist', 'list': 'linked list', 'big-o': 'complexity time performance', 'pointers': 'address reference', 'smart-pointers': 'unique_ptr shared_ptr weak_ptr', 'recursion': 'stack frames call', 'sorting': 'sort comparator', 'searching': 'binary search lower_bound upper_bound', 'bits': 'bitwise xor and or shift', 'lambdas': 'closure anonymous function', 'templates': 'generic', 'raii': 'destructor cleanup', 'move-semantics': 'rvalue std::move', 'patterns': 'leetcode interview two pointers sliding window', 'mistakes': 'bugs errors pitfalls', 'cheatsheet': 'reference summary', 'pick-container': 'which choose decision' };
  function build(q) {
    q = q.trim().toLowerCase();
    const all = COURSE.flat.map(l => ({ t: l.title, m: `${l.part.name} · ${l.mod.title}`, run: () => (location.hash = '#/lesson/' + l.id), s: (l.title + ' ' + l.mod.title + ' ' + l.id + ' ' + (SYN[l.id] || '')).toLowerCase(), l }))
      .concat(actions().map(a => Object.assign(a, { s: a.t.toLowerCase() })));
    items = (q ? all.filter(i => q.split(/\s+/).every(w => i.s.includes(w))) : all.slice(0, 8).concat([])).slice(0, 40);
    if (!q) items = actions().map(a => Object.assign(a, { s: '' })).concat(COURSE.flat.filter(l => l.ready).map(l => ({ t: l.title, m: `${l.part.name} · ${l.mod.title}`, run: () => (location.hash = '#/lesson/' + l.id) })));
    sel = 0; paint();
  }
  function paint() {
    list.innerHTML = items.length ? items.map((i, k) => `<div class="pal-item${k === sel ? ' sel' : ''}" role="option" id="pal-${k}" aria-selected="${k === sel}" data-k="${k}"><span>${i.t}</span><span class="m">${i.m}</span></div>`).join('') : '<div class="pal-empty">Nothing matches. Try a container name like “vector”.</div>';
    list.querySelector('.sel')?.scrollIntoView({ block: 'nearest' });
    input.setAttribute('aria-activedescendant', items.length ? 'pal-' + sel : '');
  }
  let opener = null;
  function open() { opener = document.activeElement; wrap.classList.add('open'); input.value = ''; build(''); input.focus(); if (window.App && App.lenis) App.lenis.stop(); }
  function close() { wrap.classList.remove('open'); if (window.App && App.lenis) App.lenis.start(); if (opener && opener.focus) opener.focus(); }
  function choose(k) { const it = items[k]; if (!it) return; close(); it.run(); }

  input.addEventListener('input', () => build(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); paint(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); paint(); e.preventDefault(); }
    else if (e.key === 'Enter') choose(sel);
    else if (e.key === 'Escape') close();
  });
  list.addEventListener('click', e => { const r = e.target.closest('.pal-item'); if (r) choose(+r.dataset.k); });
  wrap.addEventListener('mousedown', e => { if (e.target === wrap) close(); });
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); wrap.classList.contains('open') ? close() : open(); }
  });
  document.querySelectorAll('[data-palette]').forEach(b => b.addEventListener('click', open));
  window.Palette = { open, close };
})();
