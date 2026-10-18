// set theme before first paint to avoid a flash (an external file so the CSP can forbid inline scripts)
try { var t = JSON.parse(localStorage.getItem('czs:theme')); if (t) document.documentElement.dataset.theme = t;
      else if (matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.dataset.theme = 'light'; } catch (e) {}
