import { ObjectsModel } from "../models/objects.model.js";
import { CategoryModel } from "../models/Category.model.js";
import { LocationModel } from "../models/location.model.js";
import { CategoryGrupeModel } from "../models/CategoryGrupe.model.js";
import { MovimentsModel } from "../models/moviments.model.js";
import { UsersModel } from "../models/users.model.js";
import { projeto2_db } from "../config/context/database.js";

export const getDashboardStatistics = async (req, res) => {
  // Total counts
  const totalUsers = await UsersModel.count();
  const totalAssets = await ObjectsModel.count();
  const totalMovements = await MovimentsModel.count();

  // Recent movements
  const recentMovements = await MovimentsModel.findAll({
    limit: 5,  // limit to the 5 most recent movements
    order: [['timeStamps', 'DESC']],
    include: [
      { model: LocationModel, as: 'lastLocation', attributes: ['name'] },
      { model: LocationModel, as: 'currentLocation', attributes: ['name'] }
    ]
  });

  // 'dailyMovementsChartlabels:Movimentações Diárias ultimo 10 dias, label: Diax , Dia x
  const dailyMovements = await MovimentsModel.findAll({
    attributes: [
      [projeto2_db.fn('date', projeto2_db.col('timeStamps')), 'date'],
      [projeto2_db.fn('count', projeto2_db.col('id')), 'count']
    ],
    group: [projeto2_db.fn('date', projeto2_db.col('timeStamps'))],
    limit: 10
  });
  

  // Aggregated data for charts
  const assetsByLocation = await ObjectsModel.findAll({
    attributes: ['location_id', [projeto2_db.fn('count', projeto2_db.col('objects.id')), 'count']],
    group: ['location_id'],
    include: [{ model: LocationModel, as: 'location', attributes: ['name'] }]
  });

  function extractAssetName(description) {
  const regex = /Movimentação de (.*?) de/;
  const match = description.match(regex);
  return match ? match[1] : null;
}
  const assetsByCategory = await ObjectsModel.findAll({
    attributes: ['category_id', [projeto2_db.fn('count', projeto2_db.col('objects.id')), 'count']],
    group: ['category_id'],
    include: [{ model: CategoryModel, as: 'category', attributes: ['name'] }]
  });

   return res.json({ message: 'Statistics retrieved successfully',
    totalUsers,
    totalAssets,
    totalMovements,
    recentMovements: recentMovements.map(movement => ({
      asset:  extractAssetName(movement.description),
      previousLocation: movement.lastLocation.name,
      currentLocation: movement.currentLocation.name,
      timestamp: movement.timeStamps
    })),
    assetsByLocation: {
      labels: assetsByLocation.map(loc => loc.location.name),
      data: assetsByLocation.map(loc => loc.dataValues.count) // Acessando o valor do count dentro de dataValues
    },
    assetsByCategory: {
      labels: assetsByCategory.map(cat => cat.category.name),
      data: assetsByCategory.map(cat => cat.dataValues.count) // Acessando o valor do count dentro de dataValues
    },
    dailyMovementsChart: {
      labels: dailyMovements.map(movement => movement.dataValues.date),
      data: dailyMovements.map(movement => movement.dataValues.count) // Acessando o valor do count dentro de dataValues
    }
  });
 
}



 export const reportStatistics = async (req, res) => {



  const assetsByLocation = await ObjectsModel.findAll({
    attributes: ['location_id', [projeto2_db.fn('count', projeto2_db.col('objects.id')), 'count']],
    group: ['location_id'],
    include: [{ model: LocationModel, as: 'location', attributes: ['name'] }]
  });

  const assetsByCategory = await ObjectsModel.findAll({
    attributes: ['category_id', [projeto2_db.fn('count', projeto2_db.col('objects.id')), 'count']],
    group: ['category_id'],
    include: [{ model: CategoryModel, as: 'category', attributes: ['name'] }]
  });

  const movementAnalysis = await MovimentsModel.findAll({
    attributes: ['type', [projeto2_db.fn('count', projeto2_db.col('moviments.id')), 'count']],
    group: ['type']
  });

  return res.json({
    message: 'Statistics retrieved successfully',
    assetsByLocation: {
      labels: assetsByLocation.map(loc => loc.location.name),
      data: assetsByLocation.map(loc => loc.dataValues.count) // Acessando o valor do count dentro de dataValues
    },
    assetsReport: {
      labels: assetsByCategory.map(cat => cat.category.name),
      data: assetsByCategory.map(cat => cat.dataValues.count) // Acessando o valor do count dentro de dataValues
    },
    movementAnalysis: {
      labels: movementAnalysis.map(mov => mov.type),
      data: {
        // Acessando o valor do count dentro de dataValues, verificar se nao nulo
        entrada: movementAnalysis.find(mov => mov.type === 'entrada')?.dataValues.count || 0,
        saida: movementAnalysis.find(mov => mov.type === 'saida')?.dataValues.count || 0,
        transferencia: movementAnalysis.find(mov => mov.type === 'transferencia')?.dataValues.count || 0

      }
    }
  });

  // Frontend code to fetch and display the statistics



  /*   <script>
    document.addEventListener("DOMContentLoaded", function () {
                      fetchStatistics();
  
                  });
                  // Fetch dados to report grapical and table
                   function fetchStatistics() {
                      fetch('http://192.168.1.6:4242/api/statistics/report', {
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
                
                          */







}