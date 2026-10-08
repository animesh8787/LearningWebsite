/* Learner profile: wires the pure logic in profile-core.js to storage, the lesson flow and the UI. */
(function () {
  const PC = window.ProfileCore;
  const base = PC.emptyState();
  const get = k => Store.get(k, JSON.parse(JSON.stringify(base[k])));
  const listeners = new Set();
  const emit = () => listeners.forEach(fn => { try { fn(); } catch (_) { } });

  const clone = o => JSON.parse(JSON.stringify(o));
  const today = () => PC.dayKey();

  function state() {
    return { profile: get('profile'), done: get('done'), stats: get('stats'), notes: get('notes'), bookmarks: get('bookmarks'), badges: get('badges') };
  }
  function mutateStats(fn) {
    const s = clone(get('stats'));
    fn(s);
    s.updated = Date.now();
    Store.set('stats', s);
    return s;
  }

  /* ---------- toasts ---------- */
  function toast(title, msg, icon) {
    let box = document.getElementById('toasts');
    if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="toast-ic">${icon || '★'}</span><span><b>${title}</b>${msg ? `<small>${msg}</small>` : ''}</span>`;
    box.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, 4200);
  }

  /* ---------- badges ---------- */
  function badges() { return PC.evalBadges(COURSE, state()); }
  function checkBadges(silent) {
    const have = clone(get('badges'));
    const fresh = [];
    badges().forEach(b => { if (b.unlocked && !have[b.id]) { have[b.id] = Date.now(); fresh.push(b); } });
    if (fresh.length) {
      Store.set('badges', have);
      if (!silent) fresh.forEach((b, i) => setTimeout(() => toast('Badge unlocked: ' + b.title, b.desc, b.icon), i * 700));
    }
    return fresh;
  }

  /* ---------- actions ---------- */
  function completeLesson(id) {
    if (Store.isDone(id)) return { already: true };
    const before = PC.levelInfo(get('stats').xp).level;
    Store.markDone(id);
    mutateStats(s => { s.xp += PC.XP.lesson; s.streak = PC.touchStreak(s.streak, today()); });
    const after = PC.levelInfo(get('stats').xp).level;
    if (after > before) toast('Level ' + after, 'You reached level ' + after + '.', String(after));
    const fresh = checkBadges();
    emit();
    return { xp: PC.XP.lesson, levelUp: after > before, badges: fresh };
  }

  /** Called once per quiz question, with whether the learner's FIRST answer was right. */
  function quiz(lessonId, quizId, firstTryCorrect) {
    const q0 = get('stats').quiz[lessonId] || { first: 0, total: 0, seen: {} };
    if (q0.seen && q0.seen[quizId] !== undefined) return;         // each question counts once, ever
    mutateStats(s => {
      const q = s.quiz[lessonId] || { first: 0, total: 0, seen: {} };
      q.seen = q.seen || {};
      q.seen[quizId] = firstTryCorrect ? 1 : 0;
      q.total += 1; if (firstTryCorrect) { q.first += 1; s.xp += PC.XP.quizFirstTry; }
      s.quiz[lessonId] = q;
      s.streak = PC.touchStreak(s.streak, today());
    });
    checkBadges(); emit();
  }

  function addSeconds(n) {
    const day = today();
    mutateStats(s => {
      s.days[day] = (s.days[day] || 0) + n;
      if (s.days[day] >= 60) s.streak = PC.touchStreak(s.streak, day);   // a minute of learning keeps the streak alive
    });
    emit();
  }

  function updateProfile(patch) { Store.set('profile', Object.assign({}, get('profile'), patch, { updated: Date.now() })); emit(); }

  function setNote(id, text) {
    const notes = clone(get('notes'));
    if (!text.trim() && !notes[id]) return;
    notes[id] = { text, updated: Date.now() };
    Store.set('notes', notes); checkBadges(); emit();
  }
  const getNote = id => (get('notes')[id] || { text: '' }).text;

  function toggleBookmark(id) {
    const marks = clone(get('bookmarks'));
    const on = !(marks[id] && marks[id].on);
    marks[id] = { on, t: Date.now() };
    Store.set('bookmarks', marks); checkBadges(); emit();
    return on;
  }
  const isBookmarked = id => !!(get('bookmarks')[id] && get('bookmarks')[id].on);

  function resetProgress() {
    Store.set('done', {});
    Store.set('stats', Object.assign(clone(base.stats), { updated: Date.now() }));
    Store.set('badges', {});
    emit();
  }

  /* ---------- time on lessons: only while visible and the learner is active ---------- */
  let lessonActive = false, lastInput = Date.now(), timer = null, pending = 0;
  ['pointermove', 'keydown', 'scroll', 'pointerdown', 'wheel', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true }));
  function setLessonActive(on) {
    lessonActive = on;
    if (on && !timer) timer = setInterval(() => {
      if (!lessonActive || document.hidden || Date.now() - lastInput > 60000) return;
      pending += 5;
      if (pending >= 15) { addSeconds(pending); pending = 0; }
    }, 5000);
    if (!on) { if (pending) { addSeconds(pending); pending = 0; } clearInterval(timer); timer = null; }
  }
  addEventListener('pagehide', () => { if (pending) { addSeconds(pending); pending = 0; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && pending) { addSeconds(pending); pending = 0; } });

  /* ---------- derived values for the UI ---------- */
  const secondsToday = () => get('stats').days[today()] || 0;
  const liveStreak = () => PC.liveStreak(get('stats').streak, today());
  const level = () => PC.levelInfo(get('stats').xp);
  function overall() {
    const done = get('done');
    return { done: COURSE.flat.filter(l => done[l.id]).length, total: COURSE.flat.length };
  }
  function moduleProgress(m) {
    const done = get('done');
    const d = m.lessons.filter(l => done[l.id]).length;
    return { done: d, total: m.lessons.length, pct: d / m.lessons.length };
  }
  /** The lesson to offer next: the one after the last you opened (if finished), else the first unfinished. */
  function nextLesson() {
    const done = get('done'), last = Store.get('last', null);
    const flat = COURSE.flat;
    if (last && COURSE.byId[last]) {
      const i = flat.indexOf(COURSE.byId[last]);
      const cand = done[last] ? flat[i + 1] : flat[i];
      if (cand) return cand;
    }
    return flat.find(l => !done[l.id]) || flat[0];
  }
  function recent(n) {
    const done = get('done');
    return Object.entries(done).sort((a, b) => b[1] - a[1]).slice(0, n).map(([id, ts]) => ({ lesson: COURSE.byId[id], ts })).filter(x => x.lesson);
  }
  function weekStrip() {
    const days = get('stats').days, t = today(), out = [];
    for (let i = 6; i >= 0; i--) { const k = PC.shiftDay(t, -i); out.push({ key: k, sec: days[k] || 0, today: i === 0 }); }
    return out;
  }
  function totals() {
    const s = get('stats');
    const seconds = Object.values(s.days).reduce((a, b) => a + b, 0);
    const q = Object.values(s.quiz).reduce((a, x) => ({ first: a.first + x.first, total: a.total + x.total }), { first: 0, total: 0 });
    return { seconds, quiz: q, accuracy: q.total ? Math.round(q.first / q.total * 100) : null };
  }

  function init() { checkBadges(true); }

  window.Profile = {
    state, get, init, toast, on: fn => listeners.add(fn), off: fn => listeners.delete(fn), emit,
    completeLesson, quiz, addSeconds, updateProfile, setNote, getNote, toggleBookmark, isBookmarked, resetProgress, setLessonActive,
    badges, checkBadges, secondsToday, liveStreak, level, overall, moduleProgress, nextLesson, recent, weekStrip, totals,
    today, get profile() { return get('profile'); },
  };
})();
