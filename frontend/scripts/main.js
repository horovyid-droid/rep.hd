function deleteResource(id) {
    if (confirm(`Ви впевнені, що хочете видалити ресурс №${id}?`)) {
        resourceService.deleteResource(id);
        renderTable();
    }
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    resourceService.getAllResources().forEach(res => {
        const row = `
            <tr>
                <td>${res.id}</td>
                <td>
                    <strong>${res.title}</strong><br>
                    <small>${res.description}</small><br>
                    <a href="${res.url}" target="_blank" style="color: blue;">Відкрити ресурс</a>
                </td>
                <td>${res.author}</td>
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

document.getElementById('resource-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const dto = new CreateResourceRequestDto(
        document.getElementById('res-title').value,
        document.getElementById('res-url').value,
        document.getElementById('res-type').value,
        document.getElementById('res-author').value,
        document.getElementById('res-description').value
    );

    resourceService.addResource(dto);
    renderTable();
    this.reset();
});