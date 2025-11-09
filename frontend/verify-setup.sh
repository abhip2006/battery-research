#!/bin/bash

# Battery Intelligence Platform - Setup Verification Script
# This script checks that all required files are in place

echo "=================================="
echo "Battery Intelligence Platform"
echo "Setup Verification"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - MISSING: $1"
        ((CHECKS_FAILED++))
    fi
}

# Function to check directory exists
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $2 - MISSING: $1"
        ((CHECKS_FAILED++))
    fi
}

echo "Checking Configuration Files..."
check_file "package.json" "package.json"
check_file "tsconfig.json" "TypeScript configuration"
check_file "tailwind.config.ts" "Tailwind configuration"
check_file "next.config.js" "Next.js configuration"
check_file "postcss.config.js" "PostCSS configuration"
echo ""

echo "Checking Source Directories..."
check_dir "src" "Source directory"
check_dir "src/app" "App Router directory"
check_dir "src/components" "Components directory"
check_dir "src/lib" "Library directory"
check_dir "src/types" "Types directory"
check_dir "src/hooks" "Hooks directory"
check_dir "src/styles" "Styles directory"
echo ""

echo "Checking Pages..."
check_file "src/app/layout.tsx" "Root layout"
check_file "src/app/page.tsx" "Home page"
check_file "src/app/companies/page.tsx" "Companies page"
check_file "src/app/map/page.tsx" "Map page"
check_file "src/app/technology/page.tsx" "Technology page"
check_file "src/app/forecast/page.tsx" "Forecast page"
check_file "src/app/policy/page.tsx" "Policy page"
echo ""

echo "Checking Components..."
check_file "src/components/layout/Header.tsx" "Header component"
check_file "src/components/layout/Footer.tsx" "Footer component"
check_file "src/components/layout/ThemeToggle.tsx" "Theme toggle"
check_file "src/components/ui/Card.tsx" "Card component"
check_file "src/components/ui/Table.tsx" "Table component"
check_file "src/components/charts/LineChart.tsx" "Line chart"
check_file "src/components/charts/BarChart.tsx" "Bar chart"
check_file "src/components/charts/PieChart.tsx" "Pie chart"
echo ""

echo "Checking Data..."
check_file "public/data/visualization-data.json" "Visualization data"
echo ""

echo "Checking Documentation..."
check_file "README.md" "Main README"
check_file "QUICKSTART.md" "Quick start guide"
check_file "PROJECT_SUMMARY.md" "Project summary"
check_file "ARCHITECTURE.md" "Architecture docs"
echo ""

echo "Checking Node.js and npm..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Node.js not installed"
    ((CHECKS_FAILED++))
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm installed: $NPM_VERSION"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} npm not installed"
    ((CHECKS_FAILED++))
fi
echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed (node_modules exists)"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}!${NC} Dependencies not installed yet"
    echo "  Run: npm install"
fi
echo ""

# Summary
echo "=================================="
echo "Verification Summary"
echo "=================================="
echo -e "Checks Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "Checks Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! You're ready to go.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Install dependencies (if not done): npm install"
    echo "  2. Start development server: npm run dev"
    echo "  3. Open http://localhost:3000"
    echo ""
    echo "See QUICKSTART.md for detailed instructions."
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
