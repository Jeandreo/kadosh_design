import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { pool } from '../database/pool.js';
import checkDbFactory from '../middlewares/checkDb.js';
import {
  checkQuotaReset,
  formatUserResponse
} from '../services/user.service.js';

const router = Router();
const checkDb = checkDbFactory(pool);
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', checkDb, async (req, res) => {
  const { name, email, password } = req.body;
  try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
      if (existing.length > 0) return res.status(400).json({ message: "Email já cadastrado." });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const id = crypto.randomUUID();
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      await pool.query(
          `INSERT INTO users (id, name, email, password_hash, role, plan, quota_used, quota_total, last_quota_reset) 
           VALUES (?, ?, ?, ?, 'member', 'free', 0, 1, ?)`,
          [id, name, email, hash, todayStr]
      );

      const token = jwt.sign({ id, role: 'member' }, JWT_SECRET, { expiresIn: '7d' });
      const userData = { 
          id, name, email, role: 'member', plan: 'free', 
          quotaUsed: 0, quotaTotal: 1, autoRenew: true,
          subscriptionExpiry: null, renewalDate: 'N/A',
          favorites: [], downloadsHistory: [] 
      };

      res.json({ token, user: userData });
  } catch (error) {
      res.status(500).json({ message: "Erro ao criar conta." });
  }
});

router.post('/login', checkDb, async (req, res) => {
  const { email, password } = req.body;
  try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length === 0) return res.status(400).json({ message: "Usuário não encontrado." });

      let user = rows[0];
      const validPass = await bcrypt.compare(password, user.password_hash);
      if (!validPass) return res.status(400).json({ message: "Senha incorreta." });

      user = await checkQuotaReset(user);
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const userData = await formatUserResponse(user);

      res.json({ token, user: userData });
  } catch (error) {
      res.status(500).json({ message: "Erro no login." });
  }
});

router.get('/me', checkDb, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token não fornecido" });
  const token = authHeader.split(' ')[1];

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
      if (rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
      
      let user = rows[0];
      user = await checkQuotaReset(user);
      const userData = await formatUserResponse(user);
      res.json({ user: userData });
  } catch (error) {
      res.status(401).json({ message: "Token inválido ou expirado" });
  }
});

router.put('/profile', checkDb, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e e-mail são obrigatórios' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verifica se o email já pertence a outro usuário
    const [emailRows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, decoded.id]
    );

    if (emailRows.length > 0) {
      return res.status(400).json({ message: 'Este e-mail já está em uso' });
    }

    // Atualiza dados
    await pool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, decoded.id]
    );

    // Busca usuário atualizado
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    let user = rows[0];
    user = await checkQuotaReset(user);
    const userData = await formatUserResponse(user);

    return res.json({ user: userData });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
});


export default router;