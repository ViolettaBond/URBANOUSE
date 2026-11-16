import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { RequestHandler } from 'express';
import { query } from '../db';
import type { AuthUser, TokenPayload, User, UserRole } from '../types';

const requireEnv = (name: string): string => {
    const value = process.env[name];
    if (!value) {
        console.error(`${name} не задан в .env`);
        process.exit(1);
    }
    return value;
};

const JWT_SECRET = requireEnv('JWT_SECRET');
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

// Поля пользователя, которые можно отдавать клиенту (без password_hash)
export const PUBLIC_USER_FIELDS = `id, first_name, last_name, email, role, phone, avatar_url,
    email_verified_at, last_login_at, created_at`;

export const signToken = (user: Pick<User, 'id' | 'role'>): string => {
    const payload: TokenPayload = { id: user.id, role: user.role };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Проверяет заголовок "Authorization: Bearer <token>",
// подгружает пользователя из БД и убеждается, что он активен
export const auth: RequestHandler = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, error: 'Токен не передан' });
    }

    let payload: TokenPayload;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === 'string' || decoded.id === undefined) {
            throw new jwt.JsonWebTokenError('invalid payload');
        }
        payload = decoded as unknown as TokenPayload;
    } catch (err) {
        const expired = err instanceof Error && err.name === 'TokenExpiredError';
        return res.status(401).json({
            success: false,
            error: expired ? 'Срок действия токена истёк' : 'Недействительный токен'
        });
    }

    try {
        const result = await query<AuthUser>(
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
export const optionalAuth: RequestHandler = (req, res, next) => {
    if (!req.headers.authorization) {
        req.user = null;
        return next();
    }
    return auth(req, res, next);
};

// Доступ только для указанных ролей, ставится ПОСЛЕ auth
// пример: router.delete('/countries/:id', auth, requireRole('admin'), handler)
export const requireRole = (...roles: UserRole[]): RequestHandler => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Недостаточно прав' });
    }
    next();
};
