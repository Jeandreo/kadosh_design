import { Router } from 'express';

import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, role, plan,
              quota_used, quota_total, subscription_expiry
       FROM users`
    );
    res.json(rows);
  } catch {
    res.status(500).send();
  }
});

router.patch('/:id/plan', checkDb, async (req, res) => {
  const { id } = req.params;
  const { plan } = req.body;

  try {
    let quota = 1;

    if (plan === 'volunteer') quota = 3;
    if (plan === 'ministry') quota = 7;
    if (plan === 'premium_annual') quota = 7;

    await pool.query(
      'UPDATE users SET plan = ?, quota_total = ? WHERE id = ?',
      [plan, quota, id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).send();
  }
});

router.post('/:id/cancel-subscription', checkDb, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE users SET auto_renew = FALSE WHERE id = ?',
      [id]
    );

    res.json({
      message: 'Renovação automática cancelada com sucesso.'
    });
  } catch {
    res.status(500).json({
      message: 'Erro ao cancelar assinatura.'
    });
  }
});

export default router;
