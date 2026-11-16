import { Router } from 'express';
import type { Response } from 'express';
import { query } from '../db';
import { auth, optionalAuth, requireRole } from '../middleware/auth';
import handleError from '../utils/handleError';
import type {
    ApiResponse, IdParams, Inquiry, InquiriesQuery, InquiryBody, InquiryStatusBody,
    InquiryWithProperty, Req
} from '../types';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Оставить заявку может любой: гость (нужен email) или залогиненный пользователь
router.post('/inquiries', optionalAuth, async (req: Req<Record<string, string>, InquiryBody>, res: Response<ApiResponse<Inquiry>>) => {
    try {
        const { property_id, type, name = null, email = null, phone = null,
                message = null, preferred_at = null, offer_amount = null } = req.body;

        if (!property_id || !type) {
            return res.status(400).json({ success: false, error: 'Поля property_id и type обязательны' });
        }
        if (!req.user && !email) {
            return res.status(400).json({ success: false, error: 'Укажите email' });
        }
        if (email && !EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, error: 'Некорректный email' });
        }
        if (type === 'offer' && !(Number(offer_amount) > 0)) {
            return res.status(400).json({ success: false, error: 'Для предложения укажите offer_amount больше нуля' });
        }

        // агент заявки — это агент объекта
        const property = await query<{ agent_id: string | null }>(
            'SELECT agent_id FROM properties WHERE id = $1',
            [property_id]
        );
        if (property.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Объект не найден' });
        }

        const result = await query<Inquiry>(
            `INSERT INTO inquiries (property_id, agent_id, user_id, type, name, email, phone, message, preferred_at, offer_amount)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                property_id, property.rows[0].agent_id, req.user ? req.user.id : null, type,
                name, email ? String(email).toLowerCase() : null, phone, message, preferred_at,
                type === 'offer' ? offer_amount : null
            ]
        );
        res.status(201).json({
            success: true,
            message: 'Заявка успешно отправлена',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

// Мои заявки (для обычного пользователя)
router.get('/inquiries/my', auth, async (req: Req, res: Response<ApiResponse<InquiryWithProperty[]>>) => {
    try {
        const result = await query<InquiryWithProperty>(
            `SELECT i.*, p.title AS property_title
             FROM inquiries i
             JOIN properties p ON p.id = i.property_id
             WHERE i.user_id = $1
             ORDER BY i.created_at DESC`,
            [req.user!.id]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

// Все заявки — для агентов и админов. Фильтр: /api/inquiries?status=new
router.get('/inquiries', auth, requireRole('agent', 'admin'), async (req: Req, res: Response<ApiResponse<InquiryWithProperty[]>>) => {
    try {
        const { status } = req.query as InquiriesQuery;
        const result = await query<InquiryWithProperty>(
            `SELECT i.*, p.title AS property_title
             FROM inquiries i
             JOIN properties p ON p.id = i.property_id
             WHERE ($1::inquiry_status IS NULL OR i.status = $1)
             ORDER BY i.created_at DESC`,
            [status || null]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/inquiries/:id', auth, requireRole('agent', 'admin'), async (req: Req<IdParams>, res: Response<ApiResponse<Inquiry>>) => {
    try {
        const result = await query<Inquiry>('SELECT * FROM inquiries WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Заявка не найдена' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

// Смена статуса: { "status": "in_progress" }
router.put('/inquiries/:id', auth, requireRole('agent', 'admin'), async (req: Req<IdParams, InquiryStatusBody>, res: Response<ApiResponse<Inquiry>>) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ success: false, error: 'Поле status обязательно' });
        }
        const result = await query<Inquiry>(
            'UPDATE inquiries SET status = $1::inquiry_status WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Заявка не найдена' });
        }
        res.json({
            success: true,
            message: 'Заявка успешно обновлена',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

router.delete('/inquiries/:id', auth, requireRole('admin'), async (req: Req<IdParams>, res: Response<ApiResponse<Inquiry>>) => {
    try {
        const result = await query<Inquiry>('DELETE FROM inquiries WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Заявка не найдена' });
        }
        res.json({
            success: true,
            message: 'Заявка успешно удалена',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

export default router;
