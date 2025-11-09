/**
 * Battery Research Data Visualization Dashboard
 * Uses Chart.js for interactive visualizations
 * Loads data from visualization-data.json
 */

// Color scheme configuration
const COLORS = {
  primary: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6366F1', '#14B8A6'],
  gradient: {
    blue: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.4)'],
    purple: ['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.4)'],
    green: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.4)'],
    red: ['rgba(239, 68, 68, 0.8)', 'rgba(239, 68, 68, 0.4)'],
    orange: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.4)']
  },
  technology: {
    'LFP': '#10B981',
    'NMC': '#3B82F6',
    'SolidState': '#8B5CF6',
    'Solid-state': '#8B5CF6',
    'Sodium-ion': '#F59E0B',
    'Other': '#6B7280',
    'NCA': '#EC4899'
  }
};

// Global chart instances for cleanup
const charts = {};

// Main initialization function
async function initializeDashboard() {
  try {
    const data = await loadData();
    console.log('Data loaded successfully:', data);

    // Create all visualizations
    createCostCurveChart(data.costCurve);
    createCapacityGrowthChart(data.capacityGrowth);
    createTopCompaniesChart(data.topCompanies);
    createStateRankingsChart(data.stateRankings);
    createTechnologyMixChart(data.technologyMix);
    createEnergyDensityChart(data.energyDensity);
    createMarketShareChart(data.marketShare);
    createCycleLifeChart(data.cycleLife);
    createRegionalClustersCards(data.regionalClusters);
    createTimelineVisualization(data.timeline);
    createKeyMetricsDashboard(data.keyMetrics);

    console.log('All visualizations created successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Failed to load data. Please check if visualization-data.json exists.');
  }
}

