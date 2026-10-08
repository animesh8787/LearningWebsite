/* Optional "Run on a real compiler" via Wandbox. Fails gracefully when offline. */
(function () {
  const ENDPOINT = 'https://wandbox.org/api/compile.json';

  async function run(code, stdin) {
    if (!navigator.onLine) return { ok: false, text: 'You appear to be offline. The visualizers work offline, but running real C++ needs an internet connection.' };
    const ctl = new AbortController();
    const to = setTimeout(() => ctl.abort(), 20000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST', signal: ctl.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, stdin: stdin || '', compiler: 'gcc-head', options: 'warning,c++20', 'compiler-option-raw': '' }),
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const j = await res.json();
      if (j.compiler_error && !j.program_output) return { ok: false, text: j.compiler_error };
      const out = (j.program_output || '') + (j.program_error ? '\n' + j.program_error : '');
      return { ok: true, text: out || '(program finished with no output)', warn: j.compiler_error };
    } catch (e) {
      return { ok: false, text: 'Could not reach the online compiler (' + (e.name === 'AbortError' ? 'timed out' : e.message) + '). You can paste the code into any local g++ instead.' };
    } finally { clearTimeout(to); }
  }
  window.Runner = { run };
})();
