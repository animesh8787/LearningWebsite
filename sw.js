/* Service worker: precaches the app shell, lessons, vendor files, fonts, css and js so the course works offline.
   Not cached: the AI tutor (/api/*), sign-in/sync (Firebase) and the online compiler; they need a network.
   VERSION is a hash of the precached files (tools/build-sw.js). A new version installs beside the old one,
   takes over, and deletes the old cache. */
/*BUILD-START*/
const VERSION = 'abca37ef2f66';
const PRECACHE = [
  "./", "app/", "app/index.html", "assets/fonts/fonts.css", "assets/fonts/instrumentserif-400-italic.ttf", "assets/fonts/instrumentserif-400-normal.ttf", "assets/fonts/jetbrainsmono-400-normal.ttf", "assets/fonts/jetbrainsmono-500-normal.ttf", "assets/fonts/jetbrainsmono-700-normal.ttf", "assets/fonts/satoshi-300.woff2", "assets/fonts/satoshi-400.woff2", "assets/fonts/satoshi-500.woff2", "assets/fonts/satoshi-700.woff2", "assets/fonts/satoshi-900.woff2", "assets/screens/achievements.webp", "assets/screens/dashboard.webp", "assets/screens/lesson-visualizer.webp", "assets/screens/notes.webp", "content/cpp/arrays.js", "content/cpp/big-o.js", "content/cpp/bits.js", "content/cpp/classes.js", "content/cpp/conditions.js", "content/cpp/functions.js", "content/cpp/grids.js", "content/cpp/heap.js", "content/cpp/hello-world.js", "content/cpp/inheritance.js", "content/cpp/input-output.js", "content/cpp/lambdas.js", "content/cpp/loops.js", "content/cpp/memory-model.js", "content/cpp/move-semantics.js", "content/cpp/operators.js", "content/cpp/pointers.js", "content/cpp/raii.js", "content/cpp/recursion.js", "content/cpp/references.js", "content/cpp/smart-pointers.js", "content/cpp/strings.js", "content/cpp/structs.js", "content/cpp/templates.js", "content/cpp/types.js", "content/cpp/variables.js", "content/cpp/what-is-a-program.js", "content/cpp/why-stl.js", "content/glossary.js", "content/manifest.js", "content/stl/array-std.js", "content/stl/cheatsheet.js", "content/stl/comparators.js", "content/stl/deque.js", "content/stl/iterators.js", "content/stl/list.js", "content/stl/map.js", "content/stl/mistakes.js", "content/stl/multimap.js", "content/stl/multiset.js", "content/stl/numeric.js", "content/stl/pair-tuple.js", "content/stl/patterns.js", "content/stl/pick-container.js", "content/stl/priority-queue.js", "content/stl/queue.js", "content/stl/searching.js", "content/stl/set.js", "content/stl/sorting.js", "content/stl/stack.js", "content/stl/string-deep.js", "content/stl/unordered-map.js", "content/stl/unordered-set.js", "content/stl/vector.js", "css/app-pages.css", "css/assistant.css", "css/components.css", "css/landing.css", "css/layout.css", "css/tokens.css", "css/viz.css", "firebase-config.js", "index.html", "js/ai-md.js", "js/app.js", "js/assistant.js", "js/base-app.js", "js/effects.js", "js/highlight.js", "js/landing.js", "js/pages/achievements.js", "js/pages/dashboard.js", "js/pages/notes.js", "js/pages/settings.js", "js/pages/ui.js", "js/pages/welcome.js", "js/palette.js", "js/profile-core.js", "js/profile.js", "js/render.js", "js/runner.js", "js/sidebar.js", "js/store.js", "js/sw-register.js", "js/sync.js", "js/theme-init.js", "js/viz/memory.js", "js/viz/more.js", "js/viz/stepper.js", "js/viz/stl.js", "privacy.html", "terms.html", "vendor/ScrollTrigger.min.js", "vendor/firebase-app-compat.js", "vendor/firebase-auth-compat.js", "vendor/firebase-firestore-compat.js", "vendor/gsap.min.js", "vendor/lenis.min.js"
];
/*BUILD-END*/
const CACHE = 'czs-' + VERSION;
const scope = self.registration.scope;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(p => new Request(new URL(p, scope), { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('czs-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;
  if (req.mode === 'navigate') {
    // Network first so a deploy shows up straight away; the cached shell when offline.
    e.respondWith(fetch(req).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match(new URL(url.pathname.includes('/app') ? 'app/' : './', scope)))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
