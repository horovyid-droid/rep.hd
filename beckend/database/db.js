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

const initDb = () => {
    db.serialize(() => {
       
        db.run('PRAGMA foreign_keys = ON');

        
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )`);

       
        db.run(`CREATE TABLE IF NOT EXISTS Resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            type TEXT,
            author TEXT,
            description TEXT,
            userId INTEGER,
            FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
        )`);

        
        db.run(`CREATE TABLE IF NOT EXISTS Reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resourceId INTEGER NOT NULL,
            comment TEXT,
            rating INTEGER,
            FOREIGN KEY (resourceId) REFERENCES Resources(id) ON DELETE CASCADE
        )`);

        console.log("Всі три таблиці (Users, Resources, Reviews) готові!");
    });
};

module.exports = { db, initDb };