/**
 * Battery Research Platform - Advanced Search & Filter Engine
 *
 * Features:
 * - Full-text search with fuzzy matching
 * - Multi-field filtering with AND/OR logic
 * - Autocomplete suggestions
 * - Geospatial queries (radius-based search)
 * - Saved searches and recent searches
 * - Search analytics tracking
 * - Query optimization and caching
 */

class BatterySearchEngine {
  constructor() {
    this.data = { companies: [], metadata: {} };
    this.searchIndex = new Map();
    this.savedSearches = this.loadFromStorage('savedSearches') || [];
    this.recentSearches = this.loadFromStorage('recentSearches') || [];
    this.searchAnalytics = this.loadFromStorage('searchAnalytics') || {};
    this.queryCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Initialize the search engine with data
   */
  async initialize(dataUrl = 'search-data.json') {
    try {
      const response = await fetch(dataUrl);
      this.data = await response.json();
      this.buildSearchIndex();
      console.log(`Search engine initialized with ${this.data.companies.length} companies`);
      return true;
    } catch (error) {
      console.error('Failed to initialize search engine:', error);
      return false;
    }
  }

  /**
   * Build inverted index for fast full-text search
   */
  buildSearchIndex() {
    this.searchIndex.clear();

    this.data.companies.forEach((company, companyIdx) => {
      // Index company name
      this.addToIndex(company.name, { type: 'company', id: company.id, field: 'name' });

      // Index description
      this.tokenize(company.description).forEach(token => {
        this.addToIndex(token, { type: 'company', id: company.id, field: 'description' });
      });

      // Index technologies
      company.technologies.forEach(tech => {
        this.addToIndex(tech, { type: 'company', id: company.id, field: 'technology' });
      });

      // Index chemistries
      company.chemistries.forEach(chem => {
        this.addToIndex(chem, { type: 'company', id: company.id, field: 'chemistry' });
      });

      // Index facilities
      company.facilities.forEach(facility => {
        this.addToIndex(facility.name, { type: 'facility', id: company.id, field: 'facilityName' });
        this.addToIndex(facility.location, { type: 'facility', id: company.id, field: 'location' });
        this.addToIndex(facility.state, { type: 'facility', id: company.id, field: 'state' });
      });
    });
  }

  /**
   * Add term to inverted index
   */
  addToIndex(term, reference) {
    const normalized = this.normalize(term);
    if (!this.searchIndex.has(normalized)) {
      this.searchIndex.set(normalized, []);
    }
    this.searchIndex.get(normalized).push(reference);
  }

  /**
   * Normalize text for indexing and searching
   */
  normalize(text) {
    return text.toLowerCase().trim();
  }

  /**
   * Tokenize text into searchable terms
   */
  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  /**
   * Full-text search with ranking
   * @param {string} query - Search query
   * @param {object} options - Search options
   * @returns {Array} - Ranked results
   */
  search(query, options = {}) {
    const {
      fuzzy = true,
      maxResults = 50,
      minScore = 0.1
    } = options;

    if (!query || query.trim().length === 0) {
      return this.data.companies;
    }

    // Check cache
    const cacheKey = JSON.stringify({ query, options });
    if (this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.results;
      }
    }

    // Track analytics
    this.trackSearch(query);

    const tokens = this.tokenize(query);
    const scores = new Map();

    // Score each company
    this.data.companies.forEach(company => {
      let score = 0;

      // Exact match in company name (highest weight)
      if (this.normalize(company.name).includes(this.normalize(query))) {
        score += 10.0;
      }

      // Token matching
      tokens.forEach(token => {
        // Exact token match
        const exactMatches = this.searchIndex.get(token) || [];
        exactMatches.forEach(match => {
          if (match.id === company.id) {
            score += this.getFieldWeight(match.field);
          }
        });

        // Fuzzy matching
        if (fuzzy) {
          this.searchIndex.forEach((matches, indexedToken) => {
            if (this.fuzzyMatch(token, indexedToken)) {
              matches.forEach(match => {
                if (match.id === company.id) {
                  score += this.getFieldWeight(match.field) * 0.5;
                }
              });
            }
          });
        }
      });

      if (score > 0) {
        scores.set(company.id, score);
      }
    });

    // Sort by score and return results
    const results = this.data.companies
      .filter(company => scores.has(company.id))
      .map(company => ({
        ...company,
        _searchScore: scores.get(company.id)
      }))
      .filter(company => company._searchScore >= minScore)
      .sort((a, b) => b._searchScore - a._searchScore)
      .slice(0, maxResults);

    // Cache results
    this.queryCache.set(cacheKey, {
      results,
      timestamp: Date.now()
    });

    return results;
  }

  /**
   * Get field weight for scoring
   */
  getFieldWeight(field) {
    const weights = {
      'name': 5.0,
      'technology': 3.0,
      'chemistry': 3.0,
      'description': 2.0,
      'facilityName': 1.5,
      'location': 1.0,
      'state': 1.0
    };
    return weights[field] || 1.0;
  }

