const { db } = require('../database/db');
const { ResourceResponseDto, CreateResourceRequestDto } = require('../models/ResourceDto');


exports.getCount = (req, res) => {
    const sql = "SELECT type, COUNT(*) as count FROM Resources GROUP BY type";

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const result = {};
        rows.forEach(row => {
            const typeName = row.type || 'Інше';
            result[typeName] = row.count;
        });

        res.status(200).json({ success: true, result });
    });
};


exports.getAll = (req, res) => {
    const { type, sort } = req.query;

    let sql = "SELECT * FROM Resources WHERE 1=1";
    let params = [];

    if (type) {
        sql += " AND type = ?";
        params.push(type);
    }

    if (sort === 'title') {
        sql += " ORDER BY title ASC";
    } else {
        sql += " ORDER BY id DESC";
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        const formattedResources = rows.map(r => new ResourceResponseDto(r.id, r.title, r.url, r.type));
        res.status(200).json(formattedResources);
    });
};


exports.getById = (req, res) => {
    const id = parseInt(req.params.id);
    const sql = "SELECT * FROM Resources WHERE id = ?";

    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        if (!row) {
            return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ресурс не знайдено" } });
        }

        const item = new ResourceResponseDto(row.id, row.title, row.url, row.type);
        res.status(200).json(item);
    });
};


exports.create = (req, res) => {
    const currentUserId = req.headers['xdemo-userid'];
    if (!currentUserId) {
        return res.status(401).json({ error: { message: "Неавторизовано: відсутній XDemo-UserId" } });
    }

    const dto = new CreateResourceRequestDto(req.body);

    if (!dto.title || !dto.url) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Назва та URL обов'язкові" } });
    }

    
    const sql = "INSERT INTO Resources (title, url, type, userId) VALUES (?, ?, ?, ?)";
    const params = [dto.title, dto.url, dto.type, parseInt(currentUserId)];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const newRes = new ResourceResponseDto(this.lastID, dto.title, dto.url, dto.type);
        res.status(201).json(newRes);
    });
};


exports.update = (req, res) => {
    const currentUserId = req.headers['xdemo-userid'];
    if (!currentUserId) {
        return res.status(401).json({ error: { message: "Неавторизовано: відсутній XDemo-UserId" } });
    }

    const id = parseInt(req.params.id);
    const { title, url, type } = req.body;

    
    db.get("SELECT * FROM Resources WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: { message: "Немає об'єкта для оновлення" } });

        
        if (row.userId !== parseInt(currentUserId)) {
            return res.status(403).json({ error: { message: "Доступ заборонено: ви не є власником цього ресурсу" } });
        }

        const updatedTitle = title || row.title;
        const updatedUrl = url || row.url;
        const updatedType = type || row.type;

        const updateSql = "UPDATE Resources SET title = ?, url = ?, type = ? WHERE id = ?";
        db.run(updateSql, [updatedTitle, updatedUrl, updatedType, id], function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const updatedResource = new ResourceResponseDto(id, updatedTitle, updatedUrl, updatedType);
            res.status(200).json(updatedResource);
        });
    });
};


exports.delete = (req, res) => {
    const currentUserId = req.headers['xdemo-userid'];
    if (!currentUserId) {
        return res.status(401).json({ error: { message: "Неавторизовано: відсутній XDemo-UserId" } });
    }

    const id = parseInt(req.params.id);

    
    db.get("SELECT userId FROM Resources WHERE id = ?", [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: { message: "ID не знайдено" } });

        
        if (row.userId !== parseInt(currentUserId)) {
            return res.status(403).json({ error: { message: "Доступ заборонено: ви не можете видалити чужий ресурс" } });
        }

        db.run("DELETE FROM Resources WHERE id = ?", [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(204).send();
        });
    });
};