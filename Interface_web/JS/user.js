
// ****************************************************************************************************
// Declaracoes de variaveis globais
// ****************************************************************************************************
const usersTableBody = document.getElementById("users_table_body");
const open_new_user_form_button = document.querySelector("#create_user_button");
const add_edit_user_form = document.querySelector(".new_form");
const add_new_user_button = document.querySelector("#add_new_user_button");
const cancel_user_button = document.querySelector("#cancel_user_button");
const search_button = document.querySelector("#search_button");

const searchResult = document.getElementById('searchResult')
const close_search_result = document.getElementById('close_search_result');
 

import { ip } from './config/config.js';

// const logoutButton = document.getElementById("logout-button");
// logoutButton.addEventListener("click", () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     window.location.href = "../HTML/login.html";

// });  // Após sucesso do registro

close_search_result.addEventListener('click', () => {
    searchResult.style.display = 'none';
    document.getElementById('search').value = '';
    getAllUsers();
});

// ****************************************************************************************************
// Event Listeners
// ****************************************************************************************************

cancel_user_button.addEventListener("click", toggleNewUserForm);

search_button.addEventListener("click", searchUser);

document.addEventListener("DOMContentLoaded", (e) => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../HTML/login.html";
    }
    getAllUsers()
})
usersTableBody.addEventListener("click", handleUserClick);
open_new_user_form_button.addEventListener("click", toggleNewUserForm);
add_new_user_button.addEventListener("click", add_or_edit_user);

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Funcoes 
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function add_or_edit_user() {

    const name = document.querySelector("#new_user_name").value;
    const phone = document.querySelector("#new_user_phone_number").value;
    const email = document.querySelector("#new_user_email").value;
    const role = document.querySelector("#new_user_role").value;
    const password = document.querySelector("#new_user_password").value;

    const data = { name, phone, email, role, password };
   
    // Check if you are in edit mode or add mode
    const isEditMode = add_edit_user_form.getAttribute("data-edit-mode") === "true";
    let userId = document.querySelector("#edit_user_id").value;

    console.log(data);

    // URL for API endpoint
    const url = isEditMode ? `http://${ip}:4242/api/user/${userId}` : `http://${ip}:4242/api/user/register/`;

    // HTTP method for API request
    const method = isEditMode ? "PUT" : "POST";

    // Configuration for the fetch request
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(data),

    };

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to make the API request');
            }
        })
        .then(data => {
            console.log(data);
          



            toggleNewUserForm();
            getAllUsers();

        })
        .catch(error => {
            console.error(error);
        });

    // Additional code for updating the table, closing the form, etc.
}


function handleUserClick(event) {
    const target = event.target;

    const clickedRow = event.target.closest('tr');

    const id = clickedRow.querySelector('td:nth-child(1)').textContent;
  

    // Verifica se o clique ocorreu em um ícone de ação
    if (target.classList.contains("delete_user_btn")) {
        deleteUser(id);
    } else if (target.classList.contains("edit_user_btn")) {

        add_edit_user_form.setAttribute("data-edit-mode", "true");
        setEditUserFormData(id);
        toggleNewUserForm();
    } else if (target.classList.contains("aruco_asset_btn")) {
        const aruco_id = target.getAttribute("aruco_id");
        const aruco_name = target.getAttribute("aruco_name");
        window.location.href = `../HTML/aruco.html?aruco_id=${aruco_id}&aruco_name=${aruco_name}`;
    }
}

let add_user_to_table = (id, name, email, phone, role, aruco_id,location_description,location_last_update) => {
    const table_body = document.querySelector("#users_table_body");
    table_body.innerHTML += `
        <tr>
            <td>${id}</td>
            <td>${name}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td>${role}</td>
            <td>${location_description}</td>
            <td>${location_last_update}</td>
            <td class="action-icons">
                <a href="#" title="Edit"><i class="fas fa-edit edit_user_btn"></i></a>
                <a href="#" title="Delete"><i class="fas fa-trash-alt delete_user_btn"></i></a>
                 <a href="#" title="Aruco"><i class="fas fa-qrcode aruco_asset_btn" aruco_id="${aruco_id}" aruco_name="${name}"></i></a>
            </td>
        </tr>
    `
}

let getAllUsers = () => {
    const baseUrl = `http://${ip}:4242/api/user/`;
    const url = new URL(baseUrl);

    fetch(url,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        }
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(users => {

            const tableBody = document.getElementById("users_table_body");
            tableBody.innerHTML = "";

            if (users && users.length > 0) {
                users.forEach(user => {
                    const location = user.location;
                    let location_description;
                    let last_update;
                    if (!location) {
                        location_description =  "Desconhecido";
                        // se  coloccar que foi  agora agora no last_update
                        last_update = 'N/A';

                    
                    } else {
                        location_description = location.description ? location.description : 'Desconhecido';
                        last_update = user.location_last_update ? new Date(location.location_last_update).toLocaleString() : '';
                    }

                    
                    add_user_to_table(user["id"],  user["name"], user["email"], user["phone"], user["role"], user["aruco_id"], location_description, last_update );
                });
            } else {
                console.log("Nenhum usuário encontrado na resposta da API.");
            }
        })
        .catch(error => {
            console.error(`Erro ao obter usuários: ${error.message}`);
        });
}

