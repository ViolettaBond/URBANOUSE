import { Router } from 'express';
import type { Response } from 'express';
import { query } from '../db';
import handleError from '../utils/handleError';
import type { ApiResponse, ContentRow, Req } from '../types';

const router = Router();

// Эти таблицы (primery_card_info, sold__slider_info, articles_info) в SQL-схеме не описаны —
// маршруты оставлены как были, строки типизированы как ContentRow

router.get('/primery_card', async (_req: Req, res: Response<ApiResponse<ContentRow[]>>) => {
    try {
        const result = await query<ContentRow>('SELECT * FROM primery_card_info');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/sold_slider', async (_req: Req, res: Response<ApiResponse<ContentRow[]>>) => {
    try {
        const result = await query<ContentRow>('SELECT * FROM sold__slider_info');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/articles', async (_req: Req, res: Response<ApiResponse<ContentRow[]>>) => {
    try {
        const result = await query<ContentRow>('SELECT * FROM articles_info ORDER BY id DESC');
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

export default router;
