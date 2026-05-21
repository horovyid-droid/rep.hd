const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../data');
const dbPath = path.join(dbDir, 'app.db');

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Помилка підключення до БД:', err.message);
    else console.log('База підключена: ' + dbPath);
});


function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ changes: this.changes, lastID: this.lastID });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}


function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

const initDb = async () => {
    try {
        await run('PRAGMA foreign_keys = ON');

        await run(`CREATE TABLE IF NOT EXISTS Users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )`);

        await run(`CREATE TABLE IF NOT EXISTS Resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                url TEXT NOT NULL,
                type TEXT,
                author TEXT,
                description TEXT,
                userId INTEGER,
                FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
            )`);

        await run(`CREATE TABLE IF NOT EXISTS Reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                resourceId INTEGER NOT NULL,
                comment TEXT,
                rating INTEGER,
                FOREIGN KEY (resourceId) REFERENCES Resources(id) ON DELETE CASCADE
            )`);

        console.log("All tables (Users, Resources, Reviews) are ready!");

        const row = await get("SELECT COUNT(*) as count FROM Users");

        if (row && row.count === 0) {
            console.log("👉 Таблиця Users порожня. Записую тестових користувачів...");

            const insert = `INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`;

            
            await run(insert, ["admin_b", "admin@kiev.ua", "hashed_pass_123"]);
            await run(insert, ["student_group11", "student11@kiev.ua", "hashed_pass_456"]);
            await run(insert, ["teacher_test", "teacher@kiev.ua", "hashed_pass_789"]);

            console.log("✅ Тестові користувачі успішно додані в базу даних!");
        } else {
            console.log(`ℹ️ У базі вже є користувачі (${row ? row.count : 0} шт.).`);
        }

    } catch (error) {
        console.error("❌ Помилка ініціалізації бази даних:", error);
    }
};


module.exports = { db, initDb, run, get, all };