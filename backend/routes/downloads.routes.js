import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';
import { checkQuotaReset } from '../services/user.service.js';

const router = Router();
const checkDb = createCheckDb(pool);
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/', checkDb, async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  const { resourceId } = req.body;
  const token = auth.split(' ')[1];

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [userId]
    );

    if (!users.length) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    let user = await checkQuotaReset(users[0]);

    if (user.quota_used >= user.quota_total) {
      return res.status(403).json({
        success: false,
        message: 'Limite diário atingido.'
      });
    }

    const [today] = await pool.query(
      `SELECT id FROM user_downloads
       WHERE user_id = ? AND resource_id = ?
       AND DATE(downloaded_at) = CURDATE()`,
      [userId, resourceId]
    );

    if (today.length) {
      return res.json({ success: true, quotaUsed: user.quota_used });
    }

    const newQuota = user.quota_used + 1;

    await pool.query(
      'UPDATE users SET quota_used = ? WHERE id = ?',
      [newQuota, userId]
    );

    await pool.query(
      'INSERT INTO user_downloads (id, user_id, resource_id) VALUES (?, ?, ?)',
      [crypto.randomUUID(), userId, resourceId]
    );

    await pool.query(
      'UPDATE resources SET downloads = downloads + 1 WHERE id = ?',
      [resourceId]
    );

    res.json({ success: true, quotaUsed: newQuota });
  } catch {
    res.status(500).json({ message: 'Erro ao processar download' });
  }
});

router.get('/me', checkDb, async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  const token = auth.split(' ')[1];

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    const [rows] = await pool.query(
      `
      SELECT
        ud.resource_id,
        ud.downloaded_at
      FROM user_downloads ud
      WHERE ud.user_id = ?
      ORDER BY ud.downloaded_at DESC
      `,
      [userId]
    );

    res.json(
      rows.map(r => ({
        resourceId: r.resource_id,
        downloadedAt: r.downloaded_at
      }))
    );
  } catch (err) {
    res.status(401).json({ message: 'Token inválido ou expirado' });
  }
});


export default router;
