/* Shared helpers for the app pages. */
(function () {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const C = 2 * Math.PI * 45;

  /** A progress ring. pct is 0..1; label and sub appear in the middle. Rings animate in via animateRings(). */
  function ring(pct, label, sub, cls) {
    pct = Math.max(0, Math.min(1, pct || 0));
    return `<div class="ring ${cls || ''}${pct === 0 ? ' zero' : ''}" data-p="${pct}"><svg viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="45"/><circle class="prg" cx="50" cy="50" r="45" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${C.toFixed(2)}"/></svg><div class="lbl"><span>${label}${sub ? `<small>${sub}</small>` : ''}</span></div></div>`;
  }
  function animateRings(root) {
    requestAnimationFrame(() => requestAnimationFrame(() => root.querySelectorAll('.ring').forEach(r => {
      r.querySelector('.prg').style.strokeDashoffset = (C * (1 - +r.dataset.p)).toFixed(2);
    })));
  }

  function minutes(sec) {
    const m = Math.floor(sec / 60);
    if (m < 60) return m + ' min';
    return Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';
  }
  function greeting() {
    const h = new Date().getHours();
    return h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }
  const firstName = n => (n || '').trim().split(/\s+/)[0] || '';
  function ago(ts) {
    const d = Math.floor((Date.now() - ts) / 1000);
    if (d < 60) return 'just now';
    if (d < 3600) return Math.floor(d / 60) + ' min ago';
    if (d < 86400) return Math.floor(d / 3600) + ' h ago';
    if (d < 86400 * 30) return Math.floor(d / 86400) + ' d ago';
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  const icon = {
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c0 6-6 6-6 12a6 6 0 0 0 12 0c0-6-6-6-6-12z"/><path d="M12 2c0 4 3 5 3 9"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5M8 13h8M8 17h5"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 14v4M8 21h8"/></svg>',
    gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>',
    bookmark: '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  };

  window.UI = { esc, ring, animateRings, minutes, greeting, firstName, ago, icon };
  window.Pages = window.Pages || {};
})();
