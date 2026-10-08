// Unit tests for the learner-progress logic. Run: node test-profile.js
const assert = require('assert');
const P = require('../js/profile-core.js');

let passed = 0;
const t = (name, fn) => { try { fn(); passed++; } catch (e) { console.error('FAIL', name, '\n ', e.message); process.exitCode = 1; } };

/* ---------- levels ---------- */
t('level thresholds', () => {
  assert.equal(P.levelInfo(0).level, 1);
  assert.equal(P.levelInfo(49).level, 1);
  assert.equal(P.levelInfo(50).level, 2);
  assert.equal(P.levelInfo(149).level, 2);
  assert.equal(P.levelInfo(150).level, 3);
  assert.equal(P.levelInfo(300).level, 4);
});
t('level progress is a fraction within the level', () => {
  const i = P.levelInfo(100);          // level 2 spans 50..150
  assert.equal(i.level, 2); assert.equal(i.into, 50); assert.equal(i.span, 100); assert.equal(i.pct, 0.5);
});

/* ---------- days and streaks ---------- */
t('shiftDay crosses month and year boundaries', () => {
  assert.equal(P.shiftDay('2026-03-01', -1), '2026-02-28');
  assert.equal(P.shiftDay('2026-01-01', -1), '2025-12-31');
  assert.equal(P.shiftDay('2024-03-01', -1), '2024-02-29');
  assert.equal(P.shiftDay('2026-12-31', 1), '2027-01-01');
});
t('first activity starts a streak of 1', () => {
  const s = P.touchStreak(null, '2026-10-07');
  assert.deepEqual(s, { current: 1, longest: 1, lastDay: '2026-10-07' });
});
t('same day does not double count', () => {
  const a = P.touchStreak(null, '2026-10-07');
  assert.deepEqual(P.touchStreak(a, '2026-10-07'), a);
});
t('consecutive days extend the streak', () => {
  let s = P.touchStreak(null, '2026-10-07');
  s = P.touchStreak(s, '2026-10-08'); s = P.touchStreak(s, '2026-10-09');
  assert.equal(s.current, 3); assert.equal(s.longest, 3);
});
t('a gap resets current but keeps longest', () => {
  let s = { current: 5, longest: 5, lastDay: '2026-10-01' };
  s = P.touchStreak(s, '2026-10-04');
  assert.equal(s.current, 1); assert.equal(s.longest, 5);
});
t('streak across a month boundary', () => {
  let s = P.touchStreak(null, '2026-09-30');
  s = P.touchStreak(s, '2026-10-01');
  assert.equal(s.current, 2);
});
t('liveStreak is zero once a day has been missed', () => {
  const s = { current: 4, longest: 4, lastDay: '2026-10-05' };
  assert.equal(P.liveStreak(s, '2026-10-05'), 4);
  assert.equal(P.liveStreak(s, '2026-10-06'), 4);   // yesterday still counts
  assert.equal(P.liveStreak(s, '2026-10-07'), 0);
  assert.equal(P.liveStreak(null, '2026-10-07'), 0);
});

/* ---------- badges ---------- */
const course = {
  modules: [
    { id: 'a', no: 1, part: 'cpp', title: 'A', lessons: [{ id: 'a1' }, { id: 'a2' }] },
    { id: 'b', no: 2, part: 'stl', title: 'B', lessons: [{ id: 'b1' }] },
  ],
};
const get = (arr, id) => arr.find(b => b.id === id);
t('module badge needs every lesson', () => {
  const s = P.emptyState(); s.done.a1 = 1;
  let b = get(P.evalBadges(course, s), 'module-a');
  assert.equal(b.unlocked, false); assert.equal(b.value, 1); assert.equal(b.target, 2);
  s.done.a2 = 2;
  b = get(P.evalBadges(course, s), 'module-a');
  assert.equal(b.unlocked, true);
});
t('first-lesson, part and everything badges', () => {
  const s = P.emptyState(); s.done.a1 = s.done.a2 = 1;
  let all = P.evalBadges(course, s);
  assert.equal(get(all, 'first-lesson').unlocked, true);
  assert.equal(get(all, 'part-cpp').unlocked, true);
  assert.equal(get(all, 'part-stl').unlocked, false);
  assert.equal(get(all, 'everything').unlocked, false);
  s.done.b1 = 1; all = P.evalBadges(course, s);
  assert.equal(get(all, 'everything').unlocked, true);
});
t('streak badges use the longest streak', () => {
  const s = P.emptyState(); s.stats.streak = { current: 1, longest: 7, lastDay: '2026-10-07' };
  const all = P.evalBadges(course, s);
  assert.equal(get(all, 'streak-3').unlocked, true);
  assert.equal(get(all, 'streak-7').unlocked, true);
  assert.equal(get(all, 'streak-30').unlocked, false);
});
t('accuracy badge needs enough questions', () => {
  const s = P.emptyState();
  s.stats.quiz.a1 = { first: 5, total: 5 };
  assert.equal(get(P.evalBadges(course, s), 'accurate').unlocked, false);   // only 5 questions
  s.stats.quiz.a2 = { first: 5, total: 5 };
  assert.equal(get(P.evalBadges(course, s), 'accurate').unlocked, true);    // 10/10
  s.stats.quiz.b1 = { first: 0, total: 5 };
  assert.equal(get(P.evalBadges(course, s), 'accurate').unlocked, false);   // 10/15
});
t('note and bookmark badges ignore empty notes and removed bookmarks', () => {
  const s = P.emptyState();
  for (let i = 0; i < 5; i++) s.notes['n' + i] = { text: i < 4 ? 'x' : '   ', updated: 1 };
  assert.equal(get(P.evalBadges(course, s), 'note-taker').value, 4);
  s.bookmarks = { a: { on: true, t: 1 }, b: { on: false, t: 2 }, c: { on: true, t: 3 } };
  assert.equal(get(P.evalBadges(course, s), 'bookmarker').value, 2);
});

