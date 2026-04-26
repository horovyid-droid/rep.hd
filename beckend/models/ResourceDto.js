
class ResourceResponseDto {
    constructor(id, title, url, type, author, description) {
        this.id = id;
        this.title = title;
        this.url = url;
        this.type = type || "unknown";      this.author = author || "anonymous";
        this.description = description || "";
    }
}


class CreateResourceRequestDto {
    constructor(data) {
        this.title = data.title || data.name;
        this.url = data.url;
        this.type = data.type;
    }
}

module.exports = { ResourceResponseDto, CreateResourceRequestDto };