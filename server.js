
import express          from 'express';
import cors             from 'cors';
import dotenv           from 'dotenv';
import mysql            from 'mysql2/promise';
import bcrypt           from 'bcryptjs';
import jwt              from 'jsonwebtoken';
import crypto           from 'crypto';
import multer           from 'multer';
import path             from 'path';
import fs               from 'fs';
import { fileURLToPath } from 'url';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

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

const checkDb = (req, res, next) => {
    if (!pool) return res.status(503).json({ message: "Banco de dados indisponível no momento." });
    next();
};

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

// --- ROTA DE UPLOAD ---
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }
    // Retornamos um caminho relativo para maior flexibilidade
    const fileUrl = `/uploads/${path.basename(req.file.filename)}`;
    res.json({ 
        url: fileUrl, 
        filename: req.file.filename, 
        size: req.file.size,
        mimetype: req.file.mimetype
    });
});

// --- ROTAS AUTH ---
app.post('/api/auth/signup', checkDb, async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: "Email já cadastrado." });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const id = crypto.randomUUID();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        await pool.query(
            `INSERT INTO users (id, name, email, password_hash, role, plan, quota_used, quota_total, last_quota_reset) 
             VALUES (?, ?, ?, ?, 'member', 'free', 0, 1, ?)`,
            [id, name, email, hash, todayStr]
        );

        const token = jwt.sign({ id, role: 'member' }, JWT_SECRET, { expiresIn: '7d' });
        const userData = { 
            id, name, email, role: 'member', plan: 'free', 
            quotaUsed: 0, quotaTotal: 1, autoRenew: true,
            subscriptionExpiry: null, renewalDate: 'N/A',
            favorites: [], downloadsHistory: [] 
        };

        res.json({ token, user: userData });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar conta." });
    }
});

app.post('/api/auth/login', checkDb, async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ message: "Usuário não encontrado." });

        let user = rows[0];
        const validPass = await bcrypt.compare(password, user.password_hash);
        if (!validPass) return res.status(400).json({ message: "Senha incorreta." });

        user = await checkQuotaReset(user);
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        const userData = await formatUserResponse(user);

        res.json({ token, user: userData });
    } catch (error) {
        res.status(500).json({ message: "Erro no login." });
    }
});

app.get('/api/auth/me', checkDb, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token não fornecido" });
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        
        let user = rows[0];
        user = await checkQuotaReset(user);
        const userData = await formatUserResponse(user);
        res.json({ user: userData });
    } catch (error) {
        res.status(401).json({ message: "Token inválido ou expirado" });
    }
});

app.post('/api/favorites/toggle', checkDb, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Não autorizado" });
    const token = authHeader.split(' ')[1];
    const { resourceId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [exists] = await pool.query('SELECT * FROM favorites WHERE user_id = ? AND resource_id = ?', [userId, resourceId]);
        
        if (exists.length > 0) {
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND resource_id = ?', [userId, resourceId]);
            res.json({ message: "Removido dos favoritos", isFavorite: false });
        } else {
            await pool.query('INSERT INTO favorites (user_id, resource_id) VALUES (?, ?)', [userId, resourceId]);
            res.json({ message: "Adicionado aos favoritos", isFavorite: true });
        }
    } catch (e) {
        res.status(500).json({ message: "Erro ao atualizar favoritos" });
    }
});

app.post('/api/downloads', checkDb, async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Não autorizado" });
    const token = authHeader.split(' ')[1];
    const { resourceId } = req.body;

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: "Usuário não encontrado" });
        
        let user = users[0];
        user = await checkQuotaReset(user); 

        if (user.quota_used >= user.quota_total) {
            return res.status(403).json({ 
                success: false, 
                message: "Limite diário atingido. Bloqueado até a renovação." 
            });
        }

        const [todayDownloads] = await pool.query(
            'SELECT id FROM user_downloads WHERE user_id = ? AND resource_id = ? AND DATE(downloaded_at) = CURDATE()',
            [userId, resourceId]
        );

        if (todayDownloads.length > 0) {
            return res.json({ 
                success: true, 
                message: "Re-download gratuito (hoje).", 
                quotaUsed: user.quota_used 
            });
        }

        const newQuota = user.quota_used + 1;
        await pool.query('UPDATE users SET quota_used = ? WHERE id = ?', [newQuota, userId]);
        await pool.query('INSERT INTO user_downloads (id, user_id, resource_id) VALUES (?, ?, ?)', [crypto.randomUUID(), userId, resourceId]);
        await pool.query('UPDATE resources SET downloads = downloads + 1 WHERE id = ?', [resourceId]);

        res.json({ 
            success: true, 
            message: "Download autorizado!", 
            quotaUsed: newQuota 
        });

    } catch (error) {
        res.status(500).json({ message: "Erro ao processar download" });
    }
});

