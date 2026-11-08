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

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

const auth = (req, res, next) => {
    const token = req.headers.authorization;
    if(!token) return res.status(401).send('No token provided');
    try{
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.user = decodedToken;
        next();
    }catch(err){
        res.status(401).send('invalid token');
    }
}

app.get('/api/slider', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM slider_info', [])
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

const PORT = 3000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
