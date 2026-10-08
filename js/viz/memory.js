/* Memory-box visualizers: "memory" (step through code) and "typebox" (overflow playground). */
(function () {
  const SIZE = { char: 1, bool: 1, short: 2, int: 4, float: 4, double: 8, 'long long': 8, 'unsigned int': 4 };
  const hex = n => '0x' + n.toString(16).toUpperCase().padStart(8, '0');
  const esc = Highlight.esc;

  Viz.register('memory', cfg => ({
    title: cfg.title || 'Memory boxes',
    code: cfg.code,
    steps: cfg.steps,
    intro: cfg.intro,
    initial: () => ({ vars: [], top: 0x7FFC1040, changed: [], out: [], hasOut: cfg.steps.some(x => x.out != null) }),
    reduce(s, step) {
      let vars = s.vars.map(v => Object.assign({}, v));
      let top = s.top;
      const out = step.out != null ? s.out.concat(step.out) : s.out;
      if (step.del) vars = vars.filter(v => !step.del.includes(v.name));
      const changed = [];
      Object.entries(step.set || {}).forEach(([name, spec]) => {
        const [type, val] = Array.isArray(spec) ? spec : [null, spec];
        const ex = vars.find(v => v.name === name);
        if (ex) { ex.val = val; if (type) ex.type = type; changed.push(name); }
        else {
          const size = SIZE[type] || 4;
          top -= size; top -= top % size;
          vars.push({ name, type, val, size, addr: top });
          changed.push(name);
        }
      });
      return { vars, top, changed, out, hasOut: s.hasOut };
    },
    render(s, stage, prev) {
      const con = s.hasOut ? `<div class="con"><span class="lbl">Console</span>${s.out.map(esc).join('\n') || ' '}</div>` : '';
      if (!s.vars.length) { stage.innerHTML = '<div class="mem"><div class="mem-empty">// nothing in memory yet</div></div>' + con; return; }
      stage.innerHTML = '<div class="mem">' + s.vars.map(v => `
        <div class="cell${s.changed.includes(v.name) ? ' flash' : ''}">
          <div><span class="nm">${esc(v.name)}</span><span class="ty">${esc(v.type || '')}</span></div>
          <div class="vl">${esc(String(v.val))}</div>
          <div class="ad">${hex(v.addr)} · ${v.size} byte${v.size > 1 ? 's' : ''}</div>
          <div class="bytes">${'<i></i>'.repeat(v.size)}</div>
        </div>`).join('') + '</div>' + con;
    },
  }));

  /* ---------- typebox: pick a type, add 1 until it wraps ---------- */
  const T = [
    { n: 'int8_t', bits: 8, signed: true, note: 'signed 8-bit' },
    { n: 'uint8_t', bits: 8, signed: false, note: 'unsigned 8-bit' },
    { n: 'short', bits: 16, signed: true, note: 'signed 16-bit' },
    { n: 'int', bits: 32, signed: true, note: 'signed 32-bit' },
    { n: 'unsigned int', bits: 32, signed: false, note: 'unsigned 32-bit' },
    { n: 'long long', bits: 64, signed: true, note: 'signed 64-bit' },
  ];

  Viz.register('typebox', cfg => ({
    title: cfg.title || 'Overflow playground',
    custom(stage) {
      let t = T[1], raw = 250n;
      const wrap = (x, ty) => ty.signed ? BigInt.asIntN(ty.bits, x) : BigInt.asUintN(ty.bits, x);
      stage.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px" class="tb-types"></div>
        <div class="tb-bits" style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:14px"></div>
        <div style="display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:6px">
          <div class="tb-val" style="font:500 2.4rem var(--font-mono);letter-spacing:-.03em;color:var(--accent)"></div>
          <div class="tb-range eyebrow"></div>
        </div>
        <div class="tb-msg" style="color:var(--text-2);min-height:3.2em;font-size:.95rem"></div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">
          <button class="btn ghost" data-d="-1" style="--h:38px;padding:0 16px">− 1</button>
          <button class="btn" data-d="1" style="--h:38px;padding:0 16px">+ 1</button>
          <button class="btn ghost" data-d="max" style="--h:38px;padding:0 16px">jump to max</button>
        </div>`;
      const typesEl = stage.querySelector('.tb-types');
      T.forEach(ty => {
        const b = document.createElement('button');
        b.className = 'chip'; b.textContent = ty.n; b.dataset.n = ty.n;
        b.style.cursor = 'pointer';
        typesEl.appendChild(b);
      });
      const range = ty => ty.signed ? [-(1n << BigInt(ty.bits - 1)), (1n << BigInt(ty.bits - 1)) - 1n] : [0n, (1n << BigInt(ty.bits)) - 1n];
      let wrapped = '';
      function draw() {
        const v = wrap(raw, t); const [lo, hi] = range(t);
        typesEl.querySelectorAll('.chip').forEach(c => {
          const on = c.dataset.n === t.n;
          c.style.borderColor = on ? 'var(--accent)' : ''; c.style.color = on ? 'var(--accent)' : '';
        });
        const u = BigInt.asUintN(t.bits, v);
        const bin = u.toString(2).padStart(t.bits, '0');
        const bitsEl = stage.querySelector('.tb-bits');
        const size = t.bits > 32 ? 11 : t.bits > 16 ? 16 : 22;
        bitsEl.innerHTML = [...bin].map((b, i) => {
          const sign = t.signed && i === 0;
          return `<span style="width:${size}px;height:${size + 10}px;display:grid;place-items:center;border-radius:4px;font:500 ${Math.min(12, size - 2)}px var(--font-mono);` +
            `background:${b === '1' ? 'var(--accent)' : 'var(--surface)'};color:${b === '1' ? 'var(--accent-ink)' : 'var(--muted)'};` +
            `border:1px solid ${sign ? 'var(--cool)' : 'var(--line)'}">${t.bits > 32 ? '' : b}</span>`;
        }).join('');
        stage.querySelector('.tb-val').textContent = v.toString();
        stage.querySelector('.tb-range').textContent = `${t.note} · range ${lo} … ${hi} · ${t.bits / 8} byte${t.bits > 8 ? 's' : ''}`;
        stage.querySelector('.tb-msg').innerHTML = wrapped ||
          `These ${t.bits} switches are the whole value. ${t.signed ? 'The leftmost (blue-outlined) switch is the <strong>sign bit</strong>.' : 'There is no sign bit, so every switch counts toward size.'} Try pressing <strong>+ 1</strong> at the edge.`;
      }
      typesEl.addEventListener('click', e => {
        const c = e.target.closest('.chip'); if (!c) return;
        t = T.find(x => x.n === c.dataset.n); raw = wrap(raw, t); wrapped = ''; draw();
      });
      stage.addEventListener('click', e => {
        const b = e.target.closest('[data-d]'); if (!b) return;
        const [lo, hi] = range(t); const cur = wrap(raw, t);
        if (b.dataset.d === 'max') { raw = hi; wrapped = 'Parked on the biggest value this type can hold. One more step will tip it over.'; }
        else {
          const d = BigInt(b.dataset.d); const next = cur + d;
          raw = wrap(next, t);
          if (next > hi) wrapped = `<strong>Overflow.</strong> ${hi} + 1 does not fit, so the bits roll over to ${raw}. No error, no warning. ${t.signed ? 'For signed types this is actually undefined behavior in C++.' : 'Unsigned wrap-around is well-defined: it is arithmetic modulo 2<sup>' + t.bits + '</sup>.'}`;
          else if (next < lo) wrapped = `<strong>Underflow.</strong> ${lo} − 1 wraps around to ${raw}.`;
          else wrapped = '';
        }
        draw();
      });
      draw();
    },
  }));
})();
