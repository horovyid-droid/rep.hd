const express = require('express');
const resourceRoutes = require('./routes/resourceRoutes');
const userRoutes = require('./routes/userRoutes');
const { initDb } = require('./database/db'); // 1. Підключаємо логіку бази

const app = express();
const PORT = 3000;

// 2. Ініціалізуємо базу даних при старті
initDb();

app.use(express.json());

// Логування запитів (Middleware)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Статистика (приклад обробки даних)
app.get('/api/resources/count-by-type', (req, res) => {
    const data = [
        { type: 'Стаття' }, { type: 'Відео' },
        { type: 'Стаття' }, { type: 'Курс' },
        { type: 'Книга' }
    ];

    const stats = {};
    data.forEach(item => {
        stats[item.type] = (stats[item.type] || 0) + 1;
    });

    res.json({
        success: true,
        stats: stats
    });
});

// Маршрути (Routes)
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);

// Обробка 404 (Not Found)
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: "Ресурс не знайдено"
        }
    });
});

// Загальна обробка помилок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: { code: "SERVER_ERROR", message: "Сталася помилка" }
    });
});

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(` СЕРВЕР ЗАПУЩЕНО: http://localhost:${PORT}`);
    console.log(` База даних активна та готова до роботи.`);
    console.log(`=========================================`);
});