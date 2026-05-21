import { resourceService } from '../services/resourceService.js';

let columnName = null;
let allResources = [];

const btnResources = document.getElementById('btn-resources');
const btnUsers = document.getElementById('btn-users');
const sectionResources = document.getElementById('section-resources');
const sectionUsers = document.getElementById('section-users');
const usersTableBody = document.getElementById('users-table-body');

function escapeHTML(str) {
    if (!str) return '';
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

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
        const response = await fetch('http://localhost:3001/api/v1/resources/count');
        if (!response.ok) throw new Error(`Помилка сервера: ${response.status}`);

        const res = await response.json();
      
        const stats = res.result || res.stats || res;

        if (!stats || Object.keys(stats).length === 0) {
            statsContent.innerHTML = "<span>Наразі ресурсів немає</span>";
            return;
        }

        statsContent.innerHTML = Object.entries(stats)
            .map(([type, count]) => `
                <div class="stat-card">
                    <span class="stat-label">${escapeHTML(type)}</span>
                    <span class="stat-value">${escapeHTML(String(count))}</span>
                </div>
            `).join('');
    } catch (error) {
        console.error("Помилка статистики:", error);
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

           
            const data = await resourceService.getAllResources();
            allResources = Array.isArray(data) ? data : [];
        }

        await updateStatistics();

        let displayItems = allResources.filter(res =>
            (res.title && res.title.toLowerCase().includes(filterText.toLowerCase())) ||
            (res.author && res.author.toLowerCase().includes(filterText.toLowerCase()))
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
                <td>${escapeHTML(String(res.id))}</td>
                <td>
                    <strong>${escapeHTML(res.title)}</strong><br>
                    <small class="res-desc">${escapeHTML(res.description || '')}</small><br>
                    <a href="${escapeHTML(res.url)}" target="_blank" class="res-link">Відкрити посилання</a>
                </td>
                <td>${escapeHTML(res.author || '—')}</td>
                <td><span class="badge">${escapeHTML(res.type)}</span></td>
                <td>
                    <button class="delete-btn" onclick="deleteResource('${res.id}')">Видалити</button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Помилка рендеру:", error);
        updateListStatus(`Помилка: ${error.message}`, true);
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
                        <td>${escapeHTML(String(user.id || '-'))}</td>
                        <td><strong>${escapeHTML(user.username || 'Без імені')}</strong></td>
                        <td>${escapeHTML(user.email || 'Не вказано')}</td>
                    </tr>
                `;
                usersTableBody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(err => {
            console.error('Помилка при отриманні користувачів:', err);
            usersTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Не вдалося завантажити користувачів.</td></tr>';
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