// Load data from JSON file
async function loadData() {
  try {
    const response = await fetch('visualization-data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
}

// 1. Cost Curve Line Chart
function createCostCurveChart(data) {
  const ctx = document.getElementById('costCurveChart');
  if (!ctx) return;

  const years = data.map(d => d.year);
  const costs = data.map(d => d.cost);

  charts.costCurve = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Battery Pack Cost ($/kWh)',
        data: costs,
        borderColor: COLORS.gradient.blue[0],
        backgroundColor: createGradient(ctx, COLORS.gradient.blue),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: COLORS.gradient.blue[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Battery Pack Cost Decline (2015-2030)',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `Cost: $${context.parsed.y}/kWh`;
            },
            afterLabel: function(context) {
              if (context.dataIndex > 0) {
                const prevCost = costs[context.dataIndex - 1];
                const currentCost = context.parsed.y;
                const change = ((currentCost - prevCost) / prevCost * 100).toFixed(1);
                return `Change: ${change > 0 ? '+' : ''}${change}%`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            font: { size: 14, weight: 'bold' }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Cost ($/kWh)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// 2. Capacity Growth Line Chart
function createCapacityGrowthChart(data) {
  const ctx = document.getElementById('capacityGrowthChart');
  if (!ctx) return;

  const years = data.map(d => d.year);
  const capacity = data.map(d => d.capacity);

  charts.capacityGrowth = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'Manufacturing Capacity (GWh)',
        data: capacity,
        borderColor: COLORS.gradient.green[0],
        backgroundColor: createGradient(ctx, COLORS.gradient.green),
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: COLORS.gradient.green[0],
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'U.S. Battery Manufacturing Capacity Growth (2015-2030)',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              return `Capacity: ${context.parsed.y} GWh`;
            },
            afterLabel: function(context) {
              if (context.dataIndex > 0) {
                const prevCapacity = capacity[context.dataIndex - 1];
                const currentCapacity = context.parsed.y;
                const growth = ((currentCapacity - prevCapacity) / prevCapacity * 100).toFixed(1);
                return `Growth: +${growth}%`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            font: { size: 14, weight: 'bold' }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Capacity (GWh)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// 3. Top Companies Horizontal Bar Chart
function createTopCompaniesChart(data) {
  const ctx = document.getElementById('topCompaniesChart');
  if (!ctx) return;

  // Sort by capacity descending
  const sortedData = [...data].sort((a, b) => b.capacity - a.capacity);
  const companies = sortedData.map(d => d.name);
  const capacities = sortedData.map(d => d.capacity);
  const technologies = sortedData.map(d => d.technology);

  charts.topCompanies = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: companies,
      datasets: [{
        label: 'Announced Capacity (GWh)',
        data: capacities,
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary.map(c => c.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 30
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Top Battery Manufacturers by Announced Capacity',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Capacity: ${context.parsed.x} GWh`;
            },
            afterLabel: function(context) {
              return `Technology: ${technologies[context.dataIndex]}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Capacity (GWh)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// 4. State Rankings Bar Chart
function createStateRankingsChart(data) {
  const ctx = document.getElementById('stateRankingsChart');
  if (!ctx) return;

  // Sort by capacity and take top 10
  const sortedData = [...data].sort((a, b) => b.capacity - a.capacity).slice(0, 10);
  const states = sortedData.map(d => d.state);
  const capacities = sortedData.map(d => d.capacity);
  const facilities = sortedData.map(d => d.facilities);

  charts.stateRankings = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: states,
      datasets: [
        {
          label: 'Capacity (GWh)',
          data: capacities,
          backgroundColor: COLORS.gradient.purple[0],
          borderColor: COLORS.gradient.purple[0],
          borderWidth: 2,
          borderRadius: 8,
          yAxisID: 'y'
        },
        {
          label: 'Number of Facilities',
          data: facilities,
          backgroundColor: COLORS.gradient.orange[0],
          borderColor: COLORS.gradient.orange[0],
          borderWidth: 2,
          borderRadius: 8,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Top 10 States by Battery Manufacturing Capacity',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            afterLabel: function(context) {
              const index = context.dataIndex;
              const flagship = sortedData[index].flagship;
              return `Flagship: ${flagship}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Capacity (GWh)',
            font: { size: 12, weight: 'bold' }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Number of Facilities',
            font: { size: 12, weight: 'bold' }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

// 5. Technology Mix Stacked Bar Chart
function createTechnologyMixChart(data) {
  const ctx = document.getElementById('technologyMixChart');
  if (!ctx) return;

  const years = Object.keys(data);
  const technologies = new Set();

  // Get all unique technologies
  years.forEach(year => {
    Object.keys(data[year]).forEach(tech => technologies.add(tech));
  });

  const datasets = Array.from(technologies).map(tech => ({
    label: tech,
    data: years.map(year => data[year][tech] || 0),
    backgroundColor: COLORS.technology[tech] || COLORS.primary[0],
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 4
  }));

  charts.technologyMix = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: years,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Battery Technology Mix Evolution',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            },
            footer: function(tooltipItems) {
              const total = tooltipItems.reduce((sum, item) => sum + item.parsed.y, 0);
              return `Total: ${total}%`;
            }
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Year',
            font: { size: 14, weight: 'bold' }
          },
          grid: {
            display: false
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Market Share (%)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// 6. Energy Density Multi-Line Chart
function createEnergyDensityChart(data) {
  const ctx = document.getElementById('energyDensityChart');
  if (!ctx) return;

  const technologies = Object.keys(data);
  const years = new Set();

  // Get all unique years
  technologies.forEach(tech => {
    Object.keys(data[tech]).forEach(year => years.add(parseInt(year)));
  });

  const sortedYears = Array.from(years).sort();

  const datasets = [];

  // Cell level datasets
  technologies.forEach((tech, index) => {
    datasets.push({
      label: `${tech} (Cell Level)`,
      data: sortedYears.map(year => data[tech][year]?.cellLevel || null),
      borderColor: COLORS.technology[tech] || COLORS.primary[index],
      backgroundColor: COLORS.technology[tech] || COLORS.primary[index],
      borderWidth: 3,
      borderDash: [],
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: false
    });
  });

  // Pack level datasets
  technologies.forEach((tech, index) => {
    datasets.push({
      label: `${tech} (Pack Level)`,
      data: sortedYears.map(year => data[tech][year]?.packLevel || null),
      borderColor: COLORS.technology[tech] || COLORS.primary[index],
      backgroundColor: COLORS.technology[tech] || COLORS.primary[index],
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false
    });
  });

  charts.energyDensity = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedYears,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Energy Density Trends by Technology (Wh/kg)',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            label: function(context) {
              if (context.parsed.y !== null) {
                return `${context.dataset.label}: ${context.parsed.y} Wh/kg`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Year',
            font: { size: 14, weight: 'bold' }
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Energy Density (Wh/kg)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// 7. Market Share Stacked Area Chart
function createMarketShareChart(data) {
  const ctx = document.getElementById('marketShareChart');
  if (!ctx) return;

  const years = Object.keys(data).sort();
  const chemistries = new Set();

  // Get all unique chemistries
  years.forEach(year => {
    data[year].forEach(item => chemistries.add(item.chemistry));
  });

  const datasets = Array.from(chemistries).map((chemistry, index) => {
    const shares = years.map(year => {
      const item = data[year].find(d => d.chemistry === chemistry);
      return item ? item.share : 0;
    });

    return {
      label: chemistry,
      data: shares,
      backgroundColor: COLORS.technology[chemistry] || COLORS.primary[index % COLORS.primary.length],
      borderColor: '#fff',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    };
  });

  charts.marketShare = new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Battery Chemistry Market Share Evolution (2015-2030)',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        },
        filler: {
          propagate: false
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: 'Year',
            font: { size: 14, weight: 'bold' }
          },
          grid: {
            display: false
          }
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Market Share (%)',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// 8. Cycle Life Comparison Chart
function createCycleLifeChart(data) {
  const ctx = document.getElementById('cycleLifeChart');
  if (!ctx) return;

  const technologies = Object.keys(data);
  const metrics = ['laboratoryMax', 'realWorld', 'capacityAfter1000Cycles'];
  const metricLabels = {
    laboratoryMax: 'Laboratory Max Cycles',
    realWorld: 'Real-World Cycles',
    capacityAfter1000Cycles: 'Capacity After 1000 Cycles (%)'
  };

  const datasets = metrics.map((metric, index) => ({
    label: metricLabels[metric],
    data: technologies.map(tech => data[tech][metric]),
    backgroundColor: COLORS.primary[index],
    borderColor: COLORS.primary[index],
    borderWidth: 2,
    borderRadius: 8
  }));

  charts.cycleLife = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: technologies,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Battery Cycle Life Comparison by Chemistry',
          font: { size: 18, weight: 'bold' },
          padding: 20
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label;
              const value = context.parsed.y;
              if (label.includes('Capacity')) {
                return `${label}: ${value}%`;
              } else {
                return `${label}: ${value.toLocaleString()} cycles`;
              }
            },
            afterLabel: function(context) {
              const tech = context.label;
              const degradation = data[tech].degradationRate;
              return `Degradation Rate: ${degradation}% per 100 cycles`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Value',
            font: { size: 14, weight: 'bold' }
          },
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        }
      }
    }
  });
}

// 9. Regional Clusters Data Cards
function createRegionalClustersCards(data) {
  const container = document.getElementById('regionalClustersCards');
  if (!container) return;

  container.innerHTML = '';

  data.forEach((cluster, index) => {
    const card = document.createElement('div');
    card.className = 'cluster-card';
    card.style.cssText = `
      background: linear-gradient(135deg, ${COLORS.primary[index % COLORS.primary.length]}15, ${COLORS.primary[index % COLORS.primary.length]}05);
      border-left: 4px solid ${COLORS.primary[index % COLORS.primary.length]};
      padding: 24px;
      margin-bottom: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    card.innerHTML = `
      <h3 style="color: ${COLORS.primary[index % COLORS.primary.length]}; margin: 0 0 16px 0; font-size: 20px; font-weight: bold;">
        ${cluster.name}
      </h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px;">
        <div class="metric-box">
          <div style="font-size: 32px; font-weight: bold; color: ${COLORS.primary[index % COLORS.primary.length]};">
            ${cluster.totalCapacity} GWh
          </div>
          <div style="color: #6B7280; font-size: 14px;">Total Capacity</div>
        </div>
        <div class="metric-box">
          <div style="font-size: 32px; font-weight: bold; color: ${COLORS.primary[index % COLORS.primary.length]};">
            ${cluster.numFacilities}
          </div>
          <div style="color: #6B7280; font-size: 14px;">Facilities</div>
        </div>
        <div class="metric-box">
          <div style="font-size: 32px; font-weight: bold; color: ${COLORS.primary[index % COLORS.primary.length]};">
            ${cluster.employment.toLocaleString()}
          </div>
          <div style="color: #6B7280; font-size: 14px;">Jobs</div>
        </div>
      </div>
      <div style="margin-bottom: 12px;">
        <strong style="color: #374151;">States:</strong>
        <span style="color: #6B7280;">${cluster.states.join(', ')}</span>
      </div>
      <div style="margin-bottom: 12px;">
        <strong style="color: #374151;">Key Players:</strong>
        <span style="color: #6B7280;">${cluster.dominantPlayers.join(', ')}</span>
      </div>
      <div>
        <strong style="color: #374151;">Advantages:</strong>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
          ${cluster.advantages.map(adv => `
            <span style="background: ${COLORS.primary[index % COLORS.primary.length]}20;
                         color: ${COLORS.primary[index % COLORS.primary.length]};
                         padding: 4px 12px;
                         border-radius: 16px;
                         font-size: 12px;
                         font-weight: 500;">
              ${adv}
            </span>
          `).join('')}
        </div>
      </div>
    `;

    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    container.appendChild(card);
  });
}

// 10. Timeline Visualization
function createTimelineVisualization(data) {
  const container = document.getElementById('timelineVisualization');
  if (!container) return;

  container.innerHTML = '';

  const years = Object.keys(data).sort();
  const timelineWrapper = document.createElement('div');
  timelineWrapper.style.cssText = `
    position: relative;
    padding: 40px 0;
  `;

  // Create timeline line
  const line = document.createElement('div');
  line.style.cssText = `
    position: absolute;
    left: 50%;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(to bottom, ${COLORS.primary[0]}, ${COLORS.primary[2]});
    transform: translateX(-50%);
  `;
  timelineWrapper.appendChild(line);

  years.forEach((year, index) => {
    const item = data[year];
    const isLeft = index % 2 === 0;

    const timelineItem = document.createElement('div');
    timelineItem.style.cssText = `
      display: flex;
      justify-content: ${isLeft ? 'flex-end' : 'flex-start'};
      padding: 20px;
      position: relative;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
      width: 45%;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 2px solid ${COLORS.primary[index % COLORS.primary.length]};
      position: relative;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    // Timeline dot
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: ${COLORS.primary[index % COLORS.primary.length]};
      border: 4px solid white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      z-index: 10;
    `;

    card.innerHTML = `
      <div style="font-size: 24px; font-weight: bold; color: ${COLORS.primary[index % COLORS.primary.length]}; margin-bottom: 12px;">
        ${year}
      </div>
      <div style="margin-bottom: 8px;">
        <strong style="color: #374151;">Cost:</strong>
        <span style="color: #059669; font-weight: 600;">$${item.avgCost}/kWh</span>
      </div>
      <div style="margin-bottom: 8px;">
        <strong style="color: #374151;">Capacity:</strong>
        <span style="color: #3B82F6; font-weight: 600;">${item.capacity} GWh</span>
      </div>
      <div style="margin-bottom: 8px;">
        <strong style="color: #374151;">Dominant Chemistry:</strong>
        <span style="color: #6B7280;">${item.dominantChemistry}</span>
      </div>
      <div style="background: #F3F4F6; padding: 12px; border-radius: 8px; margin-top: 12px;">
        <strong style="color: #374151; font-size: 12px;">Key Event:</strong>
        <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
          ${item.keyEvent}
        </p>
      </div>
    `;

    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'scale(1.05)';
      card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'scale(1)';
      card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    timelineItem.appendChild(card);
    timelineItem.appendChild(dot);
    timelineWrapper.appendChild(timelineItem);
  });

  container.appendChild(timelineWrapper);
}

// 11. Key Metrics Dashboard Cards
function createKeyMetricsDashboard(data) {
  const container = document.getElementById('keyMetricsCards');
  if (!container) return;

  container.innerHTML = '';

  const metrics = [
    {
      title: 'Cost Reduction',
      icon: '💰',
      color: COLORS.gradient.green[0],
      items: [
        { label: 'Period', value: data.costReduction['2015to2024'] },
        { label: 'Range', value: data.costReduction.costPerKwh }
      ]
    },
    {
      title: 'Market Size',
      icon: '📈',
      color: COLORS.gradient.blue[0],
      items: [
        { label: '2024 Capacity', value: data.marketSize['2024'] },
        { label: '2030 Projected', value: data.marketSize['2030'] }
      ]
    },
    {
      title: 'Employment Impact',
      icon: '👥',
      color: COLORS.gradient.purple[0],
      items: [
        { label: 'Direct Jobs', value: data.employment.direct },
        { label: 'Total Impact', value: data.employment.indirect }
      ]
    },
    {
      title: 'Energy Density',
      icon: '⚡',
      color: COLORS.gradient.orange[0],
      items: [
        { label: 'LFP Progress', value: data.energyDensityImprovement.LFP },
        { label: 'NMC Progress', value: data.energyDensityImprovement.NMC }
      ]
    }
  ];

  const grid = document.createElement('div');
  grid.style.cssText = `
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  `;

  metrics.forEach(metric => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-top: 4px solid ${metric.color};
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    `;

    card.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <span style="font-size: 32px; margin-right: 12px;">${metric.icon}</span>
        <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #374151;">${metric.title}</h3>
      </div>
      ${metric.items.map(item => `
        <div style="margin-bottom: 12px; padding: 12px; background: #F9FAFB; border-radius: 8px;">
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">${item.label}</div>
          <div style="font-size: 20px; font-weight: bold; color: ${metric.color};">${item.value}</div>
        </div>
      `).join('')}
    `;

    // Add hover effect
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-4px)';
      card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    });

    grid.appendChild(card);
  });

  container.appendChild(grid);

  // Add supply chain gap section
  const gapSection = document.createElement('div');
  gapSection.style.cssText = `
    background: linear-gradient(135deg, #FEF3C7, #FEE2E2);
    border-radius: 16px;
    padding: 24px;
    border-left: 6px solid #F59E0B;
  `;

  gapSection.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 20px; font-weight: bold; color: #92400E;">
      ⚠️ Supply Chain Gaps
    </h3>
    <div style="display: grid; gap: 12px;">
      <div style="background: white; padding: 16px; border-radius: 8px;">
        <strong style="color: #374151;">Cathode Capacity:</strong>
        <p style="margin: 8px 0 0 0; color: #6B7280;">${data.supplyChainGap.cathodeCapacity}</p>
      </div>
      <div style="background: white; padding: 16px; border-radius: 8px;">
        <strong style="color: #374151;">Separator Production:</strong>
        <p style="margin: 8px 0 0 0; color: #6B7280;">${data.supplyChainGap.separatorProduction}</p>
      </div>
      <div style="background: white; padding: 16px; border-radius: 8px;">
        <strong style="color: #374151;">Electrolyte:</strong>
        <p style="margin: 8px 0 0 0; color: #6B7280;">${data.supplyChainGap.electrolyte}</p>
      </div>
    </div>
  `;

  container.appendChild(gapSection);
}

// Helper function to create gradient
function createGradient(ctx, colors) {
  const canvas = ctx.canvas;
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

// Error display function
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #FEE2E2;
    color: #991B1B;
    padding: 16px 24px;
    border-radius: 8px;
    border-left: 4px solid #DC2626;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    z-index: 1000;
    font-weight: 500;
  `;
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Cleanup function
function destroyAllCharts() {
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
}

// Responsive handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    Object.values(charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }, 250);
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
  initializeDashboard();
}

// Export functions for external use
window.batteryDashboard = {
  initialize: initializeDashboard,
  destroy: destroyAllCharts,
  charts: charts
};
