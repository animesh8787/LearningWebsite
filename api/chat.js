/* POST /api/chat: signed-in learners ask the AI tutor. Secrets come from Vercel environment variables:
     GROQ_API_KEY            required
     FIREBASE_SERVICE_ACCOUNT  required, the service-account JSON as one string
     AI_MODEL, AI_FALLBACK_MODEL, AI_BASE_URL, AI_DAILY_LIMIT, AI_GLOBAL_LIMIT, ALLOWED_ORIGINS   optional */
const { makeHandler } = require('./_lib/handler');
const { makeQuota } = require('./_lib/quota');

let admin = null, db = null;
function firebase() {
  if (!admin) {
    try {
      const a = require('firebase-admin');
      if (!a.apps.length) a.initializeApp({ credential: a.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
      admin = a; db = a.firestore();
    } catch (e) {
      console.error('Firebase admin is not configured:', e && e.message);   // never log the key itself
      throw Object.assign(new Error('config'), { code: 'config' });
    }
  }
  return { admin, db };
}

const num = (v, d) => { const n = parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };

const handler = makeHandler({
  verifyToken: async token => (await firebase().admin.auth().verifyIdToken(token)).uid,
  quota: {
    take: uid => makeQuota({ db: firebase().db, perUser: num(process.env.AI_DAILY_LIMIT, 30), global: num(process.env.AI_GLOBAL_LIMIT, 1500) }).take(uid),
    refund: uid => makeQuota({ db: firebase().db }).refund(uid),
  },
  provider: {
    fetch: (...a) => fetch(...a),
    baseUrl: process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1',
    key: process.env.GROQ_API_KEY,
    models: [process.env.AI_MODEL || 'llama-3.3-70b-versatile', process.env.AI_FALLBACK_MODEL || 'llama-3.1-8b-instant'],
  },
  allowedOrigins: (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
});

module.exports = handler;
