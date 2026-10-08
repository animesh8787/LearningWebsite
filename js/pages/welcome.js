/* First-run onboarding: level, daily goal, optional sync. */
(function () {
  const { esc } = UI;
  const LEVELS = [
    ['beginner', 'Like I’m new', 'Everyday analogies first, jargon later.', 'A variable is a labelled box on a shelf. You put a value inside.'],
    ['intermediate', 'Plain English', 'Clear explanations that assume some basics.', 'A variable is a named place in memory that holds one value of a given type.'],
    ['advanced', 'Technical', 'The mechanics, standards and edge cases up front.', 'A variable names an object with a type, storage duration and an address.'],
  ];
  const GOALS = [[5, 'Light'], [15, 'Steady'], [30, 'Intense']];

  Pages.welcome = function (root, done) {
    const cur = Profile.profile;
    const st = { step: 0, level: cur.level || Store.get('level', 'intermediate'), goal: cur.dailyGoalMin || 15, name: cur.name || '' };
    const canSync = !!(window.Sync && Sync.enabled);
    const total = canSync ? 3 : 2;

    function finish() {
      Store.set('level', st.level); Store.touchSettings();
      Profile.updateProfile({ name: st.name.trim(), level: st.level, dailyGoalMin: st.goal, onboarded: true });
      done();
    }

    function draw() {
      const dots = Array.from({ length: total }, (_, i) => `<i class="${i <= st.step ? 'on' : ''}"></i>`).join('');
      let body = '';
      if (st.step === 0) {
        body = `<div class="eyebrow"><b>/</b> Welcome</div>
          <h1>How should we <em>explain</em> things?</h1>
          <p class="lead">Every big idea comes at three depths. You can switch any time from the top bar.</p>
          <div class="choices" role="radiogroup" aria-label="Explanation level">
            ${LEVELS.map(([k, t, d, ex]) => `<button class="choice" role="radio" aria-checked="${st.level === k}" data-level="${k}"><b>${t}</b><span>${d}</span><span style="margin-top:8px;font-style:italic;color:var(--muted)">“${ex}”</span></button>`).join('')}
          </div>`;
      } else if (st.step === 1) {
        body = `<div class="eyebrow"><b>/</b> Your goal</div>
          <h1>How much time <em>each day?</em></h1>
          <p class="lead">A small daily habit beats an occasional marathon. You can change this later.</p>
          <div class="choices row3" role="radiogroup" aria-label="Daily goal">
            ${GOALS.map(([m, t]) => `<button class="choice" role="radio" aria-checked="${st.goal === m}" data-goal="${m}"><b>${m} min</b><span>${t}</span></button>`).join('')}
          </div>
          <label class="fld"><span>What should we call you? (optional)</span><input type="text" id="wName" maxlength="40" autocomplete="given-name" placeholder="Your name" value="${esc(st.name)}"></label>`;
      } else {
        body = `<div class="eyebrow"><b>/</b> Optional</div>
          <h1>Keep your progress <em>everywhere.</em></h1>
          <p class="lead">Sign in to sync lessons, notes and streaks across your devices. You can skip this and sign in later from Settings.</p>
          <div class="choices"><button class="choice" id="wSignin"><b>Sign in or create an account</b><span>Google, GitHub or email.</span></button></div>`;
      }
      const last = st.step === total - 1;
      root.innerHTML = `<div class="welcome-wrap"><div class="welcome-card" role="group" aria-label="Welcome, step ${st.step + 1} of ${total}">
        <div class="wsteps" aria-hidden="true">${dots}</div>${body}
        <div class="wnav">
          ${st.step > 0 ? '<button class="link-btn" id="wBack">Back</button>' : '<button class="link-btn" id="wSkip">Skip setup</button>'}
          <button class="btn" id="wNext" style="--h:46px;padding:0 24px">${last ? 'Go to dashboard' : 'Continue'} <span class="arr">→</span></button>
        </div></div></div>`;

      root.querySelectorAll('[data-level]').forEach(b => b.addEventListener('click', () => { st.level = b.dataset.level; draw(); root.querySelector('[data-level="' + st.level + '"]').focus(); }));
      root.querySelectorAll('[data-goal]').forEach(b => b.addEventListener('click', () => { st.goal = +b.dataset.goal; st.name = root.querySelector('#wName').value; draw(); root.querySelector('[data-goal="' + st.goal + '"]').focus(); }));
      const nm = root.querySelector('#wName'); if (nm) nm.addEventListener('input', () => { st.name = nm.value; });
      const si = root.querySelector('#wSignin'); if (si) si.addEventListener('click', () => Auth.open());
      root.querySelector('#wBack') && root.querySelector('#wBack').addEventListener('click', () => { st.step--; draw(); });
      root.querySelector('#wSkip') && root.querySelector('#wSkip').addEventListener('click', finish);
      root.querySelector('#wNext').addEventListener('click', () => { if (last) finish(); else { st.step++; draw(); } });
      const h = root.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); }
    }
    draw();
  };
})();
