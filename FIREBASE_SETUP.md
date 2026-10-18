# Turning on accounts and sync (optional)

The course works fully without this: progress, notes and bookmarks are saved in the browser.
Follow these steps only if you want learners to sign in and keep their progress across devices.
Firebase's free tier is plenty for this site.

1. **Create a project** at https://console.firebase.google.com (Add project; Google Analytics can stay off).
2. **Add a web app**: Project settings -> General -> Your apps -> Web (`</>`). Copy the config object.
3. **Paste the config** into `firebase-config.js`, replacing the values of the `window.FIREBASE_CONFIG` object that is already there with your own project's (see `firebase-config.example.js` for the shape). Set it to `null` to turn sync off.
4. **Enable sign-in methods**: Build -> Authentication -> Sign-in method. Turn on **Google**, **GitHub** and **Email/Password**.
   - GitHub: create an OAuth app at https://github.com/settings/developers and paste its client ID and secret into Firebase. Use the callback URL Firebase shows you.
5. **Authorised domains**: Authentication -> Settings -> Authorised domains. Add your live domain (for example `your-course.vercel.app`). `localhost` is already allowed for testing.
6. **Create the database**: Build -> Firestore Database -> Create (production mode, pick a region near your learners).
7. **Publish the rules** in `firestore.rules`: Firestore -> Rules, paste the file, Publish.
   Or with the CLI: `npm i -g firebase-tools`, `firebase login`, `firebase init firestore`, `firebase deploy --only firestore:rules`.
   The rules only accept a document shaped like `{ v, updatedAt, data }`, so republish them whenever this repo's `firestore.rules` changes.
8. Reload the site. Settings -> Account now shows **Sign in**.
9. **Restrict the web API key** (recommended): Google Cloud console -> APIs & Services -> Credentials -> your browser key -> Application restrictions -> HTTP referrers, and add your site's domain. The key is public by design, but a referrer restriction stops other sites from using your project's quota.

## What is stored
One document per learner at `users/{uid}`: completed lessons, XP, streak, minutes per day, quiz counts, notes, bookmarks, badges and a few preferences. Nothing else, and no analytics.
Learners can delete it any time from Settings -> Your data -> Delete cloud data.

## How sync behaves
- On sign-in the device's data and the cloud copy are **merged on the device** (lessons: union; notes and bookmarks: newest edit wins; XP and best streak: highest), and the merged result is then uploaded. Each upload replaces the whole cloud document with the device's current data, which already includes what it merged; changes made on other devices arrive live and are merged in the same way.
- Changes upload a couple of seconds after they happen and when the tab is hidden.
- Offline? Everything keeps working and syncs when the connection returns.
- **Sign out** clears the synced data (progress, notes, bookmarks, badges) from this browser, so the next person on a shared computer starts clean. It is kept in the cloud and comes back when you sign in again.
- **Delete cloud data** removes the cloud copy and pauses sync on this device, so it is not uploaded again. Your data on the device is kept. Sign out and back in to start syncing again.
- Creating an email/password account sends a verification email; it is needed to use the AI tutor, not for sync.

## Testing locally
`python tools/serve.py 5173` and open http://localhost:5173/app/. Sign in with Google or an email account. Open the site in a second browser profile, sign in as the same user, and watch lessons you complete appear on both.
Unit tests for the merge and sync logic: `node tools/test-profile.js` and `node tools/test-sync.js`.
