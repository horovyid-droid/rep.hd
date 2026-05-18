import { resourceService } from '../services/resourceService.js';

let columnName = null;
let allResources = [];

const btnResources = document.getElementById('btn-resources');
const btnUsers = document.getElementById('btn-users');
const sectionResources = document.getElementById('section-resources');
const sectionUsers = document.getElementById('section-users');
const usersTableBody = document.getElementById('users-table-body');

function showNotice(message, isError = false) {
    const noticeEl = document.getElementById('notice');
    if (!noticeEl) return;

    noticeEl.textContent = message;
    noticeEl.className = isError ? 'notice-error' : 'notice-success';
    noticeEl.style.display = 'block';

    setTimeout(() => {
        noticeEl.style.display = 'none';
    }, 5000);
}

function updateListStatus(message, isError = false) {
    const statusEl = document.getElementById('listStatus');
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.color = isError ? "red" : "#555";
    statusEl.style.display = message ? "block" : "none";
}


async function updateStatistics() {
    const statsContent = document.getElementById('stats-content');
    if (!statsContent) return;

    try {
        const response = await fetch('http://localhost:3001/api/v1/resources/count-by-type');
        if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

        const res = await response.json();

        if (!res.success || !res.stats || Object.keys(res.stats).length === 0) {
            statsContent.innerHTML = "<span>Наразі ресурсів немає</span>";
            return;
        }

        statsContent.innerHTML = Object.entries(res.stats)
            .map(([type, count]) => `
                <div class="stat-card">
                    <span class="stat-label">${type}</span>
                    <span class="stat-value">${count}</span>
                </div>
            `).join('');
    } catch (error) {
        console.error("Помилка завантаження статистики з бекенду:", error);
        statsContent.innerHTML = "<span style='color: red;'>Не вдалося завантажити статистику</span>";
    }
}

async function deleteResource(id) {
    if (confirm(`Ви впевнені, що хочете видалити ресурс №${id}?`)) {
        try {
            await resourceService.deleteResource(id);
            showNotice("Ресурс успішно видалено");
            allResources = [];
            await renderTable();
        } catch (error) {
            showNotice(`Помилка видалення: ${error.message}`, true);
        }
    }
}

window.deleteResource = deleteResource;

async function renderTable(filterText = "") {
    const tbody = document.getElementById('table-body');
    const listContainer = document.getElementById('listContainer');

    if (!tbody || !listContainer) return;

    try {
        if (!filterText && allResources.length === 0) {
            updateListStatus("Завантаження даних...");
            allResources = await resourceService.getAllResources();
        }

        
        await updateStatistics();

        let displayItems = allResources.filter(res =>
            res.title.toLowerCase().includes(filterText.toLowerCase()) ||
            res.author.toLowerCase().includes(filterText.toLowerCase())
        );

        if (displayItems.length === 0) {
            tbody.innerHTML = '';
            updateListStatus(filterText ? "Нічого не знайдено" : "Каталог порожній");
            listContainer.style.display = filterText ? 'block' : 'none';
            return;
        }

        updateListStatus("");
        listContainer.style.display = 'block';

        if (columnName) {
            displayItems.sort((a, b) => {
                const aVal = String(a[columnName] || '').toLowerCase();
                const bVal = String(b[columnName] || '').toLowerCase();
                return aVal < bVal ? 1 : (aVal > bVal ? -1 : 0);
            });
        }

        tbody.innerHTML = displayItems.map(res => `
            <tr>
                <td>${res.id}</td>
                <td>
                    <strong>${res.title}</strong><br>
                    <small class="res-desc">${res.description || ''}</small><br>
                    <a href="${res.url}" target="_blank" class="res-link">Відкрити посилання</a>
                </td>
                <td>${res.author || '—'}</td>
                <td><span class="badge">${res.type}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteResource('${res.id}')">Видалити</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Помилка:", error);
        updateListStatus(`Помилка підключення до сервера`, true);
    }
}

function loadUsersList() {
    if (!usersTableBody) return;
    usersTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Завантаження користувачів...</td></tr>';

    fetch('http://localhost:3001/api/v1/users')
        .then(response => {
            if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);
            return response.json();
        })
        .then(res => {
            usersTableBody.innerHTML = '';

            const users = res.data || res.users || res;

            if (!Array.isArray(users) || users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Користувачів не знайдено</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = `
                    <tr>
                        <td>${user.id || '-'}</td>
                        <td><strong>${user.username || 'Без імені'}</strong></td>
                        <td>${user.email || 'Не вказано'}</td>
                    </tr>
                `;
                usersTableBody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(err => {
            console.error('Помилка при отриманні користувачів:', err);
            usersTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Не вдалося завантажити користувачів. Перевірте бекенд!</td></tr>';
        });
}

if (btnResources && btnUsers && sectionResources && sectionUsers) {
    btnResources.addEventListener('click', (e) => {
        e.preventDefault();
        btnResources.classList.add('active');
        btnUsers.classList.remove('active');
        sectionResources.style.display = 'block';
        sectionUsers.style.display = 'none';
    });

    btnUsers.addEventListener('click', (e) => {
        e.preventDefault();
        btnUsers.classList.add('active');
        btnResources.classList.remove('active');
        sectionResources.style.display = 'none';
        sectionUsers.style.display = 'block';

        loadUsersList();
    });
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
            showNotice("Resource added successfully!");
            this.reset();
            allResources = [];
            await renderTable();
        } catch (error) {
            showNotice("Error: " + error.message, true);
        }
    });
}

const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        renderTable(e.target.value);
    });
}

const tableHeader = document.getElementById('tableHeader');
if (tableHeader) {
    tableHeader.addEventListener('click', (e) => {
        const th = e.target.closest('th');
        if (th && th.dataset.columnname) {
            columnName = th.dataset.columnname;
            renderTable(searchInput?.value || "");
        }
    });
}

renderTable();