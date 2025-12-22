import { pool } from './pool.js';
import { runMigrations } from './migrate.js';
import { seedDefaultUsers } from './seed.js';

export async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL conectado');
    conn.release();

    await runMigrations();
    await seedDefaultUsers();
  } catch (err) {
    console.error('Erro ao inicializar banco:', err);
    process.exit(1);
  }
}
