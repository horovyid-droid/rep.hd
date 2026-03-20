const { ResourceResponseDto, CreateResourceRequestDto } = require('../models/ResourceDto');

let resources = [];
let idCounter = 1;


exports.getAll = (req, res) => res.status(200).json(resources);


exports.getById = (req, res) => {
    const item = resources.find(r => r.id === parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Ресурс не знайдено" } });
    res.status(200).json(item);
};


exports.create = (req, res) => {
    const dto = new CreateResourceRequestDto(req.body);
    if (!dto.title || !dto.url) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Назва та URL обов'язкові" } });
    }
    const newRes = new ResourceResponseDto(idCounter++, dto.title, dto.url, dto.type);
    resources.push(newRes);
    res.status(201).json(newRes);
};


exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = resources.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: { message: "Немає що оновлювати" } });

    const { title, url } = req.body;
    resources[index] = { ...resources[index], title: title || resources[index].title, url: url || resources[index].url };
    res.status(200).json(resources[index]);
};


exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = resources.length;
    resources = resources.filter(r => r.id !== id);
    if (resources.length === initialLength) return res.status(404).json({ error: { message: "ID не знайдено" } });
    res.status(204).send();
};