async function deleteResource(id) {
    if (confirm(`Ви впевнені, що хочете видалити ресурс №${id}?`)) {
        await resourceService.deleteResource(id);
        await renderTable();
    }
}

let columnName = null;


async function updateStatistics() {
    const statsDiv = document.getElementById('stats-display');
    if (!statsDiv) return;

    try {
        const response = await fetch('http://localhost:3000/api/resources/count-by-type');
        const result = await response.json();

        if (result.success) {
            const stats = result.stats;
           
            statsDiv.innerHTML = Object.entries(stats)
                .map(([type, count]) => `<span><strong>${type}:</strong> ${count}</span>`)
                .join(' | ');
        }
    } catch (error) {
        console.error("Помилка оновлення статистики:", error);
    }
}

async function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    const resources = await resourceService.getAllResources();

    
    await updateStatistics();

    tbody.innerHTML = '';

    const items = resources.slice();
    items.sort((a, b) => {
        if (!columnName) return a.id - b.id;

        const aValue = a[columnName];
        const bValue = b[columnName];

        
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    });

    items.forEach(res => {
        const row = `
            <tr>
                <td>${res.id}</td>
                <td>
                    <strong>${res.title}</strong><br>
                    <small>${res.description || ''}</small><br>
                    <a href="${res.url}" target="_blank" style="color: blue;">Відкрити ресурс</a>
                </td>
                <td>${res.author || 'Не вказано'}</td>
                <td>${res.type}</td>
                <td>
                    <button style="background: #ff4d4d; color: white; border: none; padding: 5px; cursor: pointer; border-radius: 3px;" 
                            onclick="deleteResource(${res.id})">
                        Видалити
                    </button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

document.getElementById('resource-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const dto = new CreateResourceRequestDto(
        document.getElementById('res-title').value,
        document.getElementById('res-url').value,
        document.getElementById('res-type').value,
        document.getElementById('res-author').value,
        document.getElementById('res-description').value
    );

    await resourceService.addResource(dto);
    await renderTable();
    this.reset();
});


renderTable();


const tableHeader = document.getElementById('tableHeader');
if (tableHeader) {
    tableHeader.addEventListener('click', (event) => {
        const target = event.target;
        const localColumnName = target.dataset.columnname;

        if (localColumnName) {
            columnName = localColumnName;
            renderTable();
        }
    });
}