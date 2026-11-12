const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();

// GET /api/cities или /api/cities?country_id=1
router.get('/cities', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM cities WHERE ($1::smallint IS NULL OR country_id = $1) ORDER BY name',
            [req.query.country_id || null]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/cities/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM cities WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Город не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/cities', auth, requireRole('admin'), async (req, res) => {
    try {
        const { country_id, name } = req.body;
        if (!country_id || !name) {
            return res.status(400).json({ success: false, error: 'Поля country_id и name обязательны' });
        }
        const result = await pool.query(
            'INSERT INTO cities (country_id, name) VALUES ($1, $2) RETURNING *',
            [country_id, name]
        );
        res.status(201).json({
            success: true,
            message: 'Город успешно добавлен',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, {
            conflict: 'Такой город в этой стране уже существует',
            fk: 'Страна не найдена'
        });
    }
});

router.put('/cities/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { country_id, name } = req.body;
        if (!country_id || !name) {
            return res.status(400).json({ success: false, error: 'Поля country_id и name обязательны' });
        }
        const result = await pool.query(
            'UPDATE cities SET country_id = $1, name = $2 WHERE id = $3 RETURNING *',
            [country_id, name, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Город не найден' });
        }
        res.json({
            success: true,
            message: 'Город успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, {
            conflict: 'Такой город в этой стране уже существует',
            fk: 'Страна не найдена'
        });
    }
});

router.delete('/cities/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM cities WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Город не найден' });
        }
        res.json({
            success: true,
            message: 'Город успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { fk: 'Нельзя удалить город: на него ссылаются другие записи' });
    }
});

module.exports = router;
