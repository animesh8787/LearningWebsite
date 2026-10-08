# Turning on the AI tutor

Signed-in learners can ask questions in a side panel (the **Ask** button in the top bar, or `Ctrl/Cmd + /`).
The tutor sees the lesson that is open, answers at the learner's chosen level, and stays on C++ and the STL.

It runs through one small serverless function, `api/chat.js`, so the AI key is never sent to the browser.
Without the setup below the site works as before and the tutor simply does not appear to answer (the panel shows a friendly message).

Prerequisite: accounts and sync already work (see `FIREBASE_SETUP.md`), **including the Firestore database**, because daily limits are counted there.

## 1. Get a free Groq key
Create an account at https://console.groq.com, then API Keys -> Create API Key. No card needed.
Keep it secret: never paste it into code, chat or a commit.

## 2. Get a Firebase service-account key
Firebase console -> Project settings -> **Service accounts** -> Generate new private key. A `.json` file downloads.
This lets the function verify who is signed in and count their daily questions. Keep it secret too.

## 3. Add both to Vercel
Vercel -> your project -> Settings -> **Environment Variables** (add for Production and Preview):

| Name | Value |
|---|---|
| `GROQ_API_KEY` | the Groq key |
| `FIREBASE_SERVICE_ACCOUNT` | the **entire contents** of the JSON file, pasted as is |

Optional:

| Name | Default | Meaning |
|---|---|---|
| `AI_MODEL` | `llama-3.3-70b-versatile` | main model |
| `AI_FALLBACK_MODEL` | `llama-3.1-8b-instant` | used when the main model is busy |
| `AI_DAILY_LIMIT` | `30` | questions per learner per day (UTC) |
| `AI_GLOBAL_LIMIT` | `1500` | questions across everyone per day; protects the free quota |
| `AI_BASE_URL` | `https://api.groq.com/openai/v1` | any OpenAI-compatible provider |
| `ALLOWED_ORIGINS` | none | extra sites allowed to call the API, comma separated |

Then **Redeploy** (Deployments -> the latest -> Redeploy), because environment variables apply to new builds.
Delete the downloaded JSON file afterwards, or keep it somewhere private. Do not put it in the repo.

## 4. Publish the updated Firestore rules
The new `firestore.rules` explicitly blocks clients from the `usage` collection. Firestore -> Rules -> paste -> Publish.

## What is stored and sent
- Firestore keeps only counters (`usage/{uid}_{date}` and `usage/global_{date}`): how many questions were asked, never the text.
- Each question, the open lesson's text and the last few turns are sent to the AI provider to produce the answer. Conversations are kept only in the learner's browser tab (`sessionStorage`).
- The function logs nothing about message content.

## Using another provider
Set `AI_BASE_URL`, `GROQ_API_KEY` (holds that provider's key) and `AI_MODEL`. Anything that speaks the OpenAI chat-completions format with streaming works (OpenRouter, Together, Gemini's OpenAI-compatible endpoint, a local server).

## Local testing
`node tools/test-ai.js` tests validation, prompt safety, limits, fallback and the handler with no network.
To run the real function locally: `npm i -g vercel`, create `.env.local` with the two variables above (it is git-ignored), then `vercel dev` and open the printed address.

## If something fails
| Message in the panel | Cause |
|---|---|
| "Sign in to ask the tutor." | not signed in, or the session expired |
| "The assistant is not set up yet." | `GROQ_API_KEY` missing; redeploy after adding it |
| "The assistant is unavailable right now." | Firestore not created, or `FIREBASE_SERVICE_ACCOUNT` missing or malformed |
| "The AI is busy." | Groq's free rate limit; wait a few seconds |
| "You have used today's questions." | daily limit reached; resets at midnight UTC |
| "not available on this server" | opened from a plain static server; use the deployed site or `vercel dev` |
