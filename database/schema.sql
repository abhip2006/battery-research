-- Battery Research Platform Database Schema
-- PostgreSQL 14+ with PostGIS and Full-Text Search Extensions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram similarity for fuzzy matching
CREATE EXTENSION IF NOT EXISTS "postgis";        -- Geospatial queries
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- Multi-column indexes

-- Set search path
SET search_path TO public;

--------------------------------------------------------------------------------
-- COMPANIES TABLE
--------------------------------------------------------------------------------
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    capacity_gwh DECIMAL(10, 2) NOT NULL CHECK (capacity_gwh >= 0),
    stage VARCHAR(50) NOT NULL CHECK (stage IN ('R&D', 'Pilot', 'Commercial', 'Gigafactory')),
    website VARCHAR(500),
    founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= 2100),

    -- Full-text search vector
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(description, '')), 'B')
    ) STORED,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for companies
CREATE INDEX idx_companies_name_trgm ON companies USING gin (name gin_trgm_ops);
CREATE INDEX idx_companies_description_trgm ON companies USING gin (description gin_trgm_ops);
CREATE INDEX idx_companies_search_vector ON companies USING gin (search_vector);
CREATE INDEX idx_companies_capacity ON companies (capacity_gwh DESC);
CREATE INDEX idx_companies_stage ON companies (stage);
CREATE INDEX idx_companies_slug ON companies (slug);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- FACILITIES TABLE
--------------------------------------------------------------------------------
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state_code CHAR(2) NOT NULL,
    state_name VARCHAR(100) NOT NULL,
    zip_code VARCHAR(10),
    capacity_gwh DECIMAL(10, 2) NOT NULL CHECK (capacity_gwh >= 0),
    status VARCHAR(50) NOT NULL CHECK (status IN ('Planned', 'Under Construction', 'Operational', 'Pilot', 'Closed')),
    year_established INTEGER CHECK (year_established >= 1900 AND year_established <= 2100),

    -- Geospatial data
    coordinates GEOGRAPHY(POINT, 4326) NOT NULL,

    -- Additional metadata
    employees_count INTEGER CHECK (employees_count >= 0),
    annual_production_units INTEGER,

    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(location, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(city, '')), 'B')
    ) STORED,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_facility_per_company UNIQUE (company_id, name)
);

-- Indexes for facilities
CREATE INDEX idx_facilities_company_id ON facilities (company_id);
CREATE INDEX idx_facilities_state ON facilities (state_code);
CREATE INDEX idx_facilities_status ON facilities (status);
CREATE INDEX idx_facilities_coordinates ON facilities USING gist (coordinates);
CREATE INDEX idx_facilities_search_vector ON facilities USING gin (search_vector);
CREATE INDEX idx_facilities_capacity ON facilities (capacity_gwh DESC);
CREATE INDEX idx_facilities_name_trgm ON facilities USING gin (name gin_trgm_ops);
CREATE INDEX idx_facilities_location_trgm ON facilities USING gin (location gin_trgm_ops);

CREATE TRIGGER update_facilities_updated_at
    BEFORE UPDATE ON facilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- TECHNOLOGIES TABLE
--------------------------------------------------------------------------------
CREATE TABLE technologies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Cell Format', 'Chemistry', 'Architecture', 'Other')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_technologies_category ON technologies (category);
CREATE INDEX idx_technologies_name_trgm ON technologies USING gin (name gin_trgm_ops);

--------------------------------------------------------------------------------
-- CHEMISTRIES TABLE
--------------------------------------------------------------------------------
CREATE TABLE chemistries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    description TEXT,
    energy_density_wh_kg DECIMAL(10, 2),
    cycle_life INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_chemistries_name_trgm ON chemistries USING gin (name gin_trgm_ops);

--------------------------------------------------------------------------------
-- POLICIES TABLE
--------------------------------------------------------------------------------
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    description TEXT,
    policy_type VARCHAR(50) CHECK (policy_type IN ('Tax Credit', 'Grant', 'Loan', 'Regulation', 'Other')),
    enacted_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_policies_name_trgm ON policies USING gin (name gin_trgm_ops);
CREATE INDEX idx_policies_type ON policies (policy_type);

--------------------------------------------------------------------------------
-- JUNCTION TABLES (Many-to-Many Relationships)
--------------------------------------------------------------------------------

