import { ip } from './config/config.js';
import { updateNotificationCount } from './sideBar.js';

document.addEventListener("DOMContentLoaded", () => {
    validateSession();
    connectWebSocket();
    deactivateButtons();
}
);

const validateSession = () => {const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../HTML/login.html";
    }
    const userNameElement = document.querySelector(".user-name");
    const user = JSON.parse(localStorage.getItem("user"));
  
    // user exist
    if (user) {
        userNameElement.textContent = user.name;
    } else {
        window.location.href = "../HTML/login.html";
    }

    //validar token se nao espirou
    fetch(`http://${ip}:4242/api/validateToken`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })

        .then((response) => {
            if (!response.ok) {
                alert("Secção expirada");
                logout();
                throw new Error("Token inválido");
                
            }
            return response.json();
        }
        )
        .then((data) => {
            console.log("Bem-vindo");
        })
        .catch((error) => {
            console.log(error);
            logout();
        });
};

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
                if (parsedData && parsedData.type == "new_move") {
                    try {
                        updateNotificationCount();
                    } catch (error) {
                        console.log("erro ao atualizar notificações")
                        return
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

      
const deactivateButtons = () => {
    const defButton = document.querySelector(".setting-button");
    const notButton = document.querySelector(".alert-button");

    defButton.style.display = "none";
    notButton.style.display = "none";
}

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../HTML/login.html";
}