// Registers the offline service worker (sw.js at the site root). Skipped on localhost so edits show up on reload;
// add ?sw to the URL to test it there.
(function () {
  if (!('serviceWorker' in navigator)) return;
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (local && !/[?&]sw\b/.test(location.search)) return;
  const url = new URL('../sw.js', document.currentScript.src).href;
  addEventListener('load', () => navigator.serviceWorker.register(url).catch(() => { }));
})();
