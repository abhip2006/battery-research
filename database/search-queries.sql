-- Battery Research Platform - Search & Filter SQL Queries
-- Optimized PostgreSQL queries for search functionality

--------------------------------------------------------------------------------
-- FULL-TEXT SEARCH QUERIES
--------------------------------------------------------------------------------

-- 1. Basic full-text search across companies
-- Usage: Search for companies matching "solid state"
-- Parameters: $1 = search_query
SELECT
    c.id,
    c.name,
    c.description,
    c.capacity_gwh,
    c.stage,
    c.website,
    ts_rank(c.search_vector, websearch_to_tsquery('english', $1)) AS rank
FROM companies c
WHERE c.search_vector @@ websearch_to_tsquery('english', $1)
ORDER BY rank DESC, c.capacity_gwh DESC
LIMIT 50;

-- 2. Full-text search with fuzzy matching (trigram similarity)
-- Parameters: $1 = search_query, $2 = similarity_threshold (default 0.3)
SELECT
    c.id,
    c.name,
    c.description,
    c.capacity_gwh,
    c.stage,
    GREATEST(
        similarity(c.name, $1),
        similarity(c.description, $1),
        ts_rank(c.search_vector, websearch_to_tsquery('english', $1))
    ) AS relevance_score
FROM companies c
WHERE
    c.search_vector @@ websearch_to_tsquery('english', $1)
    OR similarity(c.name, $1) > $2
    OR similarity(c.description, $1) > $2
ORDER BY relevance_score DESC, c.capacity_gwh DESC
LIMIT 50;

-- 3. Advanced search across companies AND facilities
-- Parameters: $1 = search_query
SELECT DISTINCT
    c.id AS company_id,
    c.name AS company_name,
    c.description,
    c.capacity_gwh,
    c.stage,
    GREATEST(
        ts_rank(c.search_vector, websearch_to_tsquery('english', $1)),
        MAX(ts_rank(f.search_vector, websearch_to_tsquery('english', $1)))
    ) AS relevance_score,
    COUNT(f.id) AS facilities_count,
    array_agg(DISTINCT f.state_code) AS states
FROM companies c
LEFT JOIN facilities f ON c.id = f.company_id
WHERE
    c.search_vector @@ websearch_to_tsquery('english', $1)
    OR f.search_vector @@ websearch_to_tsquery('english', $1)
GROUP BY c.id, c.name, c.description, c.capacity_gwh, c.stage, c.search_vector
ORDER BY relevance_score DESC
LIMIT 50;

--------------------------------------------------------------------------------
-- FILTER QUERIES
--------------------------------------------------------------------------------

-- 4. Filter by technology
-- Parameters: $1 = technology_names (array), $2 = match_all (boolean)
SELECT DISTINCT c.*
FROM companies c
JOIN company_technologies ct ON c.id = ct.company_id
JOIN technologies t ON ct.technology_id = t.id
WHERE
    CASE
        WHEN $2 = true THEN
            -- Match ALL technologies (AND logic)
            c.id IN (
                SELECT ct2.company_id
                FROM company_technologies ct2
                JOIN technologies t2 ON ct2.technology_id = t2.id
                WHERE t2.name = ANY($1)
                GROUP BY ct2.company_id
                HAVING COUNT(DISTINCT t2.name) = array_length($1, 1)
            )
        ELSE
            -- Match ANY technology (OR logic)
            t.name = ANY($1)
    END
ORDER BY c.capacity_gwh DESC;

-- 5. Filter by chemistry
-- Parameters: $1 = chemistry_names (array), $2 = match_all (boolean)
SELECT DISTINCT c.*
FROM companies c
JOIN company_chemistries cc ON c.id = cc.company_id
JOIN chemistries ch ON cc.chemistry_id = ch.id
WHERE
    CASE
        WHEN $2 = true THEN
            c.id IN (
                SELECT cc2.company_id
                FROM company_chemistries cc2
                JOIN chemistries ch2 ON cc2.chemistry_id = ch2.id
                WHERE ch2.name = ANY($1)
                GROUP BY cc2.company_id
                HAVING COUNT(DISTINCT ch2.name) = array_length($1, 1)
            )
        ELSE
            ch.name = ANY($1)
    END
