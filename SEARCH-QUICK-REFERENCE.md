# 🔍 Search & Filter - Quick Reference Card

## Quick Start (30 seconds)

```javascript
// Initialize search engine
const searchEngine = new BatterySearchEngine();
await searchEngine.initialize('search-data.json');

// Search
const results = searchEngine.search('solid state');

// Filter
const filtered = searchEngine.filter({
    technologies: ['Solid-State'],
    states: ['CA']
});

// Autocomplete
const suggestions = searchEngine.autocomplete('quan');
```

## Core Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `search(query, options)` | Full-text search | `search('Tesla')` |
| `filter(filters)` | Apply filters | `filter({states: ['CA']})` |
| `searchAndFilter(query, filters)` | Combined | `searchAndFilter('battery', {...})` |
| `autocomplete(partial)` | Suggestions | `autocomplete('sol')` |
| `searchByRadius(lat, lng, radius)` | Geo search | `searchByRadius(39.5, -119.4, 100)` |
| `searchByState(states)` | State filter | `searchByState(['CA', 'NV'])` |
| `saveSearch(name, query, filters)` | Save search | `saveSearch('My Search', ...)` |
| `exportResults(results, format)` | Export | `exportResults(results, 'csv')` |

## Filter Options

```javascript
{
  technologies: ['Li-ion', 'Solid-State', 'Sodium-ion'],
  chemistries: ['NMC', 'LFP', 'NCA', 'NCMA'],
  states: ['CA', 'NV', 'TX', ...],
  stages: ['R&D', 'Pilot', 'Commercial', 'Gigafactory'],
  capacityMin: 10,
  capacityMax: 200,
  policies: ['IRA', 'DOE Grant', 'DOE Loans'],
  statuses: ['Operational', 'Under Construction', 'Planned'],
  operator: 'AND' // or 'OR'
}
```

## SQL Quick Reference

```sql
-- Full-text search
SELECT * FROM companies
WHERE search_vector @@ websearch_to_tsquery('english', 'solid state');

-- Fuzzy match
SELECT * FROM companies
WHERE similarity(name, 'Teslla') > 0.3;

-- Geospatial (50 miles radius)
SELECT * FROM facilities
WHERE ST_DWithin(
    coordinates,
    ST_SetSRID(ST_MakePoint(-119.4374, 39.5378), 4326)::geography,
    50 * 1609.34
);

-- Filter by technology
SELECT c.* FROM companies c
JOIN company_technologies ct ON c.id = ct.company_id
JOIN technologies t ON ct.technology_id = t.id
WHERE t.name = 'Solid-State';
```

## API Endpoints

```
GET  /search?q=query                    Full-text search
POST /search/advanced                   Advanced with filters
GET  /autocomplete?q=partial            Autocomplete
GET  /search/radius?lat=&lng=&radius=   Geo search
GET  /filters/options                   Get filter options
GET  /searches/saved                    User saved searches
POST /search/export                     Export results
```

## Performance Tips

1. **Use indexes** - Database queries < 500ms
2. **Enable caching** - 5-minute TTL
3. **Paginate results** - Limit to 50-100
4. **Debounce autocomplete** - 300ms delay
5. **Use materialized views** - Pre-compute aggregations

## File Locations

```
search-engine.js         → Core search logic
search-ui.js             → UI interactions
search-interface.html    → Search page
search-styles.css        → Styles
search-data.json         → Data source
database/schema.sql      → PostgreSQL schema
database/search-queries.sql → SQL queries
API_DOCUMENTATION.md     → Full API docs
SEARCH_README.md         → Complete guide
```

## Common Use Cases

**Find all solid-state companies:**
```javascript
searchEngine.filter({ technologies: ['Solid-State'] })
```

**Find gigafactories in Southeast:**
```javascript
searchEngine.filter({
  stages: ['Gigafactory'],
  states: ['GA', 'TN', 'NC', 'SC']
})
```

**Search with capacity range:**
```javascript
searchEngine.filter({
  capacityMin: 50,
  capacityMax: 150
})
```

**Nearby facilities:**
```javascript
searchEngine.searchByRadius(39.5378, -119.4374, 100)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No results | Check spelling, try fuzzy search |
| Slow queries | Check indexes, enable caching |
| Missing data | Refresh materialized view |
| Autocomplete not working | Min 2 characters required |

## Quick Links

- **Full Documentation:** SEARCH_README.md
- **API Reference:** API_DOCUMENTATION.md
- **Database Schema:** database/schema.sql
- **Sample Queries:** database/search-queries.sql

---

**Created by AGENT-P05 | 2025-11-09**