-- Company Technologies
CREATE TABLE company_technologies (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
    PRIMARY KEY (company_id, technology_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_technologies_company ON company_technologies (company_id);
CREATE INDEX idx_company_technologies_technology ON company_technologies (technology_id);

-- Company Chemistries
CREATE TABLE company_chemistries (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    chemistry_id UUID NOT NULL REFERENCES chemistries(id) ON DELETE CASCADE,
    PRIMARY KEY (company_id, chemistry_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_chemistries_company ON company_chemistries (company_id);
CREATE INDEX idx_company_chemistries_chemistry ON company_chemistries (chemistry_id);

-- Company Policies
CREATE TABLE company_policies (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    funding_amount_usd DECIMAL(15, 2),
    award_date DATE,
    PRIMARY KEY (company_id, policy_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_policies_company ON company_policies (company_id);
CREATE INDEX idx_company_policies_policy ON company_policies (policy_id);

--------------------------------------------------------------------------------
-- USER SEARCHES TABLE (for analytics and saved searches)
--------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users (email);

-- Saved Searches
CREATE TABLE saved_searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    query TEXT,
    filters JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_saved_searches_user ON saved_searches (user_id);

-- Search Analytics
CREATE TABLE search_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_analytics_query ON search_analytics (query);
CREATE INDEX idx_search_analytics_created_at ON search_analytics (created_at DESC);
CREATE INDEX idx_search_analytics_user ON search_analytics (user_id);

--------------------------------------------------------------------------------
-- MATERIALIZED VIEWS (for performance)
--------------------------------------------------------------------------------

-- Company search view with aggregated data
CREATE MATERIALIZED VIEW company_search_view AS
SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.capacity_gwh,
    c.stage,
    c.website,
    c.search_vector,

    -- Aggregated technologies
    COALESCE(array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL), ARRAY[]::VARCHAR[]) AS technologies,

    -- Aggregated chemistries
    COALESCE(array_agg(DISTINCT ch.name) FILTER (WHERE ch.name IS NOT NULL), ARRAY[]::VARCHAR[]) AS chemistries,

    -- Aggregated policies
    COALESCE(array_agg(DISTINCT p.name) FILTER (WHERE p.name IS NOT NULL), ARRAY[]::VARCHAR[]) AS policies,

    -- Facility data
    COUNT(DISTINCT f.id) AS facilities_count,
    COALESCE(array_agg(DISTINCT f.state_code) FILTER (WHERE f.state_code IS NOT NULL), ARRAY[]::CHAR(2)[]) AS states,
    COALESCE(SUM(f.capacity_gwh), 0) AS total_facility_capacity,

    c.created_at,
    c.updated_at
FROM companies c
LEFT JOIN company_technologies ct ON c.id = ct.company_id
LEFT JOIN technologies t ON ct.technology_id = t.id
LEFT JOIN company_chemistries cc ON c.id = cc.company_id
LEFT JOIN chemistries ch ON cc.chemistry_id = ch.id
LEFT JOIN company_policies cp ON c.id = cp.company_id
LEFT JOIN policies p ON cp.policy_id = p.id
LEFT JOIN facilities f ON c.id = f.company_id
GROUP BY c.id;

-- Index on materialized view
CREATE UNIQUE INDEX idx_company_search_view_id ON company_search_view (id);
CREATE INDEX idx_company_search_view_technologies ON company_search_view USING gin (technologies);
CREATE INDEX idx_company_search_view_chemistries ON company_search_view USING gin (chemistries);
CREATE INDEX idx_company_search_view_states ON company_search_view USING gin (states);
CREATE INDEX idx_company_search_view_search_vector ON company_search_view USING gin (search_vector);

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_company_search_view()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY company_search_view;
END;
$$ LANGUAGE plpgsql;

--------------------------------------------------------------------------------
-- HELPER FUNCTIONS
--------------------------------------------------------------------------------

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance_miles(
    lat1 DOUBLE PRECISION,
    lon1 DOUBLE PRECISION,
    lat2 DOUBLE PRECISION,
    lon2 DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1609.34; -- Convert meters to miles
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get companies within radius
CREATE OR REPLACE FUNCTION get_companies_within_radius(
    search_lat DOUBLE PRECISION,
    search_lon DOUBLE PRECISION,
    radius_miles DOUBLE PRECISION
)
RETURNS TABLE (
    company_id UUID,
    company_name VARCHAR(255),
    facility_id UUID,
    facility_name VARCHAR(255),
    distance_miles DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id AS company_id,
        c.name AS company_name,
        f.id AS facility_id,
        f.name AS facility_name,
        (ST_Distance(
            f.coordinates,
            ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography
        ) / 1609.34)::DOUBLE PRECISION AS distance_miles
    FROM facilities f
    JOIN companies c ON f.company_id = c.id
    WHERE ST_DWithin(
        f.coordinates,
        ST_SetSRID(ST_MakePoint(search_lon, search_lat), 4326)::geography,
        radius_miles * 1609.34
    )
    ORDER BY distance_miles ASC;
END;
$$ LANGUAGE plpgsql;

-- Function for fuzzy search ranking
CREATE OR REPLACE FUNCTION fuzzy_search_rank(
    search_term TEXT,
    target_text TEXT
)
RETURNS DOUBLE PRECISION AS $$
BEGIN
    RETURN GREATEST(
        similarity(search_term, target_text),
        word_similarity(search_term, target_text)
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

--------------------------------------------------------------------------------
-- GRANTS (adjust based on your user roles)
--------------------------------------------------------------------------------
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO battery_app;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO battery_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO battery_app;

--------------------------------------------------------------------------------
-- VECTOR DATABASE TABLES (RAG System)
--------------------------------------------------------------------------------

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks table with vector embeddings
CREATE TABLE document_chunks (
    id SERIAL PRIMARY KEY,

    -- Document metadata
    source_document VARCHAR(500) NOT NULL,
    chunk_index INTEGER NOT NULL,

    -- Content
    content TEXT NOT NULL,
    content_hash VARCHAR(64) NOT NULL UNIQUE,

    -- Metadata for citations
    section_title VARCHAR(500),
    page_number INTEGER,
    chunk_metadata JSONB,

    -- Vector embedding for similarity search (1536 dimensions for OpenAI text-embedding-3-small)
    embedding vector(1536) NOT NULL,

    -- Token count for cost tracking
    token_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for document_chunks
CREATE INDEX idx_document_chunks_source ON document_chunks (source_document);
CREATE INDEX idx_document_chunks_hash ON document_chunks (content_hash);
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Trigger for updated_at
CREATE TRIGGER update_document_chunks_updated_at
    BEFORE UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Document metadata table
CREATE TABLE document_metadata (
    id SERIAL PRIMARY KEY,

    -- Document info
    file_path VARCHAR(1000) NOT NULL UNIQUE,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,

    -- Processing status
    processing_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        processing_status IN ('pending', 'processing', 'completed', 'failed')
    ),

    -- Statistics
    total_chunks INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,

    -- Checksum for detecting changes
    file_hash VARCHAR(64) NOT NULL,

    -- Error tracking
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for document_metadata
CREATE INDEX idx_document_metadata_path ON document_metadata (file_path);
CREATE INDEX idx_document_metadata_status ON document_metadata (processing_status);
CREATE INDEX idx_document_metadata_hash ON document_metadata (file_hash);

-- Trigger for updated_at
CREATE TRIGGER update_document_metadata_updated_at
    BEFORE UPDATE ON document_metadata
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

--------------------------------------------------------------------------------
-- CONVERSATION TABLES (Chat History)
--------------------------------------------------------------------------------

-- Conversations table
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for conversations
CREATE INDEX idx_conversations_session ON conversations (session_id);
CREATE INDEX idx_conversations_user ON conversations (user_id);

-- Trigger for updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations JSONB,
    source_chunks JSONB,
    confidence_score FLOAT,
    model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation ON messages (conversation_id);
CREATE INDEX idx_messages_created_at ON messages (created_at DESC);

--------------------------------------------------------------------------------
-- COMMENTS
--------------------------------------------------------------------------------
COMMENT ON TABLE companies IS 'Battery manufacturing companies';
COMMENT ON TABLE facilities IS 'Manufacturing facilities with geospatial data';
COMMENT ON TABLE technologies IS 'Battery technologies (e.g., 4680, 2170)';
COMMENT ON TABLE chemistries IS 'Battery chemistries (e.g., NMC, LFP)';
COMMENT ON TABLE policies IS 'Government policies and incentives';
COMMENT ON COLUMN facilities.coordinates IS 'Geographic coordinates stored as PostGIS POINT';
COMMENT ON COLUMN companies.search_vector IS 'Full-text search vector for companies';
COMMENT ON COLUMN facilities.search_vector IS 'Full-text search vector for facilities';

COMMENT ON TABLE document_chunks IS 'Document chunks with vector embeddings for RAG system';
COMMENT ON TABLE document_metadata IS 'Metadata and processing status for source documents';
COMMENT ON TABLE conversations IS 'Chat conversation sessions';
COMMENT ON TABLE messages IS 'Individual messages in conversations';
COMMENT ON COLUMN document_chunks.embedding IS 'Vector embedding for semantic similarity search (1536-dim OpenAI embeddings)';
COMMENT ON COLUMN document_chunks.content_hash IS 'SHA-256 hash for deduplication';
