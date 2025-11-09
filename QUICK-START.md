# 🚀 Quick Start Guide - Battery Industry Visualization Dashboard

**Get up and running in 5 minutes!**

---

## 📋 What You Get

✅ **20+ Interactive Visualizations**
✅ **Interactive Maps** with state-level data
✅ **Network Graphs** showing supply chain relationships
✅ **Scenario Modeling** with 8 pre-built scenarios
✅ **Export Functions** (PNG, SVG, PDF, CSV, JSON)
✅ **Cross-Filtering** between charts
✅ **Responsive Design** for all devices

---

## 🎯 Option 1: Use Enhanced Version (Recommended)

### Step 1: Open the Dashboard

Simply open `index-enhanced.html` in your web browser:

```bash
# If you have Python installed:
cd /home/user/battery-research
python -m http.server 8000

# Then open: http://localhost:8000/index-enhanced.html
```

**Or** just double-click `index-enhanced.html` in your file browser.

### Step 2: Explore Features

1. **📉 Cost Trends** - See battery costs decline with confidence bands
2. **📈 Capacity Growth** - Explore manufacturing capacity projections
3. **🗺️ Interactive Map** - Click state markers to see facility details
4. **🕸️ Network Graph** - Drag nodes to explore supply chain relationships
5. **🎯 Scenario Modeling** - Test different market scenarios
6. **💾 Export** - Download any chart or data

### That's it! You're done! 🎉

---

## 🎯 Option 2: Use Original Version

If you prefer the simpler version without maps and advanced analytics:

```bash
# Open index.html instead
open index.html
```

---

## 🔧 Customization Quick Reference

### Change Colors

Edit `app-enhanced.js`:

```javascript
const CONFIG = {
  colors: {
    primary: ['#YOUR_COLOR_1', '#YOUR_COLOR_2', ...],
    technology: {
      'LFP': '#YOUR_LFP_COLOR',
      'NMC': '#YOUR_NMC_COLOR',
      ...
    }
  }
};
```

### Add Custom Scenario

Edit `scenario-modeling.js`:

```javascript
// Add to scenario selector
<option value="my-scenario">My Custom Scenario</option>

// Add scenario logic
applyMyScenario(data) {
  data.capacityGrowth = data.capacityGrowth.map(d => ({
    ...d,
    capacity: d.capacity * 1.5  // 50% boost
  }));
  return data;
}
```

### Export Specific Chart

```javascript
// In browser console or your own script:
ExportUtils.exportChartAsPNG('costTrendsChart', 'my-analysis.png');
ExportUtils.exportAsCSV(data.stateRankings, 'states.csv');
```

---

## 📊 Key Features Demo

### Interactive Map

```javascript
// Initialize map with custom data
MapComponent.initMap('mapContainer', myData);

// Add custom markers
MapComponent.addStateMarkers(myStateData);

// Filter markers
MapComponent.filterMarkers(marker => marker.capacity > 50);
```

### Network Graph

```javascript
// Initialize network
NetworkGraph.initGraph('networkContainer', myData);

// Filter by company
NetworkGraph.filterByType('company');

// Highlight Tesla's connections
NetworkGraph.highlightConnections('company_Tesla');

// Export as SVG
NetworkGraph.exportAsSVG('my-network.svg');
```

### Scenario Modeling

```javascript
// Apply predefined scenario
ScenarioModeling.applyScenario('ira-optimistic');

// Adjust custom parameters
document.getElementById('capacity-modifier').value = 120;
ScenarioModeling.applyCustomScenario();

// Export results
ScenarioModeling.exportScenario('json');
```

---

## 🐛 Troubleshooting

### Charts Not Showing?

**Check 1:** Open browser console (F12) and look for errors

**Check 2:** Verify data file exists:
```bash
ls -la visualization-data.json
```

**Check 3:** Make sure you're using a local server (not file://)
```bash
python -m http.server 8000
```

### Map Not Rendering?

**Check 1:** Verify container has height:
```javascript
const container = document.getElementById('mapContainer');
console.log(container.clientHeight); // Should be > 0
```

**Check 2:** Ensure Leaflet CSS is loaded:
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```

### Export Not Working?

**For PDF export**, ensure jsPDF is loaded:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
```

---

## 📚 Next Steps

### Learn More
- Read `VISUALIZATION-README.md` for complete API documentation
- Check `AGENT-P06-DELIVERABLES.md` for detailed feature list
- Explore the code - it's well-commented!

### Customize
- Modify colors in `CONFIG` object
- Add your own scenarios
- Create custom visualizations
- Extend the network graph

