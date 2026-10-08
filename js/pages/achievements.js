/* Achievements and stats: totals, 12-week activity, XP, badges. */
(function () {
  const { esc, ring, animateRings, minutes } = UI;

  Pages.achievements = function (root) {
    const P = Profile;
    const s = P.get('stats');
    const tot = P.totals();
    const ov = P.overall();
    const lv = P.level();
    const earned = P.get('badges');
    const list = P.badges();
    const unlocked = list.filter(b => b.unlocked).length;

    // 12 weeks, oldest first, aligned so each column is a Sunday-to-Saturday week
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const start = new Date(t); start.setDate(t.getDate() - t.getDay() - 7 * 11);
    const cells = [];
    for (let d = new Date(start); d <= t; d.setDate(d.getDate() + 1)) {
      const key = ProfileCore.dayKey(d), sec = s.days[key] || 0, m = sec / 60;
      const l = sec === 0 ? 0 : m < 5 ? 1 : m < 15 ? 2 : m < 30 ? 3 : 4;
      cells.push(`<i data-l="${l}" title="${key}: ${minutes(sec)}" aria-label="${key}: ${minutes(sec)}"></i>`);
    }

    root.innerHTML = `
    <div class="page">
      <header class="pg-head"><div class="eyebrow"><b>/</b> Achievements</div><h1>Your <em>progress,</em> in numbers.</h1><p>${unlocked} of ${list.length} badges unlocked.</p></header>

      <div class="stat-row">
        <div class="pcard"><h3>Time learning</h3><div class="big">${minutes(tot.seconds)}</div><div class="sub">across all days</div></div>
        <div class="pcard"><h3>Lessons</h3><div class="big">${ov.done}<span style="font-size:1.2rem;color:var(--muted)"> / ${ov.total}</span></div><div class="sub">completed</div></div>
        <div class="pcard"><h3>Quiz accuracy</h3><div class="big">${tot.accuracy === null ? '—' : tot.accuracy + '%'}</div><div class="sub">${tot.quiz.total ? tot.quiz.first + ' of ' + tot.quiz.total + ' right first try' : 'answer a quiz to start'}</div></div>
        <div class="pcard"><h3>Best streak</h3><div class="big">${s.streak.longest || 0}</div><div class="sub">days · current ${P.liveStreak()}</div></div>
      </div>

      <section class="pg-sec">
        <h2>Activity</h2>
        <div class="pcard"><div class="heat" role="img" aria-label="Learning activity over the last 12 weeks">${cells.join('')}</div>
          <div class="heat-legend">Less <i></i><i style="background:color-mix(in srgb,var(--accent) 28%,var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--accent) 55%,var(--surface-2))"></i><i style="background:color-mix(in srgb,var(--accent) 80%,var(--surface-2))"></i><i style="background:var(--accent)"></i> More</div></div>
      </section>

      <section class="pg-sec">
        <h2>Level</h2>
        <div class="pcard" style="display:flex;gap:28px;align-items:center;flex-wrap:wrap">
          ${ring(lv.pct, 'L' + lv.level, s.xp + ' XP')}
          <div style="flex:1;min-width:220px"><h3>Level ${lv.level}</h3><div class="sub" style="margin-top:0">${lv.next - s.xp} XP to level ${lv.level + 1}. Earn 10 XP per lesson and 2 XP for each quiz question you get right on the first try.</div>
          <div class="xpbar"><i style="width:${Math.round(lv.pct * 100)}%"></i></div></div>
        </div>
      </section>

      <section class="pg-sec">
        <h2>Badges</h2>
        <div class="badges">
          ${list.map(b => `<div class="badge ${b.unlocked ? 'on' : ''}"><div class="ic" aria-hidden="true">${esc(b.icon)}</div><b>${esc(b.title)}</b><small>${esc(b.desc)}</small>
            ${b.unlocked ? `<small style="color:var(--accent)">Unlocked${earned[b.id] ? ' · ' + new Date(earned[b.id]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}</small>` : `<div class="mini-bar" aria-hidden="true"><i style="width:${Math.round(b.value / b.target * 100)}%"></i></div><small>${b.value} / ${b.target}</small>`}</div>`).join('')}
        </div>
      </section>
    </div>`;
    animateRings(root);
  };
})();
