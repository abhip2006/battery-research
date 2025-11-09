#!/bin/bash
# Database initialization helper script

echo "Initializing Battery Intelligence Database..."
echo ""

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "Error: PostgreSQL is not running."
    echo "Start it with: sudo systemctl start postgresql"
    exit 1
fi

# Try to create database and user
echo "Creating database and user..."
sudo -u postgres psql << SQL
-- Create database
CREATE DATABASE battery_intelligence;

-- Connect and enable pgvector
\c battery_intelligence
CREATE EXTENSION IF NOT EXISTS vector;

-- Create user
CREATE USER battery_user WITH PASSWORD 'battery_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE battery_intelligence TO battery_user;
GRANT ALL ON SCHEMA public TO battery_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO battery_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO battery_user;

-- Verify
SELECT 'Database created successfully!' as status;
SELECT 'pgvector extension: ' || extversion as version FROM pg_extension WHERE extname = 'vector';
SQL

echo ""
echo "✓ Database initialization complete!"
echo ""
echo "Next steps:"
echo "  1. Edit backend/.env and add your API keys"
echo "  2. Run: python backend/verify_setup.py"
echo "  3. Run: python backend/scripts/process_documents.py"
