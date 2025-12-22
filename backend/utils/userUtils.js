import { pool } from '../database/pool.js';

export async function checkQuotaReset(user) {
  if (!user) return user;

  const today = new Date().toISOString().split('T')[0];

  if (user.last_quota_reset !== today) {
    await pool.query(
      'UPDATE users SET quota_used = 0, last_quota_reset = ? WHERE id = ?',
      [today, user.id]
    );
    user.quota_used = 0;
    user.last_quota_reset = today;
  }

  return user;
}
