const { db, initDb } = require('./database/db');

const seedDatabase = () => {
    console.log("--- Початок процесу заповнення бази (Seed) ---");

    db.serialize(() => {
        
        const users = [
            { name: 'baku_dev', email: 'baku.work@ukr.net' },
            { name: 'stalker_fan', email: 'vitya@zone.com' },
            { name: 'lovecraft_reader', email: 'cthulhu@ocean.sea' },
            { name: 'admin_security', email: 'admin@univ.edu.ua' }
        ];

        const randomUser = users[Math.floor(Math.random() * users.length)];
        const userSql = `INSERT OR IGNORE INTO Users (username, email, password) 
                         VALUES ('${randomUser.name}', '${randomUser.email}', 'pass_${Math.random().toString(36).substring(7)}')`;

        db.run(userSql, function (err) {
            if (err) return console.error("Помилка при створенні юзера:", err.message);

            const userId = this.lastID || 1;
            console.log(`✓ Користувач [${randomUser.name}] готовий (ID: ${userId})`);

            
            console.log("Додавання 10 випадкових ресурсів...");

            const titles = ['Основи шифрування', 'Мережева безпека', 'Таємниці Зони', 'Криптографія для чайників', 'Архітектура ПК'];
            const types = ['Стаття', 'Відео', 'Книга', 'Курс', 'Документація'];
            const authors = ['О. Баку', 'Н. Сідєльніков', 'Г. Лавкрафт', 'Дж. Коттон', 'І. Петренко'];

            for (let i = 0; i < 10; i++) {
                const title = titles[Math.floor(Math.random() * titles.length)] + ` (Частина ${i + 1})`;
                const url = `https://example.com/res-${Math.floor(Math.random() * 1000)}`;
                const type = types[Math.floor(Math.random() * types.length)];
                const author = authors[Math.floor(Math.random() * authors.length)];
                const desc = `Автоматично згенерований опис для ресурсу про ${title}.`;

                const resSql = `INSERT INTO Resources (title, url, type, author, description, userId) 
                                VALUES ('${title}', '${url}', '${type}', '${author}', '${desc}', ${userId})`;

                db.run(resSql, (err) => {
                    if (err) console.error(`Помилка на ресурсі ${i}:`, err.message);
                });
            }

            
            console.log("Додавання випадкових відгуків...");
            for (let j = 1; j <= 5; j++) {
                const rating = Math.floor(Math.random() * 5) + 1;
                const reviewSql = `INSERT INTO Reviews (resourceId, comment, rating) 
                                   VALUES (${j}, 'Автоматичний відгук номер ${j}', ${rating})`;
                db.run(reviewSql);
            }

            console.log("--- ЗАПОВНЕННЯ ЗАВЕРШЕНО! ---");
            console.log("Перевір папку data/app.db");
        });
    });
};


console.log("1. Перевірка таблиць...");
initDb(); 

console.log("2. Очікування ініціалізації...");
setTimeout(() => {
    seedDatabase(); 
}, 1000);