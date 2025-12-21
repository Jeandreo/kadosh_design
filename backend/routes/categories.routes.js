import { Router } from 'express';
import crypto from 'crypto';

import pool from '../db/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

const router = Router();
const checkDb = createCheckDb(pool);

router.get('/', checkDb, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch {
    res.status(500).send();
  }
});

router.post('/', checkDb, async (req, res) => {
  try {
    const { name } = req.body;

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    await pool.query(
      'INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)',
      [crypto.randomUUID(), name, slug]
    );

    res.json({ success: true });
  } catch {
    res.status(500).send();
  }
});

router.put('/:id', checkDb, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await pool.query(
      'UPDATE categories SET name = ? WHERE id = ?',
      [name, id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Erro ao atualizar categoria' });
  }
});

router.delete('/:id', checkDb, async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: 'Erro ao deletar categoria' });
  }
});

export default router;