ORDER BY c.capacity_gwh DESC;

-- 6. Filter by state/region
-- Parameters: $1 = state_codes (array)
SELECT DISTINCT c.*
FROM companies c
JOIN facilities f ON c.id = f.company_id
WHERE f.state_code = ANY($1)
ORDER BY c.capacity_gwh DESC;

-- 7. Filter by commercialization stage
-- Parameters: $1 = stages (array)
SELECT c.*
FROM companies c
WHERE c.stage = ANY($1)
ORDER BY c.capacity_gwh DESC;

-- 8. Filter by capacity range
-- Parameters: $1 = min_capacity, $2 = max_capacity
SELECT c.*
FROM companies c
WHERE c.capacity_gwh BETWEEN $1 AND $2
ORDER BY c.capacity_gwh DESC;

-- 9. Filter by policy exposure
-- Parameters: $1 = policy_names (array), $2 = match_all (boolean)
SELECT DISTINCT c.*
FROM companies c
JOIN company_policies cp ON c.id = cp.company_id
JOIN policies p ON cp.policy_id = p.id
WHERE
    CASE
        WHEN $2 = true THEN
            c.id IN (
                SELECT cp2.company_id
                FROM company_policies cp2
                JOIN policies p2 ON cp2.policy_id = p2.id
                WHERE p2.name = ANY($1)
                GROUP BY cp2.company_id
                HAVING COUNT(DISTINCT p2.name) = array_length($1, 1)
            )
        ELSE
            p.name = ANY($1)
    END
ORDER BY c.capacity_gwh DESC;

-- 10. Filter by facility status
-- Parameters: $1 = statuses (array)
SELECT DISTINCT c.*
FROM companies c
JOIN facilities f ON c.id = f.company_id
WHERE f.status = ANY($1)
ORDER BY c.capacity_gwh DESC;

--------------------------------------------------------------------------------
-- COMBINED SEARCH AND FILTER
--------------------------------------------------------------------------------

-- 11. Full search with multiple filters
-- Parameters:
--   $1 = search_query (text)
--   $2 = technology_names (array or NULL)
--   $3 = chemistry_names (array or NULL)
--   $4 = state_codes (array or NULL)
--   $5 = stages (array or NULL)
--   $6 = min_capacity (decimal or NULL)
--   $7 = max_capacity (decimal or NULL)
--   $8 = policy_names (array or NULL)
--   $9 = statuses (array or NULL)
--   $10 = match_all (boolean, default false)
SELECT DISTINCT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.capacity_gwh,
    c.stage,
    c.website,
    c.founded_year,
    ts_rank(c.search_vector, websearch_to_tsquery('english', $1)) AS search_rank,

    -- Aggregated data
    array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) AS technologies,
    array_agg(DISTINCT ch.name) FILTER (WHERE ch.name IS NOT NULL) AS chemistries,
    array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL) AS policies,
    array_agg(DISTINCT f.state_code) FILTER (WHERE f.state_code IS NOT NULL) AS states,
    COUNT(DISTINCT f.id) AS facilities_count

FROM companies c
LEFT JOIN company_technologies ct ON c.id = ct.company_id
LEFT JOIN technologies t ON ct.technology_id = t.id
LEFT JOIN company_chemistries cc ON c.id = cc.company_id
LEFT JOIN chemistries ch ON cc.chemistry_id = ch.id
LEFT JOIN company_policies cp ON c.id = cp.company_id
LEFT JOIN policies p ON cp.policy_id = p.id
LEFT JOIN facilities f ON c.id = f.company_id

