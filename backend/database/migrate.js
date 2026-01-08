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
        CREATE TABLE IF NOT EXISTS resource_categories (
            resource_id VARCHAR(36) NOT NULL,
            category_id VARCHAR(50) NOT NULL,
        
            PRIMARY KEY (resource_id, category_id),
        
            CONSTRAINT fk_rc_resource
            FOREIGN KEY (resource_id)
            REFERENCES resources(id)
            ON DELETE CASCADE,
        
            CONSTRAINT fk_rc_category
            FOREIGN KEY (category_id)
            REFERENCES categories(id)
            ON DELETE CASCADE
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

    await connection.query(`
        CREATE TABLE IF NOT EXISTS plans (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            daily_quota INT NOT NULL,
            price DECIMAL(10,2),
            billing_period ENUM('monthly','annual','none') DEFAULT 'none',
            auto_renew BOOLEAN DEFAULT TRUE,
            active BOOLEAN DEFAULT TRUE
        )
    `);

    await connection.query(`
        INSERT IGNORE INTO plans (id, name, daily_quota, price, billing_period, auto_renew, active) VALUES
        ('free', 'Free', 1, 0, 'none', FALSE, TRUE),
        ('volunteer', 'Voluntário', 3, 29.90, 'monthly', TRUE, TRUE),
        ('ministry', 'Ministério', 7, 49.90, 'monthly', TRUE, TRUE),
        ('premium_annual', 'Premium Anual', 7, 299.99, 'annual', FALSE, TRUE);
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            id BIGINT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(36) NOT NULL,
            plan_id VARCHAR(50) NOT NULL,

            mp_preapproval_id VARCHAR(64) NOT NULL,
            mp_status VARCHAR(32) NOT NULL,

            billing VARCHAR(16) NOT NULL,
            amount DECIMAL(10,2) NOT NULL,

            started_at DATETIME NULL,
            cancelled_at DATETIME NULL,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

            UNIQUE KEY uniq_user_subscription (user_id),
            UNIQUE KEY uniq_mp_preapproval (mp_preapproval_id),

            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // demais tabelas...
    console.log('Migrações executadas com sucesso');
  } finally {
    connection.release();
  }
}
