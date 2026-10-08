/* Dashboard: where am I, what next, how is it going. */
(function () {
  const { esc, ring, animateRings, minutes, greeting, firstName, ago, icon } = UI;

  Pages.dashboard = function (root) {
    const P = Profile, prof = P.profile;
    const next = P.nextLesson();
    const ov = P.overall();
    const lv = P.level();
    const goal = prof.dailyGoalMin || 15;
    const secToday = P.secondsToday();
    const streak = P.liveStreak();
    const week = P.weekStrip();
    const started = ov.done > 0 || Store.get('last', null);
    const mod = P.moduleProgress(next.mod);
    const name = firstName(prof.name);
    const recent = P.recent(5);
    const notes = Object.entries(P.get('notes')).filter(([, n]) => n && n.text && n.text.trim()).sort((a, b) => b[1].updated - a[1].updated).slice(0, 3);
    const dayLetter = k => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(k + 'T00:00:00').getDay()];

    root.innerHTML = `
    <div class="page dash">
      <header class="pg-head">
        <div class="eyebrow"><b>/</b> Dashboard</div>
        <h1>${greeting()}${name ? ', <em>' + esc(name) + '</em>' : ''}.</h1>
        <p>${started ? (streak > 1 ? `You are on a ${streak}-day streak. Keep it going with today’s lesson.` : 'Pick up where you left off.') : 'You are about to start. The first lesson takes about ' + next.min + ' minutes.'}</p>
      </header>

      <div class="dash-grid">
        <a class="pcard c-continue" href="#/lesson/${next.id}">
          <div>
            <div class="eyebrow">${started ? 'Continue' : 'Start here'}</div>
            <h2>${esc(next.title)}</h2>
            <div class="meta">${esc(next.part.name)} · ${esc(next.mod.title)} · ${next.min} min</div>
          </div>
          <div class="row">
            <span class="btn" style="--h:42px;padding:0 20px">${started ? 'Resume lesson' : 'Open lesson'} <span class="arr">→</span></span>
            <span class="mini-bar" aria-hidden="true"><i style="width:${Math.round(mod.pct * 100)}%"></i></span>
            <small class="muted-s">${mod.done}/${mod.total} in this module</small>
          </div>
        </a>

        <div class="c-ring">
          <div class="pcard"><h3>Course</h3>${ring(ov.done / ov.total, Math.round(ov.done / ov.total * 100) + '%', ov.done + ' of ' + ov.total)}</div>
          <div class="pcard"><h3>Today</h3>${ring(Math.min(1, secToday / 60 / goal), Math.floor(secToday / 60) + 'm', 'goal ' + goal + 'm')}</div>
        </div>

        <div class="pcard c-streak">
          <div class="streak-num">${icon.flame}<span class="big">${streak}</span><span class="sub" style="margin:0">day streak${P.get('stats').streak.longest > streak ? ' · best ' + P.get('stats').streak.longest : ''}</span></div>
          <div class="week" role="img" aria-label="Learning time over the last 7 days">
            ${week.map(d => `<div class="${d.today ? 'today' : ''}"><i><b style="height:${Math.min(100, d.sec / 60 / goal * 100)}%"></b></i><small>${dayLetter(d.key)}</small></div>`).join('')}
          </div>
        </div>

        <div class="pcard c-level">
          <h3>Level</h3>
          <div class="big">${lv.level}</div>
          <div class="sub">${P.get('stats').xp} XP · ${lv.next - P.get('stats').xp} to level ${lv.level + 1}</div>
          <div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(lv.pct * 100)}"><i style="width:${Math.round(lv.pct * 100)}%"></i></div>
        </div>
      </div>

      <section class="pg-sec">
        <h2>Your path</h2>
        <div class="mod-grid">
          ${COURSE.modules.map(m => {
            const mp = P.moduleProgress(m);
            const target = m.lessons.find(l => !P.get('done')[l.id]) || m.lessons[0];
            return `<a class="mod-card ${mp.done === mp.total ? 'done' : ''}" href="#/lesson/${target.id}">
              ${ring(mp.pct, String(m.no).padStart(2, '0'), '', 'sm')}
              <span><b>${esc(m.title)}</b><small>${mp.done}/${mp.total} lessons</small></span></a>`;
          }).join('')}
        </div>
      </section>

      <section class="pg-sec">
        <h2>Recently completed <a href="#/achievements">All stats</a></h2>
        ${recent.length ? `<div class="plist">${recent.map(r => `<a href="#/lesson/${r.lesson.id}"><span class="t"><b>${esc(r.lesson.title)}</b><small>${esc(r.lesson.mod.title)}</small></span><span class="m">${ago(r.ts)}</span></a>`).join('')}</div>`
          : `<div class="empty"><b>No completed lessons yet</b>Finish a lesson and it will appear here.</div>`}
      </section>

      ${notes.length ? `<section class="pg-sec"><h2>Recent notes <a href="#/notes">All notes</a></h2><div class="plist">${notes.map(([id, n]) => `<a href="#/lesson/${id}"><span class="t"><b>${esc((COURSE.byId[id] || {}).title || id)}</b><small>${esc(n.text.replace(/\s+/g, ' ').slice(0, 110))}</small></span><span class="m">${ago(n.updated)}</span></a>`).join('')}</div></section>` : ''}
    </div>`;
    animateRings(root);
  };
})();
