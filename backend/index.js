require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Pool} = require('pg')
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
})

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
    console.error('JWT_SECRET не задан в .env')
    process.exit(1)
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const SALT_ROUNDS = 10
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Поля пользователя, которые можно отдавать клиенту (без password_hash)
const PUBLIC_USER_FIELDS = `id, first_name, last_name, email, role, phone, avatar_url,
    email_verified_at, last_login_at, created_at`

const signToken = (user) =>
    jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

// Middleware: проверяет заголовок "Authorization: Bearer <token>",
// подгружает пользователя из БД и убеждается, что он активен
const auth = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ success: false, error: 'Токен не передан' });
    }

    let payload;
    try {
        payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        const expired = err.name === 'TokenExpiredError';
        return res.status(401).json({
            success: false,
            error: expired ? 'Срок действия токена истёк' : 'Недействительный токен'
        });
    }

    try {
        const result = await pool.query(
            `SELECT ${PUBLIC_USER_FIELDS}, is_active FROM users WHERE id = $1`,
            [payload.id]
        );
        const user = result.rows[0];
        if (!user || !user.is_active) {
            return res.status(401).json({ success: false, error: 'Пользователь не найден или заблокирован' });
        }
        req.user = user; // актуальная роль берётся из БД, а не из токена
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
}

// Middleware: доступ только для указанных ролей, ставится ПОСЛЕ auth
// пример: app.delete('/api/articles/:id', auth, requireRole('admin'), handler)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'Недостаточно прав' });
    }
    next();
}

// Регистрация (роль всегда 'user', из тела запроса она не берётся)
app.post('/api/register', async (req, res) => {
    try {
        const first_name = String(req.body.first_name || '').trim();
        const last_name = String(req.body.last_name || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        const phone = String(req.body.phone || '').trim() || null;

        if (!first_name || !last_name || first_name.length > 100 || last_name.length > 100) {
            return res.status(400).json({ success: false, error: 'Укажите имя и фамилию (до 100 символов)' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ success: false, error: 'Некорректный email' });
        }
        if (password.length < 6 || password.length > 72) {
            return res.status(400).json({ success: false, error: 'Пароль должен быть от 6 до 72 символов' });
        }
        if (phone && phone.length > 30) {
            return res.status(400).json({ success: false, error: 'Слишком длинный номер телефона' });
        }

        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, phone)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${PUBLIC_USER_FIELDS}`,
            [first_name, last_name, email, hash, phone]
        );
        const user = result.rows[0];
        res.status(201).json({ success: true, token: signToken(user), user });
    } catch (err) {
        if (err.code === '23505') { // уникальный email уже занят
            return res.status(409).json({ success: false, error: 'Пользователь с таким email уже существует' });
        }
        console.error(err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
})

// Вход
app.post('/api/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Введите email и пароль' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        // password_hash может быть NULL, если аккаунт создан через Google/Apple
        const ok = user && user.password_hash && await bcrypt.compare(password, user.password_hash);
        if (!ok) {
            return res.status(401).json({ success: false, error: 'Неверный email или пароль' });
        }
        if (!user.is_active) {
            return res.status(403).json({ success: false, error: 'Аккаунт заблокирован' });
        }

        await pool.query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);

        res.json({
            success: true,
            token: signToken(user),
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar_url: user.avatar_url,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Ошибка сервера' });
    }
})

// Текущий пользователь (защищённый маршрут)
app.get('/api/me', auth, (req, res) => {
    const { is_active, ...user } = req.user;
    res.json({ success: true, user });
})



app.get('/api/countries', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM countries ORDER BY id')
        res.json({
            success: true,
            data: result.rows,
        })
    }catch(err){
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})

app.get('/api/country/:id', async (req, res) => {
    try{
        const id = req.params
        const result = await pool.query('SELECT * FROM countries WHERE id = $1', [id])
        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, error: 'Страна не найдена' });
        }
        res.json({
            success: true,
            data: result.rows[0],
        })
    }catch(err){
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})

app.post('/api/create_country', async (req, res) => {
    try{
        const {name, code} = req.body
        if(!name || !code){
            return res.status(400).json({
                success: false,
                error: 'Поля name и code обязательны'
            })
        }
        const result = await pool.query("INSERT INTO countries (name, code) VALUES ($1, $2) RETURNING *", [name, code])
        res.status(201).json({
            success: true,
            message: "Страна успешно добавлена",
            data: result.rows[0]
        })
    }
    catch(err){
        console.error(err)
        if(err.code === '23505'){
            return res.status(409).json({
                success: false,
                error: 'Страна с таким названием или кодом уже существует'
            })
        }
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        })
    }
})

app.put('/api/country/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({
                success: false,
                error: 'Поля name и code обязательны'
            });
        }

        const result = await pool.query(
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
        console.error(err);
        if (err.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'Страна с таким названием или кодом уже существует'
            });
        }
        res.status(500).json({ 
            success: false, 
            error: 'Данных нет, или проблема с сервером' 
        });
    }
});

app.delete('/api/country/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM countries WHERE id = $1 RETURNING *',
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Страна не найдена' 
            });
        }
        res.json({
            success: true,
            message: 'Страна успешно удалена',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            return res.status(409).json({
                success: false,
                error: 'Нельзя удалить страну: на неё ссылаются другие записи'
            });
        }
        res.status(500).json({ 
            success: false, 
            error: 'Данных нет, или проблема с сервером'
        });
    }
});



app.get('/api/primery_card', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM primery_card_info', [])
        res.json({
            success: true,
            data: result.rows,
        })
    }catch(err){
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})
app.get('/api/sold_slider', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM sold__slider_info', [])
        res.json({
            success: true,
            data: result.rows,
        })
    }catch(err){
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})

app.get('/api/articles', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM articles_info ORDER BY id DESC', [])
        res.json({
            success: true,
            data: result.rows,
        })
    }catch(err){
        res.status(500).json({
            success: false,
            error: 'Данных нет, или проблема с сервером'
        });
    }
})

// Неизвестные маршруты и ошибки (в т.ч. невалидный JSON)
app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Маршрут не найден' });
})
app.use((err, req, res) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, error: 'Некорректный JSON' });
    }
    console.error(err);
    res.status(500).json({ success: false, error: 'Ошибка сервера' });
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})