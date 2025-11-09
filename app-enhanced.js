/**
 * Battery Research Data Visualization Dashboard - Enhanced Version
 * Advanced interactive visualizations with export, cross-filtering, and analytics
 *
 * Features:
 * - Interactive charts with zoom/pan
 * - Cross-filtering between visualizations
 * - Export to PNG, SVG, PDF, CSV, JSON
 * - Scenario modeling and forecasting
 * - Confidence bands for projections
 * - Advanced tooltips and interactivity
 */

// ==================== CONFIGURATION ====================

const CONFIG = {
  colors: {
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
      'LMFP': '#34D399',
      'LFP/LMFP': '#10B981',
      'NMC': '#3B82F6',
      'NMC-333': '#60A5FA',
      'NMC-811': '#2563EB',
      'NCA': '#EC4899',
      'SolidState': '#8B5CF6',
      'Solid-state': '#8B5CF6',
      'Sodium-ion': '#F59E0B',
      'Other': '#6B7280'
    }
  },
  chart: {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
    }
  }
};

// ==================== STATE MANAGEMENT ====================

const AppState = {
  data: null,
  charts: {},
  filters: {
    yearRange: null,
    selectedStates: [],
    selectedTechnologies: [],
    selectedCompanies: []
  },

  setData(data) {
    this.data = data;
  },

  getData() {
    return this.data;
  },

  setFilter(filterType, value) {
    this.filters[filterType] = value;
    this.applyFilters();
  },

  clearFilters() {
    this.filters = {
      yearRange: null,
      selectedStates: [],
      selectedTechnologies: [],
      selectedCompanies: []
    };
    this.applyFilters();
  },

  applyFilters() {
    // Trigger re-render of all charts with filtered data
    if (window.updateAllCharts) {
      window.updateAllCharts();
    }
  },

  getFilteredData() {
    let filtered = { ...this.data };

    // Apply year range filter
    if (this.filters.yearRange) {
      const [minYear, maxYear] = this.filters.yearRange;
      if (filtered.costCurve) {
        filtered.costCurve = filtered.costCurve.filter(d => d.year >= minYear && d.year <= maxYear);
      }
      if (filtered.capacityGrowth) {
        filtered.capacityGrowth = filtered.capacityGrowth.filter(d => d.year >= minYear && d.year <= maxYear);
      }
    }

    // Apply state filter
    if (this.filters.selectedStates.length > 0) {
      if (filtered.stateRankings) {
        filtered.stateRankings = filtered.stateRankings.filter(d =>
          this.filters.selectedStates.includes(d.state)
        );
      }
    }

    // Apply technology filter
    if (this.filters.selectedTechnologies.length > 0) {
      // Filter companies by technology
      if (filtered.topCompanies) {
        filtered.topCompanies = filtered.topCompanies.filter(d =>
          this.filters.selectedTechnologies.some(tech => d.technology.includes(tech))
        );
      }
    }

    return filtered;
  }
};

// ==================== DATA TRANSFORMATION UTILITIES ====================

