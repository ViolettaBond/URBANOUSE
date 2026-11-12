const jwt = require('jsonwebtoken');
const pool = require('../db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('JWT_SECRET не задан в .env');
    process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Поля пользователя, которые можно отдавать клиенту (без password_hash)
const PUBLIC_USER_FIELDS = `id, first_name, last_name, email, role, phone, avatar_url,
    email_verified_at, last_login_at, created_at`;

const signToken = (user) =>
    jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Проверяет заголовок "Authorization: Bearer <token>",
// подгружает пользователя из БД и убеждается, что он активен
const auth = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, error: 'Токен не передан' });
    }

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        const expired = err.name === 'TokenExpiredError';
        return res.status(401).json({
            success: false,
            error: expired ? 'Срок действия токена истёк' : 'Недействительный токен'
        });
    }

    try {
        const result = await pool.query(
            `SELECT ${PUBLIC_USER_FIELDS}, is_active FROM users WHERE id = $1`,
            [payload.id]
        );
        const user = result.rows[0];
        if (!user || !user.is_active) {
            return res.status(401).json({ success: false, error: 'Пользователь не найден или заблокирован' });
        }
        req.user = user; // актуальная роль берётся из БД, а не из токена
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
};

// Для маршрутов, где вход необязателен (например, заявка от гостя):
// есть токен — подставляем пользователя, нет — идём дальше как гость
const optionalAuth = (req, res, next) => {
    if (!req.headers.authorization) {
        req.user = null;
        return next();
    }
    auth(req, res, next);
};

// Доступ только для указанных ролей, ставится ПОСЛЕ auth
// пример: router.delete('/countries/:id', auth, requireRole('admin'), handler)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Недостаточно прав' });
    }
    next();
};

module.exports = { auth, optionalAuth, requireRole, signToken, PUBLIC_USER_FIELDS };
