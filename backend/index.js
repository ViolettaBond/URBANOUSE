require('dotenv').config(); // должен быть первым, до подключения остальных файлов
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Все маршруты лежат в папке routes, по файлу на сущность
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/users'));
app.use('/api', require('./routes/countries'));
app.use('/api', require('./routes/cities'));
app.use('/api', require('./routes/propertyTypes'));
app.use('/api', require('./routes/amenities'));
app.use('/api', require('./routes/agents'));
app.use('/api', require('./routes/projects'));
app.use('/api', require('./routes/properties'));
app.use('/api', require('./routes/favorites'));
app.use('/api', require('./routes/savedSearches'));
app.use('/api', require('./routes/inquiries'));
app.use('/api', require('./routes/contactMessages'));
app.use('/api', require('./routes/content'));

// Неизвестные маршруты
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Маршрут не найден' });
});

// Ошибки (в т.ч. невалидный JSON). Аргументов должно быть именно 4, иначе Express не поймёт, что это обработчик ошибок
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, error: 'Некорректный JSON' });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
