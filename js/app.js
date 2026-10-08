/* Learner app: boot, theme, level, router (dashboard, lessons, pages), smooth scroll, reading progress. */
(function () {
  const RM = window.REDUCED;
  const view = document.getElementById('view');
  const crumbs = document.getElementById('crumbs');
  const bar = document.getElementById('readBar');
  let lenis = null, spy = null, pageCleanup = null;

  /* ---------- theme ---------- */
  function setTheme(t) { document.documentElement.dataset.theme = t; Store.set('theme', t); }
  function toggleTheme() { setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); Store.touchSettings(); }

  /* ---------- level (changes which explanation tab opens by default) ---------- */
  const LV = { beginner: 'eli5', intermediate: 'plain', advanced: 'tech' };
  function setLevel(l) {
    Store.set('level', l);
    document.querySelectorAll('[data-level]').forEach(b => b.classList.toggle('on', b.dataset.level === l));
    applyLevel(view);
  }
  function applyLevel(root) {
    const k = LV[Store.get('level', 'intermediate')];
    root.querySelectorAll('.levels').forEach(box => {
      const has = box.querySelector(`[data-k="${k}"]`);
      const use = has ? k : 'plain';
      box.querySelectorAll('[data-k]').forEach(n => { n.classList.toggle('on', n.dataset.k === use); if (n.getAttribute('role') === 'tab') n.setAttribute('aria-selected', n.dataset.k === use); });
    });
  }

  /* ---------- scroll ---------- */
  function initScroll() {
    if (RM || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .95 });
    App.lenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }
  function toTop() { lenis ? lenis.scrollTo(0, { immediate: true, force: true }) : window.scrollTo(0, 0); }
  function scrollToEl(el) { lenis ? lenis.scrollTo(el, { offset: -76, duration: 1.1 }) : el.scrollIntoView({ behavior: 'smooth' }); }

  window.addEventListener('scroll', () => {
    const art = view.querySelector('.article'); if (!art) { bar.style.transform = 'scaleX(0)'; return; }
    const r = art.getBoundingClientRect(), total = r.height - innerHeight * .6;
    bar.style.transform = `scaleX(${Math.max(0, Math.min(1, -r.top / Math.max(1, total)))})`;
  }, { passive: true });

  /* ---------- helpers ---------- */
  // Cross-fade between pages with a View Transition. If the browser is slow to start one (or not
  // painting), the update still runs after a short deadline so navigation never stalls.
  const swap = fn => {
    let ran = false;
    const run = () => { if (!ran) { ran = true; fn(); } };
    if (document.startViewTransition && !RM && document.visibilityState === 'visible') {
      const vt = document.startViewTransition(run); vt.ready.catch(() => {}); vt.finished.catch(() => {});
      setTimeout(run, 400);
    } else run();
  };
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error('load ' + src));
      document.head.appendChild(s);
    });
  }
  function announce(t) { const a = document.getElementById('announcer'); if (a) a.textContent = 'Page loaded: ' + t; try { view.focus({ preventScroll: true }); } catch (_) { } }
  function setCrumbs(parts) { crumbs.innerHTML = parts.map(p => `<span>${p}</span>`).join('<i>/</i>'); }
  function leave() { if (pageCleanup) { try { pageCleanup(); } catch (_) { } pageCleanup = null; } }

  /* ---------- pages (dashboard, notes, achievements, settings, welcome) ---------- */
  function showPage(name, title, mount, opts) {
    opts = opts || {};
    Profile.setLessonActive(false);
    document.body.classList.toggle('welcome', !!opts.bare);
    document.title = `${title} — C++ & STL`;
    setCrumbs([title]); Sidebar.setPage(name); Sidebar.refresh(null);
    swap(() => {
      leave();
      view.innerHTML = '';
      const root = document.createElement('div'); view.appendChild(root);
      mount(root);
      pageCleanup = root._cleanup || null;
      toTop(); announce(title);
      if (window.gsap && !RM) gsap.from(root.querySelectorAll('.pg-head > *, .pcard, .set-sec, .mod-card, .badge'), { opacity: 0, y: 18, duration: .7, stagger: .035, ease: 'power3.out', clearProps: 'all' });
    });
  }

  /* ---------- lessons ---------- */
  async function showLesson(id) {
    const l = COURSE.byId[id];
    if (!l) { location.hash = '#/'; return; }
    Store.visit(id);
    document.body.classList.remove('welcome');
    let def = null;
    if (l.ready) { try { await loadLesson(l); def = LESSONS[id]; } catch (e) { def = null; } }
    const i = COURSE.flat.indexOf(l);
    const meta = { id, part: l.part, mod: l.mod, min: l.min, prev: COURSE.flat[i - 1], next: COURSE.flat[i + 1] };
    document.title = `${l.title} — C++ & STL`;
    setCrumbs([l.part.name, l.mod.title, l.title]); Sidebar.setPage(null); Sidebar.refresh(id);
    Profile.setLessonActive(true);
    swap(() => {
      leave();
      view.innerHTML = '';
      const root = document.createElement('div'); root.className = 'lesson-root'; view.appendChild(root);
      if (def) {
        const { html, ctx } = Render.lesson(def, meta);
        root.innerHTML = html; Render.activate(root, ctx, id); applyLevel(root); initToc(root);
      } else {
        root.innerHTML = `<div class="placeholder"><span class="eyebrow"><b>●</b> ${l.mod.title}</span><h1>${l.title}</h1>
          <p>This lesson is still being written. The structure, navigation and design are final, and the content lands module by module.</p>
          <div class="hero-cta" style="margin-top:30px">${meta.prev ? `<a class="btn ghost" href="#/lesson/${meta.prev.id}">← ${meta.prev.title}</a>` : ''}<a class="btn" href="#/lesson/${(COURSE.flat.find(x => x.ready) || l).id}">Open a finished lesson</a></div></div>`;
      }
      toTop(); Sidebar.scrollActive(); announce(l.title);
      if (window.gsap && !RM) gsap.from(root.querySelectorAll('.article > .eyebrow, .article > h1, .article > .lead'), { opacity: 0, y: 24, duration: .9, stagger: .08, ease: 'power3.out' });
      if (window.gsap && window.ScrollTrigger && !RM) root.querySelectorAll('.article h2, .viz, .codeblock, .levels, .callout, .quiz').forEach(n => {
        gsap.from(n, { opacity: 0, y: 28, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: n, start: 'top 90%', once: true } });
      });
    });
  }
  const loadLesson = l => (LESSONS[l.id] ? Promise.resolve() : loadScript(COURSE.fileFor(l)));

  /* ---------- toc spy ---------- */
  function initToc(root) {
    if (spy) spy.disconnect();
    const links = [...root.querySelectorAll('.toc a')]; if (!links.length) return;
    links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollToEl(root.querySelector(a.getAttribute('href'))); }));
    spy = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { links.forEach(a => a.classList.toggle('on', a.dataset.id === e.target.id)); } });
    }, { rootMargin: '-20% 0px -70% 0px' });
    root.querySelectorAll('.article h2').forEach(h => spy.observe(h));
  }

  /* ---------- router ---------- */
  const firstRun = () => { const p = Profile.profile; return !p.onboarded && !Object.keys(Store.get('done', {})).length && !Store.get('last', null); };

  function route() {
    const h = location.hash.replace(/^#/, '');
    if (h && !h.startsWith('/')) return;           // in-page anchor, ignore
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
    const lesson = h.match(/^\/lesson\/([\w-]+)/);
    if (lesson) return showLesson(lesson[1]);
    switch (h.replace(/\/+$/, '')) {
      case '/welcome': return showPage('welcome', 'Welcome', r => Pages.welcome(r, () => { location.hash = '#/'; }), { bare: true });
      case '/notes': return showPage('notes', 'Notes', Pages.notes);
      case '/achievements': return showPage('achievements', 'Achievements', Pages.achievements);
      case '/settings': return showPage('settings', 'Settings', Pages.settings);
      default:
        if (firstRun()) { location.replace('#/welcome'); return; }
        return showPage('dashboard', 'Dashboard', Pages.dashboard);
    }
  }

  /* ---------- menus ---------- */
  function initMenus() {
    document.addEventListener('click', e => {
      const btn = e.target.closest('[data-menu-btn]');
      document.querySelectorAll('.menu.open').forEach(m => { if (!btn || m !== btn.parentElement.querySelector('.menu')) m.classList.remove('open'); });
      if (btn) btn.parentElement.querySelector('.menu').classList.toggle('open');
      document.querySelectorAll('[data-menu-btn]').forEach(b => b.setAttribute('aria-expanded', b.parentElement.querySelector('.menu').classList.contains('open')));
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.querySelectorAll('.menu.open').forEach(m => m.classList.remove('open')); document.querySelectorAll('[data-menu-btn]').forEach(b => b.setAttribute('aria-expanded', 'false')); } });
    document.addEventListener('click', e => { if (e.target.closest('[data-reset-progress]') && confirm('Reset all progress on this device? Completed lessons, XP, streak and badges will be cleared.')) { Profile.resetProgress(); Sidebar.refresh(); } });
  }

  function init() {
    setTheme(Store.get('theme', matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
    document.querySelectorAll('[data-theme-toggle]').forEach(b => b.addEventListener('click', toggleTheme));
    document.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { setLevel(b.dataset.level); Store.touchSettings(); }));
    setLevel(Store.get('level', 'intermediate'));
    Profile.init();
    Sidebar.init(); initMenus(); initScroll();
    window.addEventListener('hashchange', route);
    route();
  }

  window.App = { init, toggleTheme, setTheme, setLevel, lenis: null };
  window.addEventListener('DOMContentLoaded', init);
})();
