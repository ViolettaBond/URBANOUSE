const express = require('express');
const pool = require('../db');
const { auth, requireRole } = require('../middleware/auth');
const handleError = require('../utils/handleError');

const router = express.Router();
const FK_MESSAGE = { fk: 'Город, тип недвижимости, агент или проект не найден' };

// Список активных объектов с фильтрами (все фильтры необязательные):
// /api/properties?listing_type=sale&city_id=1&property_type_id=2&agent_id=3
//                &min_price=100000&max_price=900000&min_bedrooms=2&is_featured=true&is_popular=true
router.get('/properties', async (req, res) => {
    try {
        const q = req.query;
        const result = await pool.query(
            `SELECT p.*, c.name AS city, pt.name AS property_type,
                    (SELECT url FROM property_images
                      WHERE property_id = p.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS cover_url
             FROM properties p
             JOIN cities c ON c.id = p.city_id
             JOIN property_types pt ON pt.id = p.property_type_id
             WHERE p.status = 'active'
               AND ($1::listing_type IS NULL OR p.listing_type = $1)
               AND ($2::int          IS NULL OR p.city_id = $2)
               AND ($3::smallint     IS NULL OR p.property_type_id = $3)
               AND ($4::bigint       IS NULL OR p.agent_id = $4)
               AND ($5::numeric      IS NULL OR p.price >= $5)
               AND ($6::numeric      IS NULL OR p.price <= $6)
               AND ($7::smallint     IS NULL OR p.bedrooms >= $7)
               AND ($8::boolean      IS NULL OR p.is_featured = $8)
               AND ($9::boolean      IS NULL OR p.is_popular = $9)
             ORDER BY p.published_at DESC NULLS LAST, p.id DESC`,
            [
                q.listing_type || null, q.city_id || null, q.property_type_id || null,
                q.agent_id || null, q.min_price || null, q.max_price || null, q.min_bedrooms || null,
                q.is_featured ? q.is_featured === 'true' : null,
                q.is_popular ? q.is_popular === 'true' : null,
            ]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

// Один объект + его фото и удобства
router.get('/properties/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, c.name AS city, pt.name AS property_type
             FROM properties p
             JOIN cities c ON c.id = p.city_id
             JOIN property_types pt ON pt.id = p.property_type_id
             WHERE p.id = $1`,
            [req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Объект не найден' });
        }
        const images = await pool.query(
            'SELECT id, url, alt_text, sort_order, is_cover FROM property_images WHERE property_id = $1 ORDER BY sort_order',
            [req.params.id]
        );
        const amenities = await pool.query(
            `SELECT a.id, a.slug, a.name
             FROM property_amenities pa
             JOIN amenities a ON a.id = pa.amenity_id
             WHERE pa.property_id = $1`,
            [req.params.id]
        );
        res.json({
            success: true,
            data: { ...result.rows[0], images: images.rows, amenities: amenities.rows }
        });
    } catch (err) {
        handleError(res, err);
    }
});

// Создавать, менять и удалять объекты могут агенты и админы
router.post('/properties', auth, requireRole('agent', 'admin'), async (req, res) => {
    try {
        const {
            slug, title, description = null, listing_type, status = null, property_type_id,
            agent_id = null, price, currency = null, bedrooms = null, bathrooms = null,
            area_sqft = null, garage_spaces = null, year_built = null, address_line, city_id,
            postal_code = null, latitude = null, longitude = null, is_featured = null,
            is_popular = null, project_id = null
        } = req.body;

        if (!slug || !title || !listing_type || !property_type_id || price === undefined || !address_line || !city_id) {
            return res.status(400).json({
                success: false,
                error: 'Обязательные поля: slug, title, listing_type, property_type_id, price, address_line, city_id'
            });
        }

        const result = await pool.query(
            `INSERT INTO properties (
                slug, title, description, listing_type, status, property_type_id, agent_id,
                price, currency, bedrooms, bathrooms, area_sqft, garage_spaces, year_built,
                address_line, city_id, postal_code, latitude, longitude,
                is_featured, is_popular, project_id, published_at
             ) VALUES (
                $1, $2, $3, $4, COALESCE($5::property_status, 'active'), $6, $7,
                $8, COALESCE($9, 'USD'), COALESCE($10, 0), COALESCE($11, 0), $12, COALESCE($13, 0), $14,
                $15, $16, $17, $18, $19,
                COALESCE($20, FALSE), COALESCE($21, FALSE), $22, now()
             ) RETURNING *`,
            [
                slug, title, description, listing_type, status, property_type_id, agent_id,
                price, currency, bedrooms, bathrooms, area_sqft, garage_spaces, year_built,
                address_line, city_id, postal_code, latitude, longitude,
                is_featured, is_popular, project_id
            ]
        );
        res.status(201).json({
            success: true,
            message: 'Объект успешно добавлен',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Объект с таким slug уже существует', ...FK_MESSAGE });
    }
});

// Передавайте только те поля, которые нужно изменить
router.put('/properties/:id', auth, requireRole('agent', 'admin'), async (req, res) => {
    try {
        const b = req.body;
        const result = await pool.query(
            `UPDATE properties SET
                slug             = COALESCE($1, slug),
                title            = COALESCE($2, title),
                description      = COALESCE($3, description),
                listing_type     = COALESCE($4::listing_type, listing_type),
                status           = COALESCE($5::property_status, status),
                property_type_id = COALESCE($6, property_type_id),
                agent_id         = COALESCE($7, agent_id),
                price            = COALESCE($8, price),
                currency         = COALESCE($9, currency),
                bedrooms         = COALESCE($10, bedrooms),
                bathrooms        = COALESCE($11, bathrooms),
                area_sqft        = COALESCE($12, area_sqft),
                garage_spaces    = COALESCE($13, garage_spaces),
                year_built       = COALESCE($14, year_built),
                address_line     = COALESCE($15, address_line),
                city_id          = COALESCE($16, city_id),
                postal_code      = COALESCE($17, postal_code),
                latitude         = COALESCE($18, latitude),
                longitude        = COALESCE($19, longitude),
                is_featured      = COALESCE($20, is_featured),
                is_popular       = COALESCE($21, is_popular),
                project_id       = COALESCE($22, project_id)
             WHERE id = $23
             RETURNING *`,
            [
                b.slug ?? null, b.title ?? null, b.description ?? null, b.listing_type ?? null,
                b.status ?? null, b.property_type_id ?? null, b.agent_id ?? null, b.price ?? null,
                b.currency ?? null, b.bedrooms ?? null, b.bathrooms ?? null, b.area_sqft ?? null,
                b.garage_spaces ?? null, b.year_built ?? null, b.address_line ?? null, b.city_id ?? null,
                b.postal_code ?? null, b.latitude ?? null, b.longitude ?? null, b.is_featured ?? null,
                b.is_popular ?? null, b.project_id ?? null, req.params.id
            ]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Объект не найден' });
        }
        res.json({
            success: true,
            message: 'Объект успешно обновлён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { conflict: 'Объект с таким slug уже существует', ...FK_MESSAGE });
    }
});

router.delete('/properties/:id', auth, requireRole('agent', 'admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Объект не найден' });
        }
        res.json({
            success: true,
            message: 'Объект успешно удалён',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

/* ---------- Фото объекта ---------- */

router.post('/properties/:id/images', auth, requireRole('agent', 'admin'), async (req, res) => {
    try {
        const { url, alt_text = null, sort_order = 0, is_cover = false } = req.body;
        if (!url) {
            return res.status(400).json({ success: false, error: 'Поле url обязательно' });
        }
        // у объекта может быть только одна обложка
        if (is_cover) {
            await pool.query('UPDATE property_images SET is_cover = FALSE WHERE property_id = $1', [req.params.id]);
        }
        const result = await pool.query(
            `INSERT INTO property_images (property_id, url, alt_text, sort_order, is_cover)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.params.id, url, alt_text, sort_order, is_cover]
        );
        res.status(201).json({
            success: true,
            message: 'Фото успешно добавлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err, { fk: 'Объект не найден' });
    }
});

router.delete('/property_images/:id', auth, requireRole('agent', 'admin'), async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM property_images WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Фото не найдено' });
        }
        res.json({
            success: true,
            message: 'Фото успешно удалено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

/* ---------- Удобства объекта ---------- */

// Заменяет весь список удобств: { "amenity_ids": [1, 2] }
router.put('/properties/:id/amenities', auth, requireRole('agent', 'admin'), async (req, res) => {
    try {
        const { amenity_ids } = req.body;
        if (!Array.isArray(amenity_ids)) {
            return res.status(400).json({ success: false, error: 'Передайте массив amenity_ids' });
        }
        await pool.query('DELETE FROM property_amenities WHERE property_id = $1', [req.params.id]);
        if (amenity_ids.length > 0) {
            await pool.query(
                `INSERT INTO property_amenities (property_id, amenity_id)
                 SELECT $1, unnest($2::smallint[]) ON CONFLICT DO NOTHING`,
                [req.params.id, amenity_ids]
            );
        }
        res.json({ success: true, message: 'Удобства успешно обновлены' });
    } catch (err) {
        handleError(res, err, { fk: 'Объект или удобство не найдено' });
    }
});

module.exports = router;