  /**
   * Fuzzy string matching using Levenshtein distance
   */
  fuzzyMatch(str1, str2, threshold = 0.7) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLen = Math.max(str1.length, str2.length);
    const similarity = 1 - (distance / maxLen);
    return similarity >= threshold;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Filter companies by multiple criteria
   * @param {object} filters - Filter criteria
   * @returns {Array} - Filtered results
   */
  filter(filters = {}) {
    const {
      technologies = [],
      chemistries = [],
      states = [],
      stages = [],
      capacityMin = null,
      capacityMax = null,
      policies = [],
      statuses = [],
      operator = 'AND' // 'AND' or 'OR'
    } = filters;

    let results = [...this.data.companies];

    // Apply technology filter
    if (technologies.length > 0) {
      results = results.filter(company => {
        if (operator === 'OR') {
          return technologies.some(tech =>
            company.technologies.some(t => this.normalize(t).includes(this.normalize(tech)))
          );
        } else {
          return technologies.every(tech =>
            company.technologies.some(t => this.normalize(t).includes(this.normalize(tech)))
          );
        }
      });
    }

    // Apply chemistry filter
    if (chemistries.length > 0) {
      results = results.filter(company => {
        if (operator === 'OR') {
          return chemistries.some(chem =>
            company.chemistries.some(c => this.normalize(c).includes(this.normalize(chem)))
          );
        } else {
          return chemistries.every(chem =>
            company.chemistries.some(c => this.normalize(c).includes(this.normalize(chem)))
          );
        }
      });
    }

    // Apply state filter
    if (states.length > 0) {
      results = results.filter(company =>
        company.facilities.some(f => states.includes(f.state))
      );
    }

    // Apply stage filter
    if (stages.length > 0) {
      results = results.filter(company =>
        stages.includes(company.stage)
      );
    }

    // Apply capacity range filter
    if (capacityMin !== null) {
      results = results.filter(company => company.capacity >= capacityMin);
    }
    if (capacityMax !== null) {
      results = results.filter(company => company.capacity <= capacityMax);
    }

    // Apply policy filter
    if (policies.length > 0) {
      results = results.filter(company => {
        if (operator === 'OR') {
          return policies.some(policy => company.policies.includes(policy));
        } else {
          return policies.every(policy => company.policies.includes(policy));
        }
      });
    }

    // Apply facility status filter
    if (statuses.length > 0) {
      results = results.filter(company =>
        company.facilities.some(f => statuses.includes(f.status))
      );
    }

    return results;
  }

  /**
   * Combined search and filter
   */
  searchAndFilter(query, filters = {}) {
    let results;

    if (query && query.trim().length > 0) {
      results = this.search(query);
    } else {
      results = [...this.data.companies];
    }

    // Apply filters to search results
    if (Object.keys(filters).length > 0) {
      const filteredIds = new Set(
        this.filter(filters).map(c => c.id)
      );
      results = results.filter(company => filteredIds.has(company.id));
    }

    return results;
  }

  /**
   * Autocomplete suggestions
   * @param {string} partial - Partial query
   * @param {number} maxSuggestions - Maximum number of suggestions
   * @returns {Array} - Suggestion list
   */
  autocomplete(partial, maxSuggestions = 10) {
    if (!partial || partial.length < 2) {
      return [];
    }

    const normalized = this.normalize(partial);
    const suggestions = new Set();

    // Company names
    this.data.companies.forEach(company => {
      if (this.normalize(company.name).includes(normalized)) {
        suggestions.add({
          text: company.name,
          type: 'company',
          id: company.id
        });
      }
    });

    // Technologies
    const allTechnologies = new Set();
    this.data.companies.forEach(company => {
      company.technologies.forEach(tech => allTechnologies.add(tech));
    });
    allTechnologies.forEach(tech => {
      if (this.normalize(tech).includes(normalized)) {
        suggestions.add({
          text: tech,
          type: 'technology'
        });
      }
    });

    // Chemistries
    const allChemistries = new Set();
    this.data.companies.forEach(company => {
      company.chemistries.forEach(chem => allChemistries.add(chem));
    });
    allChemistries.forEach(chem => {
      if (this.normalize(chem).includes(normalized)) {
        suggestions.add({
          text: chem,
          type: 'chemistry'
        });
      }
    });

    // Locations
    this.data.companies.forEach(company => {
      company.facilities.forEach(facility => {
        if (this.normalize(facility.location).includes(normalized)) {
          suggestions.add({
            text: facility.location,
            type: 'location',
            state: facility.state
          });
        }
      });
    });

    return Array.from(suggestions).slice(0, maxSuggestions);
  }

