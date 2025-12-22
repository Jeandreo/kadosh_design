import { Router } from 'express';
import crypto from 'crypto';

import { pool } from '../database/pool.js';
import createCheckDb from '../middlewares/checkDb.js';

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

const router = Router();
const checkDb = createCheckDb(pool);

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

router.post('/create-preference', checkDb, async (req, res) => {
  const { planId, title, price, userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Usuário não identificado' });
  }

  try {
    const preference = new Preference(client);

    const response = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title,
            quantity: 1,
            unit_price: Number(price)
          }
        ],
        external_reference: userId,
        back_urls: {
          success: 'https://www.kadoshdesign.com.br/?status=success',
          failure: 'https://www.kadoshdesign.com.br/?status=failure',
          pending: 'https://www.kadoshdesign.com.br/?status=pending'
        },
        auto_return: 'approved',
        notification_url:
          'https://www.kadoshdesign.com.br/api/payments/webhook'
      }
    });

    res.json({
      id: response.id,
      init_point: response.init_point
    });
  } catch (error) {
    console.error('Erro MP:', error);
    res.status(500).json({ message: 'Erro ao criar pagamento' });
  }
});

router.post('/webhook', checkDb, async (req, res) => {
  const { data, type } = req.body;

  if (
    type === 'payment' ||
    req.body.action === 'payment.created' ||
    req.body.action === 'payment.updated'
  ) {
    try {
      const paymentId = data?.id || req.body.data?.id;
      if (!paymentId) return res.status(200).send();

      const paymentClient = new Payment(client);
      const payment = await paymentClient.get({ id: paymentId });

      if (payment.status === 'approved') {
        const userId = payment.external_reference;
        const planId =
          payment.additional_info?.items?.[0]?.id || 'premium_manual';

        let newPlan = 'ministry';
        let quotaTotal = 7;
        let daysToAdd = 30;

        if (planId.includes('volunteer')) {
          newPlan = 'volunteer';
          quotaTotal = 3;
        } else if (planId.includes('annual')) {
          newPlan = 'premium_annual';
          daysToAdd = 365;
        }

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + daysToAdd);
        const expiryTimestamp = expiryDate.getTime();

        await pool.query(
          `UPDATE users
           SET plan = ?, quota_total = ?, subscription_expiry = ?, auto_renew = TRUE
           WHERE id = ?`,
          [newPlan, quotaTotal, expiryTimestamp, userId]
        );

        await pool.query(
          `INSERT INTO payments
           (id, user_id, mp_payment_id, status, plan_id, amount)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            crypto.randomUUID(),
            userId,
            paymentId.toString(),
            'approved',
            planId,
            payment.transaction_amount
          ]
        );
      }
    } catch (error) {
      console.error('Webhook Error:', error);
    }
  }

  res.status(200).send();
});

export default router;
