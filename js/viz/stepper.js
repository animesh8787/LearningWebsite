/* Visualizer engine.
   A visualizer kind is registered with Viz.register(kind, factory).
   - stepper kinds return {code, steps, reduce, render, initial}  -> play/pause/step/scrub UI
   - custom kinds return {custom(root)}                          -> free-form interactive widget */
(function () {
  const kinds = {};
  const RM = window.REDUCED;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const svg = d => `<svg viewBox="0 0 24 24">${d}</svg>`;
  const I = {
    prev: svg('<path d="M15 6l-6 6 6 6"/>'),
    next: svg('<path d="M9 6l6 6-6 6"/>'),
    play: svg('<path d="M8 5l11 7-11 7z"/>'),
    pause: svg('<path d="M9 5v14M15 5v14"/>'),
    reset: svg('<path d="M4 4v6h6"/><path d="M5 14a8 8 0 1 0 2-7.5L4 10"/>'),
  };

  function register(kind, factory) { kinds[kind] = factory; }

  function mount(root, kind, cfg) {
    const f = kinds[kind];
    if (!f) { root.innerHTML = `<div class="viz-note">Unknown visualizer “${kind}”.</div>`; return; }
    const def = f(cfg || {});
    root.classList.add('viz');
    root.innerHTML = `<div class="viz-head"><span class="eyebrow"><b>●</b> Interactive · ${def.title || cfg.title || kind}</span></div>`;
    if (def.custom) { const stage = el('div', 'viz-stage'); root.appendChild(stage); def.custom(stage); return; }
    stepper(root, def);
  }

  function stepper(root, def) {
    const lines = Highlight.lines(def.code);
    const codeEl = el('div', 'viz-code');
    codeEl.innerHTML = lines.map((h, i) => `<span class="cl" data-i="${i + 1}">${h || ' '}</span>`).join('');
    const stage = el('div', 'viz-stage');
    const note = el('div', 'viz-note', '<span class="step-n"></span><div class="txt"></div>');
    const ctrl = el('div', 'viz-ctrl');
    ctrl.innerHTML = `
      <button class="icon-btn" data-a="reset" aria-label="Restart">${I.reset}</button>
      <button class="icon-btn" data-a="prev" aria-label="Previous step">${I.prev}</button>
      <button class="icon-btn" data-a="play" aria-label="Play">${I.play}</button>
      <button class="icon-btn" data-a="next" aria-label="Next step">${I.next}</button>
      <input class="scrub" type="range" min="0" max="${def.steps.length}" value="0" aria-label="Step">
      <button class="speed" data-a="speed">1×</button>`;
    root.append(codeEl, stage, note, ctrl);
    root.tabIndex = 0;

    let i = 0, timer = null, speed = 1;
    let prev = null;
    const scrub = ctrl.querySelector('.scrub');
    const playBtn = ctrl.querySelector('[data-a=play]');
    const stateAt = n => { let s = def.initial ? def.initial() : {}; for (let k = 0; k < n; k++) s = def.reduce(s, def.steps[k], k); return s; };

    function draw() {
      const s = stateAt(i);
      def.render(s, stage, prev, i);
      prev = s;
      const step = def.steps[i - 1];
      codeEl.querySelectorAll('.cl.hl').forEach(n => n.classList.remove('hl'));
      if (step && step.line) [].concat(step.line).forEach(n => codeEl.querySelector(`.cl[data-i="${n}"]`)?.classList.add('hl'));
      note.querySelector('.step-n').textContent = i ? `${String(i).padStart(2, '0')}/${String(def.steps.length).padStart(2, '0')}` : 'START';
      const F = window.Render ? Render.fmt : String;
      note.querySelector('.txt').innerHTML = F(step ? step.note : (def.intro || 'Press play, or step through one line at a time.'));
      scrub.value = i;
    }
    function go(n) { i = Math.max(0, Math.min(def.steps.length, n)); draw(); }
    function stop() { clearInterval(timer); timer = null; playBtn.innerHTML = I.play; }
    function play() {
      if (i >= def.steps.length) go(0);
      playBtn.innerHTML = I.pause;
      timer = setInterval(() => { if (i >= def.steps.length) stop(); else go(i + 1); }, 1500 / speed);
    }
    ctrl.addEventListener('click', e => {
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'reset') { stop(); go(0); }
      else if (a === 'prev') { stop(); go(i - 1); }
      else if (a === 'next') { stop(); go(i + 1); }
      else if (a === 'play') timer ? stop() : play();
      else if (a === 'speed') { speed = speed === 1 ? 2 : speed === 2 ? .5 : 1; b.textContent = speed + '×'; if (timer) { stop(); play(); } }
    });
    scrub.addEventListener('input', () => { stop(); go(+scrub.value); });
    root.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') { stop(); go(i + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { stop(); go(i - 1); e.preventDefault(); }
      if (e.key === ' ') { timer ? stop() : play(); e.preventDefault(); }
    });
    draw();
  }

  window.Viz = { register, mount, RM };
})();
