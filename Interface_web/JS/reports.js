import { ip } from './config/config.js';

document.addEventListener("DOMContentLoaded", function () {
    fetchStatistics();
});

function fetchStatistics() {
    fetch(`http://${ip}:4242/api/statistics/report`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            // Relatório de Ativos por Categoria
            var assetsReportData = {
                labels: data.assetsReport.labels,
                datasets: [{
                    label: 'Quantidade',
                    backgroundColor: '#2575fc',
                    borderColor: '#2575fc',
                    data: data.assetsReport.data
                }]
            };

            var assetsReportCtx = document.getElementById('assetsReportChart').getContext('2d');
            new Chart(assetsReportCtx, {
                type: 'bar',
                data: assetsReportData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Permite altura fixa
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            // Distribuição de Ativos por Localização
            var assetsByLocationData = {
                labels: data.assetsByLocation.labels,
                datasets: [{
                    label: 'Ativos',
                    backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
                    borderColor: '#fff',
                    data: data.assetsByLocation.data
                }]
            };

            var assetsByLocationCtx = document.getElementById('assetsByLocationChart').getContext('2d');
            new Chart(assetsByLocationCtx, {
                type: 'pie',
                data: assetsByLocationData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    return tooltipItem.label + ': ' + tooltipItem.raw.toFixed(2) + '%';
                                }
                            }
                        }
                    }
                }
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