app.post('/api/users/:id/cancel-subscription', checkDb, async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE users SET auto_renew = FALSE WHERE id = ?', [id]);
        res.json({ message: "Renovação automática cancelada com sucesso." });
    } catch (error) {
        res.status(500).json({ message: "Erro ao cancelar assinatura." });
    }
});

app.get('/api/resources', checkDb, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM resources ORDER BY created_at DESC');
        const resources = rows.map(r => ({
            ...r,
            categories: r.category ? [r.category] : [], 
            tags: r.tags ? JSON.parse(r.tags) : [],
            searchTerms: r.search_terms,
            imageUrl: r.image_url,
            watermarkImageUrl: r.watermark_image_url,
            downloadUrl: r.download_url,
            canvaAvailable: !!r.canva_available,
            canvaUrl: r.canva_url,
            premium: !!r.premium,
            fileSize: r.file_size
        }));
        res.json(resources);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar recursos" });
    }
});

app.post('/api/resources', checkDb, async (req, res) => {
    const resData = req.body;
    try {
        const id = resData.id || crypto.randomUUID();
        const tagsJson = JSON.stringify(resData.tags || []);
        
        await pool.query(
            `INSERT INTO resources (id, title, image_url, watermark_image_url, download_url, category, tags, search_terms, premium, format, orientation, downloads, canva_available, canva_url, resolution, dimensions, file_size, author) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, resData.title, resData.imageUrl, resData.watermarkImageUrl, resData.downloadUrl, 
                resData.categories?.[0], tagsJson, resData.searchTerms, resData.premium, 
                resData.format, resData.orientation, 0, 
                resData.canvaAvailable, resData.canvaUrl,
                resData.resolution, resData.dimensions, resData.fileSize, resData.author
            ]
        );
        res.status(201).json({ message: "Recurso criado" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao salvar" });
    }
});

app.put('/api/resources/:id', checkDb, async (req, res) => {
    const { id } = req.params;
    const resData = req.body;
    try {
        const tagsJson = JSON.stringify(resData.tags || []);
        await pool.query(
            `UPDATE resources SET title=?, image_url=?, watermark_image_url=?, download_url=?, category=?, tags=?, search_terms=?, premium=?, format=?, orientation=?, canva_available=?, canva_url=?, resolution=?, dimensions=?, file_size=? WHERE id=?`,
            [
                resData.title, resData.imageUrl, resData.watermarkImageUrl, resData.downloadUrl,
                resData.categories?.[0], tagsJson, resData.searchTerms, resData.premium,
                resData.format, resData.orientation, resData.canvaAvailable, resData.canvaUrl,
                resData.resolution, resData.dimensions, resData.fileSize, id
            ]
        );
        res.json({ message: "Recurso atualizado" });
    } catch (e) {
        res.status(500).json({ message: "Erro ao atualizar" });
    }
});

app.delete('/api/resources/:id', checkDb, async (req, res) => {
    try {
        await pool.query('DELETE FROM resources WHERE id = ?', [req.params.id]);
        res.json({ message: "Deletado" });
    } catch (e) {
        res.status(500).send();
    }
});

app.get('/api/categories', checkDb, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch(e) { res.status(500).send(); }
});

app.post('/api/categories', checkDb, async (req, res) => {
    try {
        await pool.query('INSERT INTO categories (id, name, slug) VALUES (?,?,?)', [crypto.randomUUID(), 'Teste', 'test']);
        res.json({ success: true });
    } catch(e) { res.status(500).send(); }
});

app.get('/api/banners', checkDb, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM banners ORDER BY display_order ASC');
        res.json(rows);
    } catch(e) { res.status(500).send(); }
});

app.post('/api/banners', checkDb, async (req, res) => {
    const banners = req.body;
    try {
        await pool.query('DELETE FROM banners');
        for (const b of banners) {
            await pool.query('INSERT INTO banners (id, title, subtitle, cta, image, category, display_order) VALUES (?,?,?,?,?,?,?)',
                [b.id, b.title, b.subtitle, b.cta, b.image, b.category, b.order]);
        }
        res.json({ success: true });
    } catch(e) { res.status(500).send(); }
});

app.post('/api/payments/create-preference', checkDb, async (req, res) => {
    const { planId, title, price, userId } = req.body;
    if (!userId) return res.status(400).json({ message: "Usuário não identificado" });

    try {
        const preference = new Preference(client);
        const notificationUrl = `https://www.kadoshdesign.com.br/api/payments/webhook`;
        
        const response = await preference.create({
            body: {
                items: [{ id: planId, title: title, quantity: 1, unit_price: Number(price) }],
                external_reference: userId,
                back_urls: {
                    success: `https://www.kadoshdesign.com.br/?status=success`,
                    failure: `https://www.kadoshdesign.com.br/?status=failure`,
                    pending: `https://www.kadoshdesign.com.br/?status=pending`
                },
                auto_return: 'approved',
                notification_url: notificationUrl
            }
        });
        res.json({ id: response.id, init_point: response.init_point });
    } catch (error) {
        console.error("Erro MP:", error);
        res.status(500).json({ message: "Erro ao criar pagamento" });
    }
});

app.post('/api/payments/webhook', checkDb, async (req, res) => {
    const { data, type } = req.body;
    
    if (type === 'payment' || req.body.action === 'payment.created' || req.body.action === 'payment.updated') {
        try {
            const paymentId = data?.id || req.body.data?.id;
            if (!paymentId) return res.status(200).send();

            const paymentClient = new Payment(client);
            const payment = await paymentClient.get({ id: paymentId });

            if (payment.status === 'approved') {
                const userId = payment.external_reference;
                const planId = payment.additional_info?.items?.[0]?.id || 'premium_manual';
                
                let newPlan = 'ministry';
                let quotaTotal = 7;
                let daysToAdd = 30;

                if (planId.includes('volunteer')) {
                    newPlan = 'volunteer';
                    quotaTotal = 3;
                } else if (planId.includes('annual')) {
                    newPlan = 'premium_annual';
                    daysToAdd = 365;
                }

                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + daysToAdd);
                const expiryTimestamp = expiryDate.getTime();

                if (pool && userId) {
                    await pool.query(
                        `UPDATE users SET plan = ?, quota_total = ?, subscription_expiry = ?, auto_renew = TRUE WHERE id = ?`,
                        [newPlan, quotaTotal, expiryTimestamp, userId]
                    );
                    await pool.query(
                        `INSERT INTO payments (id, user_id, mp_payment_id, status, plan_id, amount) VALUES (?, ?, ?, ?, ?, ?)`,
                        [crypto.randomUUID(), userId, paymentId.toString(), 'approved', planId, payment.transaction_amount]
                    );
                }
            }
        } catch (error) {
            console.error("Webhook Error:", error);
        }
    }
    res.status(200).send();
});

app.get('/api/users', checkDb, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, plan, quota_used, quota_total, subscription_expiry FROM users');
        res.json(rows);
    } catch (e) { res.status(500).send(); }
});

app.patch('/api/users/:id/plan', checkDb, async (req, res) => {
    const { plan } = req.body;
    const { id } = req.params;
    try {
        let quota = 1;
        if(plan === 'volunteer') quota = 3;
        if(plan === 'ministry') quota = 7;
        if(plan === 'premium_annual') quota = 7;
        await pool.query('UPDATE users SET plan = ?, quota_total = ? WHERE id = ?', [plan, quota, id]);
        res.json({success:true});
    } catch(e) { res.status(500).send(); }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', db: !!pool }));

app.use('/api/*', (req, res) => {
    res.status(404).json({ message: "Endpoint de API não encontrado (404)" });
});

app.listen(port, () => {
    console.log(`🚀 Servidor Kadosh Backend rodando na porta ${port}`);
});
