import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

const LOG_PATH = path.resolve(
  process.cwd(),
  'backend',
  'logs',
  'mercado-pago-returns.log'
);

router.get('/success', async (req, res) => {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        referer: req.headers.referer,
      },
      ip: req.ip,
    };

    fs.appendFileSync(
      LOG_PATH,
      JSON.stringify(logEntry) + '\n',
      'utf8'
    );

    // resposta simples, sem lógica de negócio ainda
    res.status(200).send('Pagamento recebido. Você pode fechar esta página.');

  } catch (err) {
    console.error('MP RETURN LOG ERROR:', err);
    res.status(500).send('Erro ao processar retorno');
  }
});

export default router;