const DataTransform = {
  /**
   * Calculate confidence intervals for projections
   */
  calculateConfidenceBands(data, confidenceLevel = 0.95) {
    const historicalYears = data.filter(d => d.year <= 2024);
    const projectionYears = data.filter(d => d.year > 2024);

    if (projectionYears.length === 0) return data;

    // Calculate standard deviation from historical data
    const values = historicalYears.map(d => d.cost || d.capacity);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Z-score for 95% confidence
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.576;
    const margin = zScore * stdDev;

    return data.map(d => ({
      ...d,
      upperBound: d.year > 2024 ? (d.cost || d.capacity) + margin * (d.year - 2024) / 6 : null,
      lowerBound: d.year > 2024 ? Math.max(0, (d.cost || d.capacity) - margin * (d.year - 2024) / 6) : null
    }));
  },

  /**
   * Calculate linear regression for trend analysis
   */
  linearRegression(data, xKey = 'year', yKey = 'cost') {
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d[xKey], 0);
    const sumY = data.reduce((sum, d) => sum + d[yKey], 0);
    const sumXY = data.reduce((sum, d) => sum + d[xKey] * d[yKey], 0);
    const sumXX = data.reduce((sum, d) => sum + d[xKey] * d[xKey], 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  },

  /**
   * Generate trend line data
   */
  generateTrendLine(data, xKey = 'year', yKey = 'cost') {
    const { slope, intercept } = this.linearRegression(data, xKey, yKey);
    return data.map(d => ({
      [xKey]: d[xKey],
      [yKey]: slope * d[xKey] + intercept
    }));
  },

  /**
   * Aggregate data by category
   */
  aggregateByCategory(data, categoryKey, valueKey) {
    const aggregated = {};
    data.forEach(item => {
      const category = item[categoryKey];
      if (!aggregated[category]) {
        aggregated[category] = 0;
      }
      aggregated[category] += item[valueKey];
    });
    return Object.entries(aggregated).map(([category, value]) => ({
      [categoryKey]: category,
      [valueKey]: value
    }));
  },

  /**
   * Normalize data to percentage
   */
  normalizeToPercentage(data, valueKey) {
    const total = data.reduce((sum, d) => sum + d[valueKey], 0);
    return data.map(d => ({
      ...d,
      [`${valueKey}Percent`]: (d[valueKey] / total) * 100
    }));
  },

  /**
   * Calculate year-over-year growth
   */
  calculateGrowthRate(data, valueKey = 'capacity') {
    return data.map((d, i) => {
      if (i === 0) return { ...d, growthRate: null };
      const prevValue = data[i - 1][valueKey];
      const growthRate = ((d[valueKey] - prevValue) / prevValue) * 100;
      return { ...d, growthRate: growthRate.toFixed(2) };
    });
  },

  /**
   * Pivot data for multi-series charts
   */
  pivotData(data, rowKey, colKey, valueKey) {
    const pivoted = {};
    const columns = new Set();

    data.forEach(item => {
      const row = item[rowKey];
      const col = item[colKey];
      const value = item[valueKey];

      if (!pivoted[row]) pivoted[row] = {};
      pivoted[row][col] = value;
      columns.add(col);
    });

    return { pivoted, columns: Array.from(columns) };
  }
};

// ==================== EXPORT UTILITIES ====================

