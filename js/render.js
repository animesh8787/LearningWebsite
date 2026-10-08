/* Lesson renderer: turns a lesson definition (array of blocks) into DOM. */
(function () {
  const esc = Highlight.esc;

  /** inline formatting: `code`, **bold**, [[glossary term]] */
  function fmt(s) {
    return String(s)
      .replace(/`([^`]+)`/g, (_, c) => `<code class="i">${c}</code>`)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_, key, label) => { const d = (window.GLOSSARY || {})[key.toLowerCase()]; return `<span class="term" tabindex="0" role="button" data-term="${key.toLowerCase()}"${d ? ` aria-label="${(label || key).replace(/"/g, '')}: ${d.replace(/"/g, '&quot;')}"` : ''}>${label || key}</span>`; });
  }

  const B = {
    h2(b, ctx) {
      const id = 's' + (++ctx.n);
      ctx.toc.push({ id, text: b.text });
      return `<h2 id="${id}"><span class="n">${String(ctx.n).padStart(2, '0')}</span>${fmt(b.text)}</h2>`;
    },
    h3: b => `<h3>${fmt(b.text)}</h3>`,
    p: b => `<p>${fmt(b.html)}</p>`,
    ul: b => `<${b.ordered ? 'ol' : 'ul'}>${b.items.map(i => `<li>${fmt(i)}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`,
    callout: b => `<div class="callout ${b.kind || 'tip'}"><span class="k">${{ tip: 'Tip', warn: 'Careful', interview: 'Interview' }[b.kind || 'tip']}</span><div>${b.html.startsWith('<') ? b.html : '<p>' + fmt(b.html) + '</p>'}</div></div>`,
    levels(b, ctx) {
      const id = 'lv' + (++ctx.lv);
      const tabs = [['eli5', 'Like I’m new'], ['plain', 'Plain English'], ['tech', 'Technical']].filter(([k]) => b[k]);
      const first = b.start || (tabs.find(t => t[0] === 'plain') || tabs[0])[0];
      return `<div class="levels" data-lv="${id}">
        <div class="levels-tabs" role="tablist">${tabs.map(([k, l]) => `<button role="tab" aria-selected="${k === first}" data-k="${k}" class="${k === first ? 'on' : ''}">${l}</button>`).join('')}</div>
        <div class="levels-body">${tabs.map(([k]) => `<div data-k="${k}" class="${k === first ? 'on' : ''}">${[].concat(b[k]).map(x => '<p>' + fmt(x) + '</p>').join('')}</div>`).join('')}</div></div>`;
    },
    code(b, ctx) {
      const id = 'cb' + (++ctx.cb);
      ctx.code[id] = b.code;
      const hl = new Set(b.hl || []);
      const html = Highlight.lines(b.code).map((h, i) => `<span class="cl${hl.has(i + 1) ? ' hl' : ''}">${h || ' '}</span>`).join('');
      return `<div class="codeblock" data-cb="${id}">
        <div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span class="fn">${esc(b.file || 'main.cpp')}</span>
          <button data-a="copy">Copy</button>${window.AI && AI.enabled ? '<button data-a="ask" title="Ask the AI tutor about this code">Ask AI</button>' : ''}${b.run === false ? '' : '<button class="run" data-a="run">▶ Run</button>'}</div>
        <pre data-lenis-prevent-wheel tabindex="0"><code>${html}</code></pre>${/\b(cin|getline|scanf)\b/.test(b.code) && b.run !== false ? '<textarea class="code-in show" rows="2" aria-label="Program input (stdin)" placeholder="Program input goes here (what the user would type)…"></textarea>' : ''}<div class="code-out" role="status" aria-live="polite"></div></div>`;
    },
    viz: (b, ctx) => { const id = 'vz' + (++ctx.vz); ctx.viz.push({ id, kind: b.kind, cfg: b.cfg || {} }); return `<div id="${id}"></div>`; },
    table: b => `<div class="tbl-wrap"><table><thead><tr>${b.head.map(h => `<th>${fmt(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${fmt(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`,
    quiz(b, ctx) {
      const id = 'qz' + (++ctx.qz);
      ctx.quiz[id] = b;
      return `<div class="quiz" id="${id}"><span class="eyebrow"><b>●</b> Check yourself</span><div class="q">${fmt(b.q)}</div>
        ${b.opts.map((o, i) => `<button class="opt" data-i="${i}"><span class="l">${'ABCD'[i]}</span><span>${fmt(o)}</span></button>`).join('')}
        <div class="why" role="status" aria-live="polite">${fmt(b.why || '')}</div></div>`;
    },
    recap: b => `<div class="recap"><span class="eyebrow"><b>●</b> Recap</span><h3>What you can now do</h3><ul>${b.items.map(i => `<li>${fmt(i)}</li>`).join('')}</ul>
      <button class="btn complete-btn" data-a="complete">Mark lesson complete <span class="arr">→</span></button></div>`,
  };

  function lesson(def, meta) {
    const ctx = { n: 0, lv: 0, cb: 0, vz: 0, qz: 0, toc: [], code: {}, viz: [], quiz: {} };
    const body = def.blocks.map(b => (B[b.t] ? B[b.t](b, ctx) : '')).join('');
    const html = `
      <div class="lesson-grid">
        <article class="article">
          <div class="eyebrow"><span>${meta.part.name}</span><span>/ ${String(meta.mod.no).padStart(2, '0')} ${meta.mod.title}</span><span>/ ${meta.min} min</span></div>
          <h1>${def.title}</h1>
          <p class="lead">${fmt(def.lead)}</p>
          <div class="lesson-actions"><button class="bm-btn" id="bmBtn" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg><span>Bookmark</span></button></div>
          ${body}
          <details class="notes-panel" id="notesPanel"><summary>Your notes for this lesson <small>saved automatically</small></summary><textarea id="notesText" aria-label="Notes for this lesson" placeholder="Write anything you want to remember. Markdown is fine."></textarea></details>
          <div class="lesson-nav">${meta.prev ? `<a class="prev" href="#/lesson/${meta.prev.id}"><span class="eyebrow">← Previous</span><strong>${meta.prev.title}</strong></a>` : '<span></span>'}
            ${meta.next ? `<a class="next" href="#/lesson/${meta.next.id}"><span class="eyebrow">Next →</span><strong>${meta.next.title}</strong></a>` : ''}</div>
        </article>
        <aside class="toc"><span class="eyebrow">On this page</span>${ctx.toc.map(t => `<a href="#${t.id}" data-id="${t.id}">${fmt(t.text).replace(/<[^>]+>/g, '')}</a>`).join('')}</aside>
      </div>`;
    return { html, ctx };
  }

  /** wire up interactivity inside a rendered lesson */
  function activate(root, ctx, lessonId) {
    ctx.viz.forEach(v => Viz.mount(root.querySelector('#' + v.id), v.kind, v.cfg));

    // bookmark, notes and completion state
    if (window.Profile) {
      const bm = root.querySelector('#bmBtn');
      const paint = on => { bm.setAttribute('aria-pressed', on); bm.querySelector('span').textContent = on ? 'Bookmarked' : 'Bookmark'; };
      paint(Profile.isBookmarked(lessonId));
      bm.addEventListener('click', () => paint(Profile.toggleBookmark(lessonId)));

      const panel = root.querySelector('#notesPanel'), ta = root.querySelector('#notesText');
      ta.value = Profile.getNote(lessonId); if (ta.value.trim()) panel.open = true;
      let t; ta.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => Profile.setNote(lessonId, ta.value), 600); });
      ta.addEventListener('blur', () => { clearTimeout(t); Profile.setNote(lessonId, ta.value); });

      const cb = root.querySelector('[data-a="complete"]');
      if (cb && Store.isDone(lessonId)) cb.innerHTML = 'Completed ✓';
    }

    root.addEventListener('click', async e => {
      const lv = e.target.closest('.levels-tabs button');
      if (lv) {
        const box = lv.closest('.levels');
        box.querySelectorAll('[data-k]').forEach(n => { n.classList.toggle('on', n.dataset.k === lv.dataset.k); if (n.getAttribute('role') === 'tab') n.setAttribute('aria-selected', n.dataset.k === lv.dataset.k); });
        return;
      }
      const act = e.target.closest('[data-a]');
      if (act && act.closest('.codeblock')) {
        const cb = act.closest('.codeblock'); const code = ctx.code[cb.dataset.cb];
        if (act.dataset.a === 'copy') {
          try { await navigator.clipboard.writeText(code); act.textContent = 'Copied'; } catch (_) { act.textContent = 'Press Ctrl+C'; }
          setTimeout(() => (act.textContent = 'Copy'), 1200);
        } else if (act.dataset.a === 'ask') {
          if (window.AI) AI.ask({ text: 'Walk me through this code, line by line.', code });
        } else if (act.dataset.a === 'run') {
          const out = cb.querySelector('.code-out'); out.className = 'code-out show';
          out.innerHTML = '<span class="lbl">Compiling…</span>'; act.disabled = true;
          const stdin = cb.querySelector('.code-in'); const r = await Runner.run(code, stdin ? stdin.value : '');
          out.className = 'code-out show' + (r.ok ? '' : ' err');
          out.innerHTML = `<span class="lbl">${r.ok ? 'Output' : 'Problem'}</span>${esc(r.text)}`;
          act.disabled = false;
        }
        return;
      }
      if (act && act.dataset.a === 'complete') {
        const r = window.Profile ? Profile.completeLesson(lessonId) : (Store.markDone(lessonId), {});
        act.innerHTML = 'Completed ✓';
        if (!r.already) { Effects.confetti(act); if (r.xp && window.Profile) Profile.toast('Lesson complete', '+' + r.xp + ' XP', '+' + r.xp); }
        return;
      }
      const opt = e.target.closest('.opt');
      if (opt) {
        const q = opt.closest('.quiz'); const def = ctx.quiz[q.id];
        if (q.dataset.done) return;
        const i = +opt.dataset.i;
        if (!q.dataset.tried) { q.dataset.tried = 1; if (window.Profile) Profile.quiz(lessonId, q.id, i === def.ans); }
        if (i === def.ans) {
          q.dataset.done = 1; opt.classList.add('right'); q.querySelector('.why').classList.add('show');
        } else { opt.classList.add('wrong'); setTimeout(() => opt.classList.remove('wrong'), 500); }
      }
    });
  }

  window.Render = { lesson, activate, fmt };
})();
