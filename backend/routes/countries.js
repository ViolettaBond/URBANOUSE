const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();

// Читать можно без входа, менять — только админу
router.get('/countries', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM countries ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/countries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM countries WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Страна не найдена' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/create_countries', auth, requireRole('admin'), async (req, res) => {
    try {
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, error: 'Поля name и code обязательны' });
        }
        const result = await pool.query(
            'INSERT INTO countries (name, code) VALUES ($1, $2) RETURNING *',
            [name, code]
        );
        res.status(201).json({
            success: true,
            message: 'Страна успешно добавлена',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Страна с таким названием или кодом уже существует' });
    }
});

router.put('/countries/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, error: 'Поля name и code обязательны' });
        }
        const result = await pool.query(
            'UPDATE countries SET name = $1, code = $2 WHERE id = $3 RETURNING *',
            [name, code, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Страна не найдена' });
        }
        res.json({
            success: true,
            message: 'Страна успешно обновлена',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Страна с таким названием или кодом уже существует' });
    }
});

router.delete('/countries/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM countries WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Страна не найдена' });
        }
        res.json({
            success: true,
            message: 'Страна успешно удалена',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { fk: 'Нельзя удалить страну: на неё ссылаются другие записи' });
    }
});

module.exports = router;