function blurrbackground() {
    const right_container = document.querySelector(".right_container");
    const left_container = document.querySelector(".left_container");
   
    right_container.style.filter = "blur(0.79px)";
    left_container.style.filter = "blur(0.79px)";
    right_container.style.pointerEvents = "none";
    left_container.style.pointerEvents = "none";
}

function Noblurrbackground() {
    const right_container = document.querySelector(".right_container");
    const left_container = document.querySelector(".left_container");
    right_container.style.filter = "none";
    left_container.style.filter = "none";
    right_container.style.pointerEvents = "auto";
    left_container.style.pointerEvents = "auto";
}
function deleteUser(userId) {
    const cancel_btn = document.querySelector("#cancel_btn")
    const confirm_btn = document.querySelector("#confirm_btn")
    const confirmation_form = document.querySelector(".delete_form")
    confirmation_form.style.display = "flex";
    
    blurrbackground();

    cancel_btn.addEventListener("click", (e) => {
        confirmation_form.style.display = "none";
        Noblurrbackground();

    })

    confirm_btn.addEventListener("click", (e) => {
        const apiUrl = `http://${ip}:4242/api/user/${userId}`;

        fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                 'Authorization': `Bearer ${localStorage.getItem("token")}`
            },
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                console.log('User deleted successfully');
                confirmation_form.style.display = "none";
                Noblurrbackground()
                getAllUsers();

            })
            .catch(error => {
                console.error('Error during user deletion:', error);
            });
    })
}

function setEditUserFormData(id) {
    document.querySelector("#add_new_user_button").textContent = "Update User";

    document.querySelector("#title_add_edit_user_form").textContent = "Edit User";
    document.querySelector("#edit_user_id").value = id;

    const url = `http://${ip}:4242/api/user/${id}`;

    fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                 'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        }
    )
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            return response.json();
        })
        .then(user => {
            console.log(user);

            document.querySelector("#new_user_name").value = user.name;
            document.querySelector("#new_user_phone_number").value = user.phone;
            document.querySelector("#new_user_email").value = user.email;
            document.querySelector("#new_user_username").value = user.username;
            document.querySelector("#new_user_password").value = '';




            document.querySelector("#new_user_role").value = "super_admin";// selet option role
        })
        .catch(error => {
            console.error(`Error: ${error.message}`);
        });
}






function toggleNewUserForm() {
    if (add_edit_user_form.style.display == "none") {
        add_edit_user_form.style.display = "block";
       blurrbackground();
    } else {
        add_edit_user_form.style.display = "none";
        clear_new_user_form();
        add_edit_user_form.setAttribute("data-edit-mode", "false");
        document.querySelector("#add_new_user_button").textContent = "Add User";
        document.querySelector("#title_add_edit_user_form").textContent = "Add New User";
        Noblurrbackground();
    }
}


let clear_new_user_form = () => {
    document.getElementById('new_user_name').value = '';
    document.getElementById('new_user_email').value = '';
    document.getElementById('new_user_phone_number').value = '';
    document.getElementById('new_user_role').value = '';
    document.getElementById('new_user_password').value = '';
    document.getElementById('edit_user_id').value = '';
}


function gerarSenhaForte() {
    // Definir os caracteres permitidos na senha
    const caracteresPermitidos = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

    let senha = "";
    let comprimento = 12;

    // Gerar a senha com base no comprimento fornecido
    for (let i = 0; i < comprimento; i++) {
        const indiceAleatorio = Math.floor(Math.random() * caracteresPermitidos.length);
        senha += caracteresPermitidos.charAt(indiceAleatorio);
    }

    return senha;
}



function searchUser() {
    const searchInput = document.getElementById('search');
    const search = searchInput.value;
    const searchTitle = document.getElementById('search_title');
    searchResult.style.display = 'block';
    searchTitle.textContent = 'Resultados da pesquisa em :  ' + search;
   

    fetch(`http://${ip}:4242/api/user/search/${search}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',     'Authorization': `Bearer ${localStorage.getItem("token")}`
            }
        }
    )    	
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error);
            } else if (data.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center" style="color: red;">No results found</td></tr>';
            } else {
                usersTableBody.innerHTML = '';
                data.forEach(user => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.role}</td>
                    <td>${user.location.description ? user.location.description : 'Desconhecido'}</td>
                    <td>${user.location_last_update ? new Date(user.location_last_update).toLocaleString() : ''}</td>
                    <td class="action-icons">

                        <a href="#" title="Edit"><i class="fas fa-edit edit_user_btn"></i></a>
                        <a href="#" title="Delete"><i class="fas fa-trash-alt delete_user_btn"></i></a>
                        <a href="#" title="Aruco"><i class="fas fa-qrcode aruco_asset_btn" aruco_id="${user.aruco_id}" aruco_name="${user.name}"></i></a>
                    </td>
                `;
                    usersTableBody.appendChild(row);
                });
            }
        }
        )
        .catch(error => {
            console.log('An error occurred');
        });
}

document.querySelector("#toggle_password_visibility").addEventListener("click", function() {
    const passwordInput = document.getElementById("new_user_password");
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
    } else {    
        passwordInput.type = "password";
    }
});




