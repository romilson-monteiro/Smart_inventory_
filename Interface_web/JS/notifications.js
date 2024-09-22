import { ip } from './config/config.js';

function getLogss() {

    fetch(`http://${ip}:4242/api/alerts/Logs/`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })

        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.length === 0) {
                const logElement = document.createElement('div');
                logElement.className = 'log';
                logElement.innerHTML = '<p class="message">No logs </p>';
                document.querySelector('.log-list').appendChild(logElement);
                return;
            }
            data.forEach(log => {

            const logElement = document.createElement('div');
            const timestamp = new Date(log.timeStamps);

            logElement.className = `log ${log.event_type}`;
            logElement.innerHTML = `
                <p class="message">${log.description}</p>
                <p class="timestamp">${timestamp.toLocaleString()}</p>
            `;
            document.querySelector('.log-list').appendChild(logElement);
        });
            
        })
        .catch(error => {
            console.log('An error occurred');
        });


}

document.addEventListener("DOMContentLoaded", (e) => {
    getLogss();
});
