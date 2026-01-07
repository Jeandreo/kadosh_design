// backend/routes/webhooks.routes.js
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import mp from '../services/mercadoPago.js';
import { pool } from '../database/pool.js';
import { fileURLToPath } from 'url';

const router = Router();

// resolve __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// garante pasta de logs
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFile = path.join(logsDir, 'mercadopago-webhooks.log');

router.post('/mercadopago', async (req, res) => {
  // 🔥 RESPONDE IMEDIATAMENTE
  res.sendStatus(200);

  try {
    // 1️⃣ Salva webhook bruto no arquivo
    const logEntry = {
      received_at: new Date().toISOString(),
      headers: req.headers,
      body: req.body,
    };

    fs.appendFile(
      logFile,
      JSON.stringify(logEntry, null, 2) + '\n\n',
      (err) => {
        if (err) {
          console.error('WEBHOOK LOG ERROR:', err);
        }
      }
    );

    const { type, data } = req.body;

    // 2️⃣ Só processa eventos de assinatura
    if (type !== 'subscription_preapproval' && type !== 'preapproval') {
      return;
    }

    const preapprovalId = data?.id;
    if (!preapprovalId) return;

    // 3️⃣ Consulta estado real no Mercado Pago
    const { data: mpSub } = await mp.get(`/preapproval/${preapprovalId}`);

    const status = mpSub.status;

    // 4️⃣ Atualiza banco conforme status
    if (status === 'authorized') {
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

    if (['cancelled', 'paused', 'rejected'].includes(status)) {
      await pool.query(
        `
        UPDATE subscriptions
        SET
          mp_status = ?,
          cancelled_at = NOW()
        WHERE mp_preapproval_id = ?
      `,
        [status, preapprovalId]
      );
    }

  } catch (err) {
    // ❗ nunca quebrar webhook
    console.error('MP WEBHOOK ERROR:', err);
  }
});

export default router;
