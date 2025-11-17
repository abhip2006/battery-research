#!/bin/bash

# Database Setup Script for Battery Research RAG System
# This script handles PostgreSQL setup and pgvector extension installation

set -e

echo "=========================================="
echo "Battery Research Database Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 12+ with pgvector extension"
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL found${NC}"

# Function to check if PostgreSQL is running
check_postgres() {
    pg_isready -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER:-battery_user} &> /dev/null
    return $?
}

# Check if PostgreSQL is running, try to start if not
if ! check_postgres; then
    echo -e "${YELLOW}PostgreSQL is not running. Attempting to start...${NC}"

    # Try different methods to start PostgreSQL
    if command -v systemctl &> /dev/null; then
        sudo systemctl start postgresql || true
    elif command -v service &> /dev/null; then
        sudo service postgresql start || true
    elif command -v pg_ctlcluster &> /dev/null; then
        # Fix SSL certificate permissions if needed
        sudo chmod 640 /etc/ssl/private/ssl-cert-snakeoil.key 2>/dev/null || true
        sudo chgrp ssl-cert /etc/ssl/private/ssl-cert-snakeoil.key 2>/dev/null || true
        sudo pg_ctlcluster 16 main start || true
    fi

    sleep 2

    if check_postgres; then
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    else
        echo -e "${YELLOW}Warning: Could not start PostgreSQL automatically${NC}"
        echo "Please start PostgreSQL manually and run this script again"
        echo ""
        echo "Try one of these commands:"
        echo "  sudo systemctl start postgresql"
        echo "  sudo service postgresql start"
        echo "  sudo pg_ctlcluster 16 main start"
        exit 1
    fi
else
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
fi

# Create database user if doesn't exist
echo ""
echo "Setting up database user and database..."

# Switch to postgres user to create database
sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}';" 2>/dev/null || echo "User already exists"
sudo -u postgres psql -c "ALTER USER ${POSTGRES_USER} WITH SUPERUSER;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER};" 2>/dev/null || echo "Database already exists"

echo -e "${GREEN}✓ Database user and database ready${NC}"

# Install pgvector extension
echo ""
echo "Installing pgvector extension..."
sudo -u postgres psql -d ${POSTGRES_DB} -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true

echo -e "${GREEN}✓ pgvector extension installed${NC}"

# Verify connection
echo ""
echo "Verifying database connection..."
if PGPASSWORD=${POSTGRES_PASSWORD} psql -h ${POSTGRES_HOST:-localhost} -p ${POSTGRES_PORT:-5432} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    exit 1
fi

# Run database migrations
echo ""
echo "Running database initialization..."
cd "$(dirname "$0")/.."
python3 scripts/init_db.py

echo ""
echo -e "${GREEN}=========================================="
echo "Database setup completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys (GEMINI_API_KEY or OPENAI_API_KEY)"
echo "2. Run: python3 scripts/process_documents.py"
echo "3. Or use: python3 scripts/continuous_ingest.py (for continuous monitoring)"
