import { pool } from './pool.js';

export async function runMigrations() {
  const connection = await pool.getConnection();

  try {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(36) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'member') DEFAULT 'member',
            plan ENUM('free', 'volunteer', 'ministry', 'premium_annual') DEFAULT 'free',
            quota_used INT DEFAULT 0,
            quota_total INT DEFAULT 1,
            subscription_expiry BIGINT,
            last_quota_reset DATE,
            auto_renew BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS resources (
            id VARCHAR(36) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            image_url TEXT,
            watermark_image_url TEXT,
            download_url TEXT,
            category VARCHAR(100),
            tags TEXT,
            search_terms TEXT,
            premium BOOLEAN DEFAULT FALSE,
            format VARCHAR(20),
            orientation VARCHAR(20),
            downloads INT DEFAULT 0,
            canva_available BOOLEAN DEFAULT FALSE,
            canva_url TEXT,
            resolution VARCHAR(50),
            dimensions VARCHAR(50),
            file_size VARCHAR(50),
            author VARCHAR(100) DEFAULT 'Kadosh Team',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS categories (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100) NOT NULL
        )
    `);
    
    await connection.query(`
        CREATE TABLE IF NOT EXISTS banners (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255),
            subtitle VARCHAR(255),
            cta VARCHAR(50),
            image TEXT,
            category VARCHAR(100),
            display_order INT DEFAULT 0
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS payments (
            id VARCHAR(50) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            mp_payment_id VARCHAR(50),
            status VARCHAR(20),
            plan_id VARCHAR(50),
            amount DECIMAL(10, 2),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    await connection.query(`
        CREATE TABLE IF NOT EXISTS user_downloads (
            id VARCHAR(36) PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            resource_id VARCHAR(36) NOT NULL,
            downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_res_date (user_id, resource_id, downloaded_at)
        )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS favorites (
            user_id VARCHAR(36) NOT NULL,
            resource_id VARCHAR(36) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, resource_id)
        )
    `);

    // demais tabelas...
    console.log('Migrações executadas com sucesso');
  } finally {
    connection.release();
  }
}
