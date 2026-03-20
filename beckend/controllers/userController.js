const { UserResponseDto, CreateUserRequestDto, UpdateUserRequestDto } = require('../models/UserDto');
let users = [];
let userIdCounter = 1;

exports.getAll = (req, res) => res.json(users);

exports.getById = (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ error: { message: "Користувача не знайдено" } });
    res.json(user);
};

exports.create = (req, res) => {
    const { username, email } = req.body;
    if (!username || !email) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Username та Email обов'язкові" } });
    }
    const newUser = new UserResponseDto(userIdCounter++, username, email);
    users.push(newUser);
    res.status(201).json(newUser);
};

exports.update = (req, res) => {
    const id = parseInt(req.params.id);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: { message: "Користувача не знайдено" } });

    const { username, email } = req.body;
    users[index] = { ...users[index], username: username || users[index].username, email: email || users[index].email };
    res.json(users[index]);
};

exports.delete = (req, res) => {
    const id = parseInt(req.params.id);
    users = users.filter(u => u.id !== id);
    res.status(204).send();
};