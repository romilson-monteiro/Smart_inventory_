import { ip } from './config/config.js';
import { updateNotificationCount } from './sideBar.js';

document.addEventListener("DOMContentLoaded", (e) => {
    getLogss();
    showNotifications();
    connectWebSocket();	
});


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

function showNotifications() {
    fetch(`http://${ip}:4242/api/alerts/Notification/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
        .then(response => response.json())
        .then(data => {
            // Verifica se a resposta contém notificações
            if (Array.isArray(data)) {
                const notificationSection = document.querySelector('.notification-list');

                notificationSection.innerHTML = '';
                
                data.forEach(notification => {
                    const { id, description, timeStamps, isViewed } = notification;
                    // const date = new Date(timeStamps);
                    // timeStamps = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
                     // Criação do elemento da nova notificação
                        const newNotification = document.createElement('div');
                        newNotification.classList.add('notification');
                        newNotification.dataset.id = id;
                        // Verifica se a notificação já foi visualizada
                        if (isViewed) {
                            newNotification.classList.add('viewed'); // Adiciona uma classe para visualização
                            newNotification.innerHTML = `
                                <span class="icon"><i class="fas fa-info-circle"></i></span>
                                <div class="notification-content">
                                    <p class="message">${description}</p>
                                    <p class="timestamp">${formatDate(timeStamps)}</p>
                                </div>
                                <div class="notification-actions">
                                    <button class="notification-action view-button" style="background-color: red; color: white;">
                                        Lida
                                    </button>
                                    <button class="notification-action delete-button"><i class="fas fa-trash-alt"></i> Apagar</button>
                                </div>
                            `;
                        } else {
                            // Se a notificação não foi visualizada, usa o botão padrão
                            newNotification.innerHTML = `
                                <span class="icon"><i class="fas fa-info-circle"></i></span>
                                <div class="notification-content">
                                    <p class="message">${description}</p>
                                    <p class="timestamp">${formatDate(timeStamps)}</p>
                                </div>
                                <div class="notification-actions">
                                    <button class="notification-action view-button"><i class="fas fa-eye"></i> Visualizar</button>
                                    <button class="notification-action delete-button"><i class="fas fa-trash-alt"></i> Apagar</button>
                                </div>
                            `;
                        }

                        // Adiciona a nova notificação no topo do contêiner
                        notificationSection.prepend(newNotification);

                        // Adiciona listeners aos botões de ação
                        newNotification.querySelector('.view-button').addEventListener('click', () => viewNotification(id));
                        newNotification.querySelector('.delete-button').addEventListener('click', () => deleteNotification(id));
                });
            } else {
                console.log("Resposta inesperada do servidor:", data);
            }
        })
        .catch(error => {    
            console.error("Erro ao buscar notificações:", error); 
        });   
}

let socket;
let reconnectInterval = 5000; // Tempo entre tentativas de reconexão

function connectWebSocket() {
            const wsUrl = `ws://${ip}:4242`
            socket = new WebSocket(wsUrl);

            // Evento disparado quando a conexão é aberta
            socket.onopen = function () {
                console.log('Conectado ao servidor WebSocket');
                // document.getElementById('status').innerText = 'Status: Conectado';
            };

            // Evento disparado ao receber uma mensagem do servidor
            socket.onmessage = function (event) {
                const parsedData = JSON.parse(event.data);
                console.log(parsedData);

                if (parsedData && parsedData.type === "new_move") {
                        
                    try {
                        showNotifications();
                        updateNotificationCount();
                    } catch (error) {
                        console.error("Erro ao atualizar a notificação:", error);
                    }
                }
            };

            // Evento disparado quando há um erro na conexão
            socket.onerror = function (error) {
                // console.error('Erro no WebSocket:', error);
            };

            // Evento disparado quando a conexão é fechada
            socket.onclose = function () {
                console.log('Conexão WebSocket fechada. Tentando reconectar...');
                // document.getElementById('status').innerText = 'Status: Desconectado';
                // Tenta reconectar após um intervalo de tempo
                setTimeout(connectWebSocket, reconnectInterval);
            };
        }





function viewNotification(id) {
    const token = localStorage.getItem('token');  // Obtenha o token de autenticação, caso necessário

    fetch(`http://${ip}:4242/api/alerts/NotificationViewed/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao marcar como visualizada: ${response.status}`);
        }
        // Indicar que a notificação foi visualizada
        const notificationElement = document.querySelector(`.notification[data-id="${id}"]`);
        if (notificationElement) {
            notificationElement.classList.add('viewed');  // Exemplo de mudança visual para notificação visualizada
            showNotifications();
            updateNotificationCount();
        }
    })
    .catch(error => console.error('Erro ao marcar notificação como visualizada:', error));
}

function deleteNotification(id) {
    // Verifica se o id é válido antes de continuar
    if (!id) {
        console.error("ID não definido para deletar a notificação");
        return; // Sai da função se o ID for inválido
    }

    const token = localStorage.getItem('token');  // Obtenha o token de autenticação, caso necessário

    fetch(`http://${ip}:4242/api/alerts/Notification/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao apagar a notificação: ${response.status}`);
        }
        // Remover a notificação do DOM
        const notificationElement = document.querySelector(`.notification[data-id="${id}"]`);
        if (notificationElement) {
            notificationElement.remove();
            updateNotificationCount();
        }
    })
    .catch(error => console.error('Erro ao apagar notificação:', error));
}

function formatDate(timestamp) {
    // Verifica se o timestamp é válido
    if (!timestamp) {
        return 'N/A'; // Retorna um valor padrão se o timestamp for inválido
    }

    // Cria um objeto Date a partir do timestamp
    const date = new Date(timestamp);

    // Obtém os componentes da data
    const day = date.getUTCDate(); // Dia do mês (1-31)
    const monthIndex = date.getUTCMonth(); // Mês (0-11)
    const year = date.getUTCFullYear(); // Ano

    // Array com os nomes dos meses
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Formata a hora
    const hours = String(date.getUTCHours()).padStart(2, '0'); // Horas com 2 dígitos
    const minutes = String(date.getUTCMinutes()).padStart(2, '0'); // Minutos com 2 dígitos

    // Monta a string final no formato desejado
    return `${day} de ${months[monthIndex]} de ${year} - ${hours}:${minutes}`;
}