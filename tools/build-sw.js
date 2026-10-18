// Regenerates the PRECACHE list and VERSION in sw.js. Run after changing any site file: node build-sw.js
const fs = require('fs'), path = require('path');
const { ROOT, files, version } = require('./sw-manifest');
const p = path.join(ROOT, 'sw.js');
const s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const block = `/*BUILD-START*/\nconst VERSION = '${version()}';\nconst PRECACHE = ${JSON.stringify(['./', 'app/'].concat(files()), null, 1).replace(/\n\s*/g, ' ').replace(/\[ /, '[\n  ').replace(/ \]$/, '\n]')};\n/*BUILD-END*/`;
const out = s.replace(/\/\*BUILD-START\*\/[\s\S]*\/\*BUILD-END\*\//, block);
fs.writeFileSync(p, out);
console.log('sw.js: ' + files().length + ' files, version ' + version());
