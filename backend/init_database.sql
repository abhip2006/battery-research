-- Initialize Battery Intelligence Database
-- Run with: psql -U postgres -f init_database.sql

-- Create database
CREATE DATABASE battery_intelligence;

-- Connect to the database
\c battery_intelligence

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user
CREATE USER battery_user WITH PASSWORD 'battery_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE battery_intelligence TO battery_user;
GRANT ALL ON SCHEMA public TO battery_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO battery_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO battery_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO battery_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO battery_user;

-- Verify pgvector installation
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Show database info
SELECT current_database(), version();
