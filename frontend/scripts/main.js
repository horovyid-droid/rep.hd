import { resourceService } from '../services/resourceService.js';

let columnName = null;


function showNotice(message, isError = false) {
    const noticeEl = document.getElementById('notice');
    if (!noticeEl) return;

    noticeEl.textContent = message;
    noticeEl.style.backgroundColor = isError ? '#f2dede' : '#dff0d8';
    noticeEl.style.color = isError ? '#a94442' : '#3c763d';
    noticeEl.style.border = `1px solid ${isError ? '#ebccd1' : '#d6e9c6'}`;
    noticeEl.style.display = 'block';

    setTimeout(() => {
        noticeEl.style.display = 'none';
    }, 5000);
}


function updateListStatus(message, isError = false) {
    const statusEl = document.getElementById('listStatus');
    if (!statusEl) {
        console.error("Не знайдено елемент listStatus у HTML!");
        return;
    }

    statusEl.textContent = message;
    statusEl.style.color = isError ? "red" : "#333";
    statusEl.style.display = message ? "block" : "none";
}


async function deleteResource(id) {
    if (confirm(`Ви впевнені, що хочете видалити ресурс №${id}?`)) {
        try {
            await resourceService.deleteResource(id);
            showNotice("Ресурс успішно видалено");
            await renderTable();
        } catch (error) {
            showNotice(`Помилка видалення: ${error.message}`, true);
        }
    }
}
window.deleteResource = deleteResource;


async function updateStatistics() {
    const statsDiv = document.getElementById('stats-display');
    if (!statsDiv) return;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch('http://localhost:3000/api/v1/resources/count-by-type', { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("Сервер повернув помилку");

        const data = await response.json();
        if (data.success && data.stats) {
            statsDiv.innerHTML = '<strong>Статистика за типами:</strong> ' +
                Object.entries(data.stats)
                    .map(([type, count]) => `<span><strong>${type}:</strong> ${count}</span>`)
                    .join(' | ');
        }
    } catch (error) {
        statsDiv.innerHTML = "Статистика тимчасово недоступна";
    }
}


async function renderTable() {
    const tbody = document.getElementById('table-body');
    const listContainer = document.getElementById('listContainer');

    if (!tbody || !listContainer) {
        console.error("Критична помилка: Не знайдено елементи таблиці в HTML.");
        return;
    }

    updateListStatus("Завантаження даних...");
    listContainer.style.display = 'none';
    tbody.innerHTML = '';

    try {
        const resources = await resourceService.getAllResources();

        
        await updateStatistics();

        if (!resources || resources.length === 0) {
            updateListStatus("У каталозі поки немає жодного ресурсу.");
            return;
        }

        updateListStatus(""); 
        listContainer.style.display = 'block';

        const items = [...resources];
        if (columnName) {
            items.sort((a, b) => {
                const aVal = String(a[columnName] || '').toLowerCase();
                const bVal = String(b[columnName] || '').toLowerCase();
                return aVal < bVal ? 1 : (aVal > bVal ? -1 : 0);
            });
        }

        tbody.innerHTML = items.map(res => `
            <tr>
                <td>${res.id}</td>
                <td>
                    <strong>${res.title}</strong><br>
                    <small>${res.description || ''}</small><br>
                    <a href="${res.url}" target="_blank" style="color: #007bff; text-decoration: none;">Відкрити посилання</a>
                </td>
                <td>${res.author || '—'}</td>
                <td><span class="badge">${res.type}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteResource('${res.id}')">Видалити</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Помилка рендерингу:", error);

        // Жорсткий захист від запуску через file://
        if (window.location.protocol === 'file:') {
            updateListStatus("КРИТИЧНА ПОМИЛКА: Браузер заблокував скрипти! Відкрийте сайт через Live Server (Go Live), а не подвійним кліком по файлу.", true);
            showNotice("Помилка CORS: запустіть Live Server!", true);
        } else {
            updateListStatus(`ПОМИЛКА: ${error.message}`, true);
            showNotice("Сервер недоступний.", true);
        }

        listContainer.style.display = 'none';
    }
}


const resourceForm = document.getElementById('resource-form');
if (resourceForm) {
    resourceForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const dto = {
            title: document.getElementById('res-title').value,
            url: document.getElementById('res-url').value,
            type: document.getElementById('res-type').value,
            author: document.getElementById('res-author').value,
            description: document.getElementById('res-description').value
        };

        try {
            await resourceService.addResource(dto);
            showNotice("Ресурс успішно додано!");
            this.reset();
            await renderTable();
        } catch (error) {
            showNotice("Не вдалося додати: " + error.message, true);
        }
    });
}


const tableHeader = document.getElementById('tableHeader');
if (tableHeader) {
    tableHeader.addEventListener('click', (e) => {
        const th = e.target.closest('th');
        if (th && th.dataset.columnname) {
            columnName = th.dataset.columnname;
            renderTable();
        }
    });
}


renderTable();