WHERE
    -- Text search filter
    ($1 IS NULL OR c.search_vector @@ websearch_to_tsquery('english', $1))

    -- Technology filter
    AND ($2 IS NULL OR (
        CASE WHEN $10 = true THEN
            c.id IN (
                SELECT ct2.company_id FROM company_technologies ct2
                JOIN technologies t2 ON ct2.technology_id = t2.id
                WHERE t2.name = ANY($2)
                GROUP BY ct2.company_id
                HAVING COUNT(DISTINCT t2.name) = array_length($2, 1)
            )
        ELSE
            t.name = ANY($2)
        END
    ))

    -- Chemistry filter
    AND ($3 IS NULL OR (
        CASE WHEN $10 = true THEN
            c.id IN (
                SELECT cc2.company_id FROM company_chemistries cc2
                JOIN chemistries ch2 ON cc2.chemistry_id = ch2.id
                WHERE ch2.name = ANY($3)
                GROUP BY cc2.company_id
                HAVING COUNT(DISTINCT ch2.name) = array_length($3, 1)
            )
        ELSE
            ch.name = ANY($3)
        END
    ))

    -- State filter
    AND ($4 IS NULL OR f.state_code = ANY($4))

    -- Stage filter
    AND ($5 IS NULL OR c.stage = ANY($5))

    -- Capacity range filter
    AND ($6 IS NULL OR c.capacity_gwh >= $6)
    AND ($7 IS NULL OR c.capacity_gwh <= $7)

    -- Policy filter
    AND ($8 IS NULL OR (
        CASE WHEN $10 = true THEN
            c.id IN (
                SELECT cp2.company_id FROM company_policies cp2
                JOIN policies p2 ON cp2.policy_id = p2.id
                WHERE p2.name = ANY($8)
                GROUP BY cp2.company_id
                HAVING COUNT(DISTINCT p2.name) = array_length($8, 1)
            )
        ELSE
            p.name = ANY($8)
        END
    ))

    -- Facility status filter
    AND ($9 IS NULL OR f.status = ANY($9))

GROUP BY c.id, c.name, c.slug, c.description, c.capacity_gwh, c.stage, c.website, c.founded_year, c.search_vector
ORDER BY search_rank DESC NULLS LAST, c.capacity_gwh DESC
LIMIT 100;

--------------------------------------------------------------------------------
-- GEOSPATIAL QUERIES
--------------------------------------------------------------------------------

-- 12. Find facilities within radius of coordinates
-- Parameters: $1 = latitude, $2 = longitude, $3 = radius_miles
SELECT
    c.id AS company_id,
    c.name AS company_name,
    c.capacity_gwh AS company_capacity,
    f.id AS facility_id,
    f.name AS facility_name,
    f.location,
    f.state_code,
    f.capacity_gwh AS facility_capacity,
    f.status,
    ST_Distance(
        f.coordinates,
        ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
    ) / 1609.34 AS distance_miles
FROM facilities f
JOIN companies c ON f.company_id = c.id
WHERE ST_DWithin(
    f.coordinates,
    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
    $3 * 1609.34  -- Convert miles to meters
)
ORDER BY distance_miles ASC;

-- 13. Find companies with facilities in specific region (bounding box)
-- Parameters: $1 = min_lat, $2 = min_lon, $3 = max_lat, $4 = max_lon
SELECT DISTINCT
    c.*,
    COUNT(f.id) AS facilities_in_region
FROM companies c
JOIN facilities f ON c.id = f.company_id
WHERE ST_Contains(
    ST_MakeEnvelope($2, $1, $4, $3, 4326),
    f.coordinates::geometry
)
GROUP BY c.id
ORDER BY facilities_in_region DESC, c.capacity_gwh DESC;

-- 14. Cluster facilities by state with aggregated statistics
SELECT
    f.state_code,
    f.state_name,
    COUNT(DISTINCT c.id) AS companies_count,
    COUNT(f.id) AS facilities_count,
    SUM(f.capacity_gwh) AS total_capacity,
    AVG(f.capacity_gwh) AS avg_facility_capacity,
    array_agg(DISTINCT c.name ORDER BY c.name) AS companies
FROM facilities f
JOIN companies c ON f.company_id = c.id
GROUP BY f.state_code, f.state_name
ORDER BY total_capacity DESC;

--------------------------------------------------------------------------------
-- AUTOCOMPLETE QUERIES
--------------------------------------------------------------------------------

