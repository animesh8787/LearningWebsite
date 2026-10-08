/* AI tutor: a drawer that answers questions about the lesson you are reading.
   Needs sign-in (Firebase) and the /api/chat function. Hidden when sync is not configured or the site is opened from a file. */
(function () {
  'use strict';
  if (!window.Sync || !Sync.enabled || !/^https?:$/.test(location.protocol)) { window.AI = { enabled: false }; return; }

  const ENDPOINT = '/api/chat';
  const LEVELS = { beginner: 'Beginner', intermediate: 'Plain', advanced: 'Advanced' };
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = Highlight.esc;
  const highlight = code => Highlight.lines(code).join('\n');
  const keyFor = id => 'czs:ai:' + (id || '_');

  let panel, logEl, formEl, inEl, sendEl, stopEl, gateEl, leftEl, subEl, liveEl, backEl, btn;
  let msgs = [], lessonId = '', busy = false, ctl = null, stick = true, opener = null, pending = null, remaining = null, paintTimer = 0;

  /* ---------- helpers ---------- */
  const route = () => { const m = location.hash.match(/^#\/lesson\/([\w-]+)/); return m ? m[1] : ''; };
  const lessonTitle = id => (window.COURSE && COURSE.byId && COURSE.byId[id] && COURSE.byId[id].title) || '';
  const level = () => { const l = window.Store ? Store.get('level', 'intermediate') : 'intermediate'; return LEVELS[l] ? l : 'intermediate'; };
  const user = () => Sync.status().user;
  const store = {
    load(id) { try { return JSON.parse(sessionStorage.getItem(keyFor(id)) || '[]').filter(m => m && (m.role === 'user' || m.role === 'assistant')); } catch (_) { return []; } },
    save(id, list) { try { sessionStorage.setItem(keyFor(id), JSON.stringify(list.filter(m => (m.role === 'user' || m.role === 'assistant') && m.content).slice(-20))); } catch (_) { } },
  };

  /** Plain text of the lesson on screen: prose first, then its code, trimmed to what the server accepts. */
  function lessonContext() {
    const art = $('.lesson-root .article'); if (!art) return '';
    const prose = [], code = [];
    art.querySelectorAll('h1,h2,h3,p,li,pre').forEach(el => {
      if (el.closest('.notes-panel,.lesson-nav,.lesson-actions,.why,.code-out,.toc,.viz,.quiz')) return;
      const lv = el.closest('.levels-body > div'); if (lv && !lv.classList.contains('on')) return;
      if (el.tagName === 'PRE') {
        const cl = el.querySelectorAll('.cl');
        code.push((cl.length ? [...cl].map(x => x.textContent).join('\n') : el.textContent).trim());
      } else {
        const t = el.textContent.replace(/\s+/g, ' ').trim(); if (!t) return;
        prose.push(/^H[123]$/.test(el.tagName) ? '## ' + t : t);
      }
    });
    return (prose.join('\n').slice(0, 2200) + (code.length ? '\n\nCode in the lesson:\n' + code.join('\n\n').slice(0, 1200) : '')).trim();
  }

  /* ---------- UI ---------- */
  const ICON = {
    spark: '<svg viewBox="0 0 24 24"><path d="M11 3l1.9 5.4L18.5 10l-5.6 1.6L11 17l-1.9-5.4L3.5 10l5.6-1.6z"/><path d="M19 15v5M16.5 17.5h5"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    stop: '<svg viewBox="0 0 24 24"><rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor"/></svg>',
  };

  function build() {
    if (panel) return;
    panel = document.createElement('aside');
    panel.className = 'ai'; panel.id = 'aiPanel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'AI tutor');
    panel.innerHTML = `
      <div class="ai-head">
        <div><span class="eyebrow"><b>●</b> AI tutor</span><div class="ai-sub" id="aiSub"></div></div>
        <div class="ai-head-btns">
          <button class="icon-btn" id="aiClear" type="button" aria-label="Clear conversation" title="Clear conversation">${ICON.trash}</button>
          <button class="icon-btn" id="aiClose" type="button" aria-label="Close tutor" title="Close (Esc)">${ICON.close}</button>
        </div>
      </div>
      <div class="ai-log" id="aiLog" tabindex="0" data-lenis-prevent role="log" aria-label="Conversation"></div>
      <div class="ai-sr" id="aiLive" role="status" aria-live="polite"></div>
      <div class="ai-foot">
        <div class="ai-gate" id="aiGate" hidden>
          <p>Sign in to ask the tutor. It is free, and your progress syncs across devices too.</p>
          <button class="btn" type="button" id="aiSignin" style="--h:40px">Sign in</button>
        </div>
        <form id="aiForm" autocomplete="off">
          <textarea id="aiIn" rows="1" maxlength="2000" aria-label="Your question" placeholder="Ask about this lesson…"></textarea>
          <button type="submit" class="ai-send" id="aiSend" aria-label="Send question">${ICON.send}</button>
          <button type="button" class="ai-send ai-stop" id="aiStop" aria-label="Stop answering" hidden>${ICON.stop}</button>
        </form>
        <div class="ai-note"><span id="aiLeft"></span><span>AI can be wrong. Questions go to an AI provider.</span></div>
      </div>`;
    backEl = document.createElement('div'); backEl.className = 'ai-backdrop';
    document.body.append(backEl, panel);

    logEl = $('#aiLog'); formEl = $('#aiForm'); inEl = $('#aiIn'); sendEl = $('#aiSend'); stopEl = $('#aiStop');
    gateEl = $('#aiGate'); leftEl = $('#aiLeft'); subEl = $('#aiSub'); liveEl = $('#aiLive');

    $('#aiClose').addEventListener('click', close);
    backEl.addEventListener('click', close);
    $('#aiClear').addEventListener('click', clear);
    $('#aiSignin').addEventListener('click', () => window.Auth && Auth.open());
    stopEl.addEventListener('click', () => ctl && ctl.abort());
    formEl.addEventListener('submit', e => { e.preventDefault(); const t = inEl.value; if (t.trim()) { inEl.value = ''; grow(); send(t); } });
    inEl.addEventListener('input', grow);
    inEl.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); formEl.requestSubmit(); } });
    panel.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
    logEl.addEventListener('scroll', () => { stick = logEl.scrollHeight - logEl.scrollTop - logEl.clientHeight < 40; });
    logEl.addEventListener('click', e => {
      const chip = e.target.closest('[data-q]'); if (chip) { send(chip.dataset.q); return; }
      const cp = e.target.closest('[data-ai-copy]'); if (!cp) return;
      const code = cp.closest('.ai-code').querySelector('code').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => { cp.textContent = 'Copied'; }, () => { cp.textContent = 'Press Ctrl+C'; });
      setTimeout(() => { cp.textContent = 'Copy'; }, 1200);
    });
    Sync.onChange(paintState);
    loadFor(route());
  }

  const grow = () => { inEl.style.height = 'auto'; inEl.style.height = Math.min(inEl.scrollHeight, 140) + 'px'; };

  function chips() {
    const q = lessonId
      ? ['Explain this lesson simply', 'Quiz me on this', 'Why does the code here work?', 'Give me an interview question on this']
      : ['Where should I start?', 'What is the difference between a vector and an array?', 'Give me an interview question'];
    return `<div class="ai-empty"><h3>${lessonId ? 'Stuck on ' + esc(lessonTitle(lessonId) || 'this lesson') + '?' : 'Ask anything about C++ or the STL.'}</h3>
      <p>I answer at your chosen level (<b>${LEVELS[level()]}</b>) and can see the lesson you have open.</p>
      <div class="ai-chips">${q.map(x => `<button type="button" class="ai-chip" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div></div>`;
  }

  function msgHtml(m, i) {
    if (m.role === 'user') return `<div class="ai-msg user"><div class="ai-bubble">${esc(m.content).replace(/\n/g, '<br>')}${m.code ? '<span class="ai-attach">Code attached</span>' : ''}</div></div>`;
    if (m.role === 'error') return `<div class="ai-msg"><div class="ai-err" role="alert">${esc(m.content)}${m.signin ? ' <button type="button" class="link-btn" data-signin>Sign in</button>' : ''}</div></div>`;
    const typing = busy && i === msgs.length - 1 && !m.content;
    return `<div class="ai-msg bot"><div class="ai-body">${typing ? '<span class="ai-dots" aria-label="Thinking"><i></i><i></i><i></i></span>' : AIMd.render(m.content, { highlight })}</div></div>`;
  }

  function paintLog() {
    logEl.innerHTML = msgs.length ? msgs.map(msgHtml).join('') : chips();
    const s = logEl.querySelector('[data-signin]'); if (s) s.addEventListener('click', () => Auth.open());
    if (stick) logEl.scrollTop = logEl.scrollHeight;
  }
  function paintLast() {                       // streaming: only the newest answer changes
    const nodes = logEl.querySelectorAll('.ai-msg'); const last = nodes[nodes.length - 1];
    if (!last || !last.classList.contains('bot')) return paintLog();
    last.outerHTML = msgHtml(msgs[msgs.length - 1], msgs.length - 1);
    if (stick) logEl.scrollTop = logEl.scrollHeight;
  }

  function paintState() {
    if (!panel) return;
    const u = user();
    gateEl.hidden = !!u; formEl.hidden = !u;
    sendEl.hidden = busy; stopEl.hidden = !busy;
    leftEl.textContent = u && remaining !== null ? remaining + (remaining === 1 ? ' question' : ' questions') + ' left today' : '';
    subEl.textContent = lessonId ? (lessonTitle(lessonId) || 'This lesson') + ' · ' + LEVELS[level()] : 'General · ' + LEVELS[level()];
    inEl.placeholder = lessonId ? 'Ask about this lesson…' : 'Ask about C++ or the STL…';
    if (u && pending && !busy) { const p = pending; pending = null; send(p.text, { code: p.code }); }
  }

  function loadFor(id) {
    if (ctl) ctl.abort();
    lessonId = id; msgs = store.load(id); busy = false; stick = true;
    paintLog(); paintState();
  }

  /* ---------- open / close ---------- */
  function open(o) {
    build();
    opener = document.activeElement && document.activeElement !== document.body ? document.activeElement : btn;
    panel.classList.add('open'); backEl.classList.add('on'); btn.setAttribute('aria-expanded', 'true');
    if (route() !== lessonId) loadFor(route()); else paintState();
    if (o && o.text) { if (user()) send(o.text, { code: o.code }); else pending = { text: o.text, code: o.code }; }
    setTimeout(() => (user() ? inEl : $('#aiSignin')).focus(), 60);
  }
  function close() {
    if (!panel) return;
    panel.classList.remove('open'); backEl.classList.remove('on'); btn.setAttribute('aria-expanded', 'false');
    const back = opener && document.contains(opener) ? opener : btn; if (back && back.focus) back.focus();
  }
  const isOpen = () => !!panel && panel.classList.contains('open');
  function clear() { if (ctl) ctl.abort(); msgs = []; busy = false; store.save(lessonId, []); paintLog(); paintState(); }

  /* ---------- asking ---------- */
  function fail(list, text, extra) {
    if (list.length && list[list.length - 1].role === 'assistant' && !list[list.length - 1].content) list.pop();
    list.push(Object.assign({ role: 'error', content: text }, extra || {}));
  }

  async function send(text, o) {
    text = String(text || '').trim(); if (!text || busy) return;
    if (!user()) { pending = { text, code: o && o.code }; paintState(); return; }
    const code = (o && o.code) || '';
    const list = msgs;                         // this conversation, even if the learner switches lesson mid-answer
    const history = [];                        // only complete question-and-answer pairs; unanswered questions are skipped
    for (let k = 0; k + 1 < list.length; k++) {
      if (list[k].role === 'user' && list[k + 1].role === 'assistant' && list[k + 1].content) { history.push({ role: 'user', content: list[k].content }, { role: 'assistant', content: list[k + 1].content }); k++; }
    }
    history.splice(0, Math.max(0, history.length - 8));
    list.push({ role: 'user', content: text, code: code ? true : undefined }, { role: 'assistant', content: '' });
    busy = true; stick = true; paintLog(); paintState();
    const mine = ctl = new AbortController();
    const asked = lessonId, live = () => msgs === list;
    let got = '';
    try {
      const token = await Sync.getToken();
      if (!token) throw Object.assign(new Error('signin'), { signin: true });
      const res = await fetch(ENDPOINT, {
        method: 'POST', signal: mine.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ message: text, level: level(), lessonId: asked, context: lessonContext(), code, history }),
      });
      const left = res.headers.get('X-Quota-Remaining'); if (left !== null) remaining = +left;
      if (!res.ok) {
        let e = {}; try { e = (await res.json()).error || {}; } catch (_) { }
        if (res.status === 404 || res.status === 405 || res.status === 501) e.message = 'The tutor is not available on this server. Open the deployed site to use it.';
        if (e.code === 'limit' || e.code === 'busy') remaining = 0;
        throw Object.assign(new Error(e.message || 'Something went wrong. Try again.'), { signin: res.status === 401 });
      }
      const reader = res.body.getReader(), dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        got += dec.decode(value, { stream: true });
        list[list.length - 1].content = got;
        if (live() && !paintTimer) paintTimer = setTimeout(() => { paintTimer = 0; if (live()) paintLast(); }, 45);
      }
      got += dec.decode();
      list[list.length - 1].content = got;
      liveEl.textContent = 'Answer ready.';
    } catch (e) {
      if (e.name === 'AbortError') { if (!got) list.pop(); }
      else if (e.signin) fail(list, e.message === 'signin' ? 'Sign in to ask the tutor.' : e.message, { signin: true });
      else fail(list, /Failed to fetch|NetworkError|Load failed/i.test(e.message) ? 'Could not reach the tutor. Check your connection and try again.' : e.message);
    } finally {
      clearTimeout(paintTimer); paintTimer = 0;
      if (ctl === mine) { ctl = null; busy = false; }
      if (live() || lessonId !== asked) store.save(asked, list);   // not after "clear", which already emptied the saved chat
      if (live()) { paintLog(); paintState(); }
    }
  }

  /* ---------- wiring ---------- */
  function init() {
    const bar = $('.tb-group'); if (!bar) return;
    btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'ai-btn'; btn.setAttribute('aria-haspopup', 'dialog'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'aiPanel');
    btn.title = 'Ask the AI tutor (Ctrl+/)';
    btn.innerHTML = ICON.spark + '<span>Ask</span>';
    btn.addEventListener('click', () => (isOpen() ? close() : open()));
    const pal = bar.querySelector('[data-palette]'); bar.insertBefore(btn, pal || bar.firstChild);
    document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key === '/') { e.preventDefault(); isOpen() ? close() : open(); } });
    addEventListener('hashchange', () => { if (panel && route() !== lessonId) loadFor(route()); });
    if (window.Store && Store.on) Store.on('level', paintState);
  }

  window.AI = { enabled: true, open, close, ask: o => open({ text: o.text, code: o.code }) };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
