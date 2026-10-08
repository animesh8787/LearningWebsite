/* Turns the tutor's answer (light Markdown) into safe HTML. Everything is escaped first; only the tags built here are ever emitted.
   Supports: paragraphs, bullet and numbered lists, headings (as bold lines), `inline code`, **bold**, fenced code blocks.
   Links and images are deliberately left as plain text. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AIMd = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function inline(s) {
    return esc(s).split(/(`[^`\n]+`)/).map((part, i) => {
      if (i % 2) return '<code>' + part.slice(1, -1) + '</code>';
      return part.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    }).join('');
  }

  const FENCE = /^\s*```\s*([\w+#.-]*)\s*$/;
  const BULLET = /^\s*[-*•]\s+/;
  const NUMBER = /^\s*\d+[.)]\s+/;
  const HEAD = /^\s*#{1,6}\s+/;
  const startsBlock = l => FENCE.test(l) || BULLET.test(l) || NUMBER.test(l) || HEAD.test(l);

  /** opts.highlight(code) may return highlighted, already-escaped HTML for a code block; the default just escapes. */
  function render(text, opts) {
    const highlight = (opts && opts.highlight) || esc;
    const lines = String(text || '').replace(/\r/g, '').split('\n');
    const out = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      const f = l.match(FENCE);
      if (f) {
        const buf = [];
        i++;
        while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) buf.push(lines[i++]);
        i++;                                   // skip the closing fence (or run off the end while streaming)
        const lang = f[1] ? esc(f[1].slice(0, 12)) : 'code';
        out.push('<div class="ai-code"><div class="ai-code-head"><span>' + lang + '</span><button type="button" data-ai-copy>Copy</button></div><pre tabindex="0"><code>' + highlight(buf.join('\n')) + '</code></pre></div>');
        continue;
      }
      if (!l.trim()) { i++; continue; }
      if (BULLET.test(l)) {
        const items = [];
        while (i < lines.length && BULLET.test(lines[i])) items.push(lines[i++].replace(BULLET, ''));
        out.push('<ul>' + items.map(x => '<li>' + inline(x) + '</li>').join('') + '</ul>');
        continue;
      }
      if (NUMBER.test(l)) {
        const items = [];
        while (i < lines.length && NUMBER.test(lines[i])) items.push(lines[i++].replace(NUMBER, ''));
        out.push('<ol>' + items.map(x => '<li>' + inline(x) + '</li>').join('') + '</ol>');
        continue;
      }
      if (HEAD.test(l)) { out.push('<p class="ai-h"><strong>' + inline(l.replace(HEAD, '')) + '</strong></p>'); i++; continue; }
      const para = [];
      while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) para.push(lines[i++]);
      out.push('<p>' + para.map(inline).join('<br>') + '</p>');
    }
    return out.join('');
  }

  return { render, inline, esc };
});
