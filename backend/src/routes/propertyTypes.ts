import { Router } from 'express';
import type { Response } from 'express';
import { query } from '../db';
import { auth, requireRole } from '../middleware/auth';
import handleError from '../utils/handleError';
import type { ApiResponse, IdParams, PropertyType, Req, SlugNameBody } from '../types';

const router = Router();

router.get('/property_types', async (_req: Req, res: Response<ApiResponse<PropertyType[]>>) => {
    try {
        const result = await query<PropertyType>('SELECT * FROM property_types ORDER BY id');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/property_types/:id', async (req: Req<IdParams>, res: Response<ApiResponse<PropertyType>>) => {
    try {
        const result = await query<PropertyType>('SELECT * FROM property_types WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Тип недвижимости не найден' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/property_types', auth, requireRole('admin'), async (req: Req<Record<string, string>, SlugNameBody>, res: Response<ApiResponse<PropertyType>>) => {
    try {
        const { slug, name } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ success: false, error: 'Поля slug и name обязательны' });
        }
        const result = await query<PropertyType>(
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

router.put('/property_types/:id', auth, requireRole('admin'), async (req: Req<IdParams, SlugNameBody>, res: Response<ApiResponse<PropertyType>>) => {
    try {
        const { slug, name } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ success: false, error: 'Поля slug и name обязательны' });
        }
        const result = await query<PropertyType>(
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

router.delete('/property_types/:id', auth, requireRole('admin'), async (req: Req<IdParams>, res: Response<ApiResponse<PropertyType>>) => {
    try {
        const result = await query<PropertyType>('DELETE FROM property_types WHERE id = $1 RETURNING *', [req.params.id]);
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

export default router;
