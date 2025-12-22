import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/toggle', checkDb, async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ message: 'Não autorizado' });
  }

  const { resourceId } = req.body;
  const token = auth.split(' ')[1];

  try {
    const { id: userId } = jwt.verify(token, JWT_SECRET);

    const [exists] = await pool.query(
      'SELECT 1 FROM favorites WHERE user_id = ? AND resource_id = ?',
      [userId, resourceId]
    );

    if (exists.length) {
      await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND resource_id = ?',
        [userId, resourceId]
      );
      return res.json({ isFavorite: false });
    }

    await pool.query(
      'INSERT INTO favorites (user_id, resource_id) VALUES (?, ?)',
      [userId, resourceId]
    );

    res.json({ isFavorite: true });
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar favoritos' });
  }
});

export default router;
