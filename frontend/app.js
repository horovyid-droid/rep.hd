import { resourceService } from './services/resourceService.js';


const form = document.getElementById('resource-form');
const tableBody = document.getElementById('table-body');
const statsContent = document.getElementById('stats-content');


async function refreshData() {
    try {
        
        const resources = await resourceService.getAllResources();
        render(resources);

        
        if (statsContent) {
            statsContent.textContent = `Всього в базі: ${resources.length}`;
        }
    } catch (error) {
        console.error('Помилка завантаження:', error);
        
        tableBody.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">${error.message}</td></tr>`;
    }
}


function render(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Ресурсів поки немає. Додайте перший!</td></tr>';
        return;
    }

    data.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>
                <a href="${item.url}" target="_blank"><strong>${item.title}</strong></a><br>
                <small>${item.description || 'Опис відсутній'}</small>
            </td>
            <td>${item.author}</td>
            <td><span class="badge">${item.type}</span></td>
            <td>
                <button class="btn-delete" data-id="${item.id}">Видалити</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newItem = {
        title: document.getElementById('res-title').value,
        url: document.getElementById('res-url').value,
        type: document.getElementById('res-type').value,
        author: document.getElementById('res-author').value,
        description: document.getElementById('res-description').value
    };

    try {
        await resourceService.addResource(newItem);
        form.reset();
        await refreshData(); 
    } catch (error) {
        alert('Не вдалося додати ресурс: ' + error.message);
    }
});


tableBody.addEventListener('click', async (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const id = e.target.dataset.id;

        if (confirm(`Ви впевнені, що хочете видалити ресурс #${id}?`)) {
            try {
                await resourceService.deleteResource(id);
                await refreshData(); 
            } catch (error) {
                alert('Помилка при видаленні: ' + error.message);
            }
        }
    }
});


refreshData();