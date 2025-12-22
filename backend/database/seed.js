import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

export async function seedDefaultUsers() {
    const users = [
        {
            id: crypto.randomUUID(),
            name: 'Administrador',
            email: 'admin@admin.com',
            password: '123',
            role: 'admin',
            plan: 'premium_annual',
            quota_total: 9999
        },
        {
            id: crypto.randomUUID(),
            name: 'Assinante Premium',
            email: 'premium@kadosh.com',
            password: 'premium123',
            role: 'member',
            plan: 'ministry',
            quota_total: 7
        },
        {
            id: crypto.randomUUID(),
            name: 'Usuário Grátis',
            email: 'free@kadosh.com',
            password: 'free123',
            role: 'member',
            plan: 'free',
            quota_total: 1
        }
    ];

  for (const u of users) {
    const [exists] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [u.email]
    );

    if (exists.length > 0) continue;

    const passwordHash = await bcrypt.hash(u.password, 10);
    const today = new Date().toISOString().split('T')[0];

    await pool.query(
      `INSERT INTO users
       (id, name, email, password_hash, role, plan, quota_used, quota_total, last_quota_reset, auto_renew)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, true)`,
      [
        u.id,
        u.name,
        u.email,
        passwordHash,
        u.role,
        u.plan,
        u.quota_total,
        today
      ]
    );

    console.log(`Seed criado: ${u.email}`);
  }
}
