// backend/routes/subscriptions.routes.js
import { Router } from 'express';
import mp from '../services/mercadoPago.js';
import createCheckDb from '../middlewares/checkDb.js';
import { pool } from '../database/pool.js';
import jwt from 'jsonwebtoken';

const router = Router();
const checkDb = createCheckDb(pool);

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}


router.get('/', checkDb, async (req, res) => {
  try {
    const { data } = await mp.get('/preapproval/search', {
      params: {
        limit: 50,
      },
    });

    res.json(data.results);
  } catch (err) {
    console.error('MP LIST ERROR:', err.response?.data || err);
    res.status(500).json({ message: 'Erro ao listar assinaturas' });
  }
});

router.post('/', checkDb, async (req, res) => {
  const { plan, user } = req.body;
  
  try {

    // 1. Busca assinatura existente
    const [[existing]] = await pool.query(
      `
      SELECT *
      FROM subscriptions
      WHERE user_id = ?
      `,
      [user.id]
    );

    // 2. Se existe assinatura ativa, bloqueia
    if (existing && existing.mp_status === 'authorized') {
      return res.status(400).json({
        message: 'Você já possui uma assinatura ativa. Cancele antes de assinar outro plano.'
      });
    }

    // regra de preço especial
    const DISCOUNT_EMAILS = [
      'jeandreofur@gmail.com',
      'pr.hudsonsoarez@gmail.com',
    ];

    const transactionAmount = DISCOUNT_EMAILS.includes(user.email)
      ? 1.00
      : plan.price;

    // cria o preapproval no MP
    const { data } = await mp.post('/preapproval', {
      reason: plan.name,
      external_reference: `user_${user.id}`,
      payer_email: user.email,
      auto_recurring: {
        frequency: plan.billing === 'monthly' ? 1 : 12,
        frequency_type: 'months',
        transaction_amount: transactionAmount,
        currency_id: 'BRL',
      },
      back_url: `${process.env.MP_CALLBACK_URL}/api/checkout/success`,
    });

    if (existing) {
      // UPDATE
      await pool.query(`
        UPDATE subscriptions SET
          plan_id = ?,
          mp_preapproval_id = ?,
          mp_status = 'pending',
          billing = ?,
          amount = ?,
          cancelled_at = NULL
        WHERE user_id = ?
      `, [
        plan.id,
        data.id,
        plan.billing,
        transactionAmount,
        user.id
      ]);
    } else {
      // INSERT
      await pool.query(`
        INSERT INTO subscriptions (
          user_id,
          plan_id,
          mp_preapproval_id,
          mp_status,
          billing,
          amount
        ) VALUES (?, ?, ?, 'pending', ?, ?)
      `, [
        user.id,
        plan.id,
        data.id,
        plan.billing,
        transactionAmount
      ]);
    }

    res.json({
      id: data.id,
      init_point: data.init_point,
    });

  } catch (err) {
    console.error('MP CREATE ERROR:', err);
    res.status(500).json({ message: 'Erro ao criar assinatura', error: err });
  }
});



router.delete('/me', checkDb, auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Busca assinatura ativa do usuário
    const [[subscription]] = await pool.query(
      `
      SELECT *
      FROM subscriptions
      WHERE user_id = ?
        AND mp_status = 'authorized'
      LIMIT 1
      `,
      [userId]
    );

    if (!subscription) {
      return res.status(404).json({
        message: 'Nenhuma assinatura ativa encontrada'
      });
    }

    const preapprovalId = subscription.mp_preapproval_id;

    // 2. Cancela no Mercado Pago
    await mp.put(`/preapproval/${preapprovalId}`, {
      status: 'cancelled'
    });

    // 3. Atualiza assinatura local
    await pool.query(
      `
      UPDATE subscriptions
      SET
        mp_status = 'cancelled',
        cancelled_at = NOW()
      WHERE id = ?
      `,
      [subscription.id]
    );

    // 4. Atualiza usuário (desliga renovação)
    await pool.query(
      `
      UPDATE users
      SET auto_renew = FALSE
      WHERE id = ?
      `,
      [userId]
    );

    res.json({
      message: 'Renovação automática cancelada com sucesso'
    });

  } catch (err) {
    console.error('MP CANCEL ERROR:', err.response?.data || err);
    res.status(500).json({
      message: 'Erro ao cancelar assinatura'
    });
  }
});




export default router;
