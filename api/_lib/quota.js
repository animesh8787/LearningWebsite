/* Daily usage limits, stored as counters in Firestore (admin SDK, so clients can never write them).
   db only needs: collection(name).doc(id) and runTransaction(fn(tx)) with tx.get/tx.set. */

const dayKey = d => d.toISOString().slice(0, 10);
const nextReset = d => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)).toISOString();

function makeQuota({ db, now = () => new Date(), perUser = 30, global = 1500 }) {
  const ref = id => db.collection('usage').doc(id);

  return {
    perUser,
    /** Reserve one question for uid. Resolves { ok, remaining, resetAt, reason }. */
    async take(uid) {
      const t = now(), day = dayKey(t);
      const u = ref(uid + '_' + day), g = ref('global_' + day);
      return db.runTransaction(async tx => {
        const [us, gs] = await Promise.all([tx.get(u), tx.get(g)]);
        const used = (us.exists && us.data().count) || 0;
        const total = (gs.exists && gs.data().count) || 0;
        const resetAt = nextReset(t);
        if (total >= global) return { ok: false, reason: 'global', remaining: 0, resetAt };
        if (used >= perUser) return { ok: false, reason: 'user', remaining: 0, resetAt };
        tx.set(u, { count: used + 1, uid, day, updated: t.toISOString() });
        tx.set(g, { count: total + 1, day, updated: t.toISOString() });
        return { ok: true, remaining: perUser - used - 1, resetAt };
      });
    },
    /** Give one question back (the model never answered). */
    async refund(uid) {
      const t = now(), day = dayKey(t);
      const u = ref(uid + '_' + day), g = ref('global_' + day);
      return db.runTransaction(async tx => {
        const [us, gs] = await Promise.all([tx.get(u), tx.get(g)]);
        if (us.exists && us.data().count > 0) tx.set(u, Object.assign({}, us.data(), { count: us.data().count - 1 }));
        if (gs.exists && gs.data().count > 0) tx.set(g, Object.assign({}, gs.data(), { count: gs.data().count - 1 }));
      });
    },
  };
}

module.exports = { makeQuota, dayKey, nextReset };
