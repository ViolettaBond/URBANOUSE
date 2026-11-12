const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();

router.get('/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/projects/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Проект не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/projects', auth, requireRole('admin'), async (req, res) => {
    try {
        const {
            slug, title, description = null, city_id = null, cover_url = null,
            units_available = null, is_published = null
        } = req.body;
        if (!slug || !title) {
            return res.status(400).json({ success: false, error: 'Поля slug и title обязательны' });
        }
        const result = await pool.query(
            `INSERT INTO projects (slug, title, description, city_id, cover_url, units_available, is_published)
             VALUES ($1, $2, $3, $4, $5, COALESCE($6, 0), COALESCE($7, TRUE))
             RETURNING *`,
            [slug, title, description, city_id, cover_url, units_available, is_published]
        );
        res.status(201).json({
            success: true,
            message: 'Проект успешно добавлен',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, {
            conflict: 'Проект с таким slug уже существует',
            fk: 'Город не найден'
        });
    }
});

// Передавайте только те поля, которые нужно изменить
router.put('/projects/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const { slug, title, description, city_id, cover_url, units_available, is_published } = req.body;
        const result = await pool.query(
            `UPDATE projects SET
                slug            = COALESCE($1, slug),
                title           = COALESCE($2, title),
                description     = COALESCE($3, description),
                city_id         = COALESCE($4, city_id),
                cover_url       = COALESCE($5, cover_url),
                units_available = COALESCE($6, units_available),
                is_published    = COALESCE($7, is_published)
             WHERE id = $8
             RETURNING *`,
            [
                slug ?? null, title ?? null, description ?? null, city_id ?? null,
                cover_url ?? null, units_available ?? null, is_published ?? null, req.params.id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Проект не найден' });
        }
        res.json({
            success: true,
            message: 'Проект успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, {
            conflict: 'Проект с таким slug уже существует',
            fk: 'Город не найден'
        });
    }
});

router.delete('/projects/:id', auth, requireRole('admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Проект не найден' });
        }
        res.json({
            success: true,
            message: 'Проект успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
