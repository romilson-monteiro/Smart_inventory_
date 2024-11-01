
const assets_movementsTableBody = document.getElementById('assets_movements_table_body');
const searchButton = document.getElementById('search_button');
const searchInput = document.getElementById('search');
import { ip } from './config/config.js';




// ****************************************************************************************************
// listiners
// ****************************************************************************************************

searchButton.addEventListener('click', () => {
    searchmovement();
});



document.addEventListener("DOMContentLoaded", (e) => {
    getAllassets_movements();
});



// ****************************************************************************************************
// Funcoes
// ****************************************************************************************************

function getAllassets_movements() {
    fetch(`http://${ip}:4242/api/objects/movements`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    )
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                assets_movementsTableBody.innerHTML = '';
                if (data.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="6">No data found</td>';
                    assets_movementsTableBody.appendChild(row);
                    
                   
                }
                data.forEach(movement => {
               


                    const row = document.createElement('tr');
                    console.log(movement);
                    const date = new Date(movement.timeStamps);
                    movement.timeStamps = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

                    row.innerHTML = `
                        <td>${movement.id ? movement.id : 'N/A'}</td>
                        <td>${movement.asset ? movement.asset.id : 'N/A'}</td>
                        <td>${movement.asset ? movement.asset.name : 'N/A'}</td>
                        <td>${movement.lastLocation.description}</td>
                        <td>${movement.currentLocation.description}</td>
                        <td>${movement.timeStamps} </td>
                        
                    `;
                    assets_movementsTableBody.prepend(row);
                });
            }
        })
        
        .catch(error => {
            console.log('An error occurred');
        });
}


function searchmovement() {
    const search = searchInput.value;
    fetch(`http://${ip}:4242/api/objects/movements/Search/${search}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
    )
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else {
                console.log(data);
                assets_movementsTableBody.innerHTML = '';
                if (data.length === 0) {
                    const row = document.createElement('tr');
                    row.innerHTML = '<td colspan="6">No data found</td>';
                    assets_movementsTableBody.appendChild(row);
                }
                data.forEach(movement => {
                    const row = document.createElement('tr');
                    const date = new Date(movement.timeStamps);
                    movement.timeStamps = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
                    row.innerHTML = `
                        <td>${movement.id ? movement.id : 'N/A'}</td>
                        <td>${movement.asset.id ? movement.asset.id : 'N/A'}</td>
                        <td>${movement.asset.name ? movement.asset.name : 'N/A'}</td>
                        <td>${movement.lastLocation.description}</td>
                        <td>${movement.currentLocation.description}</td>
                        <td>${movement.timeStamps}</td>
                    `;
                    assets_movementsTableBody.appendChild(row);
                });

              
            
            }
        })
        .catch(error => {
            console.log('An error occurred');
        });
}