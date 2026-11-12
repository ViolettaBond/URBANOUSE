const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { auth, signToken, PUBLIC_USER_FIELDS } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();
const SALT_ROUNDS = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Регистрация (роль всегда 'user', из тела запроса она не берётся)
router.post('/register', async (req, res) => {
    try {
        const first_name = String(req.body.first_name || '').trim();
        const last_name = String(req.body.last_name || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const phone = String(req.body.phone || '').trim() || null;

        if (!first_name || !last_name || first_name.length > 100 || last_name.length > 100) {
            return res.status(400).json({ success: false, error: 'Укажите имя и фамилию (до 100 символов)' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, error: 'Некорректный email' });
        }
        if (password.length < 6 || password.length > 72) {
            return res.status(400).json({ success: false, error: 'Пароль должен быть от 6 до 72 символов' });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, phone)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${PUBLIC_USER_FIELDS}`,
            [first_name, last_name, email, hash, phone]
        );
        const user = result.rows[0];
        res.status(201).json({ success: true, token: signToken(user), user });
    } catch (err) {
        handleError(res, err, { conflict: 'Пользователь с таким email уже существует' });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Введите email и пароль' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // password_hash может быть NULL, если аккаунт создан через Google/Apple
        const ok = user && user.password_hash && await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
        }
        if (!user.is_active) {
            return res.status(403).json({ success: false, error: 'Аккаунт заблокирован' });
        }

        await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

        res.json({
            success: true,
            token: signToken(user),
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar_url: user.avatar_url,
            }
        });
    } catch (err) {
        handleError(res, err);
    }
});

// Текущий пользователь (защищённый маршрут)
router.get('/me', auth, (req, res) => {
    const { is_active, ...user } = req.user;
    res.json({ success: true, user });
});

module.exports = router;
