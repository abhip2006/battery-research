/**
 * Interactive Geographic Map Component
 * US Battery Manufacturing Facilities Heat Map
 * Uses Leaflet.js for interactive mapping
 */

const MapComponent = {
  map: null,
  markers: [],
  heatLayer: null,

  // US state coordinates (approximate center points)
  stateCoordinates: {
    'Nevada': [39.8283, -116.4194],
    'Tennessee': [35.5175, -86.5804],
    'Kentucky': [37.8393, -84.2700],
    'Ohio': [40.4173, -82.9071],
    'Indiana': [40.2672, -86.1349],
    'Michigan': [44.3148, -85.6024],
    'Illinois': [40.6331, -89.3985],
    'Arizona': [34.0489, -111.0937],
    'Georgia': [32.1656, -82.9001],
    'North Carolina': [35.7596, -79.0193],
    'South Carolina': [33.8361, -81.1637],
    'Kansas': [39.0119, -98.4842],
    'Mississippi': [32.3547, -89.3985],
    'Alabama': [32.3182, -86.9023],
    'West Virginia': [38.5976, -80.4549],
    'California': [36.7783, -119.4179],
    'Texas': [31.9686, -99.9018]
  },

  /**
   * Initialize the map
   */
  initMap(containerId = 'mapContainer', data) {
    // Create map container if it doesn't exist
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.style.cssText = `
        width: 100%;
        height: 600px;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      `;

      const mapSection = document.querySelector('#states .container');
      if (mapSection) {
        mapSection.appendChild(container);
      }
    }

    // Initialize Leaflet map
    this.map = L.map(containerId).setView([39.8283, -98.5795], 4);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(this.map);

    // Add state markers with capacity data
    if (data && data.stateRankings) {
      this.addStateMarkers(data.stateRankings);
    }

    return this.map;
  },

  /**
   * Add state markers with capacity visualization
   */
  addStateMarkers(stateData) {
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Find max capacity for scaling
    const maxCapacity = Math.max(...stateData.map(s => s.capacity));

    stateData.forEach(state => {
      const coords = this.stateCoordinates[state.state];
      if (!coords) return;

      // Calculate marker size based on capacity
      const radius = 10 + (state.capacity / maxCapacity) * 40;

      // Create circle marker
      const marker = L.circleMarker(coords, {
        radius: radius,
        fillColor: this.getCapacityColor(state.capacity),
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.7
      }).addTo(this.map);

      // Add popup with state information
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 18px;">
            ${state.state}
          </h3>
          <div style="margin-bottom: 8px;">
            <strong>Capacity:</strong> ${state.capacity} GWh
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Facilities:</strong> ${state.facilities}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Companies:</strong>
            <ul style="margin: 4px 0; padding-left: 20px;">
              ${state.companies.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
          <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; margin-top: 8px;">
            <strong style="font-size: 12px;">Flagship Facility:</strong>
            <div style="font-size: 12px; margin-top: 4px;">${state.flagship}</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add hover effects
      marker.on('mouseover', function() {
        this.setStyle({
          fillOpacity: 0.9,
          weight: 3
        });
      });

      marker.on('mouseout', function() {
        this.setStyle({
          fillOpacity: 0.7,
          weight: 2
        });
      });

      // Store marker reference
      this.markers.push(marker);
    });

    // Add legend
    this.addLegend();
  },

  /**
   * Get color based on capacity
   */
  getCapacityColor(capacity) {
    if (capacity >= 100) return '#059669'; // High capacity - green
    if (capacity >= 70) return '#10b981';
    if (capacity >= 50) return '#3b82f6'; // Medium capacity - blue
    if (capacity >= 30) return '#60a5fa';
    if (capacity >= 15) return '#f59e0b'; // Low capacity - orange
    return '#ef4444'; // Very low capacity - red
  },

  /**
   * Add map legend
   */
  addLegend() {
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function() {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.cssText = `
        background: white;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        font-size: 12px;
      `;

      const grades = [0, 15, 30, 50, 70, 100];
      const labels = ['<strong>Capacity (GWh)</strong>'];

      for (let i = 0; i < grades.length; i++) {
        const from = grades[i];
        const to = grades[i + 1];
        const color = MapComponent.getCapacityColor(from + 1);

        labels.push(
          `<div style="display: flex; align-items: center; margin: 4px 0;">
            <div style="
              width: 18px;
              height: 18px;
              background: ${color};
              border: 2px solid #fff;
              border-radius: 50%;
              margin-right: 8px;
            "></div>
            <span>${from}${to ? `&ndash;${to}` : '+'}</span>
          </div>`
        );
      }

      div.innerHTML = labels.join('');
      return div;
    };

    legend.addTo(this.map);
  },

  /**
   * Create heat map visualization
   */
  createHeatMap(data) {
    // Prepare heat map data
    const heatData = data.stateRankings.map(state => {
      const coords = this.stateCoordinates[state.state];
      if (!coords) return null;
      return [...coords, state.capacity / 10]; // Intensity based on capacity
    }).filter(d => d !== null);

    // Add heat layer (requires Leaflet.heat plugin)
    if (typeof L.heatLayer !== 'undefined') {
      if (this.heatLayer) {
        this.map.removeLayer(this.heatLayer);
      }

      this.heatLayer = L.heatLayer(heatData, {
        radius: 50,
        blur: 40,
        maxZoom: 10,
        max: 1.0,
        gradient: {
          0.0: '#3B82F6',
          0.5: '#F59E0B',
          1.0: '#EF4444'
        }
      }).addTo(this.map);
    }
  },

  /**
   * Create cluster visualization
   */
  createClusterMap(data) {
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    if (!data.regionalClusters) return;

    data.regionalClusters.forEach((cluster, index) => {
      // Calculate average coordinates for cluster
      const clusterCoords = this.getClusterCenter(cluster.states);
      if (!clusterCoords) return;

      // Create cluster marker
      const marker = L.circle(clusterCoords, {
        radius: cluster.totalCapacity * 500, // Scale radius by capacity
        fillColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index % 4],
        color: '#fff',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.4
      }).addTo(this.map);

      // Add popup with cluster information
      const popupContent = `
        <div style="min-width: 250px;">
          <h3 style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 18px;">
            ${cluster.name}
          </h3>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;">
            <div>
              <div style="font-size: 20px; font-weight: bold; color: #3b82f6;">
                ${cluster.totalCapacity}
              </div>
              <div style="font-size: 11px; color: #6b7280;">GWh</div>
            </div>
            <div>
              <div style="font-size: 20px; font-weight: bold; color: #10b981;">
                ${cluster.numFacilities}
              </div>
              <div style="font-size: 11px; color: #6b7280;">Facilities</div>
            </div>
            <div>
              <div style="font-size: 20px; font-weight: bold; color: #f59e0b;">
                ${cluster.employment.toLocaleString()}
              </div>
              <div style="font-size: 11px; color: #6b7280;">Jobs</div>
            </div>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>States:</strong> ${cluster.states.join(', ')}
          </div>
          <div style="margin-bottom: 8px;">
            <strong>Key Players:</strong>
            <div style="font-size: 12px; margin-top: 4px;">
              ${cluster.dominantPlayers.join(', ')}
            </div>
          </div>
          <div style="background: #f3f4f6; padding: 8px; border-radius: 6px; margin-top: 8px;">
            <strong style="font-size: 12px;">Advantages:</strong>
            <div style="font-size: 11px; margin-top: 4px;">
              ${cluster.advantages.join(' • ')}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add hover effects
      marker.on('mouseover', function() {
        this.setStyle({
          fillOpacity: 0.6,
          weight: 4
        });
      });

      marker.on('mouseout', function() {
        this.setStyle({
          fillOpacity: 0.4,
          weight: 3
        });
      });

      this.markers.push(marker);
    });
  },

  /**
   * Get center coordinates for a cluster of states
   */
  getClusterCenter(states) {
    const coords = states.map(state => this.stateCoordinates[state]).filter(c => c);
    if (coords.length === 0) return null;

    const avgLat = coords.reduce((sum, c) => sum + c[0], 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c[1], 0) / coords.length;

    return [avgLat, avgLng];
  },

  /**
   * Add facility markers with custom icons
   */
  addFacilityMarkers(facilities) {
    // Custom icon for facilities
    const facilityIcon = L.divIcon({
      className: 'facility-marker',
      html: `<div style="
        width: 24px;
        height: 24px;
        background: #3B82F6;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    facilities.forEach(facility => {
      if (!facility.coordinates) return;

      const marker = L.marker(facility.coordinates, {
        icon: facilityIcon
      }).addTo(this.map);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0;">${facility.name}</h4>
          <div><strong>Company:</strong> ${facility.company}</div>
          <div><strong>Capacity:</strong> ${facility.capacity} GWh</div>
          <div><strong>Status:</strong> ${facility.status}</div>
          ${facility.technology ? `<div><strong>Technology:</strong> ${facility.technology}</div>` : ''}
        </div>
      `);

      this.markers.push(marker);
    });
  },

  /**
   * Filter markers by criteria
   */
  filterMarkers(filterFn) {
    this.markers.forEach(marker => {
      if (filterFn(marker)) {
        marker.setStyle({ opacity: 1, fillOpacity: 0.7 });
      } else {
        marker.setStyle({ opacity: 0.3, fillOpacity: 0.2 });
      }
    });
  },

  /**
   * Reset map view
   */
  resetView() {
    if (this.map) {
      this.map.setView([39.8283, -98.5795], 4);
    }
  },

  /**
   * Destroy map instance
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.markers = [];
    this.heatLayer = null;
  }
};

// Export for global use
window.MapComponent = MapComponent;
