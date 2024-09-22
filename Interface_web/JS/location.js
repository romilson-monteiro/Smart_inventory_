import { ip } from './config/config.js';
const token = localStorage.getItem("token");
// Função para carregar as localizações na tabela
function loadLocations() {
    const tableBody = document.getElementById('locations_table_body');
    tableBody.innerHTML = '';
    



    fetch(`http://${ip}:4242/api/Locations`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }

    )
        .then(response => response.json())
        .then(data => {
            data.forEach(location => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${location.id}</td>
                    <td>${location.name}</td>
                    <td>${location.floor}</td>
                    <td>${location.description}</td>
                    <td class="action-icons">
                            <a href="#" title="Edit"><i class="fas fa-edit edit_asset_btn"></i></a>
                            <a href="#" title="Delete"><i class="fas fa-trash-alt delete_asset_btn"></i></a>
                        </td>
                `;
                tableBody.appendChild(tr);
            });
        });



}
const locationsTableBody = document.getElementById('locations_table_body');
locationsTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit_asset_btn')) {
        const locationId = e.target.closest('tr').children[0].textContent;
        editLocation(locationId);

    } else if (e.target.classList.contains('delete_asset_btn')) {
        const locationId = e.target.closest('tr').children[0].textContent;
        deleteLocation(locationId);
    }
});



// Função para adicionar uma nova localização
function addLocation(name, floor) {
    const newLocation = {
        name,
        floor
    };
    
    fetch(`http://${ip}:4242/api/Locations/create`,
         {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newLocation)
    })
        .then(response => response.json())
        .then(data => {
            
            loadLocations();
        })
        .catch(error => {
            console.log('An error occurred');
        });





    closeForm();
    loadLocations();
}

// Função para editar uma localização
function editLocation(id) {
    
    fetch(`http://${ip}:4242/api/Locations/${id}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        }

    )
        .then(response => response.json())
        .then(data => {
            console.log(data);
            console.log(data.name);
            document.getElementById('new_location_name').value = data.name;
            document.getElementById('new_location_floor').value = data.floor;
            document.querySelector('.new_form').setAttribute('locationId', data.id);
            document.querySelector('.new_form').setAttribute('data-edit-mode', 'true');
            document.getElementById('title_add_edit_location_form').textContent = 'Editar Localização';
            document.querySelector('.new_form').style.display = 'block';
        })
        .catch(error => {
            console.log('An error occurred');
        });



   
}

// Função para atualizar uma localização editada
function updateLocation(id, name, floor) {
    const updatedLocation = {
        id,
        name,
        floor
    };

    fetch(`http://${ip}:4242/api/Locations/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedLocation)
    })
        .then(response => response.json())
        .then(data => {
        })
        .catch(error => {
            console.log('An error occurred');
        });

    closeForm();
    loadLocations();
}

// Função para deletar uma localização
function deleteLocation(id) {
    fetch(`http://${ip}:4242/api/Locations/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }

    })
        .then(response => response.json())
        .then(data => {
            loadLocations();
        })
        .catch(error => {
            console.log('An error occurred');
        });
    loadLocations();
}

// Função para fechar o formulário de adicionar/editar localização
function closeForm() {
    document.getElementById('new_location_name').value = '';
    document.getElementById('new_location_floor').value = '';
    document.querySelector('.new_form').setAttribute('locationId', '');
    document.querySelector('.new_form').setAttribute('data-edit-mode', 'false');
    document.getElementById('title_add_edit_location_form').textContent = 'Adicionar Nova Localização';
    document.querySelector('.new_form').style.display = 'none';
}

// Event Listeners
document.getElementById('create_location_button').addEventListener('click', () => {
    document.querySelector('.new_form').style.display = 'block';
});

document.getElementById('cancel_button').addEventListener('click', (e) => {
    e.preventDefault();
    closeForm();
});

document.getElementById('add_new_location_button').addEventListener('click', (e) => {
    e.preventDefault();
    const name = document.getElementById('new_location_name').value.trim();
    const floor = document.getElementById('new_location_floor').value.trim();

    if (!name || !floor ) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    const editMode = document.querySelector('.new_form').getAttribute('data-edit-mode') === 'true';
    const locationId = parseInt(document.querySelector('.new_form').getAttribute('locationId'));

    if (editMode) {
        updateLocation(locationId, name, floor);
    } else {
        addLocation(name, floor);
    }
});

window.onload = function () {
    loadLocations();
};
