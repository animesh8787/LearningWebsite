/* Landing page: hero, pinned story over a "memory grid", live demo, horizontal curriculum track,
   FAQ and footer. Lives at / and links into the learner app at /app/. */
(function () {
  const RM = window.REDUCED;
  const APP = 'app/';
  let lenis = null;

  /* ---------- smooth scroll (same Lenis + ScrollTrigger pairing as the app) ---------- */
  function initScroll() {
    if (RM || !window.Lenis) return;
    lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: .95 });
    window.__lenis = lenis;
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
  }
  function scrollTo(el, offset) { lenis ? lenis.scrollTo(el, { offset: offset ?? -70, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' }); }

  /* ---------- who is visiting? ---------- */
  function visitor() {
    const prof = Store.get('profile', null);
    const done = Store.get('done', {});
    const started = !!(prof && prof.onboarded) || Object.keys(done).length > 0;
    return { started, href: started ? APP + '#/' : APP + '#/welcome', label: started ? 'Continue learning' : 'Start learning', short: started ? 'Continue' : 'Start' };
  }

  const FAQ = [
    ['Is it really free?', 'Yes. Every lesson, visualizer and exercise is free, with no ads. An account is optional and only used to sync your progress between devices.'],
    ['Do I need to create an account?', 'No. You can start immediately and your progress is saved in your browser. If you sign in, your progress, notes and bookmarks sync across your devices.'],
    ['Who is it for?', 'Complete beginners who have never written C++, and people who know the syntax but want to understand memory, the STL and the patterns used in interviews. Each big idea is explained at three levels, so you choose the depth.'],
    ['Does it work offline?', 'The lessons and visualizers run entirely in your browser. Only the optional “Run” button on code samples needs an internet connection, because it sends the program to an online compiler.'],
    ['What will I be able to do afterwards?', 'Read and write modern C++, reason about memory and complexity, choose the right STL container for a problem, and solve common LeetCode patterns with confidence.'],
  ];

  function html() {
    const mods = COURSE.modules;
    const lessons = COURSE.flat.length;
    const mins = COURSE.flat.reduce((a, l) => a + l.min, 0);
    const v = visitor();
    return `
    <section class="hero-pin" id="hero">
      <div class="hero-glow"></div>
      <div class="hero-grid" id="heroGrid"></div>
      <div class="hero-copy">
        <div class="hero-tags" data-fade><span>C++</span><span>STL</span><span class="hl">Interview preparation</span></div>
        <h1 class="display" style="margin-top:26px">
          <span class="ln"><span>Learn C++ and the STL</span></span>
          <span class="ln"><span>by <em>seeing</em> how they work.</span></span>
        </h1>
        <p class="hero-sub" data-fade>A free interactive course that takes you from your first variable to interview-ready STL. Every concept is visualized and explained at three levels, from plain English to technical detail.</p>
        <div class="hero-cta" data-fade>
          <a class="btn" data-magnetic data-start href="${v.href}">${v.label} <span class="arr">→</span></a>
          <button class="btn ghost" data-magnetic data-scroll="#roadmap">Browse the curriculum</button>
        </div>
      </div>
    </section>

    <section class="story" id="story" aria-label="What you will learn">
      <div class="hero-grid" id="storyGrid"></div>
      <div class="hero-glow"></div>
      <div class="story-lines">
        <div class="story-line">A variable is <em>a box.</em><small>A name on the label, a value inside, an address on the shelf.</small></div>
        <div class="story-line">A pointer is <em>a note</em> saying where the box lives.<small>Not the thing itself, only directions to it.</small></div>
        <div class="story-line">A vector is a row of boxes that <em>relocates</em> when it fills up.<small>Which is why a single push_back can occasionally be expensive.</small></div>
        <div class="story-line">Every concept, <em>made visible.</em><small>Each idea is shown first, then explained in depth.</small></div>
      </div>
    </section>

    <section class="sec" id="numbers">
      <span class="eyebrow"><b>/</b> What’s inside</span>
      <h2 class="sec-title">Built to take you from <em>zero</em> to fluent.</h2>
      <div class="stats">
        <div class="stat"><b data-count="${lessons}">0</b><span>lessons, in a deliberate order</span></div>
        <div class="stat"><b data-count="${mods.length}">0</b><span>modules across two parts</span></div>
        <div class="stat"><b data-count="${Math.round(mins / 60)}">0</b><span>hours of guided reading</span></div>
        <div class="stat"><b data-count="3">0</b><span>depth levels for every big idea</span></div>
      </div>
    </section>

    <section class="sec try" id="try" aria-labelledby="tryTitle">
      <span class="eyebrow"><b>/</b> Try it</span>
      <h2 class="sec-title" id="tryTitle">Understand it <em>here,</em> before you sign up.</h2>
      <p class="sec-lead">This is a real lesson excerpt. Pick how deep you want the explanation, then play with the memory underneath.</p>
      <div class="try-grid">
        <div class="levels try-levels">
          <div class="levels-tabs" role="tablist" aria-label="Explanation depth">
            <button role="tab" aria-selected="false" data-k="eli5">Like I’m new</button>
            <button role="tab" aria-selected="true" data-k="plain" class="on">Plain English</button>
            <button role="tab" aria-selected="false" data-k="tech">Technical</button>
          </div>
          <div class="levels-body">
            <div data-k="eli5"><p>Imagine a shelf of boxes. You stick a label on one that says <strong>age</strong> and put 21 inside. That box is a variable. Changing it means swapping what is inside, never the label.</p></div>
            <div data-k="plain" class="on"><p>A <strong>vector</strong> stores its elements side by side in one block of memory. When the block is full, it allocates a bigger one (about twice as large), copies everything across and frees the old block.</p><p>That occasional copy is why <code class="i">push_back</code> is fast on average but not every single time.</p></div>
            <div data-k="tech"><p>A vector holds three pointers: <code class="i">begin</code>, <code class="i">end</code> and <code class="i">end_of_storage</code>. Growth is geometric (×2 in libstdc++), so <code class="i">push_back</code> is amortized O(1). Reallocation invalidates every iterator, pointer and reference into the old block.</p></div>
          </div>
        </div>
        <div id="tryViz"></div>
      </div>
    </section>

    <section class="track-wrap" id="roadmap" aria-label="Curriculum">
      <div class="track" id="track">
        ${mods.map(m => `
          <a class="tr-card" href="${APP}#/lesson/${m.lessons[0].id}">
            <div class="big">${String(m.no).padStart(2, '0')}</div>
            <span class="eyebrow">${m.part === 'cpp' ? 'Part 1 · C++' : 'Part 2 · STL'}</span>
            <h3>${m.title}</h3>
            <p>${m.blurb}</p>
            <div class="chips"><span class="chip">${m.lessons.length} lessons</span><span class="chip">${m.lessons.reduce((a, l) => a + l.min, 0)} min</span></div>
          </a>`).join('')}
      </div>
    </section>

    <section class="sec faq" id="faq" aria-labelledby="faqTitle">
      <span class="eyebrow"><b>/</b> FAQ</span>
      <h2 class="sec-title" id="faqTitle">Frequently asked <em>questions.</em></h2>
      <div class="faq-list">
        ${FAQ.map(([q, a], i) => `
          <div class="faq-item">
            <h3><button aria-expanded="false" aria-controls="faq-p${i}" id="faq-b${i}"><span>${q}</span><i aria-hidden="true"></i></button></h3>
            <div class="faq-panel" id="faq-p${i}" role="region" aria-labelledby="faq-b${i}" hidden><p>${a}</p></div>
          </div>`).join('')}
      </div>
    </section>

    <section class="home-foot" aria-label="Get started">
      <h2 class="display">Start with <em>lesson one.</em></h2>
      <p class="sec-lead" style="margin:22px auto 0;text-align:center">Free, in your browser, no sign-up needed.</p>
      <div class="hero-cta" style="margin-top:36px">
        <a class="btn" data-magnetic data-start href="${v.href}">${v.label} <span class="arr">→</span></a>
        <a class="btn ghost" data-magnetic href="${APP}#/lesson/${(COURSE.flat.find(l => l.ready) || COURSE.flat[0]).id}">Preview a lesson</a>
      </div>
    </section>`;
  }

  /* ----- memory grid ----- */
  let timers = [];
  function buildGrid(el) {
    const W = innerWidth || document.documentElement.clientWidth || 1280, H = innerHeight || 800;
    const size = W < 600 ? 56 : 76;
    const cols = Math.ceil(W / size), rows = Math.ceil(Math.max(H, 640) / size);
    el.style.setProperty('--cols', cols);
    el.style.gridTemplateRows = `repeat(${rows}, ${size}px)`;
    let h = '';
    for (let i = 0; i < cols * rows; i++) h += `<div class="hg">${((Math.random() * 256) | 0).toString(16).toUpperCase().padStart(2, '0')}</div>`;
    el.innerHTML = h;
    return { cells: [...el.querySelectorAll('.hg')], cols, rows, size };
  }
  function pointerLight(section, g) {
    let last = -1;
    section.addEventListener('pointermove', e => {
      const r = section.getBoundingClientRect();
      const cx = Math.floor((e.clientX - r.left) / g.size), cy = Math.floor((e.clientY - r.top) / g.size);
      const idx = cy * g.cols + cx; if (idx === last || idx < 0 || idx >= g.cells.length) return; last = idx;
      const c = g.cells[idx]; c.classList.add('lit'); setTimeout(() => c.classList.remove('lit'), 900);
    });
  }
  function flicker(g) {
    timers.push(setInterval(() => {
      if (!g.cells.length || document.hidden) return;
      for (let k = 0; k < 3; k++) {
        const c = g.cells[(Math.random() * g.cells.length) | 0];
        c.textContent = ((Math.random() * 256) | 0).toString(16).toUpperCase().padStart(2, '0');
        c.classList.add('lit'); setTimeout(() => c.classList.remove('lit'), 700);
      }
    }, 650));
  }
  function pattern(g, phase) {
    g.cells.forEach(c => c.classList.remove('lit'));
    const mid = Math.floor(g.rows / 2) * g.cols + Math.floor(g.cols / 2);
    const lit = i => g.cells[i] && g.cells[i].classList.add('lit');
    if (phase === 0) lit(mid);
    else if (phase === 1) { lit(mid - 2); lit(mid + 2); lit(mid - 2 + g.cols * 2); }
    else if (phase === 2) for (let i = -3; i <= 3; i++) lit(mid + i);
    else g.cells.forEach((c, i) => setTimeout(() => c.classList.add('lit'), (i % g.cols) * 25 + Math.floor(i / g.cols) * 25));
  }

  /* ----- nav ----- */
  function initNav() {
    const nav = document.getElementById('lnav');
    const v = visitor();
    nav.querySelectorAll('[data-start]').forEach(a => { a.href = v.href; a.innerHTML = `<span class="lbl-long">${v.label}</span><span class="lbl-short">${v.short}</span> <span class="arr">→</span>`; });
    const onScroll = () => nav.classList.toggle('solid', scrollY > 24);
    onScroll(); addEventListener('scroll', onScroll, { passive: true });
    nav.querySelectorAll('[data-scroll]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(a.dataset.scroll); if (t) scrollTo(t, -10); closeMenu(); }));
    const toggle = document.getElementById('lmenu');
    function closeMenu() { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', () => { const o = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', o); });
    addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
    document.querySelectorAll('.lfoot [data-scroll]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const t = document.querySelector(a.dataset.scroll); if (t) scrollTo(t, -10); }));
    document.getElementById('lTheme').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next; Store.set('theme', next);
    });
  }

  function initFaq(root) {
    root.querySelectorAll('.faq-item button').forEach(b => b.addEventListener('click', () => {
      const open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', !open);
      root.querySelector('#' + b.getAttribute('aria-controls')).hidden = open;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }));
  }

  function initTry(root) {
    root.querySelectorAll('.try-levels .levels-tabs button').forEach(b => b.addEventListener('click', () => {
      const box = b.closest('.levels');
      box.querySelectorAll('.levels-tabs button').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
      box.querySelectorAll('.levels-body > div').forEach(d => d.classList.toggle('on', d.dataset.k === b.dataset.k));
    }));
    Viz.mount(root.querySelector('#tryViz'), 'vecgrow', {});
  }

  function mount(root) {
    root.innerHTML = html();
    const has = window.gsap && window.ScrollTrigger;

    const hg = buildGrid(root.querySelector('#heroGrid')); pointerLight(root.querySelector('#hero'), hg); if (!RM) flicker(hg);
    const sg = buildGrid(root.querySelector('#storyGrid'));
    root.querySelectorAll('[data-scroll]').forEach(b => b.addEventListener('click', () => { const t = root.querySelector(b.dataset.scroll); if (t) scrollTo(t, -20); }));
    Effects.magnetic(root);
    initFaq(root); initTry(root);

    if (!has || RM) {
      root.querySelectorAll('.story').forEach(s => { s.style.height = 'auto'; s.style.padding = '120px 24px'; });
      root.querySelectorAll('.story-line').forEach(l => { l.style.position = 'static'; l.style.opacity = 1; l.style.transform = 'none'; l.style.margin = '0 auto 90px'; l.style.maxWidth = '900px'; });
      root.querySelectorAll('.stat b').forEach(b => (b.textContent = b.dataset.count));
      root.querySelector('.track-wrap').style.overflowX = 'auto';
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    // hero entrance
    gsap.set('.display .ln > span', { yPercent: 115 });
    gsap.set('[data-fade]', { opacity: 0, y: 14 });
    gsap.timeline({ defaults: { ease: 'power4.out' }, delay: .15 })
      .to('.display .ln > span', { yPercent: 0, duration: 1.3, stagger: .12 })
      .to('[data-fade]', { opacity: 1, y: 0, duration: .9, stagger: .09 }, '-=.9');

    gsap.to('.hero-copy', { yPercent: -18, opacity: .1, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

    // story: pinned, scrubbed line swaps
    const lines = gsap.utils.toArray('.story-line');
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#story', start: 'top top', end: () => '+=' + innerHeight * 3.6, pin: true, scrub: .6, anticipatePin: 1,
        onUpdate: s => { const ph = Math.min(3, Math.floor(s.progress * 4)); if (ph !== tl._ph) { tl._ph = ph; pattern(sg, ph); } },
      },
    });
    lines.forEach((l, i) => {
      tl.fromTo(l, { opacity: 0, y: 70, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1, ease: 'power2.out' });
      if (i < lines.length - 1) tl.to(l, { opacity: 0, y: -70, filter: 'blur(10px)', duration: 1, ease: 'power2.in' }, '+=.9');
    });

    root.querySelectorAll('.stat b').forEach(b => {
      const n = +b.dataset.count, o = { v: 0 };
      ScrollTrigger.create({ trigger: b, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: n, duration: 1.6, ease: 'power3.out', onUpdate: () => (b.textContent = Math.round(o.v)) }) });
    });
    gsap.from('.stat', { opacity: 0, y: 30, stagger: .1, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 85%' } });
    gsap.from('.try-grid > *', { opacity: 0, y: 40, stagger: .12, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.try-grid', start: 'top 85%' } });

    // horizontal curriculum
    const track = root.querySelector('#track');
    const rd = root.querySelector('#roadmap');
    if (innerWidth > 760) {
      const dist = () => Math.max(0, track.scrollWidth - innerWidth);
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#roadmap', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .5, invalidateOnRefresh: true, anticipatePin: 1 } });
      rd.style.minHeight = '100vh'; rd.style.display = 'flex'; rd.style.alignItems = 'center';
    } else rd.style.overflowX = 'auto';

    gsap.from('.home-foot .display', { opacity: 0, y: 60, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '.home-foot', start: 'top 75%' } });
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
    ScrollTrigger.refresh();
  }

  function init() {
    initScroll(); initNav();
    mount(document.getElementById('landing'));
    let rw = innerWidth, rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (Math.abs(innerWidth - rw) > 80) location.reload(); rw = innerWidth; }, 400); });
  }
  addEventListener('DOMContentLoaded', init);
})();
