require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Pool} = require('pg')
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
})

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error('JWT_SECRET не задан в .env')
    process.exit(1)
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const SALT_ROUNDS = 10
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const initDb = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(100),
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        )
    `)
}

const signToken = (user) =>
    jwt.sign({id: user.id, email: user.email}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN})

const auth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({success: false, error: 'Токен не передан'});
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        const expired = err.name === 'TokenExpiredError';
        res.status(401).json({
            success: false,
            error: expired ? 'Срок действия токена истёк' : 'Недействительный токен'
        });
    }
}

app.post('/api/register', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const name = String(req.body.name || '').trim().slice(0, 100) || null;

        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({success: false, error: 'Некорректный email'});
        }
        if (password.length < 6 || password.length > 72) {
            return res.status(400).json({success: false, error: 'Пароль должен быть от 6 до 72 символов'});
        }

        const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
        if (exists.rowCount > 0) {
            return res.status(409).json({success: false, error: 'Пользователь с таким email уже существует'});
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await pool.query(
            'INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, name, hash]
        );
        const user = result.rows[0];
        res.status(201).json({success: true, token: signToken(user), user});
    } catch (err) {
        if (err.code === '23505') { // гонка: email уже занят
            return res.status(409).json({success: false, error: 'Пользователь с таким email уже существует'});
        }
        console.error(err);
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!email || !password) {
            return res.status(400).json({success: false, error: 'Введите email и пароль'});
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        const ok = user && await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({success: false, error: 'Неверный email или пароль'});
        }

        res.json({
            success: true,
            token: signToken(user),
            user: {id: user.id, email: user.email, name: user.name}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
})

app.get('/api/me', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({success: false, error: 'Пользователь не найден'});
        }
        res.json({success: true, user: result.rows[0]});
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, error: 'Ошибка сервера'});
    }
})

app.get('/api/slider', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM slider_info', [])
        res.json({
            success: true,
            data: result.rows,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})
app.get('/api/primery_card', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM primery_card_info', [])
        res.json({
            success: true,
            data: result.rows,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})
app.get('/api/sold_slider', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sold__slider_info', [])
        res.json({
            success: true,
            data: result.rows,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})

app.get('/api/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles_info ORDER BY id DESC', [])
        res.json({
            success: true,
            data: result.rows,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})
app.use((req, res) => {
    res.status(404).json({success: false, error: 'Маршрут не найден'});
})
app.use((err, req, res) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({success: false, error: 'Некорректный JSON'});
    }
    console.error(err);
    res.status(500).json({success: false, error: 'Ошибка сервера'});
})

const PORT = process.env.PORT || 3000
initDb()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => {
        console.error('Ошибка инициализации БД:', err)
        process.exit(1)
    })