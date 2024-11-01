import { ip } from './config/config.js';

document.addEventListener("DOMContentLoaded", function () {
    fetchDashboardStatistics();
    updateDateTime();
    setInterval(updateDateTime, 60000);
    connectWebSocket();
});


// Fetch dados do dashboard
 function fetchDashboardStatistics() {
    fetch(`http://${ip}:4242/api/statistics/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())

        .then(data => {
            console.log(data);
            // Atualizar cartões
            document.getElementById('totalUsers').textContent = data.totalUsers;
            document.getElementById('totalAssets').textContent = data.totalAssets;
            document.getElementById('totalMovements').textContent = data.totalMovements;

            // Atualizar tabela de movimentações recentes
            const tableBody = document.querySelector('#lastMovementsTable tbody');
            tableBody.innerHTML = '';
            data.recentMovements.forEach(movement => {

                const row = document.createElement('tr');
                row.innerHTML = `<td>${movement.asset}</td><td>${movement.previousLocation}</td><td>${movement.currentLocation}</td><td>${movement.timestamp}</td>`;
                tableBody.appendChild(row);
            });

            // Atualizar gráfico de ativos por localização

            new Chart(document.getElementById('assetsByLocationChart'), {
                type: 'bar',
                data: {
                    labels: data.assetsByLocation.labels,
                    datasets: [{
                        label: 'Ativos por Localização',
                        data: data.assetsByLocation.data,
                        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
                        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Ativos'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Localizações'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribuição de Ativos por Localização'
                        },
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `${context.label}: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });

            // Atualizar gráfico de ativos por categoria
            new Chart(document.getElementById('assetsByCategoryChart'), {
                type: 'pie',
                data: {
                    labels: data.assetsByCategory.labels,
                    datasets: [{
                        label: 'Ativos por Categoria',
                        data: data.assetsByCategory.data,
                        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribuição de Ativos por Categoria'
                        },
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                                    const percentage = ((value / total) * 100).toFixed(2);
                                    return `${label}: ${value} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });


            // Atualizar gráfico de movimentações diárias
            new Chart(document.getElementById('dailyMovementsChart'), {
                type: 'line',
                data: {
                    labels: data.dailyMovementsChart.labels,
                    datasets: [{
                        label: 'Movimentações Diárias',
                        data: data.dailyMovementsChart.data,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                        pointBackgroundColor: 'rgb(75, 192, 192)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(75, 192, 192)'
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Quantidade de Movimentações'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Dias da Semana'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Movimentações Diárias ao Longo da Semana'
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return `Movimentações: ${context.raw}`;
                                }
                            }
                        }
                    }
                }
            });
          

            // Atualizar alertas
            document.getElementById('oldAssetsAlert').textContent = data.oldAssetsAlert;
            document.getElementById('recentlyMovedAssets').textContent = data.recentlyMovedAssets;
            document.getElementById('recentlyRegisteredUsers').textContent = data.recentlyRegisteredUsers;
        })
        .catch(error => {
            console.log('An error occurred');
        });


}
//{"message":"Statistics retrieved successfully","totalUsers":1,"totalAssets":1,"totalMovements":1,"recentMovements":[{"asset":"Cadeira","previousLocation":"S.1.1","currentLocation":"S.2.13","timestamp":"2024-07-10T18:15:47.000Z"}],"assetsByLocation":{"labels":["S.2.1"],"data":[1]},"assetsByCategory":{"labels":["cadeiras"],"data":[1]},"dailyMovementsChart":{"labels":["2024-07-10"],"data":[1]}}

// Função para atualizar data e hora
function updateDateTime() {
    const user = JSON.parse(localStorage.getItem('user'));
    const welcomeSection = document.querySelector('.welcome-section');
    const date = new Date();
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const day = days[date.getDay()];
    const month = months[date.getMonth()];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    welcomeSection.querySelector('#currentDateTime').textContent = `${day}, ${date.getDate()} de ${month} de ${date.getFullYear()}, ${hours}:${formattedMinutes}`;
    welcomeSection.querySelector('#welcomeMessage').textContent = `Bem Vindo de volta, ${user.name}`;
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

                if (parsedData && parsedData.type == "new_move") {
                    const data = parsedData.data;
                    try {
                        // Atualizar tabela de movimentações recentes
                        const tableBody = document.querySelector('#lastMovementsTable tbody');
                        const row = document.createElement('tr');
                        row.innerHTML = `<td>${data.asset}</td><td>${data.last_location}</td><td>${data.current_location}</td><td>${data.timeStamps}</td>`;
                        tableBody.prepend(row);
                    } catch (error) {
                        console.log("Mensagem JSON inválida")
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

   

document.querySelector("#verMais_button").addEventListener("click", function () {
    window.location.href = "../HTML/movements.html";
})
