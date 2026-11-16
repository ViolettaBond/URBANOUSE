import { Router } from 'express';
import type { Response } from 'express';
import { query } from '../db';
import { auth } from '../middleware/auth';
import handleError from '../utils/handleError';
import type {
    ApiResponse, FavoriteBody, FavoriteProperty, MessageResponse, PropertyIdParams, Req
} from '../types';

const router = Router();

// Избранное — личное: каждый видит и меняет только своё
router.get('/favorites', auth, async (req: Req, res: Response<ApiResponse<FavoriteProperty[]>>) => {
    try {
        const result = await query<FavoriteProperty>(
            `SELECT p.*, c.name AS city,
                    (SELECT url FROM property_images
                      WHERE property_id = p.id ORDER BY is_cover DESC, sort_order LIMIT 1) AS cover_url
             FROM favorites f
             JOIN properties p ON p.id = f.property_id
             JOIN cities c ON c.id = p.city_id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [req.user!.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.post('/favorites', auth, async (req: Req<Record<string, string>, FavoriteBody>, res: Response<MessageResponse>) => {
    try {
        const { property_id } = req.body;
        if (!property_id) {
            return res.status(400).json({ success: false, error: 'Поле property_id обязательно' });
        }
        await query(
            'INSERT INTO favorites (user_id, property_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user!.id, property_id]
        );
        res.status(201).json({ success: true, message: 'Добавлено в избранное' });
    } catch (err) {
        handleError(res, err, { fk: 'Объект не найден' });
    }
});

router.delete('/favorites/:propertyId', auth, async (req: Req<PropertyIdParams>, res: Response<MessageResponse>) => {
    try {
        const result = await query(
            'DELETE FROM favorites WHERE user_id = $1 AND property_id = $2',
            [req.user!.id, req.params.propertyId]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Объекта нет в избранном' });
        }
        res.json({ success: true, message: 'Удалено из избранного' });
    } catch (err) {
        handleError(res, err);
    }
});

export default router;