  /**
   * Geospatial search - find facilities within radius
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusMiles - Radius in miles
   * @returns {Array} - Companies with facilities in range
   */
  searchByRadius(lat, lng, radiusMiles = 100) {
    const results = [];

    this.data.companies.forEach(company => {
      const facilitiesInRange = company.facilities.filter(facility => {
        const distance = this.haversineDistance(
          lat, lng,
          facility.coordinates.lat,
          facility.coordinates.lng
        );
        return distance <= radiusMiles;
      });

      if (facilitiesInRange.length > 0) {
        results.push({
          ...company,
          facilitiesInRange,
          _closestDistance: Math.min(...facilitiesInRange.map(f =>
            this.haversineDistance(lat, lng, f.coordinates.lat, f.coordinates.lng)
          ))
        });
      }
    });

    return results.sort((a, b) => a._closestDistance - b._closestDistance);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @returns {number} - Distance in miles
   */
  haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Search by state or region
   */
  searchByState(states) {
    if (!Array.isArray(states)) {
      states = [states];
    }

    return this.data.companies.filter(company =>
      company.facilities.some(f => states.includes(f.state))
    ).map(company => ({
      ...company,
      facilitiesInState: company.facilities.filter(f => states.includes(f.state))
    }));
  }

  /**
   * Get filter options for UI
   */
  getFilterOptions() {
    const options = {
      technologies: new Set(),
      chemistries: new Set(),
      states: new Set(),
      stages: new Set(),
      policies: new Set(),
      statuses: new Set()
    };

    this.data.companies.forEach(company => {
      company.technologies.forEach(t => options.technologies.add(t));
      company.chemistries.forEach(c => options.chemistries.add(c));
      company.facilities.forEach(f => {
        options.states.add(f.state);
        options.statuses.add(f.status);
      });
      options.stages.add(company.stage);
      company.policies.forEach(p => options.policies.add(p));
    });

    return {
      technologies: Array.from(options.technologies).sort(),
      chemistries: Array.from(options.chemistries).sort(),
      states: Array.from(options.states).sort(),
      stages: Array.from(options.stages).sort(),
      policies: Array.from(options.policies).sort(),
      statuses: Array.from(options.statuses).sort()
    };
  }

  /**
   * Save search for later use
   */
  saveSearch(name, query, filters = {}) {
    const search = {
      id: Date.now().toString(),
      name,
      query,
      filters,
      createdAt: new Date().toISOString()
    };

    this.savedSearches.push(search);
    this.saveToStorage('savedSearches', this.savedSearches);
    return search;
  }

  /**
   * Load saved search
   */
  getSavedSearches() {
    return this.savedSearches;
  }

  /**
   * Delete saved search
   */
  deleteSavedSearch(id) {
    this.savedSearches = this.savedSearches.filter(s => s.id !== id);
    this.saveToStorage('savedSearches', this.savedSearches);
  }

  /**
   * Track recent searches
   */
  trackSearch(query) {
    if (!query || query.trim().length === 0) return;

    // Add to recent searches
    const recent = {
      query,
      timestamp: new Date().toISOString()
    };

    this.recentSearches = [
      recent,
      ...this.recentSearches.filter(s => s.query !== query)
    ].slice(0, 10); // Keep last 10

    this.saveToStorage('recentSearches', this.recentSearches);

    // Track in analytics
    if (!this.searchAnalytics[query]) {
      this.searchAnalytics[query] = {
        count: 0,
        firstSearched: new Date().toISOString(),
        lastSearched: new Date().toISOString()
      };
    }
    this.searchAnalytics[query].count++;
    this.searchAnalytics[query].lastSearched = new Date().toISOString();
    this.saveToStorage('searchAnalytics', this.searchAnalytics);
  }

  /**
   * Get recent searches
   */
  getRecentSearches() {
    return this.recentSearches;
  }

  /**
   * Get popular searches
   */
  getPopularSearches(limit = 10) {
    return Object.entries(this.searchAnalytics)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([query, stats]) => ({ query, ...stats }));
  }

  /**
   * Export filtered results
   */
  exportResults(results, format = 'json') {
    if (format === 'json') {
      return JSON.stringify(results, null, 2);
    } else if (format === 'csv') {
      return this.exportToCSV(results);
    }
  }

  /**
   * Export to CSV format
   */
  exportToCSV(results) {
    const headers = [
      'Company Name',
      'Capacity (GWh)',
      'Technologies',
      'Chemistries',
      'Stage',
      'Facilities Count',
      'States',
      'Policies'
    ];

    const rows = results.map(company => [
      company.name,
      company.capacity,
      company.technologies.join('; '),
      company.chemistries.join('; '),
      company.stage,
      company.facilities.length,
      [...new Set(company.facilities.map(f => f.state))].join('; '),
      company.policies.join('; ')
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return csv;
  }

  /**
   * Storage helpers
   */
  saveToStorage(key, data) {
    try {
      localStorage.setItem(`batterySearch_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  loadFromStorage(key) {
    try {
      const data = localStorage.getItem(`batterySearch_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      return null;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.queryCache.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalCompanies: this.data.companies.length,
      totalFacilities: this.data.companies.reduce((sum, c) => sum + c.facilities.length, 0),
      totalCapacity: this.data.companies.reduce((sum, c) => sum + c.capacity, 0),
      savedSearches: this.savedSearches.length,
      totalSearches: Object.values(this.searchAnalytics).reduce((sum, s) => sum + s.count, 0),
      indexSize: this.searchIndex.size,
      cacheSize: this.queryCache.size
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BatterySearchEngine;
}

// Global instance
window.BatterySearchEngine = BatterySearchEngine;
