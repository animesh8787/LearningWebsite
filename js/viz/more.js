/* More visualizers: array, callstack, heapview, pipeline, bits, bigo, exprlab, ascii, grid2d, stamp */
(function () {
  const esc = Highlight.esc;
  const F = s => (window.Render ? Render.fmt(s) : s);
  const hex = n => '0x' + Number(n).toString(16).toUpperCase().padStart(4, '0');

  /* ================= array ================= */
  Viz.register('array', cfg => ({
    title: cfg.title || 'Array in memory',
    code: cfg.code, steps: cfg.steps, intro: cfg.intro,
    initial: () => ({ arr: cfg.arr.slice(), ptr: {}, hl: [], changed: [], dim: [] }),
    reduce(s, st) {
      const arr = s.arr.slice(); const ptr = Object.assign({}, s.ptr); const changed = [];
      Object.entries(st.set || {}).forEach(([i, v]) => { arr[+i] = v; changed.push(+i); });
      if (st.swap) { const [a, b] = st.swap; [arr[a], arr[b]] = [arr[b], arr[a]]; changed.push(a, b); }
      if (st.push !== undefined) { arr.push(st.push); changed.push(arr.length - 1); }
      if (st.pop) arr.pop();
      if (st.shift) { arr.shift(); }
      Object.entries(st.ptr || {}).forEach(([k, v]) => (v === null ? delete ptr[k] : (ptr[k] = v)));
      return { arr, ptr, hl: st.hl || [], changed, dim: st.dim || [] };
    },
    render(s, stage) {
      const base = cfg.base || 0x1000, size = cfg.size || 4;
      stage.innerHTML = `<div class="arr-row">${s.arr.map((v, i) => {
        const tags = Object.entries(s.ptr).filter(([, idx]) => idx === i).map(([k]) => `<span class="ptag">${esc(k)}</span>`).join('');
        return `<div class="acell-wrap"><div class="aidx">${i}</div>
          <div class="acell${s.hl.includes(i) ? ' hl' : ''}${s.changed.includes(i) ? ' flash' : ''}${s.dim.includes(i) ? ' dim' : ''}">${esc(String(v))}</div>
          ${cfg.addr === false ? '' : `<div class="aad">${hex(base + i * size)}</div>`}<div class="ptags">${tags}</div></div>`;
      }).join('')}</div>${s.arr.length === 0 ? '<div class="mem-empty">// empty</div>' : ''}`;
    },
  }));

  /* ================= callstack ================= */
  Viz.register('callstack', cfg => ({
    title: cfg.title || 'The call stack',
    code: cfg.code, steps: cfg.steps, intro: cfg.intro,
    initial: () => ({ frames: [], ret: null, out: [] }),
    reduce(s, st) {
      let frames = s.frames.map(f => ({ fn: f.fn, vars: Object.assign({}, f.vars) }));
      let ret = null; let out = s.out;
      if (st.push) frames.push({ fn: st.push.fn, vars: Object.assign({}, st.push.vars) });
      if (st.set && frames.length) Object.assign(frames[frames.length - 1].vars, st.set);
      if (st.pop) { frames.pop(); ret = st.ret != null ? st.ret : null; }
      if (st.out != null) out = out.concat(st.out);
      return { frames, ret, out };
    },
    render(s, stage, prev) {
      const prevN = prev ? prev.frames.length : 0;
      const hasOut = cfg.steps.some(x => x.out != null);
      stage.innerHTML = `<div class="stackcol">${s.frames.slice().reverse().map((f, k, a) => {
        const isTop = k === 0; const isNew = isTop && s.frames.length > prevN;
        return `<div class="frame${isTop ? ' top' : ''}${isNew ? ' new' : ''}"><div class="fh"><b>${esc(f.fn)}</b>${isTop ? '<span class="ptag">running</span>' : ''}</div>
          <div class="fv">${Object.entries(f.vars).map(([k2, v]) => `<span><i>${esc(k2)}</i> = ${esc(String(v))}</span>`).join('') || '<span class="muted-s">no locals yet</span>'}</div></div>`;
      }).join('') || '<div class="mem-empty">// stack is empty</div>'}<div class="stackbase">bottom of stack</div></div>
        ${s.ret != null ? `<div class="retbadge">returned <b>${esc(String(s.ret))}</b> to the caller</div>` : ''}
        ${hasOut ? `<div class="con"><span class="lbl">Console</span>${s.out.map(esc).join('\n') || ' '}</div>` : ''}`;
    },
  }));

  /* ================= heapview (stack + heap + arrows) ================= */
  Viz.register('heapview', cfg => ({
    title: cfg.title || 'Stack and heap',
    code: cfg.code, steps: cfg.steps, intro: cfg.intro,
    initial: () => ({ stack: {}, heap: {}, changed: [] }),
    reduce(s, st) {
      const stack = JSON.parse(JSON.stringify(s.stack)), heap = JSON.parse(JSON.stringify(s.heap)); const changed = [];
      Object.entries(st.stack || {}).forEach(([k, v]) => { if (v === null) delete stack[k]; else { stack[k] = Object.assign({}, stack[k], v); changed.push('s:' + k); } });
      Object.entries(st.heap || {}).forEach(([k, v]) => { if (v === null) delete heap[k]; else { heap[k] = Object.assign({}, heap[k], v); changed.push('h:' + k); } });
      return { stack, heap, changed };
    },
    render(s, stage) {
      const hk = Object.keys(s.heap);
      const addr = id => hex(0x5A00 + 0x40 * (cfg.heapIds || hk.concat(Object.keys(s.heap))).indexOf(id));
      const ids = cfg.heapIds || [...new Set(cfg.steps.flatMap(x => Object.keys(x.heap || {})))];
      const A = id => hex(0x5A00 + 0x20 * ids.indexOf(id));
      const noHeap = Array.isArray(cfg.heapIds) && cfg.heapIds.length === 0;
      stage.innerHTML = `<div class="hs"${noHeap ? ' style="grid-template-columns:minmax(0,420px);justify-content:center"' : ''}><div class="hcol"><div class="eyebrow">Stack <span class="muted-s">(automatic)</span></div>
        ${Object.entries(s.stack).map(([k, v]) => {
          const dangling = v.ref && v.ref.startsWith('h:') && (s.heap[v.ref.slice(2)] || {}).freed;
          return `<div class="hv${s.changed.includes('s:' + k) ? ' flash' : ''}${dangling ? ' bad' : ''}" data-id="s:${k}"><div><b>${esc(k)}</b> <span class="ty">${esc(v.type || '')}</span></div>
          <div class="vl2">${v.ref ? (v.ref === 'null' ? 'nullptr' : (dangling ? '→ ' + A(v.ref.slice(2)) + ' (dangling!)' : '→ ' + (v.ref.startsWith('h:') ? A(v.ref.slice(2)) : '&' + v.ref.slice(2)))) : esc(String(v.val))}</div></div>`;
        }).join('') || '<div class="mem-empty">empty</div>'}</div>
        ${noHeap ? '' : `<div class="hcol"><div class="eyebrow">Heap <span class="muted-s">(you manage it)</span></div>
        ${Object.entries(s.heap).map(([k, v]) => `<div class="hv hp${v.freed ? ' freed' : ''}${s.changed.includes('h:' + k) ? ' flash' : ''}" data-id="h:${k}">
          <div><b>${A(k)}</b> <span class="ty">${v.size || 4} bytes</span>${v.rc != null ? `<span class="ptag">refs: ${v.rc}</span>` : ''}${v.freed ? '<span class="ptag bad">freed</span>' : ''}${v.leak ? '<span class="ptag bad">leaked</span>' : ''}</div>
          <div class="vl2">${esc(String(v.val == null ? '?' : v.val))}</div></div>`).join('') || '<div class="mem-empty">empty</div>'}</div>`}</div>
        <svg class="arrows"></svg>`;
      requestAnimationFrame(() => {
        const svg = stage.querySelector('.arrows'); const box = stage.getBoundingClientRect(); let d = '';
        Object.entries(s.stack).forEach(([k, v]) => {
          if (!v.ref || v.ref === 'null') return;
          const from = stage.querySelector(`[data-id="s:${k}"]`), to = stage.querySelector(`[data-id="${v.ref.startsWith('h:') ? v.ref : 's:' + v.ref.slice(2)}"]`);
          if (!from || !to) return;
          const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
          const x1 = a.right - box.left, y1 = a.top + a.height / 2 - box.top, x2 = (v.ref.startsWith('h:') ? b.left : b.right) - box.left, y2 = b.top + b.height / 2 - box.top;
          const bad = to.classList.contains('freed');
          const mid = v.ref.startsWith('h:') ? (x1 + x2) / 2 : x1 + 40;
          d += `<path d="M${x1},${y1} C${mid},${y1} ${v.ref.startsWith('h:') ? mid : x1 + 40},${y2} ${x2},${y2}" fill="none" stroke="${bad ? 'var(--bad)' : 'var(--accent)'}" stroke-width="1.6" ${bad ? 'stroke-dasharray="4 4"' : ''} marker-end="url(#ah${bad ? 'b' : ''})"/>`;
        });
        svg.innerHTML = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)"/></marker><marker id="ahb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--bad)"/></marker></defs>` + d;
      });
    },
  }));

  /* ================= pipeline ================= */
  Viz.register('pipeline', cfg => ({
    title: 'From source file to running program',
    custom(stage) {
      const S = [
        ['hello.cpp', 'Source', 'The text you wrote. Humans can read it; the CPU cannot.', '#include <iostream>\nint main() { std::cout << "Hi"; }'],
        ['Preprocessor', 'Copy & paste', 'Handles every line starting with #. `#include` literally pastes the header file’s text in place. Comments vanish.', '// ...thousands of lines from <iostream>...\nint main() { std::cout << "Hi"; }'],
        ['Compiler', 'Translate', 'Checks your grammar and types, then translates C++ into assembly: low-level steps close to what the CPU does.', 'main:\n  mov  edi, OFFSET .LC0\n  call puts\n  xor  eax, eax\n  ret'],
        ['Assembler', 'Encode', 'Turns each assembly line into raw machine code bytes and packs them in an object file (hello.o).', '55 48 89 E5 BF 00 00 00 00 E8 ...\n(binary, shown as hex)'],
        ['Linker', 'Connect', 'Glues your object file together with library code (like the real code behind cout) and decides final addresses.', 'hello.o + libstdc++  →  a.exe'],
        ['Running', 'Execute', 'The operating system loads the file into memory and the CPU runs it, instruction by instruction.', 'Hi'],
      ];
      stage.innerHTML = `<div class="pipe">${S.map((s, i) => `<button class="pnode" data-i="${i}"><span class="pn">${i + 1}</span><b>${s[0]}</b><small>${s[1]}</small></button>`).join('<span class="pline"><i></i></span>')}</div>
        <div class="pdetail"><p class="pd-t"></p><pre class="pd-c"></pre></div>
        <div style="margin-top:12px"><button class="btn" data-play style="--h:38px;padding:0 18px">▶ Play the pipeline</button></div>`;
      let cur = 0, timer;
      const show = i => {
        cur = i;
        stage.querySelectorAll('.pnode').forEach((n, k) => { n.classList.toggle('on', k === i); n.classList.toggle('past', k < i); });
        stage.querySelectorAll('.pline').forEach((n, k) => n.classList.toggle('past', k < i));
        stage.querySelector('.pd-t').innerHTML = F(S[i][2]); stage.querySelector('.pd-c').textContent = S[i][3];
      };
      stage.addEventListener('click', e => {
        const n = e.target.closest('.pnode'); if (n) { clearInterval(timer); show(+n.dataset.i); }
        if (e.target.closest('[data-play]')) { clearInterval(timer); show(0); timer = setInterval(() => { if (cur >= S.length - 1) clearInterval(timer); else show(cur + 1); }, 1500); }
      });
      show(0);
    },
  }));

  /* ================= bits ================= */
  Viz.register('bits', cfg => ({
    title: 'Bit lab',
    custom(stage) {
      let a = cfg.a ?? 0b10110010, b = cfg.b ?? 0b00001111, op = cfg.op || '&';
      const ops = { '&': (x, y) => x & y, '|': (x, y) => x | y, '^': (x, y) => x ^ y, '<<': (x, y) => (x << y) & 255, '>>': (x, y) => x >> y, '~': x => ~x & 255 };
      const bin = n => n.toString(2).padStart(8, '0');
      stage.innerHTML = `<div class="bitlab"><div class="brow"><span class="blabel">A</span><span class="bbits" data-r="a"></span><span class="bdec" data-d="a"></span></div>
        <div class="brow"><span class="blabel op"><select aria-label="operator">${Object.keys(ops).map(o => `<option${o === op ? ' selected' : ''}>${o}</option>`).join('')}</select></span><span class="bbits" data-r="b"></span><span class="bdec"><input type="number" min="0" max="255" aria-label="B value"></span></div>
        <div class="bline"></div>
        <div class="brow"><span class="blabel">=</span><span class="bbits res" data-r="r"></span><span class="bdec" data-d="r"></span></div></div>
        <p class="muted-s" style="margin:12px 0 0">Click any bit of <b>A</b> to flip it. Change the operator or B and watch the result row.</p>`;
      const inp = stage.querySelector('input'), sel = stage.querySelector('select');
      const row = (r, n, click) => { stage.querySelector(`[data-r=${r}]`).innerHTML = [...bin(n)].map((c, i) => `<i class="${c === '1' ? 'on' : ''}"${click ? ` data-b="${7 - i}"` : ''}>${c}</i>`).join(''); };
      function draw() {
        op = sel.value; const y = op === '<<' || op === '>>' ? Math.min(b, 7) : b;
        const r = op === '~' ? ops['~'](a) : ops[op](a, y);
        row('a', a, true); row('b', op === '~' ? 0 : b); row('r', r);
        stage.querySelector('[data-d=a]').textContent = a + ' · 0x' + a.toString(16).toUpperCase();
        stage.querySelector('[data-d=r]').textContent = r + ' · 0x' + r.toString(16).toUpperCase();
        if (document.activeElement !== inp) inp.value = b; stage.querySelector('[data-r=b]').style.opacity = op === '~' ? .25 : 1;
      }
      stage.addEventListener('click', e => { const t = e.target.closest('[data-b]'); if (t) { a ^= 1 << +t.dataset.b; draw(); } });
      inp.addEventListener('input', () => { b = Math.max(0, Math.min(255, +inp.value || 0)); draw(); });
      sel.addEventListener('change', draw); draw();
    },
  }));

  /* ================= bigo ================= */
  Viz.register('bigo', cfg => ({
    title: 'How fast does work grow?',
    custom(stage) {
      const C = [
        ['O(1)', n => 1, 'var(--good)'], ['O(log n)', n => Math.log2(n), 'var(--cool)'], ['O(n)', n => n, 'var(--accent)'],
        ['O(n log n)', n => n * Math.log2(n), '#d9a0ff'], ['O(n²)', n => n * n, 'var(--bad)'], ['O(2ⁿ)', n => Math.pow(2, n), '#ff5ea0'],
      ];
      stage.innerHTML = `<label class="muted-s" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">n = <b class="nval" style="font:700 1.4rem var(--font-mono);color:var(--accent)"></b>
        <input type="range" min="0" max="100" value="50" style="flex:1;min-width:160px;accent-color:var(--accent)"></label>
        <div class="bo-rows"></div><p class="muted-s bo-note" style="margin:14px 0 0"></p>`;
      const rng = stage.querySelector('input'), rows = stage.querySelector('.bo-rows');
      const fmt = x => (!isFinite(x) ? '> 10^308' : x < 1e6 ? Math.round(x).toLocaleString() : x.toExponential(1).replace('e+', ' × 10^'));
      function draw() {
        const n = Math.max(1, Math.round(Math.pow(10, rng.value / 100 * 6))); // 1..1,000,000
        stage.querySelector('.nval').textContent = n.toLocaleString();
        const nn = n > 40 ? n : n; const vals = C.map(([, f]) => (f === C[5][1] ? Math.pow(2, Math.min(n, 1024)) : f(nn)));
        const mx = Math.log10(Math.max(...vals.slice(0, 5)) + 1) || 1;   // scale by the polynomial rows; 2^n simply pegs the bar
        rows.innerHTML = C.map(([name, , col], i) => {
          const v = vals[i]; const secs = v / 1e8; const verdict = !isFinite(v) || v > 1e10 ? ['bad', 'hopeless'] : v > 1e8 ? ['bad', 'too slow (> 1 s)'] : v > 1e7 ? ['mid', 'ok-ish'] : ['good', 'instant'];
          return `<div class="bo-row"><span class="bo-n">${name}</span><span class="bo-bar"><i style="width:${Math.max(1, Math.min(100, Math.log10(Math.min(v, 1e300) + 1) / mx * 100))}%;background:${col}"></i></span><span class="bo-v">${fmt(v)}</span><span class="bo-s ${verdict[0]}">${verdict[1]}</span></div>`;
        }).join('');
        stage.querySelector('.bo-note').innerHTML = `Bars use a <b>log scale</b> so the small ones stay visible. A typical judge does about <b>10⁸ simple steps per second</b>. That is why <code class="i">n = 10⁵</code> allows O(n log n) but not O(n²).`;
      }
      rng.addEventListener('input', draw); draw();
    },
  }));

  /* ================= exprlab ================= */
  Viz.register('exprlab', cfg => ({
    title: 'Operator lab',
    custom(stage) {
      let a = cfg.a ?? 17, b = cfg.b ?? 5;
      stage.innerHTML = `<div class="el-in"><label>a <input type="number" value="${a}" data-v="a"></label><label>b <input type="number" value="${b}" data-v="b"></label></div><div class="el-rows"></div>`;
      const rows = stage.querySelector('.el-rows');
      function draw() {
        const t = x => (x < 0 ? Math.ceil(x) : Math.floor(x));
        const q = b === 0 ? null : t(a / b), m = b === 0 ? null : a - q * b;
        const R = [
          ['a + b', a + b, ''], ['a - b', a - b, ''], ['a * b', a * b, ''],
          ['a / b', q === null ? 'crash! divide by zero' : q, 'int ÷ int throws away the decimal part (truncates toward zero)'],
          ['a % b', m === null ? 'crash!' : m, 'the remainder: what is left after the division'],
          ['(double)a / b', b === 0 ? 'inf' : +(a / b).toFixed(4), 'making one side a double keeps the decimals'],
          ['a / b * b + a % b', q === null ? '—' : q * b + m, 'always gets back to a'],
        ];
        rows.innerHTML = R.map(r => `<div class="el-row"><code>${esc(r[0])}</code><b>${esc(String(r[1]))}</b><span>${r[2]}</span></div>`).join('');
      }
      stage.addEventListener('input', e => { const k = e.target.dataset.v; if (k) { (k === 'a' ? (a = Math.trunc(+e.target.value || 0)) : (b = Math.trunc(+e.target.value || 0))); draw(); } });
      draw();
    },
  }));

  /* ================= ascii ================= */
  Viz.register('ascii', cfg => ({
    title: 'Characters are numbers',
    custom(stage) {
      stage.innerHTML = `<label class="muted-s">Type something: <input class="txt-in" value="${cfg.text || 'Hi!'}" maxlength="12" style="margin-left:8px"></label>
        <div class="asc-row"></div><label class="muted-s" style="display:block;margin-top:14px"><input type="checkbox" class="nul" checked> show the hidden <code class="i">'\\0'</code> terminator of a C-string</label>`;
      const inp = stage.querySelector('.txt-in'), nul = stage.querySelector('.nul'), row = stage.querySelector('.asc-row');
      function draw() {
        const cs = [...inp.value].map(c => c.charCodeAt(0) & 255); if (nul.checked) cs.push(0);
        row.innerHTML = cs.map((c, i) => `<div class="asc${c === 0 ? ' z' : ''}"><div class="ac">${c === 0 ? '\\0' : c === 32 ? '␠' : esc(String.fromCharCode(c))}</div><div class="an">${c}</div><div class="ab">${c.toString(2).padStart(8, '0')}</div><div class="ai">[${i}]</div></div>`).join('');
      }
      inp.addEventListener('input', draw); nul.addEventListener('change', draw); draw();
    },
  }));

  /* ================= grid2d ================= */
  Viz.register('grid2d', cfg => ({
    title: '2D array = one long row',
    custom(stage) {
      const R = cfg.rows || 3, C = cfg.cols || 4;
      stage.innerHTML = `<div class="g2"><div class="g2g" style="grid-template-columns:repeat(${C},1fr)">${Array.from({ length: R * C }, (_, k) => `<button class="g2c" data-k="${k}">${Math.floor(k / C)},${k % C}</button>`).join('')}</div>
        <div class="g2f"></div></div><div class="g2flat">${Array.from({ length: R * C }, (_, k) => `<i data-k="${k}">${k}</i>`).join('')}</div>`;
      const info = stage.querySelector('.g2f');
      function pick(k) {
        stage.querySelectorAll('[data-k]').forEach(n => n.classList.toggle('on', +n.dataset.k === k));
        const r = Math.floor(k / C), c = k % C;
        info.innerHTML = `<p><code class="i">grid[${r}][${c}]</code></p><p>index = <b>${r}</b> × ${C} + <b>${c}</b> = <b>${k}</b></p><p>address = base + ${k} × 4 = <b>${hex(0x2000 + k * 4)}</b></p>`;
      }
      stage.addEventListener('click', e => { const t = e.target.closest('[data-k]'); if (t) pick(+t.dataset.k); });
      pick(cfg.pick ?? 6);
    },
  }));

  /* ================= stamp (templates) ================= */
  Viz.register('stamp', cfg => ({
    title: 'The compiler stamps out real functions',
    custom(stage) {
      const T = [
        { t: 'int', a: '3, 9', r: '9', body: 'int maxOf(int a, int b) { return (a > b) ? a : b; }' },
        { t: 'double', a: '2.5, 1.5', r: '2.5', body: 'double maxOf(double a, double b) { return (a > b) ? a : b; }' },
        { t: 'char', a: "'x', 'b'", r: "'x'", body: "char maxOf(char a, char b) { return (a > b) ? a : b; }" },
        { t: 'string', a: '"pear", "apple"', r: '"pear"', body: 'string maxOf(string a, string b) { return (a > b) ? a : b; }' },
      ];
      stage.innerHTML = `<pre class="tp"><code>${Highlight.lines('template <typename T>\nT maxOf(T a, T b) { return (a > b) ? a : b; }').join('\n')}</code></pre>
        <div class="muted-s" style="margin:12px 0 8px">You call it with…</div><div class="stp-types" style="display:flex;gap:8px;flex-wrap:wrap"></div>
        <div class="stp-out" style="margin-top:16px"></div>`;
      const tw = stage.querySelector('.stp-types'), out = stage.querySelector('.stp-out');
      T.forEach((x, i) => { const b = document.createElement('button'); b.className = 'chip'; b.style.cursor = 'pointer'; b.textContent = `maxOf(${x.a})`; b.dataset.i = i; tw.appendChild(b); });
      function pick(i) {
        const x = T[i]; tw.querySelectorAll('.chip').forEach((c, k) => { c.style.borderColor = k === i ? 'var(--accent)' : ''; c.style.color = k === i ? 'var(--accent)' : ''; });
        out.innerHTML = `<div class="muted-s">The compiler deduces <b>T = ${x.t}</b> and generates this real function, just for you:</div>
          <pre class="tp" style="border-color:var(--accent)"><code>${Highlight.lines(x.body).join('\n')}</code></pre><div class="muted-s">Result: <b style="color:var(--accent)">${esc(x.r)}</b></div>`;
      }
      tw.addEventListener('click', e => { const c = e.target.closest('.chip'); if (c) pick(+c.dataset.i); }); pick(0);
    },
  }));
})();
