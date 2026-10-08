/* STL container playgrounds: vecgrow, heaptree, bst, hashtab, deqblocks, listviz, decision */
(function () {
  const esc = Highlight.esc;
  const hex = n => '0x' + n.toString(16).toUpperCase().padStart(4, '0');
  const btn = (label, attrs = '', cls = 'ghost') => `<button class="btn ${cls}" ${attrs} style="--h:34px;padding:0 14px;font-size:.88rem">${label}</button>`;
  const NS = 'http://www.w3.org/2000/svg';

  /* ================= vecgrow ================= */
  Viz.register('vecgrow', cfg => ({
    title: 'vector: size, capacity and reallocation',
    custom(stage) {
      const S = { cap: 0, size: 0, addr: 0x1000, reallocs: 0, copies: 0, msg: 'The vector starts empty with no memory at all.', grew: false };
      stage.innerHTML = `<div class="vg-stats"></div><div class="vg-slots"></div><div class="vg-msg"></div>
        <div class="vg-btns">${btn('push_back', 'data-a="push"', '')}${btn('push ×10', 'data-a="push10"')}${btn('pop_back', 'data-a="pop"')}${btn('reserve(32)', 'data-a="reserve"')}${btn('shrink_to_fit', 'data-a="shrink"')}${btn('reset', 'data-a="reset"')}</div>`;
      function realloc(newCap) {
        const old = S.cap; S.reallocs++; S.copies += S.size; S.addr += 0x1000; S.cap = newCap;
        S.msg = `<b>Reallocation!</b> No room left, so capacity ${old} → ${newCap}. A new block at <code class="i">${hex(S.addr)}</code> was allocated, ${S.size} element${S.size === 1 ? '' : 's'} copied over, and the old block freed. Any pointer or iterator into the old block is now <b>invalid</b>.`;
        S.grew = true;
      }
      function push() { S.grew = false; if (S.size === S.cap) realloc(S.cap ? S.cap * 2 : 1); else S.msg = `Room available, so the new element just goes in slot ${S.size}. <b>O(1)</b>, nothing copied.`; S.size++; }
      function draw() {
        stage.querySelector('.vg-stats').innerHTML = [['size()', S.size], ['capacity()', S.cap], ['data()', hex(S.addr)], ['reallocations', S.reallocs], ['total copies', S.copies]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
        const n = Math.min(S.cap, 64);
        stage.querySelector('.vg-slots').innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < S.size ? 'on' : ''}${S.grew && i < S.size - 1 ? ' moved' : ''}">${i < S.size ? i + 1 : ''}</i>`).join('') || '<span class="muted-s">no memory allocated yet</span>';
        stage.querySelector('.vg-msg').innerHTML = S.msg;
      }
      stage.addEventListener('click', e => {
        const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
        if (a === 'push') push();
        else if (a === 'push10') { const r0 = S.reallocs; for (let i = 0; i < 10; i++) push(); S.msg = `Ten pushes triggered <b>${S.reallocs - r0}</b> reallocation${S.reallocs - r0 === 1 ? '' : 's'}. Doubling means copies stay rare: total copies (${S.copies}) is less than the number of elements pushed (${S.size}).`; S.grew = false; }
        else if (a === 'pop') { S.grew = false; if (S.size) { S.size--; S.msg = '<code class="i">pop_back()</code> only lowers size. The capacity (and the memory) stays reserved for reuse.'; } }
        else if (a === 'reserve') { S.grew = false; if (S.cap < 32) { realloc(32); S.msg = `<code class="i">reserve(32)</code> allocates once, up front: capacity 32, and the next 32 pushes can never reallocate.`; S.grew = false; } else S.msg = 'Already at least 32.'; }
        else if (a === 'shrink') { S.grew = false; if (S.cap > S.size) { S.cap = S.size; S.addr += 0x1000; S.reallocs++; S.copies += S.size; S.msg = '<code class="i">shrink_to_fit()</code> asks for a block exactly as big as size (it copies once).'; } }
        else if (a === 'reset') Object.assign(S, { cap: 0, size: 0, addr: 0x1000, reallocs: 0, copies: 0, grew: false, msg: 'Back to an empty vector.' });
        draw();
      });
      draw();
    },
  }));

  /* ================= heaptree ================= */
  Viz.register('heaptree', cfg => ({
    title: 'priority_queue: a heap, shown two ways',
    custom(stage) {
      let mode = cfg.mode || 'max'; let a = (cfg.items || [50, 30, 40, 10, 20]).slice(); let hl = []; let msg = 'The array below and the tree above are the <b>same data</b>. Children of index <code class="i">i</code> live at <code class="i">2i+1</code> and <code class="i">2i+2</code>.';
      const before = (x, y) => (mode === 'max' ? x > y : x < y);
      stage.innerHTML = `<div class="ht-ctl"><input type="number" value="${cfg.next ?? 45}" aria-label="value to push">${btn('push', 'data-a="push"', '')}${btn('pop top', 'data-a="pop"')}${btn(mode === 'max' ? 'max-heap' : 'min-heap', 'data-a="mode"')}</div>
        <svg class="ht-svg" viewBox="0 0 600 220"></svg><div class="ht-arr"></div><div class="vg-msg"></div>`;
      const svg = stage.querySelector('svg'), inp = stage.querySelector('input');
      function heapify() { const t = a.slice(); a = []; t.forEach(x => { a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (before(a[i], a[p])) { [a[i], a[p]] = [a[p], a[i]]; i = p; } else break; } }); }
      function draw() {
        const depth = Math.max(1, Math.floor(Math.log2(a.length || 1)) + 1); let h = '';
        const pos = i => { const d = Math.floor(Math.log2(i + 1)), first = (1 << d) - 1, cnt = 1 << d; return [((i - first) + .5) / cnt * 600, 30 + d * 52]; };
        a.forEach((_, i) => { if (i) { const [x1, y1] = pos((i - 1) >> 1), [x2, y2] = pos(i); h += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--line-strong)" stroke-width="1.5"/>`; } });
        a.forEach((v, i) => { const [x, y] = pos(i); const on = hl.includes(i); h += `<g><circle cx="${x}" cy="${y}" r="18" fill="${on ? 'var(--accent)' : 'var(--surface)'}" stroke="${i === 0 ? 'var(--accent)' : 'var(--line-strong)'}" stroke-width="1.5"/><text x="${x}" y="${y + 5}" text-anchor="middle" font-family="var(--font-mono)" font-size="13" font-weight="500" fill="${on ? 'var(--accent-ink)' : 'var(--text)'}">${v}</text></g>`; });
        svg.setAttribute('viewBox', `0 0 600 ${Math.max(70, 40 + depth * 52)}`); svg.innerHTML = h || '<text x="300" y="40" text-anchor="middle" fill="var(--muted)" font-size="13">empty heap</text>';
        stage.querySelector('.ht-arr').innerHTML = a.map((v, i) => `<div class="${hl.includes(i) ? 'on' : ''}"><small>${i}</small><b>${v}</b></div>`).join('');
        stage.querySelector('.vg-msg').innerHTML = msg;
      }
      stage.addEventListener('click', e => {
        const b = e.target.closest('[data-a]'); if (!b) return; const k = b.dataset.a; hl = [];
        if (k === 'push') {
          const v = +inp.value || 0; a.push(v); let i = a.length - 1; hl = [i]; let swaps = 0;
          while (i > 0) { const p = (i - 1) >> 1; if (before(a[i], a[p])) { [a[i], a[p]] = [a[p], a[i]]; i = p; hl.push(i); swaps++; } else break; }
          msg = `Pushed <b>${v}</b> at the end, then <b>sifted up</b> ${swaps} level${swaps === 1 ? '' : 's'} (highlighted path) until its parent was ${mode === 'max' ? 'bigger' : 'smaller'}. Cost: at most the tree height, <b>O(log n)</b>.`;
        } else if (k === 'pop') {
          if (!a.length) { msg = 'Nothing to pop.'; } else {
            const top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0, swaps = 0; hl = [0];
              for (;;) { let c = i; const l = 2 * i + 1, r = l + 1; if (l < a.length && before(a[l], a[c])) c = l; if (r < a.length && before(a[r], a[c])) c = r; if (c === i) break; [a[i], a[c]] = [a[c], a[i]]; i = c; hl.push(i); swaps++; } msg = `Popped the top <b>${top}</b>. The last element moved to the root and <b>sifted down</b> ${swaps} level${swaps === 1 ? '' : 's'}. Cost <b>O(log n)</b>. Reading the top is just <code class="i">a[0]</code>: <b>O(1)</b>.`; } else msg = `Popped <b>${top}</b>. The heap is now empty.`;
          }
        } else if (k === 'mode') { mode = mode === 'max' ? 'min' : 'max'; b.textContent = mode === 'max' ? 'max-heap' : 'min-heap'; heapify(); msg = `Rebuilt as a <b>${mode}-heap</b>: the ${mode === 'max' ? 'largest' : 'smallest'} value is always on top. (C++’s default <code class="i">priority_queue</code> is a max-heap.)`; }
        draw();
      });
      heapify(); draw();
    },
  }));

  /* ================= bst (AVL) ================= */
  Viz.register('bst', cfg => ({
    title: 'set / map: a self-balancing search tree',
    custom(stage) {
      let root = null, rot = 0, path = [], found = null, msg = 'Smaller keys go left, bigger keys go right. Insert some values.';
      const H = n => (n ? n.h : 0), upd = n => { n.h = 1 + Math.max(H(n.l), H(n.r)); };
      const rotR = y => { const x = y.l; y.l = x.r; x.r = y; upd(y); upd(x); rot++; return x; };
      const rotL = x => { const y = x.r; x.r = y.l; y.l = x; upd(x); upd(y); rot++; return y; };
      function ins(n, k) {
        if (!n) return { k, l: null, r: null, h: 1 };
        if (k < n.k) n.l = ins(n.l, k); else if (k > n.k) n.r = ins(n.r, k); else return n;
        upd(n); const b = H(n.l) - H(n.r);
        if (b > 1) { if (k > n.l.k) n.l = rotL(n.l); return rotR(n); }
        if (b < -1) { if (k < n.r.k) n.r = rotR(n.r); return rotL(n); }
        return n;
      }
      stage.innerHTML = `<div class="ht-ctl"><input type="number" value="${cfg.next ?? 25}" aria-label="key">${btn('insert', 'data-a="ins"', '')}${btn('lower_bound', 'data-a="lb"')}${btn('insert 1…7 in order', 'data-a="seq"')}${btn('reset', 'data-a="reset"')}</div>
        <svg class="ht-svg" viewBox="0 0 600 200"></svg><div class="vg-msg"></div>`;
      const svg = stage.querySelector('svg'), inp = stage.querySelector('input');
      function draw() {
        const pos = new Map(); let idx = 0, maxd = 1;
        (function walk(n, d) { if (!n) return; walk(n.l, d + 1); pos.set(n, [idx++, d]); maxd = Math.max(maxd, d + 1); walk(n.r, d + 1); })(root, 0);
        const total = Math.max(1, idx); const X = i => 30 + (i + .5) * Math.min(52, 540 / total); const Y = d => 28 + d * 46; let h = '';
        pos.forEach(([i, d], n) => { [n.l, n.r].forEach(c => { if (c) { const [ci, cd] = pos.get(c); h += `<line x1="${X(i)}" y1="${Y(d)}" x2="${X(ci)}" y2="${Y(cd)}" stroke="${path.includes(n.k) && path.includes(c.k) ? 'var(--accent)' : 'var(--line-strong)'}" stroke-width="${path.includes(n.k) && path.includes(c.k) ? 2.4 : 1.4}"/>`; } }); });
        pos.forEach(([i, d], n) => { const on = path.includes(n.k), hit = found === n.k; h += `<circle cx="${X(i)}" cy="${Y(d)}" r="17" fill="${hit ? 'var(--accent)' : on ? 'var(--accent-soft)' : 'var(--surface)'}" stroke="${on ? 'var(--accent)' : 'var(--line-strong)'}" stroke-width="1.5"/><text x="${X(i)}" y="${Y(d) + 5}" text-anchor="middle" font-family="var(--font-mono)" font-size="13" font-weight="500" fill="${hit ? 'var(--accent-ink)' : 'var(--text)'}">${n.k}</text>`; });
        svg.setAttribute('viewBox', `0 0 600 ${Math.max(80, 50 + maxd * 46)}`); svg.innerHTML = h || '<text x="300" y="40" text-anchor="middle" fill="var(--muted)" font-size="13">empty tree</text>';
        stage.querySelector('.vg-msg').innerHTML = `${msg}<div class="muted-s" style="margin-top:6px">height ${H(root)} · rotations so far: ${rot}</div>`;
      }
      stage.addEventListener('click', e => {
        const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; path = []; found = null;
        if (a === 'ins') { const k = +inp.value; const r0 = rot; root = ins(root, k); path = [k]; msg = `Inserted <b>${k}</b>: walk down comparing, attach as a leaf, then ${rot > r0 ? `<b>rotate ${rot - r0}×</b> to restore balance` : 'no rotation needed'}. Height stays about log₂ n, so insert, erase and find are all <b>O(log n)</b>.`; inp.value = k + 5; }
        else if (a === 'seq') { root = null; rot = 0; for (let k = 1; k <= 7; k++) root = ins(root, k); msg = `Inserted 1 through 7 <b>in sorted order</b>. A naive tree would become a 7-long chain (the worst case, O(n)). The tree rotated <b>${rot}×</b> and stayed bushy: that is what “self-balancing” buys you.`; }
        else if (a === 'lb') { const k = +inp.value; let n = root, best = null; while (n) { path.push(n.k); if (n.k >= k) { best = n.k; n = n.l; } else n = n.r; } found = best; msg = best === null ? `<code class="i">lower_bound(${k})</code> found nothing: every key is smaller (returns <code class="i">end()</code>).` : `<code class="i">lower_bound(${k})</code> = <b>${best}</b>, the first key ≥ ${k}. The highlighted path shows the O(log n) walk.`; }
        else if (a === 'reset') { root = null; rot = 0; msg = 'Cleared.'; }
        draw();
      });
      if (cfg.seed !== false) { [20, 10, 30, 5, 15, 25, 40].forEach(k => (root = ins(root, k))); rot = 0; msg = 'A set holding 5, 10, 15, 20, 25, 30, 40. Try <b>lower_bound</b> with different keys, or insert more.'; }
      draw();
    },
  }));

  /* ================= hashtab ================= */
  Viz.register('hashtab', cfg => ({
    title: 'unordered_map: buckets and collisions',
    custom(stage) {
      const SIZES = [7, 17, 37, 79, 163]; let si = 0; let items = []; let msg = 'Each key is turned into a bucket number by a <b>hash function</b>. Here: <code class="i">key % bucketCount</code>.'; let hit = null;
      const hashOf = k => (/^-?\d+$/.test(k) ? Math.abs(+k) : [...k].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7));
      const bk = k => hashOf(k) % SIZES[si];
      stage.innerHTML = `<div class="ht-ctl"><input value="${cfg.next ?? '31'}" aria-label="key" style="width:110px">${btn('insert', 'data-a="ins"', '')}${btn('find', 'data-a="find"')}${btn('reset', 'data-a="reset"')}</div>
        <div class="hx-stats"></div><div class="hx-b"></div><div class="vg-msg"></div>`;
      const inp = stage.querySelector('input');
      function draw() {
        const B = SIZES[si]; const lf = items.length / B; const chains = Array.from({ length: B }, () => []); items.forEach(k => chains[bk(k)].push(k));
        const longest = Math.max(0, ...chains.map(c => c.length));
        stage.querySelector('.hx-stats').innerHTML = [['size()', items.length], ['bucket_count()', B], ['load_factor()', lf.toFixed(2)], ['longest chain', longest]].map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('');
        stage.querySelector('.hx-b').innerHTML = chains.map((c, i) => `<div class="hx-row"><em>${i}</em><div>${c.map(k => `<i class="${hit === k ? 'hit' : ''}">${esc(k)}</i>`).join('') || '<span class="muted-s">·</span>'}</div></div>`).join('');
        stage.querySelector('.vg-msg').innerHTML = msg;
      }
      stage.addEventListener('click', e => {
        const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a; const k = inp.value.trim(); hit = null;
        if (a === 'ins' && k && !items.includes(k)) {
          const before = chains0(k); items.push(k); const B = SIZES[si]; msg = `<code class="i">${esc(k)}</code> hashes to bucket <b>${bk(k)}</b>${before ? `, which already holds ${before} key${before > 1 ? 's' : ''}: a <b>collision</b>, so it joins the chain` : ''}.`;
          if (items.length / B > 1 && si < SIZES.length - 1) { si++; msg += ` Load factor passed 1.0, so the table <b>rehashed</b> to ${SIZES[si]} buckets and every key was re-placed. That is the occasional O(n) cost, which keeps lookups O(1) on average.`; }
          if (/^-?\d+$/.test(k)) inp.value = String(+k + 7); }
        else if (a === 'find' && k) { const c = items.filter(x => bk(x) === bk(k)); const idx = c.indexOf(k); hit = idx >= 0 ? k : null; msg = idx >= 0 ? `<code class="i">find(${esc(k)})</code>: hash → bucket ${bk(k)}, then ${idx + 1} comparison${idx ? 's' : ''} down the chain. Found.` : `<code class="i">find(${esc(k)})</code>: bucket ${bk(k)} has ${c.length} key${c.length === 1 ? '' : 's'}, none equal. Not found (still just one bucket checked).`; }
        else if (a === 'reset') { items = []; si = 0; msg = 'Reset.'; }
        draw();
      });
      const chains0 = k => items.filter(x => bk(x) === bk(k)).length;
      (cfg.items || ['10', '17', '24', '3']).forEach(k => items.push(k)); draw();
    },
  }));

  /* ================= deqblocks ================= */
  Viz.register('deqblocks', cfg => ({
    title: 'deque: a map of fixed-size blocks',
    custom(stage) {
      const BS = 4; let items = [3, 4, 5]; let start = 2; let nextF = 2, nextB = 6; let msg = 'A deque is a small <b>map</b> (array of pointers) to equal-size <b>blocks</b>. Both ends can grow without moving old elements.';
      stage.innerHTML = `<div class="dq"></div><div class="vg-msg"></div><div class="vg-btns">${btn('push_front', 'data-a="pf"', '')}${btn('push_back', 'data-a="pb"', '')}${btn('pop_front', 'data-a="xf"')}${btn('pop_back', 'data-a="xb"')}${btn('reset', 'data-a="reset"')}</div>`;
      function draw() {
        const nb = Math.max(1, Math.ceil((start + items.length) / BS)); let h = `<div class="dq-map"><span class="eyebrow">map</span>${Array.from({ length: nb }, (_, b) => `<i>→ block ${b}</i>`).join('')}</div><div class="dq-blocks">`;
        for (let b = 0; b < nb; b++) { h += `<div class="dq-b"><small>block ${b}</small><div>`; for (let s = 0; s < BS; s++) { const idx = b * BS + s - start; h += `<i class="${idx >= 0 && idx < items.length ? 'on' : ''}">${idx >= 0 && idx < items.length ? items[idx] : ''}</i>`; } h += '</div></div>'; }
        stage.querySelector('.dq').innerHTML = h + '</div>'; stage.querySelector('.vg-msg').innerHTML = msg + `<div class="muted-s" style="margin-top:6px">size ${items.length} · blocks ${nb} · <code class="i">dq[i]</code> = block (i+offset)/${BS}, slot (i+offset)%${BS}: still O(1)</div>`;
      }
      stage.addEventListener('click', e => {
        const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
        if (a === 'pf') { if (start === 0) { start = BS; msg = '<b>push_front</b>: the first block was full on that side, so a <b>new block</b> was added at the front. Nothing else moved.'; } else msg = '<b>push_front</b> fills the free slot just before the first element. O(1).'; start--; items.unshift(nextF--); }
        else if (a === 'pb') { items.push(nextB++); msg = '<b>push_back</b>: next free slot (a new block is added when the last one fills). O(1). Existing elements never move, so references to them stay valid.'; }
        else if (a === 'xf') { if (items.length) { items.shift(); start++; if (start >= BS) start -= BS; msg = '<b>pop_front</b> just moves the start offset. O(1).'; } }
        else if (a === 'xb') { if (items.length) { items.pop(); msg = '<b>pop_back</b>. O(1).'; } }
        else if (a === 'reset') { items = [3, 4, 5]; start = 2; nextF = 2; nextB = 6; msg = 'Reset.'; }
        draw();
      });
      draw();
    },
  }));

  /* ================= listviz ================= */
  Viz.register('listviz', cfg => ({
    title: 'list: nodes linked by pointers',
    custom(stage) {
      let id = 5, nodes = [{ v: 1, id: 1 }, { v: 2, id: 2 }, { v: 3, id: 3 }, { v: 4, id: 4 }]; let sel = 1; let msg = 'Click a node to select it, then insert after it or erase it.';
      stage.innerHTML = `<div class="ls"></div><div class="vg-msg"></div><div class="vg-btns">${btn('insert after selected', 'data-a="ins"', '')}${btn('erase selected', 'data-a="del"')}${btn('push_front', 'data-a="pf"')}${btn('push_back', 'data-a="pb"')}</div>`;
      function draw() {
        stage.querySelector('.ls').innerHTML = `<span class="ls-end">begin</span>` + nodes.map((n, i) => `<span class="ls-arr">⇄</span><button class="ls-n${i === sel ? ' sel' : ''}" data-i="${i}"><b>${n.v}</b><small>@${hex(0x3000 + n.id * 0x30)}</small></button>`).join('') + `<span class="ls-arr">⇄</span><span class="ls-end">end</span>`;
        stage.querySelector('.vg-msg').innerHTML = msg;
      }
      stage.addEventListener('click', e => {
        const n = e.target.closest('.ls-n'); if (n) { sel = +n.dataset.i; msg = `Selected node <b>${nodes[sel].v}</b>. Its address never changes while it exists, so iterators to it stay valid.`; draw(); return; }
        const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
        if (a === 'ins' && nodes.length) { nodes.splice(sel + 1, 0, { v: 10 * id, id }); id++; msg = '<b>insert</b>: allocate one new node and rewire <b>4 pointers</b> (two on the new node, one on each neighbour). Nothing shifts, no other address changes: <b>O(1)</b> once you hold the iterator.'; sel++; }
        else if (a === 'del' && nodes.length) { const v = nodes[sel].v; nodes.splice(sel, 1); sel = Math.max(0, sel - 1); msg = `<b>erase(${v})</b>: unlink the node by joining its neighbours. <b>O(1)</b>. Only iterators to the erased node are invalidated.`; }
        else if (a === 'pf') { nodes.unshift({ v: 10 * id, id }); id++; sel = 0; msg = '<b>push_front</b>: O(1), cheaper than a vector’s O(n) shift.'; }
        else if (a === 'pb') { nodes.push({ v: 10 * id, id }); id++; sel = nodes.length - 1; msg = '<b>push_back</b>: O(1), a new node each time (one heap allocation per element).'; }
        draw();
      });
      draw();
    },
  }));

  /* ================= decision ================= */
  const TREE = {
    start: { q: 'What is the main thing you need to do?', o: [['Keep a list of items in order', 'seq'], ['Check membership / keep unique items', 'uniq'], ['Look things up by a key', 'kv'], ['Always grab the biggest (or smallest) next', 'R:priority_queue|Repeatedly extracting the max/min is exactly what a heap does: O(log n) push and pop, O(1) peek.'], ['Last-in, first-out (undo, brackets, DFS)', 'R:stack|LIFO. Push and pop at one end, O(1). Think “stack of plates”.'], ['First-in, first-out (BFS, scheduling)', 'R:queue|FIFO. Push at the back, pop at the front, O(1). Think “waiting line”.']] },
    seq: { q: 'Do you need to add or remove at the FRONT as well?', o: [['No, only at the end', 'seq2'], ['Yes, both ends', 'R:deque|Fast at both ends and still has O(1) indexing. Slightly heavier than vector.']] },
    seq2: { q: 'Do you insert/erase in the MIDDLE a lot, holding iterators?', o: [['No (the usual case)', 'R:vector|The default. Contiguous, cache-friendly, O(1) indexing, amortized O(1) push_back. Start here unless you have a reason not to.'], ['Yes, constantly', 'R:list|O(1) insert/erase at a known position with stable iterators. But no indexing and poor cache behaviour. Rarely the right choice.']] },
    uniq: { q: 'Do you need the items kept SORTED, or range queries like lower_bound?', o: [['Yes, sorted / ranges', 'R:set|Balanced tree. O(log n) everything, iterates in sorted order. Use multiset if duplicates are allowed.'], ['No, just fast membership', 'R:unordered_set|Hash table. O(1) average insert/find/erase. Iteration order is arbitrary.']] },
    kv: { q: 'Do you need keys in SORTED order, or range queries?', o: [['Yes', 'R:map|Balanced tree of key→value. O(log n), sorted iteration, lower_bound. Use multimap if keys repeat.'], ['No, just fastest lookup', 'R:unordered_map|Hash table of key→value. O(1) average. The default for counting and memoizing.']] },
  };
  Viz.register('decision', cfg => ({
    title: 'Which container should I use?',
    custom(stage) {
      let trail = ['start'];
      function draw() {
        const key = trail[trail.length - 1]; const last = trail.length - 1;
        if (key.startsWith('R:')) { const [name, why] = key.slice(2).split('|'); stage.innerHTML = `<div class="dc-res"><span class="eyebrow"><b>●</b> Use</span><div class="dc-name"><code>${name}</code></div><p>${why}</p></div><div class="vg-btns">${btn('← back', 'data-a="back"')}${btn('start over', 'data-a="reset"')}</div>`; return; }
        const n = TREE[key];
        stage.innerHTML = `<div class="dc-q"><span class="eyebrow">Question ${last + 1}</span><h4>${n.q}</h4>${n.o.map((o, i) => `<button class="opt" data-i="${i}"><span class="l">${'ABCDEF'[i]}</span><span>${o[0]}</span></button>`).join('')}</div>${last ? `<div class="vg-btns">${btn('← back', 'data-a="back"')}</div>` : ''}`;
      }
      stage.addEventListener('click', e => {
        const o = e.target.closest('.opt'); const b = e.target.closest('[data-a]');
        if (o) { const key = trail[trail.length - 1]; trail.push(TREE[key].o[+o.dataset.i][1]); draw(); }
        else if (b) { if (b.dataset.a === 'back' && trail.length > 1) trail.pop(); else if (b.dataset.a === 'reset') trail = ['start']; draw(); }
      });
      draw();
    },
  }));
})();
