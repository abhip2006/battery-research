/**
 * Battery Research Search Interface
 * Handles all UI interactions for search and filtering
 */

let searchEngine;
let currentResults = [];
let currentFilters = {};
let currentQuery = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  searchEngine = new BatterySearchEngine();
  const initialized = await searchEngine.initialize();

  if (initialized) {
    console.log('Search engine initialized successfully');
    initializeUI();
    showAllResults();
  } else {
    showError('Failed to initialize search engine');
  }
});

/**
 * Initialize UI components
 */
function initializeUI() {
  // Setup event listeners
  setupSearchListeners();
  setupFilterListeners();
  setupModalListeners();

  // Initialize filters
  populateFilterOptions();

  // Show recent and saved searches
  displayRecentSearches();
  displaySavedSearches();
}

/**
 * Setup search-related event listeners
 */
function setupSearchListeners() {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const clearButton = document.getElementById('clearSearch');

  // Real-time search
  searchInput.addEventListener('input', debounce((e) => {
    const query = e.target.value;

    // Show/hide clear button
    clearButton.style.display = query ? 'block' : 'none';

    // Show autocomplete
    if (query.length >= 2) {
      showAutocomplete(query);
    } else {
      hideAutocomplete();
    }

    // Perform search
    performSearch(query);
  }, 300));

  // Search button
  searchButton.addEventListener('click', () => {
    performSearch(searchInput.value);
  });

  // Clear button
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    clearButton.style.display = 'none';
    hideAutocomplete();
    performSearch('');
  });

  // Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
      hideAutocomplete();
    }
  });

  // Toggle filters
  document.getElementById('toggleFilters').addEventListener('click', toggleFiltersPanel);

  // Save search
  document.getElementById('saveSearchBtn').addEventListener('click', openSaveSearchModal);

  // Export results
  document.getElementById('exportResultsBtn').addEventListener('click', openExportModal);

  // Sort
  document.getElementById('sortBy').addEventListener('change', (e) => {
    sortResults(e.target.value);
  });
}

/**
 * Setup filter-related event listeners
 */
function setupFilterListeners() {
  // Clear filters
  document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

  // Capacity sliders
  const capacityMin = document.getElementById('capacityMin');
  const capacityMax = document.getElementById('capacityMax');

  capacityMin.addEventListener('input', (e) => {
    document.getElementById('capacityMinValue').textContent = e.target.value;
    applyFilters();
  });

  capacityMax.addEventListener('input', (e) => {
    document.getElementById('capacityMaxValue').textContent = e.target.value;
    applyFilters();
  });

  // Filter operator
  document.querySelectorAll('input[name="filterOperator"]').forEach(radio => {
    radio.addEventListener('change', applyFilters);
  });

  // Location search
  document.getElementById('searchByLocation').addEventListener('click', searchByLocation);
}

/**
 * Setup modal event listeners
 */
function setupModalListeners() {
  document.getElementById('confirmSaveSearch').addEventListener('click', saveCurrentSearch);
}

/**
 * Populate filter options from data
 */
function populateFilterOptions() {
  const options = searchEngine.getFilterOptions();

  // Technology filters
  createCheckboxFilters('technologyFilters', options.technologies, 'technology');

  // Chemistry filters
  createCheckboxFilters('chemistryFilters', options.chemistries, 'chemistry');

  // State filters
  createCheckboxFilters('stateFilters', options.states, 'state');

  // Stage filters
  createCheckboxFilters('stageFilters', options.stages, 'stage');

  // Policy filters
  createCheckboxFilters('policyFilters', options.policies, 'policy');

  // Status filters
  createCheckboxFilters('statusFilters', options.statuses, 'status');
}

/**
 * Create checkbox filters
 */
