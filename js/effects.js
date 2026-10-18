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

  window.Effects = { RM };
})();
