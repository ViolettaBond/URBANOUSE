const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();

router.get('/amenities', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM amenities ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/amenities/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM amenities WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Удобство не найдено' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/amenities', auth, requireRole('admin'), async (req, res) => {
    try {
        const { slug, name } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ success: false, error: 'Поля slug и name обязательны' });
        }
        const result = await pool.query(
            'INSERT INTO amenities (slug, name) VALUES ($1, $2) RETURNING *',
            [slug, name]
        );
        res.status(201).json({
            success: true,
            message: 'Удобство успешно добавлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Удобство с таким slug уже существует' });
    }
});

router.put('/amenities/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { slug, name } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ success: false, error: 'Поля slug и name обязательны' });
        }
        const result = await pool.query(
            'UPDATE amenities SET slug = $1, name = $2 WHERE id = $3 RETURNING *',
            [slug, name, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Удобство не найдено' });
        }
        res.json({
            success: true,
            message: 'Удобство успешно обновлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Удобство с таким slug уже существует' });
    }
});

router.delete('/amenities/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM amenities WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Удобство не найдено' });
        }
        res.json({
            success: true,
            message: 'Удобство успешно удалено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
