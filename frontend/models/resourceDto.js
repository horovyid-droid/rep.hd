
class CreateResourceRequestDto {
    constructor(title, url, type, author, description) {
        this.title = title;
        this.url = url;
        this.type = type;
        this.author = author;
        this.description = description;
    }
}


class UpdateResourceRequestDto {
    constructor(title, url, type, author, description) {
        this.title = title;
        this.url = url;
        this.type = type;
        this.author = author;
        this.description = description;
    }
}


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