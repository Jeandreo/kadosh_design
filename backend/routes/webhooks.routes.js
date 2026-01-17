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

router.post('/mercadopago', async (req, res) => {
  // responde imediatamente para evitar retries do Mercado Pago
  res.sendStatus(200);

  try {
    /**
     * Cria registro bruto do webhook recebido
     */
    const webhookLogEntry = {
      // received_at: new Date().toISOString(),
      // headers: req.headers,
      body: req.body,
    };

    saveWebhookLog(webhookLogEntry);

    const { type, data } = req.body;

    /**
     * Processa apenas eventos relacionados a assinaturas
     */
    if (type !== 'subscription_preapproval' && type !== 'preapproval') {
      return;
    }

    const preapprovalId = data?.id;
    if (!preapprovalId) {
      return;
    }

    /**
     * Consulta o estado real da assinatura no Mercado Pago
     */
    const { data: mercadoPagoSubscription } =
      await mercadoPagoClient.get(`/preapproval/${preapprovalId}`);

    const subscriptionStatus = mercadoPagoSubscription.status;

    /**
     * Atualiza assinatura autorizada
     */
    if (subscriptionStatus === 'authorized') {
      await pool.query(
        `
        UPDATE subscriptions
        SET
          mp_status = 'authorized',
          started_at = NOW()
        WHERE mp_preapproval_id = ?
        `,
        [preapprovalId]
      );
    }

    /**
     * Atualiza assinatura cancelada, pausada ou rejeitada
     */
    if (['cancelled', 'paused', 'rejected'].includes(subscriptionStatus)) {
      await pool.query(
        `
        UPDATE subscriptions
        SET
          mp_status = ?,
          cancelled_at = NOW()
        WHERE mp_preapproval_id = ?
        `,
        [subscriptionStatus, preapprovalId]
      );
    }
  } catch (error) {
    // nunca quebrar o fluxo do webhook
    console.error('MP WEBHOOK ERROR:', error);
  }
});

export default router;