function createCheckboxFilters(containerId, options, filterType) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  options.forEach(option => {
    const label = document.createElement('label');
    label.className = 'checkbox-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = option;
    checkbox.dataset.filterType = filterType;
    checkbox.addEventListener('change', applyFilters);

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${option}`));
    container.appendChild(label);
  });
}

/**
 * Perform search
 */
function performSearch(query) {
  currentQuery = query;
  applyFilters();
}

/**
 * Apply all filters
 */
function applyFilters() {
  // Collect active filters
  const filters = collectActiveFilters();
  currentFilters = filters;

  // Perform search with filters
  if (currentQuery) {
    currentResults = searchEngine.searchAndFilter(currentQuery, filters);
  } else {
    currentResults = searchEngine.filter(filters);
  }

  // Display results
  displayResults(currentResults);
  displayActiveFilters();
}

/**
 * Collect active filters from UI
 */
function collectActiveFilters() {
  const filters = {
    technologies: [],
    chemistries: [],
    states: [],
    stages: [],
    policies: [],
    statuses: [],
    capacityMin: parseInt(document.getElementById('capacityMin').value),
    capacityMax: parseInt(document.getElementById('capacityMax').value),
    operator: document.querySelector('input[name="filterOperator"]:checked').value
  };

  // Collect checked checkboxes
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
    const filterType = checkbox.dataset.filterType;
    if (filterType) {
      filters[`${filterType}s`] = filters[`${filterType}s`] || [];
      filters[`${filterType}s`].push(checkbox.value);
    }
  });

  return filters;
}

/**
 * Display search results
 */
function displayResults(results) {
  const resultsGrid = document.getElementById('resultsGrid');
  const resultsCount = document.getElementById('resultsCount');
  const noResults = document.getElementById('noResults');

  resultsCount.textContent = results.length;

  if (results.length === 0) {
    resultsGrid.style.display = 'none';
    noResults.style.display = 'flex';
    return;
  }

  resultsGrid.style.display = 'grid';
  noResults.style.display = 'none';
  resultsGrid.innerHTML = '';

  results.forEach(company => {
    const card = createResultCard(company);
    resultsGrid.appendChild(card);
  });
}

/**
 * Create result card
 */
function createResultCard(company) {
  const card = document.createElement('div');
  card.className = 'result-card';

  const facilitiesCount = company.facilities.length;
  const states = [...new Set(company.facilities.map(f => f.state))];

  card.innerHTML = `
    <div class="result-header">
      <h3 class="result-title">${company.name}</h3>
      ${company._searchScore ? `<span class="result-score">Score: ${company._searchScore.toFixed(1)}</span>` : ''}
    </div>

    <p class="result-description">${company.description}</p>

    <div class="result-metrics">
      <div class="result-metric">
        <span class="metric-label">Capacity</span>
        <span class="metric-value">${company.capacity} GWh</span>
      </div>
      <div class="result-metric">
        <span class="metric-label">Facilities</span>
        <span class="metric-value">${facilitiesCount}</span>
      </div>
      <div class="result-metric">
        <span class="metric-label">Stage</span>
        <span class="metric-value">${company.stage}</span>
      </div>
    </div>

    <div class="result-tags">
      <div class="tag-group">
        <span class="tag-label">Technologies:</span>
        ${company.technologies.map(t => `<span class="tag tag-tech">${t}</span>`).join('')}
      </div>
      <div class="tag-group">
        <span class="tag-label">Chemistries:</span>
        ${company.chemistries.map(c => `<span class="tag tag-chem">${c}</span>`).join('')}
      </div>
    </div>

    <div class="result-footer">
      <div class="result-states">
        <strong>States:</strong> ${states.join(', ')}
      </div>
      <div class="result-policies">
        <strong>Policies:</strong> ${company.policies.join(', ')}
      </div>
    </div>

    <div class="result-facilities">
      <button class="expand-facilities" onclick="toggleFacilities('${company.id}')">
        View ${facilitiesCount} Facilities ▼
      </button>
      <div id="facilities-${company.id}" class="facilities-list" style="display: none;">
        ${company.facilities.map(f => `
          <div class="facility-item">
            <strong>${f.name}</strong>
            <div>${f.location}, ${f.state}</div>
            <div class="facility-meta">
              ${f.capacity} GWh • ${f.status} • Est. ${f.yearEstablished}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return card;
}

/**
 * Toggle facilities display
 */
function toggleFacilities(companyId) {
  const facilitiesDiv = document.getElementById(`facilities-${companyId}`);
  const button = event.target;

  if (facilitiesDiv.style.display === 'none') {
    facilitiesDiv.style.display = 'block';
    button.innerHTML = button.innerHTML.replace('▼', '▲');
  } else {
    facilitiesDiv.style.display = 'none';
    button.innerHTML = button.innerHTML.replace('▲', '▼');
  }
}

/**
 * Display active filters
 */
function displayActiveFilters() {
  const container = document.getElementById('activeFilters');
  const filters = currentFilters;
  const tags = [];

  // Add filter tags
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      value.forEach(v => {
        tags.push({ type: key, value: v });
      });
    } else if (key === 'capacityMin' && value > 0) {
      tags.push({ type: 'capacity', value: `Min: ${value} GWh` });
    } else if (key === 'capacityMax' && value < 200) {
      tags.push({ type: 'capacity', value: `Max: ${value} GWh` });
    }
  });

  if (tags.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="filter-tags">
      ${tags.map(tag => `
        <span class="filter-tag">
          ${tag.value}
          <button class="remove-filter" onclick="removeFilter('${tag.type}', '${tag.value}')">&times;</button>
        </span>
      `).join('')}
    </div>
  `;
}

/**
 * Remove individual filter
 */
function removeFilter(type, value) {
  // Find and uncheck the checkbox
  document.querySelectorAll(`input[data-filter-type="${type.replace('s', '')}"]`).forEach(checkbox => {
    if (checkbox.value === value || value.includes(checkbox.value)) {
      checkbox.checked = false;
    }
  });

  // Reset capacity sliders if needed
  if (type === 'capacity') {
    if (value.includes('Min')) {
      document.getElementById('capacityMin').value = 0;
      document.getElementById('capacityMinValue').textContent = 0;
    } else {
      document.getElementById('capacityMax').value = 200;
      document.getElementById('capacityMaxValue').textContent = 200;
    }
  }

  applyFilters();
}

/**
 * Show autocomplete suggestions
 */
function showAutocomplete(query) {
  const suggestions = searchEngine.autocomplete(query);
  const dropdown = document.getElementById('autocompleteDropdown');

  if (suggestions.length === 0) {
    hideAutocomplete();
    return;
  }

  dropdown.innerHTML = suggestions.map(s => `
    <div class="autocomplete-item" onclick="selectAutocomplete('${s.text}')">
      <span class="autocomplete-type">${s.type}</span>
      <span class="autocomplete-text">${s.text}</span>
    </div>
  `).join('');

  dropdown.style.display = 'block';
}

/**
 * Hide autocomplete
 */
function hideAutocomplete() {
  document.getElementById('autocompleteDropdown').style.display = 'none';
}

/**
 * Select autocomplete suggestion
 */
function selectAutocomplete(text) {
  document.getElementById('searchInput').value = text;
  hideAutocomplete();
  performSearch(text);
}

/**
 * Display recent searches
 */
function displayRecentSearches() {
  const container = document.getElementById('recentSearches');
  const recent = searchEngine.getRecentSearches();

  if (recent.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <h4>Recent Searches</h4>
    <div class="search-chips">
      ${recent.slice(0, 5).map(s => `
        <button class="search-chip" onclick="performSearch('${s.query}')">
          ${s.query}
        </button>
      `).join('')}
    </div>
  `;
}

/**
 * Display saved searches
 */
function displaySavedSearches() {
  const container = document.getElementById('savedSearchesDisplay');
  const saved = searchEngine.getSavedSearches();

  if (saved.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <h4>Saved Searches</h4>
    <div class="saved-search-list">
      ${saved.map(s => `
        <div class="saved-search-item">
          <button class="saved-search-name" onclick="loadSavedSearch('${s.id}')">
            ${s.name}
          </button>
          <button class="delete-saved" onclick="deleteSavedSearch('${s.id}')" title="Delete">&times;</button>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Load saved search
 */
function loadSavedSearch(id) {
  const saved = searchEngine.getSavedSearches().find(s => s.id === id);
  if (!saved) return;

  // Set query
  document.getElementById('searchInput').value = saved.query;

  // Apply filters
  // TODO: Restore filter checkboxes based on saved.filters

  performSearch(saved.query);
}

/**
 * Delete saved search
 */
function deleteSavedSearch(id) {
  if (confirm('Delete this saved search?')) {
    searchEngine.deleteSavedSearch(id);
    displaySavedSearches();
  }
}

/**
 * Toggle filters panel
 */
function toggleFiltersPanel() {
  const panel = document.getElementById('filtersPanel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  // Uncheck all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

  // Reset sliders
  document.getElementById('capacityMin').value = 0;
  document.getElementById('capacityMax').value = 200;
  document.getElementById('capacityMinValue').textContent = 0;
  document.getElementById('capacityMaxValue').textContent = 200;

  // Reset radio
  document.querySelector('input[name="filterOperator"][value="AND"]').checked = true;

  applyFilters();
}

/**
 * Show all results (no search/filter)
 */
function showAllResults() {
  currentResults = searchEngine.data.companies;
  displayResults(currentResults);
}

/**
 * Sort results
 */
function sortResults(sortBy) {
  let sorted = [...currentResults];

  switch (sortBy) {
    case 'relevance':
      sorted.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
      break;
    case 'capacity-desc':
      sorted.sort((a, b) => b.capacity - a.capacity);
      break;
    case 'capacity-asc':
      sorted.sort((a, b) => a.capacity - b.capacity);
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
  }

  currentResults = sorted;
  displayResults(currentResults);
}

/**
 * Search by location
 */
function searchByLocation() {
  const lat = parseFloat(document.getElementById('locationLat').value);
  const lng = parseFloat(document.getElementById('locationLng').value);
  const radius = parseInt(document.getElementById('locationRadius').value);

  if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
    alert('Please enter valid coordinates and radius');
    return;
  }

  currentResults = searchEngine.searchByRadius(lat, lng, radius);
  displayResults(currentResults);
}

/**
 * Save search modal
 */
function openSaveSearchModal() {
  document.getElementById('saveSearchModal').style.display = 'flex';
}

function closeSaveSearchModal() {
  document.getElementById('saveSearchModal').style.display = 'none';
}

function saveCurrentSearch() {
  const name = document.getElementById('searchName').value;
  if (!name) {
    alert('Please enter a name for this search');
    return;
  }

  searchEngine.saveSearch(name, currentQuery, currentFilters);
  displaySavedSearches();
  closeSaveSearchModal();
  document.getElementById('searchName').value = '';
}

/**
 * Export modal
 */
function openExportModal() {
  document.getElementById('exportModal').style.display = 'flex';
}

function closeExportModal() {
  document.getElementById('exportModal').style.display = 'none';
}

function exportResults(format) {
  const data = searchEngine.exportResults(currentResults, format);
  const blob = new Blob([data], {
    type: format === 'json' ? 'application/json' : 'text/csv'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `battery-search-results.${format}`;
  a.click();
  URL.revokeObjectURL(url);
  closeExportModal();
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Utility: Show error
 */
function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}
