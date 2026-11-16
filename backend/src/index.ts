import 'dotenv/config'; // должен быть первым импортом, до остальных файлов
import express from 'express';
import type { ErrorRequestHandler, RequestHandler } from 'express';
import cors from 'cors';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import countriesRoutes from './routes/countries';
import citiesRoutes from './routes/cities';
import propertyTypesRoutes from './routes/propertyTypes';
import amenitiesRoutes from './routes/amenities';
import agentsRoutes from './routes/agents';
import projectsRoutes from './routes/projects';
import propertiesRoutes from './routes/properties';
import favoritesRoutes from './routes/favorites';
import savedSearchesRoutes from './routes/savedSearches';
import inquiriesRoutes from './routes/inquiries';
import contactMessagesRoutes from './routes/contactMessages';
import contentRoutes from './routes/content';

const app = express();
app.use(cors());
app.use(express.json());

// Все маршруты лежат в папке routes, по файлу на сущность
app.use('/api', authRoutes);
app.use('/api', usersRoutes);
app.use('/api', countriesRoutes);
app.use('/api', citiesRoutes);
app.use('/api', propertyTypesRoutes);
app.use('/api', amenitiesRoutes);
app.use('/api', agentsRoutes);
app.use('/api', projectsRoutes);
app.use('/api', propertiesRoutes);
app.use('/api', favoritesRoutes);
app.use('/api', savedSearchesRoutes);
app.use('/api', inquiriesRoutes);
app.use('/api', contactMessagesRoutes);
app.use('/api', contentRoutes);

// Неизвестные маршруты
const notFound: RequestHandler = (_req, res) => {
    res.status(404).json({ success: false, error: 'Маршрут не найден' });
};
app.use(notFound);

// Ошибки (в т.ч. невалидный JSON). Аргументов должно быть именно 4, иначе Express не поймёт, что это обработчик ошибок
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err?.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, error: 'Некорректный JSON' });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
};
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
