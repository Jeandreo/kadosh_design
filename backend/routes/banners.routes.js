import { Router } from 'express';

import pool from '../db/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM banners ORDER BY display_order ASC'
    );
    res.json(rows);
  } catch {
    res.status(500).send();
  }
});

router.post('/', checkDb, async (req, res) => {
  const banners = req.body;

  try {
    await pool.query('DELETE FROM banners');

    for (const b of banners) {
      await pool.query(
        `INSERT INTO banners
         (id, title, subtitle, cta, image, category, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id,
          b.title,
          b.subtitle,
          b.cta,
          b.image,
          b.category,
          b.order
        ]
      );
    }

    res.json({ success: true });
  } catch {
    res.status(500).send();
  }
});

export default router;
