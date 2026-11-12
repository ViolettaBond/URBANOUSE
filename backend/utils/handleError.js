// Общая обработка ошибок БД, чтобы не повторять её в каждом маршруте.
// messages — необязательные свои тексты: { conflict: '...', fk: '...' }
module.exports = (res, err, messages = {}) => {
    console.error(err);

    // 23505 — нарушено уникальное поле (например, email или slug уже заняты)
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            error: messages.conflict || 'Такая запись уже существует'
        });
    }
    // 23503 — нарушен внешний ключ (нет связанной записи или на запись есть ссылки)
    if (err.code === '23503') {
        return res.status(409).json({
            success: false,
            error: messages.fk || 'Связанная запись не найдена или на эту запись есть ссылки'
        });
    }
    // некорректный формат данных (например, id = "abc", неверное значение enum)
    if (['22P02', '23502', '23514', '22001', '22003'].includes(err.code)) {
        return res.status(400).json({ success: false, error: 'Некорректные данные' });
    }

    res.status(500).json({
        success: false,
        error: 'Данных нет, или проблема с сервером'
    });
};
