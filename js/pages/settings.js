/* Settings: profile, learning, appearance, layout, account, data. */
(function () {
  const { esc, ago } = UI;

  Pages.settings = function (root) {
    const prof = Profile.profile;
    const theme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
    const level = Store.get('level', 'intermediate');
    const mode = Sidebar.getMode();
    const rm = !!Store.get('rm', false);
    const sync = window.Sync || { enabled: false };

    const seg = (id, opts, cur) => `<div class="seg lg" role="radiogroup" id="${id}">${opts.map(([k, t]) => `<button role="radio" aria-checked="${cur === k}" class="${cur === k ? 'on' : ''}" data-v="${k}">${t}</button>`).join('')}</div>`;

    root.innerHTML = `
    <div class="page">
      <header class="pg-head"><div class="eyebrow"><b>/</b> Settings</div><h1>Settings</h1><p>Everything is saved on this device, and synced if you are signed in.</p></header>

      <section class="set-sec"><h2>Profile</h2>
        <div class="set-row"><div class="l"><b>Name</b><small>Used for your greeting on the dashboard.</small></div>
          <div class="r"><input class="txt-input" id="sName" maxlength="40" autocomplete="given-name" value="${esc(prof.name || '')}" placeholder="Your name" aria-label="Name"></div></div>
      </section>

      <section class="set-sec"><h2>Learning</h2>
        <div class="set-row"><div class="l"><b>Explanation level</b><small>Which depth opens first on every lesson.</small></div>
          <div class="r">${seg('sLevel', [['beginner', 'Beginner'], ['intermediate', 'Plain'], ['advanced', 'Advanced']], level)}</div></div>
        <div class="set-row"><div class="l"><b>Daily goal</b><small>Minutes of active learning per day.</small></div>
          <div class="r">${seg('sGoal', [[5, '5 min'], [15, '15 min'], [30, '30 min'], [60, '60 min']].map(([k, t]) => [String(k), t]), String(prof.dailyGoalMin || 15))}</div></div>
      </section>

      <section class="set-sec"><h2>Appearance and layout</h2>
        <div class="set-row"><div class="l"><b>Theme</b></div><div class="r">${seg('sTheme', [['dark', 'Dark'], ['light', 'Light']], theme)}</div></div>
        <div class="set-row"><div class="l"><b>Sidebar</b><small>Pinned pushes the page, overlay floats above it, auto-hide appears at the left edge.</small></div>
          <div class="r">${seg('sMode', [['pinned', 'Pinned'], ['overlay', 'Overlay'], ['auto', 'Auto-hide']], mode)}</div></div>
        <div class="set-row"><div class="l"><b>Reduce motion</b><small>Turns off scroll animation and transitions. Applies after reload.</small></div>
          <div class="r"><button class="switch" id="sRm" role="switch" aria-checked="${rm}" aria-label="Reduce motion"></button></div></div>
      </section>

      <section class="set-sec"><h2>Account</h2>
        <div class="set-row" id="sAccount"></div>
      </section>

      <section class="set-sec"><h2>Your data</h2>
        <p>Export a backup, move progress to another browser, or start over.</p>
        <div class="set-row"><div class="l"><b>Export progress</b><small>Downloads a JSON file with lessons, notes, bookmarks and stats.</small></div><div class="r"><button class="pbtn" id="sExport">Export</button></div></div>
        <div class="set-row"><div class="l"><b>Import progress</b><small>Replaces what is on this device with the file’s contents.</small></div><div class="r"><button class="pbtn" id="sImport">Choose file…</button><input type="file" id="sFile" accept="application/json,.json" hidden></div></div>
        <div class="set-row"><div class="l"><b>Reset progress</b><small>Clears completed lessons, XP, streak and badges. Notes and bookmarks stay.</small></div><div class="r"><button class="pbtn danger" id="sReset">Reset…</button></div></div>
        <div class="set-row" id="sCloudRow" hidden><div class="l"><b>Delete cloud data</b><small>Removes your synced copy. Data on this device is kept.</small></div><div class="r"><button class="pbtn danger" id="sCloudDel">Delete…</button></div></div>
      </section>

      <section class="set-sec"><h2>Keyboard shortcuts</h2>
        <div class="kbd-list">
          <div><span>Search lessons and pages</span><span class="kbd">Ctrl K</span></div>
          <div><span>Toggle sidebar</span><span class="kbd">Ctrl B</span></div>
          <div><span>Focus mode</span><span class="kbd">F</span></div>
          <div><span>Close dialogs and focus mode</span><span class="kbd">Esc</span></div>
          <div><span>Step a visualizer</span><span class="kbd">← →</span></div>
          <div><span>Play or pause a visualizer</span><span class="kbd">Space</span></div>
        </div>
      </section>
    </div>`;

    const bindSeg = (id, fn) => root.querySelectorAll('#' + id + ' button').forEach(b => b.addEventListener('click', () => {
      root.querySelectorAll('#' + id + ' button').forEach(x => { const on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-checked', on); });
      fn(b.dataset.v);
    }));
    root.querySelector('#sName').addEventListener('change', e => Profile.updateProfile({ name: e.target.value.trim() }));
    bindSeg('sLevel', v => { App.setLevel(v); Profile.updateProfile({ level: v }); Store.touchSettings(); });
    bindSeg('sGoal', v => Profile.updateProfile({ dailyGoalMin: +v }));
    bindSeg('sTheme', v => { App.setTheme(v); Store.touchSettings(); });
    bindSeg('sMode', v => { Sidebar.setMode(v); Store.touchSettings(); });
    root.querySelector('#sRm').addEventListener('click', e => {
      const on = e.currentTarget.getAttribute('aria-checked') !== 'true';
      e.currentTarget.setAttribute('aria-checked', on); Store.set('rm', on); Store.touchSettings();
    });

    /* account */
    function drawAccount() {
      const el = root.querySelector('#sAccount'); if (!el) return;
      const s = Sync.status ? Sync.status() : null;
      if (!sync.enabled) {
        el.innerHTML = `<div class="l"><b>Sync is not set up on this site</b><small>Your progress is saved in this browser. The site owner can enable accounts by adding a Firebase config (see FIREBASE_SETUP.md).</small></div>`;
        return;
      }
      if (!s.user) {
        el.innerHTML = `<div class="l"><b>Not signed in</b><small>Sign in to keep progress, notes and bookmarks in sync across devices.</small></div><div class="r"><button class="pbtn primary" id="sSignin">Sign in</button></div>`;
        el.querySelector('#sSignin').addEventListener('click', () => Auth.open());
      } else {
        const label = { idle: 'Up to date', syncing: 'Syncing…', error: 'Sync problem', offline: 'Offline' }[s.state] || s.state;
        el.innerHTML = `<div class="l"><b>${esc(s.user.displayName || s.user.email || 'Signed in')}</b><small><span class="sync-dot ${s.state === 'idle' ? 'ok' : s.state === 'syncing' ? 'busy' : 'err'}"></span>${label}${s.last ? ' · last synced ' + ago(s.last) : ''}</small></div>
          <div class="r"><button class="pbtn" id="sSyncNow">Sync now</button><button class="pbtn" id="sSignout">Sign out</button></div>`;
        el.querySelector('#sSyncNow').addEventListener('click', () => Sync.syncNow().then(drawAccount));
        el.querySelector('#sSignout').addEventListener('click', () => Auth.signOut());
      }
      root.querySelector('#sCloudRow').hidden = !(s && s.user);
    }
    drawAccount();
    const off = Sync.onChange ? Sync.onChange(drawAccount) : null;
    root._cleanup = () => off && off();

    /* data */
    root.querySelector('#sExport').addEventListener('click', () => {
      const blob = new Blob([Store.exportJSON()], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cpp-course-progress-' + Profile.today() + '.json';
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    const file = root.querySelector('#sFile');
    root.querySelector('#sImport').addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const f = file.files[0]; if (!f) return;
      try {
        if (!confirm('Replace the progress on this device with the contents of this file?')) return;
        Store.importJSON(await f.text()); Profile.emit(); Profile.toast('Progress imported', 'Your data was restored from the file.', '✓'); Pages.settings(root);
      } catch (e) { alert(e.message || 'Could not read that file.'); }
    });
    root.querySelector('#sReset').addEventListener('click', () => {
      if (confirm('Reset all progress on this device? Completed lessons, XP, streak and badges will be cleared. This cannot be undone.')) { Profile.resetProgress(); Sidebar.refresh(); Profile.toast('Progress reset', '', '↺'); }
    });
    root.querySelector('#sCloudDel').addEventListener('click', async () => {
      if (confirm('Delete your synced copy from the cloud? Data on this device is kept.')) { try { await Sync.deleteCloud(); Profile.toast('Cloud data deleted', '', '✓'); } catch (e) { alert(e.message); } drawAccount(); }
    });
  };
})();
