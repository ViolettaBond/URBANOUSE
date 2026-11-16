import { Router } from 'express';
import type { Response } from 'express';
import { query } from '../db';
import { auth, optionalAuth, requireRole } from '../middleware/auth';
import handleError from '../utils/handleError';
import type {
    ApiResponse, ContactHandledBody, ContactMessage, ContactMessageBody, ContactMessagesQuery,
    IdParams, Req
} from '../types';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Написать нам может любой, читать сообщения — только админ
router.post('/contact_messages', optionalAuth, async (req: Req<Record<string, string>, ContactMessageBody>, res: Response<ApiResponse<ContactMessage>>) => {
    try {
        const { name = null, email, phone = null, message } = req.body;
        if (!email || !message) {
            return res.status(400).json({ success: false, error: 'Поля email и message обязательны' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, error: 'Некорректный email' });
        }
        const result = await query<ContactMessage>(
            `INSERT INTO contact_messages (user_id, name, email, phone, message)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [req.user ? req.user.id : null, name, String(email).toLowerCase(), phone, message]
        );
        res.status(201).json({
            success: true,
            message: 'Сообщение успешно отправлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

// /api/contact_messages или /api/contact_messages?is_handled=false
router.get('/contact_messages', auth, requireRole('admin'), async (req: Req, res: Response<ApiResponse<ContactMessage[]>>) => {
    try {
        const { is_handled } = req.query as ContactMessagesQuery;
        const result = await query<ContactMessage>(
            `SELECT * FROM contact_messages
             WHERE ($1::boolean IS NULL OR is_handled = $1)
             ORDER BY created_at DESC`,
            [is_handled ? is_handled === 'true' : null]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        handleError(res, err);
    }
});

router.get('/contact_messages/:id', auth, requireRole('admin'), async (req: Req<IdParams>, res: Response<ApiResponse<ContactMessage>>) => {
    try {
        const result = await query<ContactMessage>('SELECT * FROM contact_messages WHERE id = $1', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сообщение не найдено' });
        }
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        handleError(res, err);
    }
});

// Отметить обработанным: { "is_handled": true }
router.put('/contact_messages/:id', auth, requireRole('admin'), async (req: Req<IdParams, ContactHandledBody>, res: Response<ApiResponse<ContactMessage>>) => {
    try {
        const { is_handled } = req.body;
        if (typeof is_handled !== 'boolean') {
            return res.status(400).json({ success: false, error: 'Поле is_handled должно быть true или false' });
        }
        const result = await query<ContactMessage>(
            'UPDATE contact_messages SET is_handled = $1 WHERE id = $2 RETURNING *',
            [is_handled, req.params.id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сообщение не найдено' });
        }
        res.json({
            success: true,
            message: 'Сообщение успешно обновлено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

router.delete('/contact_messages/:id', auth, requireRole('admin'), async (req: Req<IdParams>, res: Response<ApiResponse<ContactMessage>>) => {
    try {
        const result = await query<ContactMessage>('DELETE FROM contact_messages WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Сообщение не найдено' });
        }
        res.json({
            success: true,
            message: 'Сообщение успешно удалено',
            data: result.rows[0]
        });
    } catch (err) {
        handleError(res, err);
    }
});

export default router;
