const express = require('express');
const pool = require('../db');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Написать нам может любой, читать сообщения — только админ
router.post('/contact_messages', optionalAuth, async (req, res) => {
    try {
        const { name = null, email, phone = null, message } = req.body;
        if (!email || !message) {
            return res.status(400).json({ success: false, error: 'Поля email и message обязательны' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, error: 'Некорректный email' });
        }
        const result = await pool.query(
            `INSERT INTO contact_messages (user_id, name, email, phone, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [req.user ? req.user.id : null, name, String(email).toLowerCase(), phone, message]
        );
        res.status(201).json({
            success: true,
            message: 'Сообщение успешно отправлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

// /api/contact_messages или /api/contact_messages?is_handled=false
router.get('/contact_messages', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM contact_messages
             WHERE ($1::boolean IS NULL OR is_handled = $1)
             ORDER BY created_at DESC`,
            [req.query.is_handled ? req.query.is_handled === 'true' : null]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/contact_messages/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сообщение не найдено' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

// Отметить обработанным: { "is_handled": true }
router.put('/contact_messages/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { is_handled } = req.body;
        if (typeof is_handled !== 'boolean') {
            return res.status(400).json({ success: false, error: 'Поле is_handled должно быть true или false' });
        }
        const result = await pool.query(
            'UPDATE contact_messages SET is_handled = $1 WHERE id = $2 RETURNING *',
            [is_handled, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сообщение не найдено' });
        }
        res.json({
            success: true,
            message: 'Сообщение успешно обновлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

router.delete('/contact_messages/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сообщение не найдено' });
        }
        res.json({
            success: true,
            message: 'Сообщение успешно удалено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
