import type { Response } from 'express';

// Необязательные свои тексты ошибок
export interface ErrorMessages {
    conflict?: string; // 23505: уникальное поле уже занято
    fk?: string; // 23503: нарушен внешний ключ
}

interface PgError {
    code?: string;
}

// Общая обработка ошибок БД, чтобы не повторять её в каждом маршруте
export default function handleError(res: Response, err: unknown, messages: ErrorMessages = {}): void {
    console.error(err);
    const code = (err as PgError | null)?.code;

    // 23505: нарушено уникальное поле (например, email или slug уже заняты)
    if (code === '23505') {
        res.status(409).json({
            success: false,
            error: messages.conflict || 'Такая запись уже существует'
        });
        return;
    }
    // 23503: нарушен внешний ключ (нет связанной записи или на запись есть ссылки)
    if (code === '23503') {
        res.status(409).json({
            success: false,
            error: messages.fk || 'Связанная запись не найдена или на эту запись есть ссылки'
        });
        return;
    }
    // некорректный формат данных (например, id = "abc", неверное значение enum)
    if (code && ['22P02', '23502', '23514', '22001', '22003'].includes(code)) {
        res.status(400).json({ success: false, error: 'Некорректные данные' });
        return;
    }

    res.status(500).json({
        success: false,
        error: 'Данных нет, или проблема с сервером'
    });
}
