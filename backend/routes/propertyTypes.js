const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();

router.get('/property_types', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM property_types ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/property_types/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM property_types WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Тип недвижимости не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/property_types', auth, requireRole('admin'), async (req, res) => {
    try {
        const { slug, name } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ success: false, error: 'Поля slug и name обязательны' });
        }
        const result = await pool.query(
            'INSERT INTO property_types (slug, name) VALUES ($1, $2) RETURNING *',
            [slug, name]
        );
        res.status(201).json({
            success: true,
            message: 'Тип недвижимости успешно добавлен',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Тип с таким slug уже существует' });
    }
});

router.put('/property_types/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { slug, name } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ success: false, error: 'Поля slug и name обязательны' });
        }
        const result = await pool.query(
            'UPDATE property_types SET slug = $1, name = $2 WHERE id = $3 RETURNING *',
            [slug, name, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Тип недвижимости не найден' });
        }
        res.json({
            success: true,
            message: 'Тип недвижимости успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Тип с таким slug уже существует' });
    }
});

router.delete('/property_types/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM property_types WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Тип недвижимости не найден' });
        }
        res.json({
            success: true,
            message: 'Тип недвижимости успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { fk: 'Нельзя удалить тип: к нему привязаны объекты' });
    }
});

module.exports = router;