/* ---------- merge ---------- */
t('merge: completed lessons are a union, earliest timestamp wins', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.done = { x: 100, y: 50 }; b.done = { y: 80, z: 10 };
  const m = P.merge(a, b);
  assert.deepEqual(m.done, { x: 100, y: 50, z: 10 });
});
t('merge: notes use the newest edit per lesson', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.notes = { l1: { text: 'old', updated: 1 }, l2: { text: 'only local', updated: 5 } };
  b.notes = { l1: { text: 'new', updated: 9 } };
  const m = P.merge(a, b);
  assert.equal(m.notes.l1.text, 'new'); assert.equal(m.notes.l2.text, 'only local');
});
t('merge: a removed bookmark wins if it was toggled later', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.bookmarks = { l1: { on: true, t: 1 } };
  b.bookmarks = { l1: { on: false, t: 2 } };
  assert.equal(P.merge(a, b).bookmarks.l1.on, false);
  assert.equal(P.merge(b, a).bookmarks.l1.on, false);
});
t('merge: xp and longest streak take the max, streak follows the latest day', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.stats.xp = 40; a.stats.streak = { current: 2, longest: 9, lastDay: '2026-10-05' };
  b.stats.xp = 70; b.stats.streak = { current: 4, longest: 4, lastDay: '2026-10-07' };
  const m = P.merge(a, b);
  assert.equal(m.stats.xp, 70);
  assert.deepEqual(m.stats.streak, { current: 4, longest: 9, lastDay: '2026-10-07' });
});
t('merge: time per day takes the larger value, quiz keeps the fuller record', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.stats.days = { '2026-10-06': 300, '2026-10-07': 60 }; b.stats.days = { '2026-10-07': 120 };
  a.stats.quiz = { q1: { first: 1, total: 3 } }; b.stats.quiz = { q1: { first: 2, total: 2 }, q2: { first: 1, total: 1 } };
  const m = P.merge(a, b);
  assert.deepEqual(m.stats.days, { '2026-10-06': 300, '2026-10-07': 120 });
  assert.equal(m.stats.quiz.q1.total, 3); assert.equal(m.stats.quiz.q2.total, 1);
});
t('merge: profile follows the newest edit but onboarding is sticky', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.profile = { name: 'Old', level: 'beginner', dailyGoalMin: 5, onboarded: true, updated: 1 };
  b.profile = { name: 'New', level: 'advanced', dailyGoalMin: 30, onboarded: false, updated: 5 };
  const m = P.merge(a, b);
  assert.equal(m.profile.name, 'New'); assert.equal(m.profile.dailyGoalMin, 30); assert.equal(m.profile.onboarded, true);
});
t('merge is symmetric for set-like data and tolerates a missing side', () => {
  const a = P.emptyState(), b = P.emptyState();
  a.done = { x: 1 }; b.done = { y: 2 };
  assert.deepEqual(P.merge(a, b).done, P.merge(b, a).done);
  assert.equal(P.merge(a, null), a); assert.equal(P.merge(null, b), b);
});

console.log(passed + ' tests passed');
