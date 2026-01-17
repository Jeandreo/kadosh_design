import { Router } from 'express';
import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const days = Number(req.query.days) || 30;

    // 1️⃣ Subscriptions por dia
    const [subscriptions] = await pool.query(`
      SELECT DATE(created_at) AS day, COUNT(*) AS total
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY day
      ORDER BY day ASC
    `, [days]);

    // 2️⃣ Churn por dia
    const [churn] = await pool.query(`
      SELECT DATE(canceled_at) AS day, COUNT(*) AS total
      FROM users
      WHERE canceled_at IS NOT NULL
        AND canceled_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY day
      ORDER BY day ASC
    `, [days]);

    // 3️⃣ Receita mensal (MRR)
    const [[revenue]] = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM subscriptions
      WHERE mp_status = 'authorized'
    `);

    // 4️⃣ Crescimento de usuários
    const [[current]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const [[previous]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM users
      WHERE created_at BETWEEN
        DATE_SUB(CURDATE(), INTERVAL 60 DAY)
        AND DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    const growth =
      previous.total === 0
        ? 100
        : ((current.total - previous.total) / previous.total) * 100;

    res.json({
      subscriptions,
      churn,
      revenue: revenue.total,
      growth: Number(growth.toFixed(1)),
      days
    });

  } catch (err) {
    console.error('ADMIN METRICS ERROR:', err);
    res.status(500).json({ message: 'Erro ao buscar métricas' });
  }
});


export default router;
