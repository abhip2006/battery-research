/**
 * Scenario Modeling and Advanced Analytics Component
 * Allows users to model different scenarios and see forecast impacts
 * Features:
 * - IRA (Inflation Reduction Act) impact modeling
 * - Supply chain constraint scenarios
 * - Technology adoption scenarios
 * - Market demand scenarios
 */

const ScenarioModeling = {
  baselineData: null,
  currentScenario: null,
  scenarioChart: null,

  /**
   * Initialize scenario modeling interface
   */
  init(containerId, data) {
    this.baselineData = JSON.parse(JSON.stringify(data)); // Deep copy

    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    // Create scenario control panel
    this.createControlPanel(container);

    // Create comparison chart
    this.createComparisonChart(container);

    // Set default scenario
    this.applyScenario('baseline');
  },

  /**
   * Create scenario control panel
   */
  createControlPanel(container) {
    const panel = document.createElement('div');
    panel.id = 'scenario-control-panel';
    panel.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 24px;
    `;

    panel.innerHTML = `
      <h3 style="margin: 0 0 20px 0; font-size: 20px; color: #1e3a8a;">
        📊 Scenario Modeling Dashboard
      </h3>

      <!-- Scenario Selection -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 600;">
          Select Scenario:
        </label>
        <select id="scenario-selector" style="
          width: 100%;
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
        ">
          <option value="baseline">Baseline (Current Trajectory)</option>
          <option value="ira-optimistic">IRA Impact - Optimistic (20% boost)</option>
          <option value="ira-moderate">IRA Impact - Moderate (10% boost)</option>
          <option value="supply-constraint">Supply Chain Constraint (-15%)</option>
          <option value="tech-breakthrough">Technology Breakthrough (Solid-state success)</option>
          <option value="market-slowdown">Market Demand Slowdown (-20%)</option>
          <option value="rapid-adoption">Rapid EV Adoption (+30%)</option>
          <option value="china-competition">Increased China Competition (-10%)</option>
        </select>
      </div>

      <!-- Custom Adjustments -->
      <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 12px 0; font-size: 16px;">Custom Adjustments:</h4>

        <!-- Capacity Growth Modifier -->
        <div style="margin-bottom: 16px;">
          <label style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Capacity Growth Modifier:</span>
            <span id="capacity-modifier-value" style="font-weight: bold; color: #3b82f6;">100%</span>
          </label>
          <input type="range" id="capacity-modifier" min="50" max="150" value="100" step="5" style="width: 100%;">
        </div>

        <!-- Cost Reduction Modifier -->
        <div style="margin-bottom: 16px;">
          <label style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Cost Reduction Rate:</span>
            <span id="cost-modifier-value" style="font-weight: bold; color: #10b981;">100%</span>
          </label>
          <input type="range" id="cost-modifier" min="50" max="150" value="100" step="5" style="width: 100%;">
        </div>

        <!-- LFP Market Share -->
        <div style="margin-bottom: 16px;">
          <label style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>LFP Market Share Target (2030):</span>
            <span id="lfp-share-value" style="font-weight: bold; color: #f59e0b;">40%</span>
          </label>
          <input type="range" id="lfp-share" min="20" max="60" value="40" step="5" style="width: 100%;">
        </div>

        <!-- Solid-state Market Share -->
        <div style="margin-bottom: 16px;">
          <label style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Solid-state Market Share (2030):</span>
            <span id="solid-state-share-value" style="font-weight: bold; color: #8b5cf6;">10%</span>
          </label>
          <input type="range" id="solid-state-share" min="0" max="30" value="10" step="5" style="width: 100%;">
        </div>

        <button id="apply-custom-scenario" style="
          width: 100%;
          padding: 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
        ">
          Apply Custom Scenario
        </button>
      </div>

      <!-- Scenario Summary -->
      <div id="scenario-summary" style="
        background: #eff6ff;
        border-left: 4px solid #3b82f6;
        padding: 16px;
        border-radius: 8px;
      "></div>

      <!-- Export Scenario -->
      <div style="margin-top: 20px; display: flex; gap: 8px;">
        <button id="export-scenario-json" style="
          flex: 1;
          padding: 10px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">
          Export JSON
        </button>
        <button id="export-scenario-csv" style="
          flex: 1;
          padding: 10px;
          background: #059669;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">
          Export CSV
        </button>
        <button id="reset-scenario" style="
          flex: 1;
          padding: 10px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        ">
          Reset
        </button>
      </div>
    `;

    container.appendChild(panel);

    // Add event listeners
    this.attachEventListeners();
  },

  /**
   * Attach event listeners to controls
   */
  attachEventListeners() {
    // Scenario selector
    document.getElementById('scenario-selector')?.addEventListener('change', (e) => {
      this.applyScenario(e.target.value);
    });

    // Sliders
    document.getElementById('capacity-modifier')?.addEventListener('input', (e) => {
      document.getElementById('capacity-modifier-value').textContent = `${e.target.value}%`;
    });

    document.getElementById('cost-modifier')?.addEventListener('input', (e) => {
      document.getElementById('cost-modifier-value').textContent = `${e.target.value}%`;
    });

    document.getElementById('lfp-share')?.addEventListener('input', (e) => {
      document.getElementById('lfp-share-value').textContent = `${e.target.value}%`;
    });

    document.getElementById('solid-state-share')?.addEventListener('input', (e) => {
      document.getElementById('solid-state-share-value').textContent = `${e.target.value}%`;
    });

    // Apply custom scenario
    document.getElementById('apply-custom-scenario')?.addEventListener('click', () => {
      this.applyCustomScenario();
    });

    // Export buttons
    document.getElementById('export-scenario-json')?.addEventListener('click', () => {
      this.exportScenario('json');
    });

    document.getElementById('export-scenario-csv')?.addEventListener('click', () => {
      this.exportScenario('csv');
    });

    // Reset button
    document.getElementById('reset-scenario')?.addEventListener('click', () => {
      this.resetToBaseline();
    });
  },

  /**
   * Create comparison chart
   */
  createComparisonChart(container) {
    const chartContainer = document.createElement('div');
    chartContainer.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    chartContainer.innerHTML = `
      <h3 style="margin: 0 0 20px 0; font-size: 18px;">
        Baseline vs. Scenario Comparison
      </h3>
      <div style="height: 400px;">
        <canvas id="scenario-comparison-chart"></canvas>
      </div>
    `;

    container.appendChild(chartContainer);
  },

  /**
   * Apply predefined scenario
   */
  applyScenario(scenarioId) {
    this.currentScenario = scenarioId;

    let modifiedData = JSON.parse(JSON.stringify(this.baselineData));

    switch (scenarioId) {
      case 'ira-optimistic':
        modifiedData = this.applyIRAOptimistic(modifiedData);
        break;
      case 'ira-moderate':
        modifiedData = this.applyIRAModerate(modifiedData);
        break;
      case 'supply-constraint':
        modifiedData = this.applySupplyConstraint(modifiedData);
        break;
      case 'tech-breakthrough':
        modifiedData = this.applyTechBreakthrough(modifiedData);
        break;
      case 'market-slowdown':
        modifiedData = this.applyMarketSlowdown(modifiedData);
        break;
      case 'rapid-adoption':
        modifiedData = this.applyRapidAdoption(modifiedData);
        break;
      case 'china-competition':
        modifiedData = this.applyChinaCompetition(modifiedData);
        break;
      default:
        // Baseline - no modifications
        break;
    }

    this.updateChart(modifiedData);
    this.updateSummary(scenarioId, modifiedData);
  },

  /**
   * Apply custom scenario based on slider values
   */
  applyCustomScenario() {
    const capacityMod = parseInt(document.getElementById('capacity-modifier').value) / 100;
    const costMod = parseInt(document.getElementById('cost-modifier').value) / 100;
    const lfpShare = parseInt(document.getElementById('lfp-share').value);
    const solidStateShare = parseInt(document.getElementById('solid-state-share').value);

    let modifiedData = JSON.parse(JSON.stringify(this.baselineData));

    // Modify capacity growth
    if (modifiedData.capacityGrowth) {
      modifiedData.capacityGrowth = modifiedData.capacityGrowth.map(d => ({
        ...d,
        capacity: Math.round(d.capacity * capacityMod)
      }));
    }

    // Modify cost curve
    if (modifiedData.costCurve) {
      modifiedData.costCurve = modifiedData.costCurve.map(d => ({
        ...d,
        cost: Math.round(d.cost * costMod)
      }));
    }

    // Modify 2030 technology mix
    if (modifiedData.technologyMix && modifiedData.technologyMix['2030']) {
      const remaining = 100 - lfpShare - solidStateShare;
      modifiedData.technologyMix['2030'] = {
        'LFP': lfpShare,
        'SolidState': solidStateShare,
        'NMC': Math.round(remaining * 0.6),
        'Sodium-ion': Math.round(remaining * 0.3),
        'Other': Math.round(remaining * 0.1)
      };
    }

    this.currentScenario = 'custom';
    this.updateChart(modifiedData);
    this.updateSummary('custom', modifiedData);
  },

  /**
   * IRA Optimistic Scenario - 20% boost to capacity
   */
  applyIRAOptimistic(data) {
    if (data.capacityGrowth) {
      data.capacityGrowth = data.capacityGrowth.map(d => {
        if (d.year >= 2024) {
          return { ...d, capacity: Math.round(d.capacity * 1.2) };
        }
        return d;
      });
    }

    if (data.costCurve) {
      data.costCurve = data.costCurve.map(d => {
        if (d.year >= 2024) {
          return { ...d, cost: Math.round(d.cost * 0.9) }; // Faster cost reduction
        }
        return d;
      });
    }

    return data;
  },

  /**
   * IRA Moderate Scenario - 10% boost to capacity
   */
  applyIRAModerate(data) {
    if (data.capacityGrowth) {
      data.capacityGrowth = data.capacityGrowth.map(d => {
        if (d.year >= 2024) {
          return { ...d, capacity: Math.round(d.capacity * 1.1) };
        }
        return d;
      });
    }

    if (data.costCurve) {
      data.costCurve = data.costCurve.map(d => {
        if (d.year >= 2024) {
          return { ...d, cost: Math.round(d.cost * 0.95) };
        }
        return d;
      });
    }

    return data;
  },

  /**
   * Supply Chain Constraint Scenario
   */
  applySupplyConstraint(data) {
    if (data.capacityGrowth) {
      data.capacityGrowth = data.capacityGrowth.map(d => {
        if (d.year >= 2024) {
          return { ...d, capacity: Math.round(d.capacity * 0.85) };
        }
        return d;
      });
    }

    if (data.costCurve) {
      data.costCurve = data.costCurve.map(d => {
        if (d.year >= 2024) {
          return { ...d, cost: Math.round(d.cost * 1.1) }; // Higher costs due to constraints
        }
        return d;
      });
    }

    return data;
  },

  /**
   * Technology Breakthrough Scenario (Solid-state success)
   */
  applyTechBreakthrough(data) {
    if (data.technologyMix && data.technologyMix['2030']) {
      data.technologyMix['2030'] = {
        'Solid-state': 25,
        'LFP': 35,
        'NMC': 25,
        'Sodium-ion': 10,
        'Other': 5
      };
    }

    if (data.energyDensity && data.energyDensity.SolidState) {
      data.energyDensity.SolidState['2030'] = {
        cellLevel: 500,
        packLevel: 420
      };
    }

    return data;
  },

  /**
   * Market Slowdown Scenario
   */
  applyMarketSlowdown(data) {
    if (data.capacityGrowth) {
      data.capacityGrowth = data.capacityGrowth.map(d => {
        if (d.year >= 2024) {
          return { ...d, capacity: Math.round(d.capacity * 0.8) };
        }
        return d;
      });
    }

    return data;
  },

  /**
   * Rapid Adoption Scenario
   */
  applyRapidAdoption(data) {
    if (data.capacityGrowth) {
      data.capacityGrowth = data.capacityGrowth.map(d => {
        if (d.year >= 2024) {
          return { ...d, capacity: Math.round(d.capacity * 1.3) };
        }
        return d;
      });
    }

    if (data.costCurve) {
      data.costCurve = data.costCurve.map(d => {
        if (d.year >= 2024) {
          return { ...d, cost: Math.round(d.cost * 0.85) };
        }
        return d;
      });
    }

    return data;
  },

  /**
   * China Competition Scenario
   */
  applyChinaCompetition(data) {
    if (data.capacityGrowth) {
      data.capacityGrowth = data.capacityGrowth.map(d => {
        if (d.year >= 2024) {
          return { ...d, capacity: Math.round(d.capacity * 0.9) };
        }
        return d;
      });
    }

    return data;
  },

  /**
   * Update comparison chart
   */
  updateChart(scenarioData) {
    const ctx = document.getElementById('scenario-comparison-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (this.scenarioChart) {
      this.scenarioChart.destroy();
    }

    const years = this.baselineData.capacityGrowth.map(d => d.year);
    const baselineCapacity = this.baselineData.capacityGrowth.map(d => d.capacity);
    const scenarioCapacity = scenarioData.capacityGrowth.map(d => d.capacity);

    this.scenarioChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Baseline',
            data: baselineCapacity,
            borderColor: '#6B7280',
            backgroundColor: 'rgba(107, 114, 128, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: 'Scenario',
            data: scenarioCapacity,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: false
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
                return `${context.dataset.label}: ${context.parsed.y} GWh`;
              },
              afterLabel: function(context) {
                if (context.datasetIndex === 1) {
                  const baselineValue = baselineCapacity[context.dataIndex];
                  const diff = context.parsed.y - baselineValue;
                  const pct = ((diff / baselineValue) * 100).toFixed(1);
                  return `Difference: ${diff > 0 ? '+' : ''}${diff} GWh (${pct}%)`;
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
  },

  /**
   * Update scenario summary
   */
  updateSummary(scenarioId, data) {
    const summary = document.getElementById('scenario-summary');
    if (!summary) return;

    const baseline2030 = this.baselineData.capacityGrowth.find(d => d.year === 2030)?.capacity || 0;
    const scenario2030 = data.capacityGrowth.find(d => d.year === 2030)?.capacity || 0;
    const diff = scenario2030 - baseline2030;
    const pct = ((diff / baseline2030) * 100).toFixed(1);

    const baselineCost2030 = this.baselineData.costCurve.find(d => d.year === 2030)?.cost || 0;
    const scenarioCost2030 = data.costCurve.find(d => d.year === 2030)?.cost || 0;
    const costDiff = scenarioCost2030 - baselineCost2030;

    const scenarioNames = {
      'baseline': 'Baseline Scenario',
      'ira-optimistic': 'IRA Impact - Optimistic',
      'ira-moderate': 'IRA Impact - Moderate',
      'supply-constraint': 'Supply Chain Constraint',
      'tech-breakthrough': 'Technology Breakthrough',
      'market-slowdown': 'Market Demand Slowdown',
      'rapid-adoption': 'Rapid EV Adoption',
      'china-competition': 'Increased China Competition',
      'custom': 'Custom Scenario'
    };

    summary.innerHTML = `
      <h4 style="margin: 0 0 12px 0; font-size: 16px; color: #1e3a8a;">
        ${scenarioNames[scenarioId] || 'Unknown Scenario'}
      </h4>
      <div style="display: grid; gap: 12px;">
        <div>
          <strong>2030 Capacity:</strong> ${scenario2030} GWh
          <span style="color: ${diff >= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">
            (${diff >= 0 ? '+' : ''}${diff} GWh, ${pct}%)
          </span>
        </div>
        <div>
          <strong>2030 Cost:</strong> $${scenarioCost2030}/kWh
          <span style="color: ${costDiff <= 0 ? '#059669' : '#dc2626'}; font-weight: 600;">
            (${costDiff >= 0 ? '+' : ''}$${costDiff}/kWh)
          </span>
        </div>
        <div>
          <strong>Total Impact:</strong>
          ${diff >= 0 ? 'Positive' : 'Negative'} capacity change of
          ${Math.abs(diff).toLocaleString()} GWh by 2030
        </div>
      </div>
    `;
  },

  /**
   * Export scenario data
   */
  exportScenario(format) {
    if (!this.currentScenario) return;

    const scenarioData = {
      scenario: this.currentScenario,
      timestamp: new Date().toISOString(),
      data: this.getCurrentScenarioData()
    };

    if (format === 'json') {
      const json = JSON.stringify(scenarioData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = `scenario-${this.currentScenario}-${Date.now()}.json`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } else if (format === 'csv') {
      // Export capacity comparison as CSV
      const headers = ['Year', 'Baseline', 'Scenario', 'Difference', 'Difference %'];
      const rows = this.baselineData.capacityGrowth.map((d, i) => {
        const scenarioValue = scenarioData.data.capacityGrowth[i].capacity;
        const diff = scenarioValue - d.capacity;
        const pct = ((diff / d.capacity) * 100).toFixed(2);
        return [d.year, d.capacity, scenarioValue, diff, pct];
      });

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const link = document.createElement('a');
      link.download = `scenario-${this.currentScenario}-${Date.now()}.csv`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  },

  /**
   * Get current scenario data
   */
  getCurrentScenarioData() {
    // This would return the currently displayed scenario data
    // For now, just reapply the current scenario
    let data = JSON.parse(JSON.stringify(this.baselineData));
    if (this.currentScenario !== 'baseline' && this.currentScenario !== 'custom') {
      this.applyScenario(this.currentScenario);
    }
    return data;
  },

  /**
   * Reset to baseline
   */
  resetToBaseline() {
    document.getElementById('scenario-selector').value = 'baseline';
    document.getElementById('capacity-modifier').value = 100;
    document.getElementById('cost-modifier').value = 100;
    document.getElementById('lfp-share').value = 40;
    document.getElementById('solid-state-share').value = 10;

    document.getElementById('capacity-modifier-value').textContent = '100%';
    document.getElementById('cost-modifier-value').textContent = '100%';
    document.getElementById('lfp-share-value').textContent = '40%';
    document.getElementById('solid-state-share-value').textContent = '10%';

    this.applyScenario('baseline');
  },

  /**
   * Destroy scenario modeling
   */
  destroy() {
    if (this.scenarioChart) {
      this.scenarioChart.destroy();
      this.scenarioChart = null;
    }
    this.baselineData = null;
    this.currentScenario = null;
  }
};

// Export for global use
window.ScenarioModeling = ScenarioModeling;
