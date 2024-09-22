import { ip } from './config/config.js';
const token = localStorage.getItem('token');

const categoryGroupsTableBody = document.getElementById('category_groups_table_body');
const categoriesTableBody = document.getElementById('categories_table_body');
const createCategoryGroupButton = document.getElementById('create_category_group_button');
const createCategoryButton = document.getElementById('create_category_button');
const categoryGroupForm = document.getElementById('category_group_form');
const categoryForm = document.getElementById('category_form');
const saveCategoryGroupButton = document.getElementById('save_category_group_button');
const saveCategoryButton = document.getElementById('save_category_button');
const cancelCategoryGroupButton = document.getElementById('cancel_category_group_button');
const cancelCategoryButton = document.getElementById('cancel_category_button');
const categoryGroupSelect = document.getElementById('category_group_select');

let editMode = false;
let editCategoryGroupId = null;
let editCategoryId = null;

document.addEventListener("DOMContentLoaded", () => {
    getAllCategoryGroups();
    getAllCategories();
});

createCategoryGroupButton.addEventListener('click', () => {
    categoryGroupForm.style.display = 'block';
    categoryGroupForm.setAttribute('data-edit-mode', 'false');
    
    editMode = false;
    editCategoryGroupId = null;
});

createCategoryButton.addEventListener('click', () => {
    categoryForm.style.display = 'block';
    categoryForm.setAttribute('data-edit-mode', 'false');
    
    editMode = false;
    editCategoryId = null;
    console.log('createCategoryButton');
    populateCategoryGroupSelect();
});

saveCategoryGroupButton.addEventListener('click', () => {
    if (editMode) {
        updateCategoryGroup();
    } else {
        createCategoryGroup();
    }
});

saveCategoryButton.addEventListener('click', () => {
    if (editMode) {
        updateCategory();
    } else {
        createCategory();
    }
});

cancelCategoryGroupButton.addEventListener('click', () => {
    categoryGroupForm.style.display = 'none';
    
});

cancelCategoryButton.addEventListener('click', () => {
    categoryForm.style.display = 'none';
    
});

categoryGroupsTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit_category_group_btn')) {
        editMode = true;
        const categoryGroupId = e.target.closest('tr').children[0].textContent;
        categoryGroupForm.style.display = 'block';
        categoryGroupForm.setAttribute('data-edit-mode', 'true');
        editCategoryGroupId = categoryGroupId;
        fillCategoryGroupForm(categoryGroupId);
    } else if (e.target.classList.contains('delete_category_group_btn')) {
        const categoryGroupId = e.target.closest('tr').children[0].textContent;
        deleteCategoryGroup(categoryGroupId);
    }
});

categoriesTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit_category_btn')) {
        editMode = true;
        const categoryId = e.target.closest('tr').children[0].textContent;
        categoryForm.style.display = 'block';
        categoryForm.setAttribute('data-edit-mode', 'true');
        editCategoryId = categoryId;
        fillCategoryForm(categoryId);
    } else if (e.target.classList.contains('delete_category_btn')) {
        const categoryId = e.target.closest('tr').children[0].textContent;
        deleteCategory(categoryId);
    }
});

async function getAllCategoryGroups() {
    const response = await fetch(`http://${ip}:4242/api/objects/Category/Groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    renderCategoryGroups(data);
}

async function getAllCategories() {
    const response = await fetch(`http://${ip}:4242/api/objects/Category`, {
        headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    renderCategories(data);
}

function renderCategoryGroups(groups) {
    categoryGroupsTableBody.innerHTML = '';
    groups.forEach(group => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${group.id}</td>
            <td>${group.name}</td>
            <td class="action-icons">
                <a href="#" title="Edit"><i class="fas fa-edit edit_category_group_btn"></i></a>
                <a href="#" title="Delete"><i class="fas fa-trash delete_category_group_btn"></i></a>
            </td>
        `;
        categoryGroupsTableBody.appendChild(row);
    });
}

function renderCategories(categories) {
    categoriesTableBody.innerHTML = '';
    categories.forEach(category => {
 
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name || ''}</td>
            <td>${category.categoryGroup.name || ''}</td>
            <td>${category.description}</td>
            <td class="action-icons">
                <a href="#" title="Edit"><i class="fas fa-edit  edit_category_btn"></i></a>
                <a href="#" title="Delete"><i class="fas fa-trash delete_asset_btn  delete_category_btn"></i></a>
            </td>
        `;
        categoriesTableBody.appendChild(row);
    });
}

async function populateCategoryGroupSelect() {
    console.log('populateCategoryGroupSelect');
    fetch(`http://${ip}:4242/api/objects/Category/Groups`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        categoryGroupSelect.innerHTML = '';
        data.forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = group.name;
            categoryGroupSelect.appendChild(option);
        });
    });

}

async function createCategoryGroup() {
    const name = document.getElementById('category_group_name').value;
    const response = await fetch(`http://${ip}:4242/api/objects/Category/Group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name })
    });
    if (response.ok) {
        getAllCategoryGroups();
        categoryGroupForm.style.display = 'none';
        
    }
}

async function updateCategoryGroup() {
    const name = document.getElementById('category_group_name').value;
    const response = await fetch(`http://${ip}:4242/api/objects/Category/Group/${editCategoryGroupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name })
    });
    if (response.ok) {
        getAllCategoryGroups();
        categoryGroupForm.style.display = 'none';
        
    }
}

async function deleteCategoryGroup(id) {
    const response = await fetch(`http://${ip}:4242/api/objects/Category/Group/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        getAllCategoryGroups();
    }
}

async function createCategory() {
    const name = document.getElementById('category_name').value;
    const categoryGroupId = document.getElementById('category_group_select').value;
    const description = document.getElementById('category_description').value;
    const response = await fetch(`http://${ip}:4242/api/objects/Category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, CategoryGrupe_id: categoryGroupId, description })
    });
    if (response.ok) {
        getAllCategories();
        categoryForm.style.display = 'none';
        
    }
}

async function updateCategory() {
    const name = document.getElementById('category_name').value;
    const categoryGroupId = document.getElementById('category_group_select').value;
    const description = document.getElementById('category_description').value;
    const response = await fetch(`http://${ip}:4242/api/objects/Category/byid/${editCategoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, CategoryGrupe_id: categoryGroupId, description })
    });
    if (response.ok) {
        getAllCategories();
        categoryForm.style.display = 'none';
        
    }
}

async function deleteCategory(id) {
    const response = await fetch(`http://${ip}:4242/api/objects/Category/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        getAllCategories();
    }
}

async function fillCategoryGroupForm(id) {
    const response = await fetch(`http://${ip}:4242/api/objects/Category/Group/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    document.getElementById('category_group_name').value = data.name;
}

async function fillCategoryForm(id) {
    const response = await fetch(`http://${ip}:4242/api/objects/Category/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    document.getElementById('category_name').value = data.name;
    document.getElementById('category_description').value = data.description;
    populateCategoryGroupSelect().then(() => {
        document.getElementById('category_group_select').value = data.CategoryGrupe_id;
    });
}