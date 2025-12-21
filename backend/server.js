
import express          from 'express';
import cors             from 'cors';
import dotenv           from 'dotenv';
import mysql            from 'mysql2/promise';
import bcrypt           from 'bcryptjs';
import multer           from 'multer';
import path             from 'path';
import fs               from 'fs';
import { fileURLToPath } from 'url';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import apiRoutes from './routes/index.js';
import createCheckDb from './middlewares/checkDb.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'kadosh_secret_key_change_this';

// CONFIGURAÇÃO DE SEGURANÇA E LIMITES
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configuração de CORS robusta
app.use(cors({
    origin: (origin, callback) => {
        // Permite requisições sem origin (como apps ou curl) ou de domínios conhecidos
        const allowedOrigins = [
            'http://localhost:3000', 
            'http://localhost:5173', 
            'https://www.kadoshdesign.com.br', 
            'https://kadoshdesign.com.br',
            'https://api.kadoshdesign.com.br'
        ];
        if (!origin || allowedOrigins.includes(origin) || origin.includes('hstgr.cloud') || origin.includes('localhost')) {
            callback(null, true);
        } else {
            callback(null, true); // No ambiente de desenvolvimento/preview, permitimos mais flexibilidade
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true
}));

// --- CONFIGURAÇÃO DE UPLOAD (MULTER) ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
        console.error("Erro ao criar pasta uploads:", err);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Servir arquivos estáticos ANTES das rotas de API para evitar conflitos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- CONEXÃO MYSQL ---
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kadoshusers',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function initDb() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log("Conexão MySQL estabelecida com sucesso!");

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

        connection.release();

        // Cria usuários padrão
        await seedDefaultUsers();
        
    } catch (err) {
        console.error("ERRO NO BANCO DE DADOS:", err.message);
    }
}

async function seedDefaultUsers() {
    const users = [
        {
            id: 'admin-1',
            name: 'Administrador',
            email: 'admin@admin.com',
            password: '123',
            role: 'admin',
            plan: 'premium_annual',
            quota_total: 9999
        },
        {
            id: 'premium-1',
            name: 'Assinante Premium',
            email: 'premium@kadosh.com',
            password: 'premium123',
            role: 'member',
            plan: 'ministry',
            quota_total: 7
        },
        {
            id: 'free-1',
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

        console.log(`Usuário seed criado: ${u.email}`);
    }
}


initDb();

const checkDb = createCheckDb(pool);

// --- MERCADO PAGO ---
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-2707297611771274-100819-be6767c015602a20bee6a7b9e47a13b9-406493649' 
});

async function checkQuotaReset(user) {
    if (!user) return user;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    let lastResetStr = '';
    if (user.last_quota_reset instanceof Date) {
        lastResetStr = user.last_quota_reset.toISOString().split('T')[0];
    } else if (typeof user.last_quota_reset === 'string') {
         lastResetStr = user.last_quota_reset.split('T')[0];
    }

    if (lastResetStr !== todayStr) {
        await pool.query('UPDATE users SET quota_used = 0, last_quota_reset = ? WHERE id = ?', [todayStr, user.id]);
        user.quota_used = 0;
        user.last_quota_reset = todayStr;
    }
    return user;
}

async function formatUserResponse(user) {
    const [history] = await pool.query(
        'SELECT resource_id as resourceId, UNIX_TIMESTAMP(downloaded_at) * 1000 as timestamp, DATE_FORMAT(downloaded_at, "%Y-%m-%d") as dateString FROM user_downloads WHERE user_id = ? ORDER BY downloaded_at DESC LIMIT 50', 
        [user.id]
    );

    const [favorites] = await pool.query(
        'SELECT resource_id FROM favorites WHERE user_id = ?',
        [user.id]
    );
    const favoriteIds = favorites.map(f => f.resource_id);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        quotaUsed: user.quota_used,
        quotaTotal: user.quota_total,
        autoRenew: !!user.auto_renew,
        subscriptionExpiry: user.subscription_expiry ? Number(user.subscription_expiry) : null,
        renewalDate: user.subscription_expiry ? new Date(Number(user.subscription_expiry)).toLocaleDateString() : 'N/A',
        favorites: favoriteIds,
        downloadsHistory: history
    };
}

export {
    pool,
    JWT_SECRET,
    upload,
    checkQuotaReset,
    formatUserResponse,
    client,
    checkDb
  };
  

app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Servidor Kadosh Backend rodando na porta ${port}`);
});