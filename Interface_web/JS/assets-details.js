import { ip } from './config/config.js';


const assetID = new URLSearchParams(window.location.search).get('id');


document.addEventListener('DOMContentLoaded', () => {
getAssetDetails();
getAllassets_movements();

});
function getAllassets_movements() {
fetch(`http://${ip}:4242/api/objects/movements/MovimentsByObjectId/${assetID}`,
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
        } else
        
        {

            if (data.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="6">No data found</td>';
                assets_movementsTableBody.appendChild(row);       
            }
            console.log(data);
            const movementsTableBody = document.getElementById('movements-table-body');
            movementsTableBody.innerHTML = '';
            data.forEach(movement => {
                const row = document.createElement('tr');
                const date = new Date(movement.timeStamps);
                    movement.timeStamps = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

                    row.innerHTML = `
                        <td>${movement.id ? movement.id : 'N/A'}</td>
                      <td>${movement.lastLocation.description}</td>
                      <td>${movement.currentLocation.description}</td>
                      <td>${movement.timeStamps} </td>
                        
                    `;
                movementsTableBody.appendChild(row);
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function getAssetDetails() {
fetch(`http://${ip}:4242/api/objects/objectbyid/${assetID}`,
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
            document.getElementById('asset-id').textContent = data.id;
            document.getElementById('asset-name').textContent = data.name;
            document.getElementById('asset-uhf_tag').textContent = data.uhf_tag;
            document.getElementById('asset-category').textContent = data.category.description;
            document.getElementById('asset-description').textContent = data.description;
            document.getElementById('asset-location').textContent = data.location.name
            document.getElementById('asset-location-last-update').textContent = data.location_last_update
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
