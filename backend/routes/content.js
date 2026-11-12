const express = require('express');
const pool = require('../db');
const handleError = require('../utils/handleError');

const router = express.Router();

// Эти таблицы (primery_card_info, sold__slider_info, articles_info) в SQL-схеме не описаны —
// маршруты оставлены как были

router.get('/primery_card', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM primery_card_info');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/sold_slider', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM sold__slider_info');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles_info ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
