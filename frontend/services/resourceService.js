class ResourceService {
    constructor() {
        this.resources = [];
        this.counter = 1;
    }

    addResource(dto) {
        const newRes = new ResourceResponseDto(
            this.counter++,
            dto.title,
            dto.url,
            dto.type,
            dto.author,
            dto.description
        );
        this.resources.push(newRes);
        return newRes;
    }

    getAllResources() {
        return this.resources;
    }

    deleteResource(id) {
        this.resources = this.resources.filter(res => res.id !== id);
    }

    updateResource(id, updateDto) {
        const index = this.resources.findIndex(res => res.id === id);
        if (index !== -1) {
            this.resources[index] = { ...this.resources[index], ...updateDto };
            return this.resources[index];
        }
        return null;
    }
}

// Створюємо екземпляр сервісу відразу тут
const resourceService = new ResourceService();