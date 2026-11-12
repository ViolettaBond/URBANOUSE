const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const { auth, requireRole, PUBLIC_USER_FIELDS } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = ['user', 'agent', 'admin'];

// Всё управление пользователями — только для админа
router.use('/users', auth, requireRole('admin'));

router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ${PUBLIC_USER_FIELDS}, is_active FROM users ORDER BY id`
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ${PUBLIC_USER_FIELDS}, is_active FROM users WHERE id = $1`,
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/users', async (req, res) => {
    try {
        const { first_name, last_name, email, password, role = 'user', phone = null } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Поля first_name, last_name, email и password обязательны'
            });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, error: 'Некорректный email' });
        }
        if (!ROLES.includes(role)) {
            return res.status(400).json({ success: false, error: 'Некорректная роль' });
        }
        if (String(password).length < 6 || String(password).length > 72) {
            return res.status(400).json({ success: false, error: 'Пароль должен быть от 6 до 72 символов' });
        }

        const hash = await bcrypt.hash(String(password), 10);
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role, phone)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING ${PUBLIC_USER_FIELDS}, is_active`,
            [first_name, last_name, String(email).toLowerCase(), hash, role, phone]
        );
        res.status(201).json({
            success: true,
            message: 'Пользователь успешно создан',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Пользователь с таким email уже существует' });
    }
});

// Передавайте только те поля, которые нужно изменить
router.put('/users/:id', async (req, res) => {
    try {
        const { first_name, last_name, phone, role, is_active } = req.body;
        if (role && !ROLES.includes(role)) {
            return res.status(400).json({ success: false, error: 'Некорректная роль' });
        }
        // Чтобы админ случайно не лишил себя прав
        if (String(req.user.id) === req.params.id && (is_active === false || (role && role !== 'admin'))) {
            return res.status(400).json({ success: false, error: 'Нельзя снять с себя роль админа или заблокировать себя' });
        }

        const result = await pool.query(
            `UPDATE users SET
                first_name = COALESCE($1, first_name),
                last_name  = COALESCE($2, last_name),
                phone      = COALESCE($3, phone),
                role       = COALESCE($4::user_role, role),
                is_active  = COALESCE($5, is_active)
             WHERE id = $6
             RETURNING ${PUBLIC_USER_FIELDS}, is_active`,
            [first_name ?? null, last_name ?? null, phone ?? null, role ?? null, is_active ?? null, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }
        res.json({
            success: true,
            message: 'Пользователь успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        if (String(req.user.id) === req.params.id) {
            return res.status(400).json({ success: false, error: 'Нельзя удалить самого себя' });
        }
        const result = await pool.query(
            `DELETE FROM users WHERE id = $1 RETURNING ${PUBLIC_USER_FIELDS}`,
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Пользователь не найден' });
        }
        res.json({
            success: true,
            message: 'Пользователь успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
