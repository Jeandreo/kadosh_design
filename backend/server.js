import './env.js';
import { createApp } from './app.js';
import { initDatabase } from './database/index.js';

const PORT = process.env.PORT;

async function bootstrap() {
  await initDatabase();

  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);
console.log('MP_ACCESS_TOKEN ATUAL:', process.env.MP_ACCESS_TOKEN);

bootstrap();
