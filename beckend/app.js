const express = require('express');
const resourceRoutes = require('./routes/resourceRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

// 1. Парсинг JSON (Вимога 5) - МУСИТЬ бути першим!
app.use(express.json());

// 2. Middleware для логування кожного запиту (Вимога 8)
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// 3. Підключаємо маршрути (Вимога 2 та 3)
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);

// 4. Обробка 404 (Вимога 7.1 - шлях не знайдено)
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: "NOT_FOUND",
            message: "Ресурс або сторінку не знайдено"
        }
    });
});

// 5. Централізована обробка помилок (Вимога 7.2)
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.stack);

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        error: {
            code: err.code || "INTERNAL_SERVER_ERROR",
            message: err.message || "Сталася непередбачувана помилка на сервері",
            details: err.details || []
        }
    });
});

// 6. Запуск сервера
app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(` СЕРВЕР ЗАПУЩЕНО УСПІШНО!`);
    console.log(` Локальна адреса: http://localhost:${PORT}`);
    console.log(` Ресурси (Resources): http://localhost:${PORT}/api/resources`);
    console.log(` Користувачі (Users): http://localhost:${PORT}/api/users`);
    console.log(`=========================================`);
    console.log(`\nНатисніть Ctrl+C для зупинки.\n`);
});