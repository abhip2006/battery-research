/**
 * Network Graph Component for Supply Chain Visualization
 * Uses D3.js for force-directed graph visualization
 * Shows relationships between companies, technologies, and supply chain
 */

const NetworkGraph = {
  svg: null,
  simulation: null,
  nodes: [],
  links: [],

  /**
   * Initialize network graph
   */
  initGraph(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return null;
    }

    // Clear existing content
    container.innerHTML = '';

    // Set dimensions
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    // Create SVG
    this.svg = d3.select(`#${containerId}`)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; border-radius: 12px; background: #f9fafb;');

    // Add zoom behavior
    const g = this.svg.append('g');

    this.svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      }));

    // Prepare network data
    this.prepareNetworkData(data);

    // Create force simulation
    this.simulation = d3.forceSimulation(this.nodes)
      .force('link', d3.forceLink(this.links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40));

    // Draw links
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.value));

    // Draw nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(this.nodes)
      .enter()
      .append('g')
      .call(this.drag(this.simulation));

    // Add circles for nodes
    node.append('circle')
      .attr('r', d => d.size || 20)
      .attr('fill', d => this.getNodeColor(d.type))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d.size || 20) * 1.5)
          .attr('stroke-width', 4);

        // Show tooltip
        NetworkGraph.showTooltip(event, d);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.size || 20)
          .attr('stroke-width', 2);

        NetworkGraph.hideTooltip();
      });

    // Add labels
    node.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => (d.size || 20) + 15)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', '#374151');

    // Add icons for node types
    node.append('text')
      .text(d => this.getNodeIcon(d.type))
      .attr('x', 0)
      .attr('y', 5)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => (d.size || 20) * 0.8)
      .attr('fill', '#fff');

    // Update positions on simulation tick
    this.simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Add legend
    this.addLegend(container);

    return this.svg;
  },

  /**
   * Prepare network data from battery industry data
   */
  prepareNetworkData(data) {
    this.nodes = [];
    this.links = [];

    // Add company nodes
    if (data.topCompanies) {
      data.topCompanies.forEach(company => {
        this.nodes.push({
          id: `company_${company.name}`,
          label: company.name,
          type: 'company',
          size: 15 + (company.capacity / 10),
          capacity: company.capacity,
          technology: company.technology
        });
      });
    }

    // Add technology nodes
    const technologies = ['LFP', 'NMC', 'NCA', 'Solid-state', 'Sodium-ion'];
    technologies.forEach(tech => {
      this.nodes.push({
        id: `tech_${tech}`,
        label: tech,
        type: 'technology',
        size: 25
      });
    });

    // Add supply chain component nodes
    const components = ['Cathode', 'Anode', 'Electrolyte', 'Separator', 'Cell'];
    components.forEach(component => {
      this.nodes.push({
        id: `component_${component}`,
        label: component,
        type: 'component',
        size: 20
      });
    });

    // Create links between companies and technologies
    if (data.topCompanies) {
      data.topCompanies.forEach(company => {
        technologies.forEach(tech => {
          if (company.technology.includes(tech)) {
            this.links.push({
              source: `company_${company.name}`,
              target: `tech_${tech}`,
              value: 2,
              type: 'produces'
            });
          }
        });
      });
    }

    // Create links between technologies and components
    const techComponentLinks = {
      'LFP': ['Cathode', 'Anode', 'Electrolyte', 'Separator', 'Cell'],
      'NMC': ['Cathode', 'Anode', 'Electrolyte', 'Separator', 'Cell'],
      'NCA': ['Cathode', 'Anode', 'Electrolyte', 'Separator', 'Cell'],
      'Solid-state': ['Cathode', 'Anode', 'Electrolyte', 'Cell'],
      'Sodium-ion': ['Cathode', 'Anode', 'Electrolyte', 'Separator', 'Cell']
    };

    Object.entries(techComponentLinks).forEach(([tech, comps]) => {
      comps.forEach(comp => {
        this.links.push({
          source: `tech_${tech}`,
          target: `component_${comp}`,
          value: 1,
          type: 'requires'
        });
      });
    });

    // Add regional cluster nodes if available
    if (data.regionalClusters) {
      data.regionalClusters.forEach(cluster => {
        this.nodes.push({
          id: `cluster_${cluster.name}`,
          label: cluster.name.split(' ')[0], // Short label
          type: 'cluster',
          size: 15 + (cluster.totalCapacity / 20),
          capacity: cluster.totalCapacity
        });

        // Link companies to their clusters
        cluster.dominantPlayers.forEach(player => {
          const companyNode = this.nodes.find(n => n.label === player);
          if (companyNode) {
            this.links.push({
              source: companyNode.id,
              target: `cluster_${cluster.name}`,
              value: 1,
              type: 'located_in'
            });
          }
        });
      });
    }
  },

  /**
   * Get node color based on type
   */
  getNodeColor(type) {
    const colors = {
      company: '#3B82F6',      // Blue
      technology: '#10B981',   // Green
      component: '#F59E0B',    // Orange
      cluster: '#8B5CF6',      // Purple
      supplier: '#EC4899'      // Pink
    };
    return colors[type] || '#6B7280';
  },

  /**
   * Get icon for node type
   */
  getNodeIcon(type) {
    const icons = {
      company: '🏢',
      technology: '⚡',
      component: '🔧',
      cluster: '📍',
      supplier: '📦'
    };
    return icons[type] || '●';
  },

  /**
   * Drag behavior for nodes
   */
  drag(simulation) {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  },

  /**
   * Show tooltip
   */
  showTooltip(event, d) {
    let tooltip = document.getElementById('network-tooltip');

    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'network-tooltip';
      tooltip.style.cssText = `
        position: absolute;
        background: white;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        pointer-events: none;
        z-index: 1000;
        font-size: 14px;
        max-width: 250px;
      `;
      document.body.appendChild(tooltip);
    }

    let content = `
      <div style="font-weight: bold; margin-bottom: 8px; color: ${this.getNodeColor(d.type)};">
        ${d.label}
      </div>
      <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
        Type: ${d.type.charAt(0).toUpperCase() + d.type.slice(1)}
      </div>
    `;

    if (d.capacity) {
      content += `
        <div style="font-size: 12px; color: #6B7280;">
          Capacity: ${d.capacity} GWh
        </div>
      `;
    }

    if (d.technology) {
      content += `
        <div style="font-size: 12px; color: #6B7280;">
          Technology: ${d.technology}
        </div>
      `;
    }

    tooltip.innerHTML = content;
    tooltip.style.display = 'block';
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
  },

  /**
   * Hide tooltip
   */
  hideTooltip() {
    const tooltip = document.getElementById('network-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  },

  /**
   * Add legend to the graph
   */
  addLegend(container) {
    const legend = document.createElement('div');
    legend.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      font-size: 12px;
    `;

    const types = [
      { type: 'company', label: 'Companies' },
      { type: 'technology', label: 'Technologies' },
      { type: 'component', label: 'Components' },
      { type: 'cluster', label: 'Regional Clusters' }
    ];

    legend.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">Network Legend</div>
      ${types.map(t => `
        <div style="display: flex; align-items: center; margin: 6px 0;">
          <div style="
            width: 16px;
            height: 16px;
            background: ${this.getNodeColor(t.type)};
            border: 2px solid #fff;
            border-radius: 50%;
            margin-right: 8px;
          "></div>
          <span>${t.label}</span>
        </div>
      `).join('')}
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6B7280;">
        Drag nodes to rearrange<br>
        Scroll to zoom<br>
        Hover for details
      </div>
    `;

    container.style.position = 'relative';
    container.appendChild(legend);
  },

  /**
   * Filter network by type
   */
  filterByType(type) {
    if (!this.svg) return;

    this.svg.selectAll('g.nodes g')
      .transition()
      .duration(300)
      .style('opacity', d => {
        if (!type || d.type === type) {
          return 1;
        }
        return 0.2;
      });

    this.svg.selectAll('g.links line')
      .transition()
      .duration(300)
      .style('opacity', d => {
        if (!type || d.source.type === type || d.target.type === type) {
          return 0.6;
        }
        return 0.1;
      });
  },

  /**
   * Reset filter
   */
  resetFilter() {
    if (!this.svg) return;

    this.svg.selectAll('g.nodes g')
      .transition()
      .duration(300)
      .style('opacity', 1);

    this.svg.selectAll('g.links line')
      .transition()
      .duration(300)
      .style('opacity', 0.6);
  },

  /**
   * Highlight connections for a specific node
   */
  highlightConnections(nodeId) {
    if (!this.svg) return;

    const connectedNodes = new Set();
    connectedNodes.add(nodeId);

    this.links.forEach(link => {
      if (link.source.id === nodeId) {
        connectedNodes.add(link.target.id);
      } else if (link.target.id === nodeId) {
        connectedNodes.add(link.source.id);
      }
    });

    this.svg.selectAll('g.nodes g')
      .transition()
      .duration(300)
      .style('opacity', d => connectedNodes.has(d.id) ? 1 : 0.2);

    this.svg.selectAll('g.links line')
      .transition()
      .duration(300)
      .style('opacity', d => {
        if (d.source.id === nodeId || d.target.id === nodeId) {
          return 1;
        }
        return 0.1;
      })
      .style('stroke-width', d => {
        if (d.source.id === nodeId || d.target.id === nodeId) {
          return Math.sqrt(d.value) * 2;
        }
        return Math.sqrt(d.value);
      });
  },

  /**
   * Export network as SVG
   */
  exportAsSVG(filename = 'network-graph.svg') {
    if (!this.svg) return;

    const svgElement = this.svg.node();
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  },

  /**
   * Destroy the network graph
   */
  destroy() {
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }

    if (this.svg) {
      this.svg.remove();
      this.svg = null;
    }

    this.nodes = [];
    this.links = [];

    const tooltip = document.getElementById('network-tooltip');
    if (tooltip) {
      tooltip.remove();
    }
  }
};

// Export for global use
window.NetworkGraph = NetworkGraph;
