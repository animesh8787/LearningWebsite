// Lists the files the service worker precaches and hashes them into a cache version.
// `node build-sw.js` rewrites sw.js from this; `node test-sw.js` fails if sw.js is out of date.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.join(__dirname, '..');
const DIRS = ['css', 'js', 'content', 'vendor', 'assets'];
const ROOT_FILES = ['index.html', 'terms.html', 'privacy.html', 'app/index.html', 'firebase-config.js'];
const TEXT = /\.(js|css|html)$/;

function walk(dir, out) {
  for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
    const rel = dir + '/' + e.name;
    if (e.isDirectory()) walk(rel, out); else out.push(rel);
  }
  return out;
}
const files = () => ROOT_FILES.concat(...DIRS.map(d => walk(d, []))).sort();
/** Hash of the precached bytes; line endings are normalised so Windows and Linux checkouts agree. */
function version() {
  const h = crypto.createHash('sha256');
  for (const f of files()) {
    let b = fs.readFileSync(path.join(ROOT, f));
    if (TEXT.test(f)) b = Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'));
    h.update(f + '\0').update(b);
  }
  return h.digest('hex').slice(0, 12);
}
module.exports = { ROOT, files, version };
