// backend/routes/webhooks.routes.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import mercadoPagoClient from '../services/mercadoPago.js';
import { pool } from '../database/pool.js';
import { fileURLToPath } from 'url';

const router = Router();

/**
 * Resolve __dirname em ambiente ESM
 */
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);

/**
 * Garante que a pasta de logs exista
 */
const logsDirectoryPath = path.join(currentDirectoryPath, '../logs');
if (!fs.existsSync(logsDirectoryPath)) {
  fs.mkdirSync(logsDirectoryPath, { recursive: true });
}

const webhookLogFilePath = path.join(
  logsDirectoryPath,
  'mercadopago-webhooks.log'
);

/**
 * Salva o webhook bruto em arquivo para auditoria
 */
function saveWebhookLog(logEntry) {
  fs.appendFile(
    webhookLogFilePath,
    JSON.stringify(logEntry, null, 2) + '\n\n',
    (error) => {
      if (error) {
        console.error('WEBHOOK LOG ERROR:', error);
      }
    }
  );
}

function calculateExpiry(billing) {
  const now = new Date()

  if (billing === 'monthly') {
    now.setMonth(now.getMonth() + 1)
  }

  if (billing === 'annual') {
    now.setFullYear(now.getFullYear() + 1)
  }

  return now;
  
}

router.post('/mercadopago', async (req, res) => {
  res.sendStatus(200)

  try {
    let { type, action, data } = req.body

    // Log simplificado
    saveWebhookLog({
      at: new Date().toISOString(),
      type,
      action,
      id: data?.id
    })

    /**
     * 1. PAGAMENTO DA ASSINATURA (EVENTO PRINCIPAL)
     */
    if (type === 'subscription_authorized_payment' && action === 'created') {
      const authorizedPaymentId = data.id

      // Busca pagamento autorizado
      const { data: payment } = await mercadoPagoClient.get(`/authorized_payments/${authorizedPaymentId}`)

      if (payment.payment?.status !== 'approved') {
        return
      }

      const preapprovalId = payment.preapproval_id

      // Busca assinatura no banco
      const [[subscription]] = await pool.query(
        `
        SELECT s.*, p.billing_period, p.id AS plan_code
        FROM subscriptions s
        JOIN plans p ON p.id = s.plan_id
        WHERE s.mp_preapproval_id = ?
        `,
        [preapprovalId]
      )

      if (!subscription) return

      // Calcula expiração
      const expiry = calculateExpiry(subscription.billing)

      // Atualiza usuário
      await pool.query(
        `
        UPDATE users
        SET
          plan = ?,
          quota_total = ?,
          subscription_expiry = ?,
          auto_renew = TRUE
        WHERE id = ?
        `,
        [
          subscription.plan_id,
          subscription.billing === 'monthly' ? 7 : 7,
          expiry,
          subscription.user_id
        ]
      )

      // Atualiza assinatura
      await pool.query(
        `
        UPDATE subscriptions
        SET
          mp_status = 'authorized',
          started_at = NOW()
        WHERE mp_preapproval_id = ?
        `,
        [preapprovalId]
      )

      return
    }

    /**
     * 2. EVENTOS DE STATUS DA ASSINATURA (secundários)
     */
    if (type === 'subscription_preapproval' || type === 'preapproval') {
      const preapprovalId = data?.id
      if (!preapprovalId) return
 
      const { data: mpSubscription } = await mercadoPagoClient.get(`/preapproval/${preapprovalId}`)

      const status = mpSubscription.status

      if (['cancelled', 'paused', 'rejected'].includes(status)) {
        await pool.query(
          `
          UPDATE subscriptions
          SET mp_status = ?, cancelled_at = NOW()
          WHERE mp_preapproval_id = ?
          `,
          [status, preapprovalId]
        )
      }
    }

  } catch (error) {
    console.error('MP WEBHOOK ERROR:', error)
  }
})


export default router;
