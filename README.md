# C++ & STL: Zero to Hero

A free interactive course from your first C++ variable to interview-ready STL. 52 lessons, 19 visualizers,
a landing page, and a learner app (dashboard, notes, achievements, settings) with optional cloud sync.
Plain HTML, CSS and JavaScript. No build step.

## Run it

```bash
python tools/serve.py 5173      # then open http://localhost:5173
```
Double-clicking `index.html` also works. Everything runs offline except the **Run** button on code samples
(it sends the program to an online compiler) and optional sign-in.

## Two entry points

| URL | What | File |
|---|---|---|
| `/` | Landing page: hero, scroll story, live demo, curriculum, FAQ | `index.html`, `js/landing.js`, `css/landing.css` |
| `/app/` | The learner app (hash routes below) | `app/index.html`, `js/app.js` |

App routes: `#/welcome` (first visit), `#/` dashboard, `#/lesson/:id`, `#/notes`, `#/achievements`, `#/settings`.

## Layout

```
js/profile-core.js   pure XP, level, streak, badge and merge logic (unit-tested)
js/profile.js        wires that logic to storage and the lesson flow (completions, quizzes, time, notes, bookmarks)
js/store.js          persisted store + snapshot/restore/export/import
js/sync.js           Firebase Auth + Firestore sync (lazy-loaded; off unless configured)
js/pages/            dashboard, welcome, settings, achievements, notes
js/viz/              visualizers
content/             manifest (course outline), glossary, lessons (cpp/, stl/)
vendor/              gsap, ScrollTrigger, lenis, Firebase compat SDK
firebase-config.js   paste your Firebase web config here to enable accounts (see FIREBASE_SETUP.md)
firestore.rules      owner-only access rules
vercel.json          cache and security headers
```

## Deploy (Vercel or Netlify)

It is a static site: import the repo, framework preset "Other", no build command, output directory `.`.
For accounts, follow `FIREBASE_SETUP.md` and add your domain to Firebase's authorised domains.

## Checks (run from `tools/`)

```bash
node check-content.js     # lesson structure, quiz answers
node qa-code.js g++       # compiles every runnable code sample
node test-profile.js      # XP, levels, streaks, badges, merge
node test-sync.js         # sync logic against a fake Firestore and two devices
```

## Adding a lesson

1. Add it to `content/manifest.js`. 2. Create `content/<cpp|stl>/<id>.js` with `registerLesson(...)`.
3. `python tools/sync-ready.py`. 4. Run the checks.

## Keyboard

`Ctrl/Cmd+K` search · `Ctrl/Cmd+B` sidebar · `F` focus mode · `Esc` closes overlays · arrow keys step a focused visualizer.
