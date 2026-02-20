let resources = [];

const form = document.getElementById('resource-form');
const tableBody = document.getElementById('table-body');

function render() {
    tableBody.innerHTML = '';
    resources.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <a href="${item.url}" target="_blank"><strong>${item.title}</strong></a><br>
                <small>${item.description}</small>
            </td>
            <td>${item.author}</td>
            <td>${item.type}</td>
            <td><button onclick="deleteItem(${index})">Видалити</button></td>
        `;
        tableBody.appendChild(row);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newItem = {
        title: document.getElementById('res-title').value,
        url: document.getElementById('res-url').value,
        type: document.getElementById('res-type').value,
        author: document.getElementById('res-author').value,
        description: document.getElementById('res-description').value
    };

    resources.push(newItem);
    form.reset();
    render();
});

window.deleteItem = (index) => {
    resources.splice(index, 1);
    render();
};