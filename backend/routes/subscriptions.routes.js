// backend/routes/subscriptions.routes.js
import { Router } from 'express';
import mp from '../services/mercadoPago.js';
import createCheckDb from '../middlewares/checkDb.js';
import { pool } from '../database/pool.js';

const router = Router();
const checkDb = createCheckDb(pool);

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
    // cria o preapproval no MP
    const { data } = await mp.post('/preapproval', {
      reason: plan.name,
      external_reference: `user_${user.id}`,
      payer_email: 'teste@kadoshdesign.com.br',
      auto_recurring: {
        frequency: plan.billing === 'monthly' ? 1 : 12,
        frequency_type: 'months',
        transaction_amount: plan.price,
        currency_id: 'BRL',
      },
      back_url: `${process.env.MP_CALLBACK_URL}/checkout/success`,
    });

    // verifica se já existe assinatura
    const [[existing]] = await pool.query(
      'SELECT id FROM subscriptions WHERE user_id = ?',
      [user.id]
    );

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
        plan.price,
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
        plan.price
      ]);
    }

    res.json({
      id: data.id,
      init_point: data.init_point,
    });

  } catch (err) {
    console.error('MP CREATE ERROR:', err);
    res.status(500).json({ message: 'Erro ao criar assinatura' });
  }
});



router.delete('/:id', checkDb, async (req, res) => {
  try {
    await mp.put(`/preapproval/${req.params.id}`, {
      status: 'cancelled',
    });

    res.json({ message: 'Assinatura cancelada' });
  } catch (err) {
    console.error('MP CANCEL ERROR:', err.response?.data || err);
    res.status(500).json({ message: 'Erro ao cancelar assinatura' });
  }
});


export default router;
