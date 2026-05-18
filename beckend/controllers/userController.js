const { UserResponseDto, CreateUserRequestDto, UpdateUserRequestDto } = require('../models/UserDto');
const { db } = require('../database/db'); 

exports.getAll = (req, res) => {
    const selectSql = "SELECT id, username, email FROM Users";

    db.all(selectSql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: { message: err.message } });
        }

       
        if (!rows || rows.length === 0) {
            console.log("👉 База порожня! Додаю користувачів прямо з контролера...");

            const insertSql = `INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`;

            db.run(insertSql, ["admin_baku", "admin@kiev.ua", "hashed_123"], () => {
                db.run(insertSql, ["student_group11", "student11@kiev.ua", "hashed_456"], () => {
                    db.run(insertSql, ["teacher_test", "teacher@kiev.ua", "hashed_789"], () => {
                      
                        db.all(selectSql, [], (errAfter, rowsAfter) => {
                            if (errAfter) return res.status(500).json({ error: { message: errAfter.message } });
                            const dtos = rowsAfter.map(r => new UserResponseDto(r.id, r.username, r.email));
                            return res.json(dtos);
                        });
                    });
                });
            });
        } else {
         
            const dtos = rows.map(r => new UserResponseDto(r.id, r.username, r.email));
            res.json(dtos);
        }
    });
};

exports.getById = (req, res) => {
    const id = parseInt(req.params.id);
    db.get("SELECT id, username, email FROM Users WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: { message: err.message } });
        if (!row) return res.status(404).json({ error: { message: "Користувача не знайдено" } });
        res.json(new UserResponseDto(row.id, row.username, row.email));
    });
};

exports.create = (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Username та Email обов'язкові" } });
    }

   
    const pwd = password || 'default_pass_123';
    const insertSql = `INSERT INTO Users (username, email, password) VALUES (?, ?, ?)`;

    db.run(insertSql, [username, email, pwd], function (err) {
        if (err) return res.status(500).json({ error: { message: err.message } });
        res.status(201).json(new UserResponseDto(this.lastID, username, email));
    });
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const { username, email } = req.body;

    db.get("SELECT * FROM Users WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: { message: err.message } });
        if (!row) return res.status(404).json({ error: { message: "Користувача не знайдено" } });

        const updatedUsername = username || row.username;
        const updatedEmail = email || row.email;

        db.run("UPDATE Users SET username = ?, email = ? WHERE id = ?", [updatedUsername, updatedEmail, id], function (updateErr) {
            if (updateErr) return res.status(500).json({ error: { message: updateErr.message } });
            res.json(new UserResponseDto(id, updatedUsername, updatedEmail));
        });
    });
};

exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    db.run("DELETE FROM Users WHERE id = ?", [id], function (err) {
        if (err) return res.status(500).json({ error: { message: err.message } });
        res.status(204).send();
    });
};