const { ResourceResponseDto, CreateResourceRequestDto } = require('../models/ResourceDto');

let resources = [];
let idCounter = 1;

// Отримати всі ресурси
exports.getAll = (req, res) => {
    res.status(200).json(resources);
};

// Отримати за ID
exports.getById = (req, res) => {
    const item = resources.find(r => r.id === parseInt(req.params.id));
    if (!item) {
        return res.status(404).json({
            error: { code: "NOT_FOUND", message: "Ресурс не знайдено" }
        });
    }
    res.status(200).json(item);
};

// Створити новий ресурс
exports.create = (req, res) => {
    const dto = new CreateResourceRequestDto(req.body);

    if (!dto.title || !dto.url) {
        return res.status(400).json({
            error: { code: "VALIDATION_ERROR", message: "Назва та URL обов'язкові" }
        });
    }

    const newRes = new ResourceResponseDto(idCounter++, dto.title, dto.url, dto.type);
    resources.push(newRes);
    res.status(201).json(newRes);
};

// Оновити ресурс
exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = resources.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(404).json({
            error: { message: "Немає об'єкта для оновлення" }
        });
    }

    const { title, url, type } = req.body;

    // Оновлюємо, зберігаючи структуру через DTO
    const updatedResource = new ResourceResponseDto(
        id,
        title || resources[index].title,
        url || resources[index].url,
        type || resources[index].type
    );

    resources[index] = updatedResource;
    res.status(200).json(updatedResource);
};

// Видалити ресурс
exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = resources.length;

    resources = resources.filter(r => r.id !== id);

    if (resources.length === initialLength) {
        return res.status(404).json({
            error: { message: "ID не знайдено" }
        });
    }

    res.status(204).send();
};