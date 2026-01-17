import { Router } from 'express';
import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    // Subscriptions por dia
    const [subscriptions] = await pool.query(
      `
      SELECT
        DATE(created_at) AS day,
        COUNT(*) AS total
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY day
      ORDER BY day ASC
      `,
      [days]
    );

    // Churn por dia
    const [churn] = await pool.query(
      `
      SELECT
        DATE(canceled_at) AS day,
        COUNT(*) AS total
      FROM users
      WHERE canceled_at IS NOT NULL
        AND canceled_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY day
      ORDER BY day ASC
      `,
      [days]
    );

    res.json({
      subscriptions,
      churn,
      days,
    });

  } catch (err) {
    console.error('ADMIN METRICS ERROR:', err);
    res.status(500).json({ message: 'Erro ao buscar métricas' });
  }
});

export default router;
