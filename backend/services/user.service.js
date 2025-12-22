import { pool } from '../database/pool.js';

export async function checkQuotaReset(user) {
  if (!user) return user;

  const todayStr = new Date().toISOString().split('T')[0];

  const lastReset =
    user.last_quota_reset instanceof Date
      ? user.last_quota_reset.toISOString().split('T')[0]
      : user.last_quota_reset?.split('T')[0];

  if (lastReset !== todayStr) {
    await pool.query(
      'UPDATE users SET quota_used = 0, last_quota_reset = ? WHERE id = ?',
      [todayStr, user.id]
    );
    user.quota_used = 0;
    user.last_quota_reset = todayStr;
  }

  return user;
}

export async function formatUserResponse(user) {
  const [history] = await pool.query(
    `SELECT resource_id as resourceId,
            UNIX_TIMESTAMP(downloaded_at) * 1000 as timestamp,
            DATE_FORMAT(downloaded_at, "%Y-%m-%d") as dateString
     FROM user_downloads
     WHERE user_id = ?
     ORDER BY downloaded_at DESC
     LIMIT 50`,
    [user.id]
  );

  const [favorites] = await pool.query(
    'SELECT resource_id FROM favorites WHERE user_id = ?',
    [user.id]
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    quotaUsed: user.quota_used,
    quotaTotal: user.quota_total,
    autoRenew: !!user.auto_renew,
    subscriptionExpiry: user.subscription_expiry
      ? Number(user.subscription_expiry)
      : null,
    renewalDate: user.subscription_expiry
      ? new Date(Number(user.subscription_expiry)).toLocaleDateString()
      : 'N/A',
    favorites: favorites.map(f => f.resource_id),
    downloadsHistory: history
  };
}
