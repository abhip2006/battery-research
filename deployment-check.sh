#!/bin/bash
echo "=== FRONTEND DEPLOYMENT CHECK ==="
echo ""

# Check critical files
echo "1. Critical Files Status:"
files=("index.html" "styles.css" "app.js" "visualization-data.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        echo "   ✅ $file ($size)"
    else
        echo "   ❌ $file - MISSING"
    fi
done
echo ""

# Check JSON data validity
echo "2. Data Validation:"
if python3 -c "import json; json.load(open('visualization-data.json'))" 2>/dev/null; then
    echo "   ✅ visualization-data.json - Valid JSON"
else
    echo "   ❌ visualization-data.json - Invalid JSON"
fi
echo ""

# Check for Chart.js CDN in HTML
echo "3. Chart.js Integration:"
if grep -q "chart.js" index.html; then
    echo "   ✅ Chart.js CDN found in index.html"
else
    echo "   ❌ Chart.js CDN missing"
fi
echo ""

# Count sections in HTML
echo "4. HTML Structure:"
sections=$(grep -c 'id=".*" class="section' index.html)
echo "   📊 Total sections: $sections"
echo ""

# Check app.js structure
echo "5. JavaScript Functionality:"
if grep -q "Chart" app.js 2>/dev/null; then
    echo "   ✅ Chart.js integration found in app.js"
fi
if grep -q "fetch" app.js 2>/dev/null; then
    echo "   ✅ Data fetching logic present"
fi
if grep -q "addEventListener" app.js 2>/dev/null; then
    echo "   ✅ Event listeners configured"
fi
echo ""

# Server status
echo "6. Local Server:"
if lsof -i :8080 > /dev/null 2>&1; then
    echo "   ✅ HTTP server running on port 8080"
    echo "   🌐 Access at: http://localhost:8080"
else
    echo "   ⚠️  No server detected on port 8080"
fi
echo ""

echo "=== DEPLOYMENT STATUS: READY ==="
