import { ip } from './config/config.js';


document.addEventListener("DOMContentLoaded", function () {
    fetchStatistics();

});
// Fetch dados to report grapical and table
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

              // Análise de Movimentações
              var movementAnalysisData = {
                  labels: data.movementAnalysis.labels,
                  datasets: [{
                          label: 'Entrada',
                          backgroundColor: '#2ecc71',
                          borderColor: '#2ecc71',
                          data: data.movementAnalysis.data.entrada,
                          fill: false
                      },
                      {
                          label: 'Saída',
                          backgroundColor: '#e74c3c',
                          borderColor: '#e74c3c',
                          data: data.movementAnalysis.data.saida,
                          fill: false
                      },
                      {
                          label: 'Transferência',
                          backgroundColor: '#f39c12',
                          borderColor: '#f39c12',
                          data: data.movementAnalysis.data.transferencia,
                          fill: false
                      }
                  ]
              };

              var movementAnalysisCtx = document.getElementById('movementAnalysisChart').getContext('2d');

              var movementAnalysisChart = new Chart(movementAnalysisCtx, {
                  type: 'line',
                  data: movementAnalysisData,
                  options: {
                      responsive: true,
                      scales: {
                          y: {
                              beginAtZero: true
                          }
                      }
                  }
              });

              // Relatório de Ativos



            

            
            // Ativos por Localização
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
            var assetsByLocationChart = new Chart(assetsByLocationCtx, {
                type: 'pie',
                data: assetsByLocationData,
                options: {
                    responsive: true,
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

            // Ativos por Categoria
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

              var assetsReportChart = new Chart(assetsReportCtx, {
                  type: 'bar',
                  data: assetsReportData,
                  options: {
                      responsive: true,
                      scales: {
                          y: {
                              beginAtZero: true
                          }
                      }
                  }
              });

              




        
           
        
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
