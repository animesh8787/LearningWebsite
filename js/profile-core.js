/* Pure learner-progress logic: XP, levels, streaks, badges and the sync merge.
   No DOM and no storage, so it can be unit-tested in Node (tools/test-profile.js). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ProfileCore = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const SCHEMA = 1;
  const XP = { lesson: 10, quizFirstTry: 2 };

  /* ---------- dates (local calendar days) ---------- */
  function dayKey(d) {
    d = d ? new Date(d) : new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function shiftDay(key, delta) {
    const [y, m, d] = key.split('-').map(Number);
    return dayKey(new Date(y, m - 1, d + delta));
  }

  /* ---------- xp and levels ---------- */
  const xpNeeded = L => 25 * (L - 1) * L;           // cumulative XP required to reach level L
  function levelInfo(xp) {
    xp = Math.max(0, xp | 0);
    const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 4 * xp / 25)) / 2));
    const lo = xpNeeded(level), hi = xpNeeded(level + 1);
    return { level, into: xp - lo, span: hi - lo, pct: (xp - lo) / (hi - lo), next: hi };
  }

  /* ---------- streaks ---------- */
  function touchStreak(streak, today) {
    const s = { current: (streak && streak.current) || 0, longest: (streak && streak.longest) || 0, lastDay: (streak && streak.lastDay) || null };
    if (s.lastDay === today) return s;
    s.current = s.lastDay && shiftDay(today, -1) === s.lastDay ? s.current + 1 : 1;
    s.longest = Math.max(s.longest, s.current);
    s.lastDay = today;
    return s;
  }
  /** What to show: a streak is only alive if you last learned today or yesterday. */
  function liveStreak(streak, today) {
    if (!streak || !streak.lastDay) return 0;
    return streak.lastDay === today || shiftDay(today, -1) === streak.lastDay ? streak.current : 0;
  }

  /* ---------- state ---------- */
  function emptyState() {
    return {
      v: SCHEMA,
      profile: { name: '', level: 'intermediate', dailyGoalMin: 15, onboarded: false, updated: 0 },
      done: {},
      stats: { xp: 0, streak: { current: 0, longest: 0, lastDay: null }, days: {}, quiz: {}, updated: 0 },
      notes: {},
      bookmarks: {},
      badges: {},
      settings: { updated: 0 },
    };
  }

  /* ---------- badges ---------- */
  function badgeDefs(course) {
    const defs = [];
    const doneCount = s => Object.keys(s.done).length;
    const total = course.modules.reduce((a, m) => a + m.lessons.length, 0);
    const quizTotals = s => Object.values(s.stats.quiz).reduce((a, q) => ({ first: a.first + (q.first || 0), total: a.total + (q.total || 0) }), { first: 0, total: 0 });
    const notesCount = s => Object.values(s.notes).filter(n => n && n.text && n.text.trim()).length;
    const marks = s => Object.values(s.bookmarks).filter(b => b && b.on).length;

    defs.push({ id: 'first-lesson', title: 'First step', desc: 'Complete your first lesson.', icon: '1', target: 1, value: s => doneCount(s) });
    defs.push({ id: 'halfway', title: 'Halfway there', desc: 'Complete half of all lessons.', icon: '½', target: Math.ceil(total / 2), value: s => doneCount(s) });
    defs.push({ id: 'everything', title: 'Course complete', desc: 'Complete every lesson.', icon: '★', target: total, value: s => doneCount(s) });
    course.modules.forEach(m => defs.push({
      id: 'module-' + m.id, title: m.title, desc: `Finish every lesson in “${m.title}”.`, icon: String(m.no).padStart(2, '0'),
      target: m.lessons.length, value: s => m.lessons.filter(l => s.done[l.id]).length,
    }));
    ['cpp', 'stl'].forEach(p => {
      const mods = course.modules.filter(m => m.part === p);
      const ids = mods.flatMap(m => m.lessons.map(l => l.id));
      defs.push({ id: 'part-' + p, title: p === 'cpp' ? 'C++ foundations' : 'STL fluent', desc: p === 'cpp' ? 'Finish all of Part 1.' : 'Finish all of Part 2.', icon: p === 'cpp' ? 'C+' : 'S', target: ids.length, value: s => ids.filter(i => s.done[i]).length });
    });
    [3, 7, 30].forEach(n => defs.push({ id: 'streak-' + n, title: n + '-day streak', desc: `Learn on ${n} days in a row.`, icon: n + 'd', target: n, value: s => s.stats.streak.longest || 0 }));
    defs.push({ id: 'quiz-20', title: 'Sharp', desc: 'Answer 20 quiz questions correctly on the first try.', icon: 'Q', target: 20, value: s => quizTotals(s).first });
    defs.push({ id: 'accurate', title: 'Accurate', desc: 'Keep 90% first-try accuracy over at least 10 questions.', icon: '%', target: 1, value: s => { const t = quizTotals(s); return t.total >= 10 && t.first / t.total >= 0.9 ? 1 : 0; } });
    defs.push({ id: 'note-taker', title: 'Note taker', desc: 'Write notes on 5 lessons.', icon: 'N', target: 5, value: s => notesCount(s) });
    defs.push({ id: 'bookmarker', title: 'Bookmarker', desc: 'Bookmark 3 lessons.', icon: 'B', target: 3, value: s => marks(s) });
    return defs;
  }
  function evalBadges(course, state) {
    return badgeDefs(course).map(d => {
      const value = Math.min(d.target, d.value(state));
      return { id: d.id, title: d.title, desc: d.desc, icon: d.icon, target: d.target, value, unlocked: value >= d.target };
    });
  }

  /* ---------- merge two states (first sign-in, or pulling remote changes) ---------- */
  const newest = (a, b) => ((a && a.updated) || 0) >= ((b && b.updated) || 0) ? a : b;

  function merge(local, remote) {
    if (!remote) return local;
    if (!local) return remote;
    const out = emptyState();
    out.profile = Object.assign({}, newest(local.profile, remote.profile));
    out.profile.onboarded = !!(local.profile && local.profile.onboarded) || !!(remote.profile && remote.profile.onboarded);
    out.settings = Object.assign({}, newest(local.settings, remote.settings));

    // lessons completed on either device stay completed (earliest timestamp wins)
    out.done = Object.assign({}, remote.done);
    Object.entries(local.done || {}).forEach(([id, ts]) => { out.done[id] = Math.min(ts, out.done[id] || ts); });

    // notes: per lesson, newest edit wins
    const ids = new Set([...Object.keys(local.notes || {}), ...Object.keys(remote.notes || {})]);
    ids.forEach(id => { out.notes[id] = newest((local.notes || {})[id], (remote.notes || {})[id]); });

    // bookmarks: per lesson, newest toggle wins
    const bids = new Set([...Object.keys(local.bookmarks || {}), ...Object.keys(remote.bookmarks || {})]);
    bids.forEach(id => {
      const a = (local.bookmarks || {})[id], b = (remote.bookmarks || {})[id];
      out.bookmarks[id] = !a ? b : !b ? a : (a.t >= b.t ? a : b);
    });

    // badges: union, earliest unlock time
    out.badges = Object.assign({}, remote.badges);
    Object.entries(local.badges || {}).forEach(([id, ts]) => { out.badges[id] = Math.min(ts, out.badges[id] || ts); });

    // stats
    const ls = local.stats || out.stats, rs = remote.stats || out.stats;
    out.stats.xp = Math.max(ls.xp || 0, rs.xp || 0);
    const lastest = ((ls.streak || {}).lastDay || '') >= ((rs.streak || {}).lastDay || '') ? ls.streak : rs.streak;
    out.stats.streak = { current: (lastest || {}).current || 0, lastDay: (lastest || {}).lastDay || null, longest: Math.max((ls.streak || {}).longest || 0, (rs.streak || {}).longest || 0) };
    const days = new Set([...Object.keys(ls.days || {}), ...Object.keys(rs.days || {})]);
    days.forEach(d => { out.stats.days[d] = Math.max((ls.days || {})[d] || 0, (rs.days || {})[d] || 0); });
    const qids = new Set([...Object.keys(ls.quiz || {}), ...Object.keys(rs.quiz || {})]);
    qids.forEach(id => {
      const a = (ls.quiz || {})[id], b = (rs.quiz || {})[id];
      out.stats.quiz[id] = !a ? b : !b ? a : ((a.total || 0) >= (b.total || 0) ? a : b);
    });
    out.stats.updated = Math.max(ls.updated || 0, rs.updated || 0);
    return out;
  }

  return { SCHEMA, XP, dayKey, shiftDay, xpNeeded, levelInfo, touchStreak, liveStreak, emptyState, badgeDefs, evalBadges, merge };
});
