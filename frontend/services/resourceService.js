class ResourceService {
    constructor() {
        this.baseUrl = 'http://localhost:3001/api/v1/resources';
        this.currentUserId = '2'; 
    }

    async getResourceStats() {
        try {
            const response = await fetch(`${this.baseUrl}/count`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Статистика недоступна: ${response.status}`);
            }

            const data = await response.json();
           
            return data.result || {};
        } catch (error) {
            console.error('Сервіс: помилка при отриманні статистики:', error);
            throw error;
        }
    }

    async getAllResources(searchQuery = '') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const url = searchQuery
                ? `${this.baseUrl}?search=${encodeURIComponent(searchQuery)}`
                : this.baseUrl;

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Сервер повернув помилку: ${response.status}`);
            }

            const result = await response.json();

            
            return result.data || result;
        } catch (error) {
            console.error('Сервіс: помилка при отриманні:', error);

            let friendlyMessage = "Помилка зв'язку з сервером";

            if (error.name === 'AbortError') {
                friendlyMessage = "Сервер не відповів вчасно (Таймаут 3с).";
            } else if (error instanceof TypeError || error.message.includes('fetch')) {
                friendlyMessage = "Бекенд недоступний. Запустіть сервер (node app.js)";
            } else {
                friendlyMessage = error.message;
            }

            throw new Error(friendlyMessage);
        }
    }

    async addResource(dto) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'XDemo-UserId': this.currentUserId
                },
                body: JSON.stringify(dto)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Помилка додавання (${response.status})`);
            }

            return await response.json();
        } catch (error) {
            console.error('Сервіс: помилка при додаванні:', error);
            throw error;
        }
    }

    async deleteResource(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'XDemo-UserId': this.currentUserId
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Не вдалося видалити (ID: ${id})`);
            }

            return true;
        } catch (error) {
            console.error('Сервіс: помилка при видаленні:', error);
            throw error;
        }
    }
}

export const resourceService = new ResourceService();