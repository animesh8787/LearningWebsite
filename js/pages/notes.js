/* Notes and bookmarks: one searchable place for both. */
(function () {
  const { esc, ago } = UI;

  Pages.notes = function (root) {
    const P = Profile;
    let q = '', mod = 'all', view = 'all';

    function collect() {
      const notes = Object.entries(P.get('notes')).filter(([id, n]) => COURSE.byId[id] && n && n.text && n.text.trim())
        .map(([id, n]) => ({ lesson: COURSE.byId[id], text: n.text, updated: n.updated }));
      const marks = Object.entries(P.get('bookmarks')).filter(([id, b]) => COURSE.byId[id] && b && b.on)
        .map(([id, b]) => ({ lesson: COURSE.byId[id], t: b.t }));
      const match = l => (mod === 'all' || l.mod.id === mod);
      const text = (l, extra) => (q ? (l.title + ' ' + l.mod.title + ' ' + (extra || '')).toLowerCase().includes(q) : true);
      return {
        notes: notes.filter(n => match(n.lesson) && text(n.lesson, n.text)).sort((a, b) => b.updated - a.updated),
        marks: marks.filter(m => match(m.lesson) && text(m.lesson)).sort((a, b) => b.t - a.t),
      };
    }

    function list() {
      const { notes, marks } = collect();
      const showN = view !== 'bookmarks', showB = view !== 'notes';
      let h = '';
      if (showB) h += `<section class="pg-sec" style="margin-top:0"><h2>Bookmarks <span class="muted-s">${marks.length}</span></h2>${marks.length ? `<div class="plist">${marks.map(m => `<a href="#/lesson/${m.lesson.id}"><span class="t"><b>${esc(m.lesson.title)}</b><small>${esc(m.lesson.part.name)} · ${esc(m.lesson.mod.title)}</small></span><span class="m">${ago(m.t)}</span></a>`).join('')}</div>` : `<div class="empty"><b>${q || mod !== 'all' ? 'No bookmarks match' : 'No bookmarks yet'}</b>${q || mod !== 'all' ? 'Try a different search or module.' : 'Use the bookmark button at the top of any lesson to save it here.'}</div>`}</section>`;
      if (showN) h += `<section class="pg-sec"><h2>Notes <span class="muted-s">${notes.length}</span></h2>${notes.length ? `<div class="plist">${notes.map(n => `<div class="note-card"><header><a href="#/lesson/${n.lesson.id}">${esc(n.lesson.title)}</a><small>${esc(n.lesson.mod.title)} · ${ago(n.updated)}</small></header><pre>${esc(n.text)}</pre></div>`).join('')}</div>` : `<div class="empty"><b>${q || mod !== 'all' ? 'No notes match' : 'No notes yet'}</b>${q || mod !== 'all' ? 'Try a different search or module.' : 'Open the Notes panel at the bottom of any lesson and write something.'}</div>`}</section>`;
      root.querySelector('#nList').innerHTML = h;
    }

    root.innerHTML = `
    <div class="page">
      <header class="pg-head"><div class="eyebrow"><b>/</b> Notes</div><h1>Notes and <em>bookmarks.</em></h1><p>Everything you saved while learning, in one place.</p></header>
      <div class="note-tools">
        <input class="txt-input" id="nQ" type="search" placeholder="Search notes and lessons" aria-label="Search notes and bookmarks">
        <select class="txt-input" id="nMod" aria-label="Filter by module" style="min-width:180px;flex:none"><option value="all">All modules</option>${COURSE.modules.map(m => `<option value="${m.id}">${String(m.no).padStart(2, '0')} ${esc(m.title)}</option>`).join('')}</select>
        <div class="seg lg" role="group" aria-label="Show">${[['all', 'All'], ['notes', 'Notes'], ['bookmarks', 'Bookmarks']].map(([k, t]) => `<button data-v="${k}" class="${k === 'all' ? 'on' : ''}">${t}</button>`).join('')}</div>
        <button class="pbtn" id="nExport">Export as Markdown</button>
      </div>
      <div id="nList"></div>
    </div>`;
    list();

    root.querySelector('#nQ').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); list(); });
    root.querySelector('#nMod').addEventListener('change', e => { mod = e.target.value; list(); });
    root.querySelectorAll('.seg button').forEach(b => b.addEventListener('click', () => {
      view = b.dataset.v; root.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x === b)); list();
    }));
    root.querySelector('#nExport').addEventListener('click', () => {
      const all = Object.entries(P.get('notes')).filter(([id, n]) => COURSE.byId[id] && n.text.trim());
      const marks = Object.entries(P.get('bookmarks')).filter(([id, b]) => COURSE.byId[id] && b.on);
      let md = '# My C++ and STL notes\n\n';
      if (marks.length) md += '## Bookmarks\n\n' + marks.map(([id]) => `- ${COURSE.byId[id].title} (${COURSE.byId[id].mod.title})`).join('\n') + '\n\n';
      md += '## Notes\n\n' + (all.length ? all.map(([id, n]) => `### ${COURSE.byId[id].title}\n*${COURSE.byId[id].mod.title}*\n\n${n.text.trim()}\n`).join('\n') : '_No notes yet._\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })); a.download = 'cpp-course-notes.md';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
  };
})();
