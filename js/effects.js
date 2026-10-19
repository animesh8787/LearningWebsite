/* Small motion/interaction helpers. Everything honours prefers-reduced-motion. */
(function () {
  const RM = window.REDUCED;

  /* glossary hover cards (event-delegated, works for any rendered lesson) */
  const card = document.createElement('div');
  card.className = 'term-card';
  document.body.appendChild(card);
  function showTerm(t) {
    const key = t.dataset.term; const def = (window.GLOSSARY || {})[key];
    if (!def) return;
    card.innerHTML = `<b>${key}</b>${def}`;
    const r = t.getBoundingClientRect();
    card.classList.add('show');
    const w = card.offsetWidth, h = card.offsetHeight;
    let x = Math.min(window.innerWidth - w - 12, Math.max(12, r.left + r.width / 2 - w / 2));
    let y = r.top - h - 10; if (y < 70) y = r.bottom + 10;
    card.style.left = x + 'px'; card.style.top = y + 'px';
  }
  const hideTerm = () => card.classList.remove('show');
  document.addEventListener('mouseover', e => { const t = e.target.closest?.('.term'); if (t) showTerm(t); });
  document.addEventListener('mouseout', e => { if (e.target.closest?.('.term')) hideTerm(); });
  document.addEventListener('focusin', e => { const t = e.target.closest?.('.term'); if (t) showTerm(t); });
  document.addEventListener('focusout', hideTerm);
  window.addEventListener('scroll', hideTerm, { passive: true });

  /* spotlight: tracks the pointer inside any element that opts in */
  document.addEventListener('pointermove', e => {
    const c = e.target.closest?.('.tr-card'); if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  /* magnetic buttons */
  function magnetic(root) {
    if (RM || !window.gsap) return;
    root.querySelectorAll('[data-magnetic]').forEach(b => {
      const xTo = gsap.quickTo(b, 'x', { duration: .5, ease: 'power3' });
      const yTo = gsap.quickTo(b, 'y', { duration: .5, ease: 'power3' });
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * .25); yTo((e.clientY - (r.top + r.height / 2)) * .35);
      });
      b.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* confetti burst from an element, canvas-based, ~1.4s */
  function confetti(from) {
    if (RM) return;
    const r = from.getBoundingClientRect();
    const cv = document.createElement('canvas'); cv.className = 'confetti';
    cv.width = innerWidth; cv.height = innerHeight; document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    const colors = ['#f5a524', '#f0e7d6', '#7db4ff', '#ff7a6b', '#7bd88f'];
    const P = Array.from({ length: 70 }, () => ({
      x: r.left + r.width / 2, y: r.top + r.height / 2,
      vx: (Math.random() - .5) * 11, vy: -Math.random() * 11 - 3, s: 4 + Math.random() * 5,
      c: colors[(Math.random() * colors.length) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
    }));
    let t0 = performance.now();
    (function tick(t) {
      const dt = Math.min(2, (t - t0) / 16.7); t0 = t;
      ctx.clearRect(0, 0, cv.width, cv.height);
      P.forEach(p => { p.vy += .35 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); });
      if (P.some(p => p.y < cv.height + 20) && performance.now() - start < 1600) requestAnimationFrame(tick); else cv.remove();
    })(start = performance.now());
    var start;
  }

  window.Effects = { magnetic, confetti, RM };
})();
