import { Router } from 'express';
import type { Response } from 'express';
import { query } from '../db';
import { auth, requireRole } from '../middleware/auth';
import handleError from '../utils/handleError';
import type { ApiResponse, CountryBody, Country, IdParams, Req } from '../types';

const router = Router();

// Читать можно без входа, менять — только админу
router.get('/countries', async (_req: Req, res: Response<ApiResponse<Country[]>>) => {
    try {
        const result = await query<Country>('SELECT * FROM countries ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/countries/:id', async (req: Req<IdParams>, res: Response<ApiResponse<Country>>) => {
    try {
        const { id } = req.params;
        const result = await query<Country>('SELECT * FROM countries WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Страна не найдена' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/create_countries', auth, requireRole('admin'), async (req: Req<Record<string, string>, CountryBody>, res: Response<ApiResponse<Country>>) => {
    try {
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, error: 'Поля name и code обязательны' });
        }
        const result = await query<Country>(
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

router.put('/countries/:id', auth, requireRole('admin'), async (req: Req<IdParams, CountryBody>, res: Response<ApiResponse<Country>>) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;
        if (!name || !code) {
            return res.status(400).json({ success: false, error: 'Поля name и code обязательны' });
        }
        const result = await query<Country>(
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

router.delete('/countries/:id', auth, requireRole('admin'), async (req: Req<IdParams>, res: Response<ApiResponse<Country>>) => {
    try {
        const { id } = req.params;
        const result = await query<Country>('DELETE FROM countries WHERE id = $1 RETURNING *', [id]);
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

export default router;