const ExportUtils = {
  /**
   * Export chart as PNG
   */
  exportChartAsPNG(chartId, filename = 'chart.png') {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  },

  /**
   * Export chart as SVG (requires conversion)
   */
  exportChartAsSVG(chartId, filename = 'chart.svg') {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;

    // Get the chart image data
    const imgData = canvas.toDataURL('image/png');

    // Create SVG wrapper
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink"
           width="${canvas.width}"
           height="${canvas.height}">
        <image xlink:href="${imgData}" width="${canvas.width}" height="${canvas.height}"/>
      </svg>
    `;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  },

  /**
   * Export data as CSV
   */
  exportAsCSV(data, filename = 'data.csv') {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape values containing commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  },

  /**
   * Export data as JSON
   */
  exportAsJSON(data, filename = 'data.json') {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  },

  /**
   * Export chart as PDF (requires jsPDF library)
   */
  async exportChartAsPDF(chartId, filename = 'chart.pdf') {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;

    // Check if jsPDF is loaded
    if (typeof window.jspdf === 'undefined') {
      console.warn('jsPDF library not loaded. Cannot export as PDF.');
      alert('PDF export requires jsPDF library. Please include it in your project.');
      return;
    }

    const imgData = canvas.toDataURL('image/png');
    const pdf = new window.jspdf.jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  }
};

// ==================== CHART COMPONENTS ====================

const ChartComponents = {
  /**
   * Create enhanced cost curve chart with confidence bands
   */
  createCostCurveChart(data, canvasId = 'costTrendsChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Add confidence bands
    const dataWithBands = DataTransform.calculateConfidenceBands(data);

    const years = dataWithBands.map(d => d.year);
    const costs = dataWithBands.map(d => d.cost);
    const upperBounds = dataWithBands.map(d => d.upperBound);
    const lowerBounds = dataWithBands.map(d => d.lowerBound);

    // Calculate trend line for historical data
    const historicalData = data.filter(d => d.year <= 2024);
    const trendData = DataTransform.generateTrendLine(historicalData);

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Actual Cost',
            data: costs,
            borderColor: CONFIG.colors.gradient.blue[0],
            backgroundColor: CONFIG.colors.gradient.blue[1],
            borderWidth: 3,
            fill: false,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: CONFIG.colors.gradient.blue[0],
            pointBorderColor: '#fff',
            pointBorderWidth: 2
          },
          {
            label: 'Upper Confidence (95%)',
            data: upperBounds,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: '+1',
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'Lower Confidence (95%)',
            data: lowerBounds,
            borderColor: 'rgba(59, 130, 246, 0.3)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 1,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            tension: 0.4
          },
          {
            label: 'Trend Line',
            data: years.map(year => {
              const trend = trendData.find(d => d.year === year);
              return trend ? trend.cost : null;
            }),
            borderColor: 'rgba(245, 158, 11, 0.6)',
            borderWidth: 2,
            borderDash: [10, 5],
            fill: false,
            pointRadius: 0,
            tension: 0
          }
        ]
      },
      options: {
        ...CONFIG.chart,
        plugins: {
          title: {
            display: true,
            text: 'Battery Pack Cost Decline with Forecast (2015-2030)',
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
                if (context.dataset.label.includes('Confidence')) {
                  return `${context.dataset.label}: $${context.parsed.y?.toFixed(0)}/kWh`;
                }
                return `${context.dataset.label}: $${context.parsed.y}/kWh`;
              },
              afterLabel: function(context) {
                if (context.datasetIndex === 0 && context.dataIndex > 0) {
                  const prevCost = costs[context.dataIndex - 1];
                  const currentCost = context.parsed.y;
                  const change = ((currentCost - prevCost) / prevCost * 100).toFixed(1);
                  return `YoY Change: ${change > 0 ? '+' : ''}${change}%`;
                }
                return '';
              }
            }
          },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
                modifierKey: 'ctrl'
              },
              pinch: {
                enabled: true
              },
              mode: 'x'
            },
            pan: {
              enabled: true,
              mode: 'x',
              modifierKey: 'shift'
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
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const dataIndex = elements[0].index;
            const year = years[dataIndex];
            console.log(`Clicked on year ${year}`);
            // Could trigger cross-filtering here
          }
        }
      }
    });

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Create capacity growth chart with growth rate annotations
   */
  createCapacityGrowthChart(data, canvasId = 'capacityChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const dataWithGrowth = DataTransform.calculateGrowthRate(data, 'capacity');

    const years = dataWithGrowth.map(d => d.year);
    const capacity = dataWithGrowth.map(d => d.capacity);
    const growthRates = dataWithGrowth.map(d => d.growthRate);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Manufacturing Capacity (GWh)',
            data: capacity,
            backgroundColor: CONFIG.colors.gradient.green[0],
            borderColor: CONFIG.colors.gradient.green[0],
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'YoY Growth Rate (%)',
            data: growthRates,
            type: 'line',
            borderColor: CONFIG.colors.gradient.orange[0],
            backgroundColor: 'transparent',
            borderWidth: 3,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: 'y1',
            tension: 0.4
          }
        ]
      },
      options: {
        ...CONFIG.chart,
        plugins: {
          title: {
            display: true,
            text: 'US Battery Manufacturing Capacity Growth (2015-2030)',
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
                if (context.dataset.label.includes('Growth')) {
                  return context.parsed.y !== null ?
                    `${context.dataset.label}: ${context.parsed.y}%` :
                    'N/A';
                }
                return `${context.dataset.label}: ${context.parsed.y} GWh`;
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
            type: 'linear',
            display: true,
            position: 'left',
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
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Growth Rate (%)',
              font: { size: 14, weight: 'bold' }
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Create top companies chart with technology filtering
   */
  createTopCompaniesChart(data, canvasId = 'companiesChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const sortedData = [...data].sort((a, b) => b.capacity - a.capacity);
    const companies = sortedData.map(d => d.name);
    const capacities = sortedData.map(d => d.capacity);
    const technologies = sortedData.map(d => d.technology);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: companies,
        datasets: [{
          label: 'Announced Capacity (GWh)',
          data: capacities,
          backgroundColor: CONFIG.colors.primary,
          borderColor: CONFIG.colors.primary,
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        indexAxis: 'y',
        ...CONFIG.chart,
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
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const company = companies[index];
            console.log(`Clicked on company: ${company}`);
            // Trigger cross-filtering
            AppState.setFilter('selectedCompanies', [company]);
          }
        }
      }
    });

    // Populate companies table
    this.populateCompaniesTable(sortedData);

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Populate companies data table
   */
  populateCompaniesTable(data) {
    const tableBody = document.querySelector('#companiesTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = data.map((company, index) => `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${company.name}</strong></td>
        <td>${company.capacity} GWh</td>
        <td>${company.technology}</td>
      </tr>
    `).join('');
  },

  /**
   * Create state rankings chart
   */
  createStateRankingsChart(data, canvasId = 'statesChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const sortedData = [...data].sort((a, b) => b.capacity - a.capacity).slice(0, 10);
    const states = sortedData.map(d => d.state);
    const capacities = sortedData.map(d => d.capacity);
    const facilities = sortedData.map(d => d.facilities);

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: states,
        datasets: [
          {
            label: 'Capacity (GWh)',
            data: capacities,
            backgroundColor: CONFIG.colors.gradient.purple[0],
            borderColor: CONFIG.colors.gradient.purple[0],
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y'
          },
          {
            label: 'Number of Facilities',
            data: facilities,
            backgroundColor: CONFIG.colors.gradient.orange[0],
            borderColor: CONFIG.colors.gradient.orange[0],
            borderWidth: 2,
            borderRadius: 8,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        ...CONFIG.chart,
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
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const state = states[index];
            console.log(`Clicked on state: ${state}`);
            AppState.setFilter('selectedStates', [state]);
          }
        }
      }
    });

    // Populate states grid
    this.populateStatesGrid(sortedData);

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Populate states data grid
   */
  populateStatesGrid(data) {
    const grid = document.getElementById('statesGrid');
    if (!grid) return;

    grid.innerHTML = data.map((state, index) => `
      <div class="state-card" style="
        background: linear-gradient(135deg, ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}15, ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}05);
        border-left: 4px solid ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};
        padding: 20px;
        margin-bottom: 16px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      ">
        <h3 style="color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}; margin: 0 0 12px 0;">
          ${index + 1}. ${state.state}
        </h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 24px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};">
              ${state.capacity} GWh
            </div>
            <div style="color: #6B7280; font-size: 12px;">Capacity</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};">
              ${state.facilities}
            </div>
            <div style="color: #6B7280; font-size: 12px;">Facilities</div>
          </div>
          <div>
            <div style="font-size: 24px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};">
              ${state.companies.length}
            </div>
            <div style="color: #6B7280; font-size: 12px;">Companies</div>
          </div>
        </div>
        <div style="margin-bottom: 8px;">
          <strong>Companies:</strong> ${state.companies.join(', ')}
        </div>
        <div style="background: #F3F4F6; padding: 8px; border-radius: 6px;">
          <strong>Flagship:</strong> ${state.flagship}
        </div>
      </div>
    `).join('');
  },

  /**
   * Create technology mix evolution chart
   */
  createTechnologyMixChart(data, canvasId = 'technologyMixChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const years = Object.keys(data);
    const technologies = new Set();

    years.forEach(year => {
      Object.keys(data[year]).forEach(tech => technologies.add(tech));
    });

    const datasets = Array.from(technologies).map(tech => ({
      label: tech,
      data: years.map(year => data[year][tech] || 0),
      backgroundColor: CONFIG.colors.technology[tech] || CONFIG.colors.primary[0],
      borderColor: '#fff',
      borderWidth: 2,
      borderRadius: 4
    }));

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        ...CONFIG.chart,
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

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Create energy density comparison chart
   */
  createEnergyDensityChart(data, canvasId = 'energyDensityChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const technologies = Object.keys(data);
    const years = new Set();

    technologies.forEach(tech => {
      Object.keys(data[tech]).forEach(year => years.add(parseInt(year)));
    });

    const sortedYears = Array.from(years).sort();
    const datasets = [];

    // Cell level datasets
    technologies.forEach((tech, index) => {
      datasets.push({
        label: `${tech} (Cell)`,
        data: sortedYears.map(year => data[tech][year]?.cellLevel || null),
        borderColor: CONFIG.colors.technology[tech] || CONFIG.colors.primary[index],
        backgroundColor: CONFIG.colors.technology[tech] || CONFIG.colors.primary[index],
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
        label: `${tech} (Pack)`,
        data: sortedYears.map(year => data[tech][year]?.packLevel || null),
        borderColor: CONFIG.colors.technology[tech] || CONFIG.colors.primary[index],
        backgroundColor: CONFIG.colors.technology[tech] || CONFIG.colors.primary[index],
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false
      });
    });

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedYears,
        datasets: datasets
      },
      options: {
        ...CONFIG.chart,
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

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Create market share pie charts for different years
   */
  createMarketShareCharts(data) {
    const years = ['2015', '2020', '2024', '2030'];

    years.forEach(year => {
      const canvasId = `marketShare${year}`;
      const ctx = document.getElementById(canvasId);
      if (!ctx) return;

      const yearData = data[year];
      const labels = yearData.map(d => d.chemistry);
      const shares = yearData.map(d => d.share);
      const colors = labels.map(chem => CONFIG.colors.technology[chem] || CONFIG.colors.primary[0]);

      const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: shares,
            backgroundColor: colors,
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          ...CONFIG.chart,
          plugins: {
            title: {
              display: false
            },
            legend: {
              display: true,
              position: 'bottom'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.parsed}%`;
                }
              }
            }
          }
        }
      });

      AppState.charts[canvasId] = chart;
    });
  },

  /**
   * Create cycle life comparison chart
   */
  createCycleLifeChart(data, canvasId = 'cycleLifeChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

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
      backgroundColor: CONFIG.colors.primary[index],
      borderColor: CONFIG.colors.primary[index],
      borderWidth: 2,
      borderRadius: 8
    }));

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: technologies,
        datasets: datasets
      },
      options: {
        ...CONFIG.chart,
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
                return `Degradation: ${degradation}% per 100 cycles`;
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

    // Populate cycle life table
    this.populateCycleLifeTable(data);

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Populate cycle life comparison table
   */
  populateCycleLifeTable(data) {
    const tableBody = document.getElementById('cycleLifeTable');
    if (!tableBody) return;

    tableBody.innerHTML = Object.entries(data).map(([tech, metrics]) => `
      <tr>
        <td><strong>${tech}</strong></td>
        <td>${metrics.laboratoryMax.toLocaleString()} cycles</td>
        <td>${metrics.realWorld.toLocaleString()} cycles</td>
        <td>${metrics.degradationRate}%</td>
        <td>${metrics.capacityAfter1000Cycles}%</td>
      </tr>
    `).join('');
  },

  /**
   * Create regional clusters visualization
   */
  createRegionalClustersCards(data) {
    const container = document.getElementById('clustersGrid');
    if (!container) return;

    container.innerHTML = data.map((cluster, index) => `
      <div class="cluster-card" style="
        background: linear-gradient(135deg, ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}15, ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}05);
        border-left: 4px solid ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};
        padding: 24px;
        margin-bottom: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      ">
        <h3 style="color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}; margin: 0 0 16px 0; font-size: 20px; font-weight: bold;">
          ${cluster.name}
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 32px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};">
              ${cluster.totalCapacity} GWh
            </div>
            <div style="color: #6B7280; font-size: 14px;">Total Capacity</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};">
              ${cluster.numFacilities}
            </div>
            <div style="color: #6B7280; font-size: 14px;">Facilities</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};">
              ${cluster.employment.toLocaleString()}
            </div>
            <div style="color: #6B7280; font-size: 14px;">Jobs</div>
          </div>
        </div>
        <div style="margin-bottom: 12px;">
          <strong>States:</strong> ${cluster.states.join(', ')}
        </div>
        <div style="margin-bottom: 12px;">
          <strong>Key Players:</strong> ${cluster.dominantPlayers.join(', ')}
        </div>
        <div>
          <strong>Advantages:</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
            ${cluster.advantages.map(adv => `
              <span style="
                background: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}20;
                color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};
                padding: 4px 12px;
                border-radius: 16px;
                font-size: 12px;
                font-weight: 500;
              ">
                ${adv}
              </span>
            `).join('')}
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Create regional capacity chart
   */
  createRegionalCapacityChart(data, canvasId = 'regionalCapacityChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    const names = data.map(d => d.name);
    const capacities = data.map(d => d.totalCapacity);

    const chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: names,
        datasets: [{
          data: capacities,
          backgroundColor: CONFIG.colors.primary,
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        ...CONFIG.chart,
        plugins: {
          title: {
            display: true,
            text: 'Regional Cluster Capacity Distribution',
            font: { size: 18, weight: 'bold' },
            padding: 20
          },
          legend: {
            display: true,
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = capacities.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} GWh (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    AppState.charts[canvasId] = chart;
    return chart;
  },

  /**
   * Create timeline visualization
   */
  createTimelineVisualization(data) {
    const container = document.getElementById('industryTimeline');
    if (!container) return;

    const years = Object.keys(data).sort();

    container.innerHTML = `
      <div style="position: relative; padding: 40px 0;">
        <div style="
          position: absolute;
          left: 50%;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(to bottom, ${CONFIG.colors.primary[0]}, ${CONFIG.colors.primary[2]});
          transform: translateX(-50%);
        "></div>

        ${years.map((year, index) => {
          const item = data[year];
          const isLeft = index % 2 === 0;

          return `
            <div style="
              display: flex;
              justify-content: ${isLeft ? 'flex-end' : 'flex-start'};
              padding: 20px;
              position: relative;
            ">
              <div style="
                width: 45%;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                border: 2px solid ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};
                transition: transform 0.3s ease;
              " class="timeline-card">
                <div style="font-size: 24px; font-weight: bold; color: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]}; margin-bottom: 12px;">
                  ${year}
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Cost:</strong> <span style="color: #059669; font-weight: 600;">$${item.avgCost}/kWh</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Capacity:</strong> <span style="color: #3B82F6; font-weight: 600;">${item.capacity} GWh</span>
                </div>
                <div style="margin-bottom: 8px;">
                  <strong>Dominant Chemistry:</strong> ${item.dominantChemistry}
                </div>
                <div style="background: #F3F4F6; padding: 12px; border-radius: 8px; margin-top: 12px;">
                  <strong style="font-size: 12px;">Key Event:</strong>
                  <p style="margin: 8px 0 0 0; color: #6B7280; font-size: 14px; line-height: 1.5;">
                    ${item.keyEvent}
                  </p>
                </div>
              </div>

              <div style="
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: ${CONFIG.colors.primary[index % CONFIG.colors.primary.length]};
                border: 4px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                z-index: 10;
              "></div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Add hover effects
    document.querySelectorAll('.timeline-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.15)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'scale(1)';
        card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      });
    });
  },

  /**
   * Populate metadata sections
   */
  populateMetadata(metadata) {
    // Data sources
    const dataSourcesList = document.getElementById('dataSources');
    if (dataSourcesList && metadata.dataSource) {
      dataSourcesList.innerHTML = metadata.dataSource.map(source =>
        `<li>${source}</li>`
      ).join('');
    }

    // Report dates
    const reportDateElements = document.querySelectorAll('#reportDate, #footerReportDate');
    reportDateElements.forEach(el => {
      if (el) el.textContent = metadata.reportDate || 'N/A';
    });
  }
};

// ==================== INITIALIZATION ====================

async function initializeDashboard() {
  try {
    // Load data
    const data = await loadData();
    AppState.setData(data);

    console.log('Data loaded successfully:', data);

    // Create all visualizations
    ChartComponents.createCostCurveChart(data.costCurve);
    ChartComponents.createCapacityGrowthChart(data.capacityGrowth);
    ChartComponents.createTopCompaniesChart(data.topCompanies);
    ChartComponents.createStateRankingsChart(data.stateRankings);
    ChartComponents.createTechnologyMixChart(data.technologyMix);
    ChartComponents.createEnergyDensityChart(data.energyDensity);
    ChartComponents.createMarketShareCharts(data.marketShare);
    ChartComponents.createCycleLifeChart(data.cycleLife);
    ChartComponents.createRegionalClustersCards(data.regionalClusters);
    ChartComponents.createRegionalCapacityChart(data.regionalClusters);
    ChartComponents.createTimelineVisualization(data.timeline);
    ChartComponents.populateMetadata(data.metadata);

    // Add export buttons
    addExportButtons();

    // Add filter controls
    addFilterControls();

    // Add navigation enhancements
    enhanceNavigation();

    console.log('All visualizations created successfully');
  } catch (error) {
    console.error('Error initializing dashboard:', error);
    showError('Failed to load data. Please check if visualization-data.json exists.');
  }
}

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

// ==================== UI ENHANCEMENTS ====================

function addExportButtons() {
  const sections = document.querySelectorAll('.chart-container');
  sections.forEach(section => {
    const canvas = section.querySelector('canvas');
    if (!canvas) return;

    const exportBar = document.createElement('div');
    exportBar.className = 'export-bar';
    exportBar.style.cssText = `
      display: flex;
      gap: 8px;
      justify-content: flex-end;
      margin-bottom: 12px;
      padding: 8px;
      background: #F9FAFB;
      border-radius: 8px;
    `;

    const buttons = [
      { label: 'PNG', action: () => ExportUtils.exportChartAsPNG(canvas.id, `${canvas.id}.png`) },
      { label: 'SVG', action: () => ExportUtils.exportChartAsSVG(canvas.id, `${canvas.id}.svg`) },
      { label: 'PDF', action: () => ExportUtils.exportChartAsPDF(canvas.id, `${canvas.id}.pdf`) }
    ];

    buttons.forEach(btn => {
      const button = document.createElement('button');
      button.textContent = btn.label;
      button.className = 'export-btn';
      button.style.cssText = `
        padding: 6px 12px;
        background: #3B82F6;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        transition: background 0.2s;
      `;
      button.addEventListener('mouseenter', () => {
        button.style.background = '#2563EB';
      });
      button.addEventListener('mouseleave', () => {
        button.style.background = '#3B82F6';
      });
      button.addEventListener('click', btn.action);
      exportBar.appendChild(button);
    });

    section.insertBefore(exportBar, canvas);
  });

  // Add data export button to hero section
  const heroSection = document.querySelector('.hero-content');
  if (heroSection) {
    const dataExportBtn = document.createElement('button');
    dataExportBtn.textContent = 'Export All Data';
    dataExportBtn.style.cssText = `
      margin-top: 20px;
      padding: 12px 24px;
      background: #10B981;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: background 0.2s;
    `;
    dataExportBtn.addEventListener('mouseenter', () => {
      dataExportBtn.style.background = '#059669';
    });
    dataExportBtn.addEventListener('mouseleave', () => {
      dataExportBtn.style.background = '#10B981';
    });
    dataExportBtn.addEventListener('click', () => {
      const data = AppState.getData();
      ExportUtils.exportAsJSON(data, 'battery-industry-data.json');
    });
    heroSection.appendChild(dataExportBtn);
  }
}

function addFilterControls() {
  // Add filter panel
  const filterPanel = document.createElement('div');
  filterPanel.id = 'filterPanel';
  filterPanel.style.cssText = `
    position: fixed;
    right: 20px;
    top: 100px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 300px;
    z-index: 100;
    display: none;
  `;

  filterPanel.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 18px;">Filters</h3>
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 600;">Year Range</label>
      <input type="range" id="yearRangeMin" min="2015" max="2030" value="2015" style="width: 100%;">
      <input type="range" id="yearRangeMax" min="2015" max="2030" value="2030" style="width: 100%;">
      <div id="yearRangeDisplay" style="font-size: 14px; color: #6B7280; margin-top: 4px;">2015 - 2030</div>
    </div>
    <button id="clearFilters" style="
      width: 100%;
      padding: 10px;
      background: #EF4444;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    ">Clear Filters</button>
    <button id="closeFilters" style="
      width: 100%;
      margin-top: 8px;
      padding: 10px;
      background: #6B7280;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    ">Close</button>
  `;

  document.body.appendChild(filterPanel);

  // Add filter toggle button
  const filterToggle = document.createElement('button');
  filterToggle.id = 'filterToggle';
  filterToggle.textContent = '🔍 Filters';
  filterToggle.style.cssText = `
    position: fixed;
    right: 20px;
    top: 100px;
    padding: 12px 20px;
    background: #3B82F6;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 99;
  `;

  filterToggle.addEventListener('click', () => {
    filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
  });

  document.body.appendChild(filterToggle);

  // Filter event listeners
  document.getElementById('yearRangeMin')?.addEventListener('input', updateYearRange);
  document.getElementById('yearRangeMax')?.addEventListener('input', updateYearRange);
  document.getElementById('clearFilters')?.addEventListener('click', () => {
    AppState.clearFilters();
    document.getElementById('yearRangeMin').value = 2015;
    document.getElementById('yearRangeMax').value = 2030;
    updateYearRange();
  });
  document.getElementById('closeFilters')?.addEventListener('click', () => {
    filterPanel.style.display = 'none';
  });
}

function updateYearRange() {
  const min = parseInt(document.getElementById('yearRangeMin').value);
  const max = parseInt(document.getElementById('yearRangeMax').value);

  if (min > max) {
    document.getElementById('yearRangeMin').value = max;
    return;
  }

  document.getElementById('yearRangeDisplay').textContent = `${min} - ${max}`;
  AppState.setFilter('yearRange', [min, max]);
}

function enhanceNavigation() {
  // Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTop.style.display = 'block';
      } else {
        backToTop.style.display = 'none';
      }
    });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

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

// Update all charts with filtered data
window.updateAllCharts = function() {
  const filteredData = AppState.getFilteredData();

  // Destroy and recreate charts with filtered data
  Object.values(AppState.charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });

  // Recreate charts
  if (filteredData.costCurve) ChartComponents.createCostCurveChart(filteredData.costCurve);
  if (filteredData.capacityGrowth) ChartComponents.createCapacityGrowthChart(filteredData.capacityGrowth);
  if (filteredData.topCompanies) ChartComponents.createTopCompaniesChart(filteredData.topCompanies);
  if (filteredData.stateRankings) ChartComponents.createStateRankingsChart(filteredData.stateRankings);
};

// Responsive handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    Object.values(AppState.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }, 250);
});

// Cleanup function
window.destroyAllCharts = function() {
  Object.values(AppState.charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') {
      chart.destroy();
    }
  });
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
  initializeDashboard();
}

// Export global interface
window.batteryDashboard = {
  initialize: initializeDashboard,
  destroy: window.destroyAllCharts,
  charts: AppState.charts,
  state: AppState,
  export: ExportUtils,
  dataTransform: DataTransform
};
