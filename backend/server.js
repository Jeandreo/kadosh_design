import dotenv from 'dotenv';
import { createApp } from './app.js';
import { initDatabase } from './database/index.js';

dotenv.config();

const PORT = process.env.PORT || 3001;

async function bootstrap() {
  await initDatabase();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

bootstrap();
