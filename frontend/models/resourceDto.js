// Модель для створення
class CreateResourceRequestDto {
    constructor(title, url, type, author, description) {
        this.title = title;
        this.url = url;
        this.type = type;
        this.author = author;
        this.description = description;
    }
}

// Модель для оновлення
class UpdateResourceRequestDto {
    constructor(title, url, type, author, description) {
        this.title = title;
        this.url = url;
        this.type = type;
        this.author = author;
        this.description = description;
    }
}

// Модель для відповіді
class ResourceResponseDto {
    constructor(id, title, url, type, author, description) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.type = type;
        this.author = author;
        this.description = description;
    }
}