const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();

// GET /api/agents или /api/agents?city_id=1
router.get('/agents', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, c.name AS city
             FROM agents a
             LEFT JOIN cities c ON c.id = a.city_id
             WHERE a.is_active = TRUE AND ($1::int IS NULL OR a.city_id = $1)
             ORDER BY a.rating DESC NULLS LAST, a.id`,
            [req.query.city_id || null]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/agents/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT a.*, c.name AS city
             FROM agents a
             LEFT JOIN cities c ON c.id = a.city_id
             WHERE a.id = $1`,
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Агент не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/agents', auth, requireRole('admin'), async (req, res) => {
    try {
        const {
            user_id = null, first_name, last_name, title = null, bio = null, photo_url = null,
            email = null, phone = null, city_id = null, rating = null, properties_sold = null
        } = req.body;
        if (!first_name || !last_name) {
            return res.status(400).json({ success: false, error: 'Поля first_name и last_name обязательны' });
        }
        const result = await pool.query(
            `INSERT INTO agents (user_id, first_name, last_name, title, bio, photo_url, email, phone, city_id, rating, properties_sold)
             VALUES ($1, $2, $3, COALESCE($4, 'Senior Real Estate Advisor'), $5, $6, $7, $8, $9, $10, COALESCE($11, 0))
             RETURNING *`,
            [user_id, first_name, last_name, title, bio, photo_url, email, phone, city_id, rating, properties_sold]
        );
        res.status(201).json({
            success: true,
            message: 'Агент успешно добавлен',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, {
            conflict: 'Этот пользователь уже привязан к другому агенту',
            fk: 'Пользователь или город не найден'
        });
    }
});

// Передавайте только те поля, которые нужно изменить
router.put('/agents/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const {
            user_id, first_name, last_name, title, bio, photo_url,
            email, phone, city_id, rating, properties_sold, is_active
        } = req.body;
        const result = await pool.query(
            `UPDATE agents SET
                user_id         = COALESCE($1, user_id),
                first_name      = COALESCE($2, first_name),
                last_name       = COALESCE($3, last_name),
                title           = COALESCE($4, title),
                bio             = COALESCE($5, bio),
                photo_url       = COALESCE($6, photo_url),
                email           = COALESCE($7, email),
                phone           = COALESCE($8, phone),
                city_id         = COALESCE($9, city_id),
                rating          = COALESCE($10, rating),
                properties_sold = COALESCE($11, properties_sold),
                is_active       = COALESCE($12, is_active)
             WHERE id = $13
             RETURNING *`,
            [
                user_id ?? null, first_name ?? null, last_name ?? null, title ?? null, bio ?? null,
                photo_url ?? null, email ?? null, phone ?? null, city_id ?? null, rating ?? null,
                properties_sold ?? null, is_active ?? null, req.params.id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Агент не найден' });
        }
        res.json({
            success: true,
            message: 'Агент успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, {
            conflict: 'Этот пользователь уже привязан к другому агенту',
            fk: 'Пользователь или город не найден'
        });
    }
});

router.delete('/agents/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Агент не найден' });
        }
        res.json({
            success: true,
            message: 'Агент успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