-- 15. Autocomplete company names
-- Parameters: $1 = partial_name, $2 = limit
SELECT
    id,
    name,
    slug,
    'company' AS type
FROM companies
WHERE name ILIKE $1 || '%' OR similarity(name, $1) > 0.3
ORDER BY
    CASE WHEN name ILIKE $1 || '%' THEN 0 ELSE 1 END,
    similarity(name, $1) DESC,
    name
LIMIT $2;

-- 16. Autocomplete technologies
-- Parameters: $1 = partial_name, $2 = limit
SELECT DISTINCT
    t.id,
    t.name,
    t.category,
    'technology' AS type,
    COUNT(ct.company_id) AS usage_count
FROM technologies t
LEFT JOIN company_technologies ct ON t.id = ct.technology_id
WHERE t.name ILIKE $1 || '%' OR similarity(t.name, $1) > 0.3
GROUP BY t.id, t.name, t.category
ORDER BY
    CASE WHEN t.name ILIKE $1 || '%' THEN 0 ELSE 1 END,
    usage_count DESC,
    similarity(t.name, $1) DESC
LIMIT $2;

-- 17. Autocomplete locations (cities/states)
-- Parameters: $1 = partial_location, $2 = limit
SELECT DISTINCT
    location,
    city,
    state_code,
    state_name,
    'location' AS type,
    COUNT(*) AS facility_count
FROM facilities
WHERE
    city ILIKE $1 || '%'
    OR location ILIKE '%' || $1 || '%'
    OR state_name ILIKE $1 || '%'
GROUP BY location, city, state_code, state_name
ORDER BY facility_count DESC
LIMIT $2;

--------------------------------------------------------------------------------
-- ANALYTICS & STATISTICS
--------------------------------------------------------------------------------

-- 18. Get search statistics
SELECT
    query,
    COUNT(*) AS search_count,
    AVG(results_count) AS avg_results,
    AVG(execution_time_ms) AS avg_execution_time_ms,
    MAX(created_at) AS last_searched
FROM search_analytics
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY query
ORDER BY search_count DESC
LIMIT 50;

-- 19. Get popular filters
SELECT
    filters->>'technologies' AS technologies_filter,
    filters->>'chemistries' AS chemistries_filter,
    filters->>'states' AS states_filter,
    COUNT(*) AS usage_count
FROM search_analytics
WHERE filters IS NOT NULL
GROUP BY filters->>'technologies', filters->>'chemistries', filters->>'states'
ORDER BY usage_count DESC
LIMIT 20;

-- 20. Get user search history
-- Parameters: $1 = user_id, $2 = limit
SELECT
    id,
    query,
    filters,
    results_count,
    created_at
FROM search_analytics
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT $2;

--------------------------------------------------------------------------------
-- SAVED SEARCHES
--------------------------------------------------------------------------------

-- 21. Get user's saved searches
-- Parameters: $1 = user_id
SELECT
    id,
    name,
    query,
    filters,
    created_at,
    updated_at
FROM saved_searches
WHERE user_id = $1
ORDER BY updated_at DESC;

-- 22. Create saved search
-- Parameters: $1 = user_id, $2 = name, $3 = query, $4 = filters (JSONB)
INSERT INTO saved_searches (user_id, name, query, filters)
VALUES ($1, $2, $3, $4)
RETURNING id, name, created_at;

-- 23. Load saved search
-- Parameters: $1 = saved_search_id, $2 = user_id
SELECT query, filters
FROM saved_searches
WHERE id = $1 AND user_id = $2;

-- 24. Delete saved search
-- Parameters: $1 = saved_search_id, $2 = user_id
DELETE FROM saved_searches
WHERE id = $1 AND user_id = $2
RETURNING id;

--------------------------------------------------------------------------------
-- PERFORMANCE MONITORING
--------------------------------------------------------------------------------

-- 25. Query to check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- 26. Query to find slow queries (requires pg_stat_statements extension)
-- SELECT query, mean_exec_time, calls
-- FROM pg_stat_statements
-- WHERE query LIKE '%companies%' OR query LIKE '%facilities%'
-- ORDER BY mean_exec_time DESC
-- LIMIT 10;
