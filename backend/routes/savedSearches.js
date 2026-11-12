const express = require('express');
const pool = require('../db');
const { auth } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();
const FK_MESSAGE = { fk: 'Город или тип недвижимости не найден' };

// Сохранённые поиски — личные: везде фильтруем по user_id = req.user.id
router.get('/saved_searches', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY id DESC',
            [req.user.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/saved_searches/:id', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM saved_searches WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сохранённый поиск не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/saved_searches', auth, async (req, res) => {
    try {
        const {
            name = null, listing_type = null, city_id = null, property_type_id = null,
            min_bedrooms = null, max_price = null, alerts_enabled = null
        } = req.body;
        const result = await pool.query(
            `INSERT INTO saved_searches
                (user_id, name, listing_type, city_id, property_type_id, min_bedrooms, max_price, alerts_enabled)
             VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, TRUE))
             RETURNING *`,
            [req.user.id, name, listing_type, city_id, property_type_id, min_bedrooms, max_price, alerts_enabled]
        );
        res.status(201).json({
            success: true,
            message: 'Поиск успешно сохранён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, FK_MESSAGE);
    }
});

// Передавайте только те поля, которые нужно изменить
router.put('/saved_searches/:id', auth, async (req, res) => {
    try {
        const { name, listing_type, city_id, property_type_id, min_bedrooms, max_price, alerts_enabled } = req.body;
        const result = await pool.query(
            `UPDATE saved_searches SET
                name             = COALESCE($1, name),
                listing_type     = COALESCE($2::listing_type, listing_type),
                city_id          = COALESCE($3, city_id),
                property_type_id = COALESCE($4, property_type_id),
                min_bedrooms     = COALESCE($5, min_bedrooms),
                max_price        = COALESCE($6, max_price),
                alerts_enabled   = COALESCE($7, alerts_enabled)
             WHERE id = $8 AND user_id = $9
             RETURNING *`,
            [
                name ?? null, listing_type ?? null, city_id ?? null, property_type_id ?? null,
                min_bedrooms ?? null, max_price ?? null, alerts_enabled ?? null,
                req.params.id, req.user.id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сохранённый поиск не найден' });
        }
        res.json({
            success: true,
            message: 'Поиск успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, FK_MESSAGE);
    }
});

router.delete('/saved_searches/:id', auth, async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.id, req.user.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сохранённый поиск не найден' });
        }
        res.json({
            success: true,
            message: 'Поиск успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
