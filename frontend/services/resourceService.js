class ResourceService {
    constructor() {
        
        this.baseUrl = 'http://localhost:3000/api/v1/resources';
    }

    /**
     *  (GET)
     */
    async getAllResources() {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const response = await fetch(this.baseUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Сервер повернув помилку: ${response.status}`);
            }

            return await response.json();
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

    /**
     * (POST)
     */
    async addResource(dto) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    /**
     * (DELETE)
     */
    async deleteResource(id) {
        try {
            const response = await fetch(`${this.baseUrl}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`Не вдалося видалити (ID: ${id})`);
            }

            return true;
        } catch (error) {
            console.error('Сервіс: помилка при видаленні:', error);
            throw error;
        }
    }
}

export const resourceService = new ResourceService();