


    // ****************************************************************************************************
    // Declaracoes de variaveis globais
    // ****************************************************************************************************
    import { ip } from './config/config.js';


    const assetsTableBody = document.getElementById('assets_table_body');
    const createAssetButton = document.getElementById('create_asset_button');
    const newAssetForm = document.querySelector('.new_form');
    const addNewAssetButton = document.getElementById('add_new_asset_button');
    const cancelAssetButton = document.getElementById('cancel_button');
    const searchButton = document.getElementById('search_button');
    const searchInput = document.getElementById('search');
    const editAssetButtons = document.querySelectorAll('.edit_asset_btn');
    const deleteAssetButtons = document.querySelectorAll('.delete_asset_btn');
    const searchResult = document.getElementById('searchResult')
    const close_search_result = document.getElementById('close_search_result');
    const selectedPiso = document.getElementById('Piso');
    const token = localStorage.getItem('token');


    let editMode = false;





    // ****************************************************************************************************
    // listiners
    // ****************************************************************************************************

    selectedPiso.addEventListener('change', (e) => {
        const piso = e.target.value;
        getAllOLocation(piso);
    });


    close_search_result.addEventListener('click', () => {
        searchResult.style.display = 'none';
        document.getElementById('search').value = '';
        getAllAssets();
    });

    assetsTableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit_asset_btn')) {
            editMode = true;
            const assetId = e.target.closest('tr').children[0].textContent;
            newAssetForm.style.display = 'block';
            newAssetForm.setAttribute('data-edit-mode', 'true');
            newAssetForm.setAttribute('assetId', assetId);
            getAllObjectsTypes(assetId);
            fillAssetForm();
        } else if (e.target.classList.contains('delete_asset_btn')) {
            const assetId = e.target.closest('tr').children[0].textContent;
            deleteAsset(assetId);
        } else if (e.target.classList.contains('aruco_asset_btn')) {
            const aruco_id = e.target.getAttribute('aruco_id');
            const aruco_name = e.target.getAttribute('aruco_name');


            window.location.href = `aruco.html?aruco_id=${aruco_id}&aruco_name=${aruco_name}`;




        } else {
            const assetId = e.target.closest('tr').children[0].textContent;
            window.location.href = `asset-detail.html?id=${assetId}`;
        }
    });

    createAssetButton.addEventListener('click', () => {
        newAssetForm.style.display = 'block';
        newAssetForm.setAttribute('data-edit-mode', 'false');
        newAssetForm.setAttribute('assetId', '');
        editMode = false;
      
        
        getAllObjectsTypes();
    });

    addNewAssetButton.addEventListener('click', () => {
        if (editMode) {
            editAsset();
        } else {
            addAsset();
        }
    });

    cancelAssetButton.addEventListener('click', () => {
        newAssetForm.style.display = 'none';
        clearAssetForm();
    });

    searchButton.addEventListener('click', () => {
        searchAsset();
    });




    document.addEventListener("DOMContentLoaded", (e) => {
        getAllAssets();
    });


    document.querySelector("#btn_read_uhf").addEventListener("click", () => {
        readUhfTag()
    })
    
    async function readUhfTag() {
        const statusMessage = document.getElementById('statusMessage');
        

        statusMessage.textContent = 'A ler tag UHF...';

        try {
                    const response = await fetch(`http://${ip}:4242/api/objects/addTag`, {
                        method: 'POST',
                    });
                    
                    if (!response.ok) {
                        throw new Error('Erro ao adicionar tag UHF');
                    }
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        document.getElementById('new_asset_uhf_tag').value = data.uhfTag;
                        statusMessage.textContent = 'Tag UHF adicionada com sucesso!';
                    } else {
                        statusMessage.textContent = data.message;
                    }
                } catch (error) {
                    statusMessage.textContent = error.message;
                }
    }
    // ****************************************************************************************************
    // Funcoes
    // ****************************************************************************************************

    function clearAssetForm() {
        document.getElementById('new_asset_name').value = '';
        document.getElementById('new_asset_uhf_tag').value = '';
        document.getElementById('new_asset_type').value = '';
        document.getElementById('new_asset_location').value = '';
        document.getElementById('new_asset_description').value = '';
        document.getElementById('statusMessage').textContent = ''; 
    }

    function getAllAssets() {
        fetch(`http://${ip}:4242/api/objects`,
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
                assetsTableBody.innerHTML = '';
                data.forEach(asset => {
                    const row = document.createElement('tr');
                    const aruco_name = asset.name + ' - ' + asset.category.description;
                    row.innerHTML = `
                    <td>${asset.id}</td>
                    <td>${asset.name}</td>
                    <td>${asset.uhf_tag}</td>
                    <td>${asset.category.description}</td>
                    <td>${asset.location.name}</td>
                    <td>${asset.description}</td>
                    <td class="action-icons">
                        <a href="#" title="Edit"><i class="fas fa-edit edit_asset_btn"></i></a>
                        <a href="#" title="Delete"><i class="fas fa-trash-alt delete_asset_btn"></i></a>
                        <a href="#" title="Aruco"><i class="fas fa-qrcode aruco_asset_btn" aruco_id="${asset.id}" aruco_name="${aruco_name}"></i></a>
                    </td>
                `;
                    assetsTableBody.appendChild(row);
                });
            })
            .catch(error => {
                console.log('An error occurred');
            });
    }


    function getAllObjectsTypes() {
        fetch(`http://${ip}:4242/api/objects/category/`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },


        )
            .then(response => response.json())
            .then(data => {
                
                data.forEach(type => {
                    console.log(type.name);
                    const option = document.createElement('option');
                    option.value = type.id;
                    option.textContent = type.name;
                    document.getElementById('new_asset_type').appendChild(option);

                });
            })
            .catch(error => {
                console.log('An error occurred');
            });


    }

    // req.headers["authorization"];
    function getAllOLocation(piso) {
        fetch(`http://${ip}:4242/api/Locations/LocationByFloor/${piso}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            },
        )
            .then(response => response.json())
            .then(data => {

                document.getElementById('new_asset_location').disabled = false;
                document.getElementById('new_asset_location').innerHTML = '';


                data.forEach(location => {
                    const option = document.createElement('option');
                    option.value = location.id;
                    option.textContent = location.name;
                    document.getElementById('new_asset_location').appendChild(option);


                });
            })
            .catch(error => {
                console.log('An error occurred');
            });



    }



    function fillAssetForm() {
        const assetId = newAssetForm.getAttribute('assetId');
        fetch(`http://${ip}:4242/api/objects/objectbyid/${assetId}`,
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
                getAllOLocation(data.location.floor);
                fillAssetFormFields(data.name, data.uhf_tag, data.category_id, data.location.floor, data.location.id, data.description);
            })
            .catch(error => {
                console.log('An error occurred');
            });
    }



    function fillAssetFormFields(name, uhf_tag, category_id, piso, location_id, description) {
        document.getElementById('new_asset_name').value = name;
        document.getElementById('new_asset_uhf_tag').value = uhf_tag;
        document.getElementById('new_asset_type').value = category_id;
        document.getElementById('Piso').value = piso;
        document.getElementById('Piso').dispatchEvent(new Event('change'));


        document.getElementById('new_asset_location').value = location_id;










        document.getElementById('new_asset_description').value = description;
    }

    function addAsset() {
        const name = document.getElementById('new_asset_name').value;
        const uhf_tag = document.getElementById('new_asset_uhf_tag').value;
        const category_id = document.getElementById('new_asset_type').value;
        const location_id = document.getElementById('new_asset_location').value;

        const description = document.getElementById('new_asset_description').value;



        fetch(`http://${ip}:4242/api/objects/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name,
                uhf_tag,
                user_id: 1,
                category_id,
                location_id,
                description
            })
        })

            // dar erro se a resposta for 400
            .then(response => response.json())

            .then(data => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    console.log('Asset added successfully');
                    location.reload();
                }
            })

            .catch(error => {
                console.log('An error occurred');
            });


    }

    function editAsset() {
        const assetId = newAssetForm.getAttribute('assetId');
        const name = document.getElementById('new_asset_name').value;
        const uhf_tag = document.getElementById('new_asset_uhf_tag').value;
        const category_id = document.getElementById('new_asset_type').value;
        const objectTypeName = document.getElementById('new_asset_type').selectedOptions[0].textContent;
        const location_id = document.getElementById('new_asset_location').value;
        const description = document.getElementById('new_asset_description').value;

        fetch(`http://${ip}:4242/api/objects/${assetId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,

            },
            body: JSON.stringify({
                name,
                uhf_tag,
                category_id,
                location_id,
                user_id: 1,

                description,
                objectTypeName
            })
        })

            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    console.log('Asset edited successfully');
                    location.reload();
                }
            })
            .catch(error => {
                console.log('An error occurred');
            });

    }

    function deleteAsset(assetId) {
        fetch(`http://${ip}:4242/api/objects/${assetId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }





        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    console.log('Asset deleted successfully');
                    location.reload();
                }
            })
            .catch(error => {
                console.log('An error occurred');
            });
    }

    function searchAsset() {


        const searchTitle = document.getElementById('search_title');
        const searchResult = document.getElementById('searchResult');
        searchResult.style.display = 'block';
        const search = searchInput.value;

        searchTitle.textContent = 'Resultados da pesquisa em :  ' + search;
        fetch(`http://${ip}:4242/api/objects/search/${search}`,
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
                if (data.error) {
                    console.log(data.error);
                } else if (data.length === 0) {

                    assetsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center" style="color: red;">No results found</td></tr>';
                } else {
                    assetsTableBody.innerHTML = '';
                    data.forEach(asset => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                        <td>${asset.id}</td>
                        <td>${asset.name}</td>
                        <td>${asset.uhf_tag}</td>
                        <td>${asset.category.description}</td>
                        <td>${asset.location.description}</td>
                        <td>${asset.description}</td>
                         <td class="action-icons">
                        <a href="#" title="Edit"><i class="fas fa-edit edit_asset_btn"></i></a>
                        <a href="#" title="Delete"><i class="fas fa-trash-alt delete_asset_btn"></i></a>
                        <a href="#" title="Aruco"><i class="fas fa-qrcode aruco_asset_btn" aruco_id="${asset.id}" aruco_name="${aruco_name}"></i></a>
                    </td>
                    `;
                        assetsTableBody.appendChild(row);
                    });
                }
            })
            .catch(error => {
                console.log('An error occurred');
            });
    }

