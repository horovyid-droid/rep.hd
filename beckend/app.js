const express = require('express');
const cors = require('cors');
const resourceRoutes = require('./routes/resourceRoutes');
const userRoutes = require('./routes/userRoutes');

const { db, initDb } = require('./database/db');

const app = express();
const PORT = 3001;

async function bootstrap() {
   
    await initDb();

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
                callback(null, true);
            } else {
                console.log(`CORS заблокував запит з: ${origin}`);
                callback(new Error('CORS: Origin not allowed'));
            }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json());

   
    app.use((req, res, next) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
        next();
    });

  
    app.get('/api/v1/resources/count-by-type', (req, res) => {
        const sql = `SELECT type, COUNT(*) as count FROM Resources GROUP BY type`;

        db.all(sql, [], (err, rows) => {
            if (err) {
                console.error("Помилка при отриманні статистики:", err.message);
                return res.status(500).json({
                    success: false,
                    error: "Помилка бази даних"
                });
            }

           
            const stats = {};
            rows.forEach(row => {
                const typeName = row.type || 'Інше';
                stats[typeName] = row.count;
            });

            res.json({
                success: true,
                stats: stats
            });
        });
    });

    app.use('/api/v1/resources', resourceRoutes);
    app.use('/api/v1/users', userRoutes);

    
    app.use((req, res) => {
        res.status(404).json({
            error: {
                code: "NOT_FOUND",
                message: "Шлях не знайдено. Перевірте наявність /api/v1/ у запиті."
            }
        });
    });

   
    app.use((err, req, res, next) => {
        if (err.message === 'CORS: Origin not allowed') {
            return res.status(403).json({
                error: { code: "CORS_ERROR", message: err.message }
            });
        }
        console.error("Помилка сервера:", err.stack);
        res.status(500).json({
            error: { code: "SERVER_ERROR", message: "Сталася внутрішня помилка сервера" }
        });
    });

    app.listen(PORT, () => {
        console.log(`\n=========================================`);
        console.log(` СЕРВЕР ЗАПУЩЕНО: http://localhost:${PORT}`);
        console.log(` CORS: Дозволено всі порти localhost`);
        console.log(`=========================================`);
    });
}

bootstrap().catch(error => {
    console.error("Failed to start application", error);
    process.exit(1);
});