### Deploy
- Host on GitHub Pages
- Deploy to Netlify or Vercel
- Integrate with your React/Vue/Angular app
- Embed in Jupyter notebooks

---

## 🎨 File Overview

| File | Purpose | Size |
|------|---------|------|
| `index-enhanced.html` | Main dashboard page | 15KB |
| `app-enhanced.js` | Chart components | 55KB |
| `map-component.js` | Interactive maps | 12KB |
| `network-graph.js` | Network graphs | 14KB |
| `scenario-modeling.js` | Scenario builder | 22KB |
| `visualization-data.json` | Data source | 10KB |

---

## 💡 Pro Tips

### 1. Use Filters
Click on any chart element to filter related visualizations

### 2. Export Everything
Right-click charts to save, or use the export buttons

### 3. Zoom Charts
Hold `Ctrl` and scroll to zoom time series charts
Hold `Shift` and drag to pan

### 4. Network Graph Tricks
- Drag nodes to rearrange
- Scroll to zoom in/out
- Hover for detailed info
- Click legend items to filter

### 5. Scenario Modeling
- Start with pre-built scenarios
- Then adjust sliders for custom analysis
- Export results for reporting

---

## 🤝 Getting Help

### Documentation
- **Quick Start**: This file
- **Full Docs**: `VISUALIZATION-README.md`
- **Deliverables**: `AGENT-P06-DELIVERABLES.md`

### Code Examples
All components have inline examples:
```javascript
// See app-enhanced.js for chart examples
// See map-component.js for map examples
// See network-graph.js for network examples
// See scenario-modeling.js for scenario examples
```

### Browser Console
Open F12 to see debug logs:
```javascript
console.log(batteryDashboard.state.getData());
console.log(batteryDashboard.charts);
```

---

## ✅ Checklist

Before you start customizing, verify:

- [ ] All JS files are in the same directory
- [ ] `visualization-data.json` exists
- [ ] You're using a local server (not file://)
- [ ] Browser console shows no errors
- [ ] Charts are visible and interactive
- [ ] Map displays with markers
- [ ] Network graph is interactive
- [ ] Export buttons work

---

## 🎯 Common Use Cases

### 1. Create a Report
```javascript
// Export all charts as PNG
Object.keys(batteryDashboard.charts).forEach(id => {
  ExportUtils.exportChartAsPNG(id, `${id}.png`);
});

// Export data as CSV
ExportUtils.exportAsCSV(data.stateRankings, 'states.csv');
```

### 2. Filter by Region
```javascript
// Show only Southeast states
const southeastStates = ['GA', 'TN', 'NC', 'SC', 'KY', 'AL'];
AppState.setFilter('selectedStates', southeastStates);
```

### 3. Compare Scenarios
```javascript
// Apply IRA scenario
ScenarioModeling.applyScenario('ira-optimistic');

// Screenshot the comparison chart
// Then apply different scenario
ScenarioModeling.applyScenario('supply-constraint');
```

### 4. Analyze Supply Chain
```javascript
// Initialize network
NetworkGraph.initGraph('networkContainer', data);

// Highlight Tesla's supply chain
NetworkGraph.highlightConnections('company_Tesla');

// Export for presentation
NetworkGraph.exportAsSVG('tesla-supply-chain.svg');
```

---

## 🚀 Advanced Usage

### Custom Data Source

Replace `visualization-data.json` with your own data:

```javascript
async function loadCustomData() {
  const response = await fetch('my-custom-data.json');
  const data = await response.json();
  AppState.setData(data);

  // Recreate visualizations
  ChartComponents.createCostCurveChart(data.costCurve);
  MapComponent.initMap('mapContainer', data);
  // ... etc
}
```

### Programmatic Export

```javascript
// Export all data sections
Object.entries(AppState.getData()).forEach(([key, value]) => {
  if (Array.isArray(value)) {
    ExportUtils.exportAsCSV(value, `${key}.csv`);
  }
});
```

### Real-time Updates

```javascript
// Update data periodically
setInterval(async () => {
  const newData = await fetch('api/latest-data').then(r => r.json());
  AppState.setData(newData);
  window.updateAllCharts();
}, 60000); // Every minute
```

---

## 🎉 You're Ready!

**Happy Visualizing!** 🎨📊🗺️

For more details, see:
- `VISUALIZATION-README.md` - Complete documentation
- `AGENT-P06-DELIVERABLES.md` - Feature list
- Source code - Well-commented for easy reading

---

**Last Updated:** 2025-11-09
**Version:** 2.0.0
