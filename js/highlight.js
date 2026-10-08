/* Small C++ tokenizer -> per-line HTML. No dependencies, works offline. */
(function () {
  const KW = new Set(('if else for while do switch case default break continue return goto namespace using class struct enum union ' +
    'template typename public private protected virtual override final new delete const constexpr static inline explicit operator ' +
    'this try catch throw sizeof auto typedef noexcept nullptr true false mutable friend volatile extern decltype register thread_local').split(' '));
  const TY = new Set(('int long short char bool float double void unsigned signed size_t string vector map set multiset multimap ' +
    'unordered_map unordered_set pair stack queue deque priority_queue array list forward_list tuple optional unique_ptr shared_ptr ' +
    'weak_ptr cout cin cerr endl int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t ostream istream stringstream ' +
    'function iterator bitset string_view greater less ll ull wchar_t').split(' '));

  const RE = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#[ \t]*\w+[^\n]*)|(\b0[xX][0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uUlLfF]*\b)|([A-Za-z_]\w*)|([^\s\w])|(\s+)/gm;

  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function tokens(code) {
    const out = [];
    let m;
    RE.lastIndex = 0;
    while ((m = RE.exec(code))) {
      if (m[1]) out.push(['t-com', m[1]]);
      else if (m[2]) out.push(['t-str', m[2]]);
      else if (m[3]) out.push(['t-pre', m[3]]);
      else if (m[4]) out.push(['t-num', m[4]]);
      else if (m[5]) {
        const w = m[5];
        const next = code[RE.lastIndex];
        let c = '';
        if (KW.has(w)) c = 't-kw';
        else if (TY.has(w)) c = 't-ty';
        else if (next === '(') c = 't-fn';
        out.push([c, w]);
      } else if (m[6]) out.push(['t-p', m[6]]);
      else out.push(['', m[7]]);
    }
    return out;
  }

  /** returns an array of HTML strings, one per source line */
  function lines(code) {
    code = code.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
    const result = [''];
    for (const [cls, text] of tokens(code)) {
      const parts = text.split('\n');
      parts.forEach((part, i) => {
        if (i > 0) result.push('');
        if (part === '') return;
        const e = esc(part);
        result[result.length - 1] += cls ? `<span class="${cls}">${e}</span>` : e;
      });
    }
    return result;
  }

  window.Highlight = { lines, esc };
})();
