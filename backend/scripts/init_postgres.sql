-- PostgreSQL initialization script for Battery Intelligence Platform
-- This script runs automatically when the Docker container is first created

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create additional extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search optimization

-- Set default timezone
SET timezone = 'UTC';

-- Log successful initialization
SELECT 'Battery Intelligence Platform database initialized successfully' as status;
