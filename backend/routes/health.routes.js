import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', db: !!pool });
});

export default router;
