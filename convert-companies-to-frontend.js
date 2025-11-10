#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the detailed companies data
const detailedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data/companies-detailed.json'), 'utf8')
);

// Helper function to extract numeric capacity and handle unit conversion
function extractNumericCapacity(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    // Handle MW to GWh conversion
    const mwMatch = value.match(/(\d+(?:\.\d+)?)\s*MW/i);
    if (mwMatch) {
      return parseFloat(mwMatch[1]) / 1000; // Convert MW to GWh
    }

    // Handle GWh values
    const gwhMatch = value.match(/(\d+(?:\.\d+)?)\s*GWh/i);
    if (gwhMatch) {
      return parseFloat(gwhMatch[1]);
    }

    // If it's just a number without units in a capacity field, assume GWh
    if (value.match(/^\d+(?:\.\d+)?$/)) {
      return parseFloat(value);
    }
  }

  return 0;
}

// Helper function to extract capacity from facilities
function extractFacilityCapacity(facilities) {
  if (!facilities || !Array.isArray(facilities)) {
    return 0;
  }

  let total = 0;
  facilities.forEach(facility => {
    // Only look at fields that are clearly capacity-related
    if (facility.capacity_gwh !== undefined) {
      total += extractNumericCapacity(facility.capacity_gwh);
    }
    // Check if capacity field contains GWh or MW
    if (facility.capacity && typeof facility.capacity === 'string') {
      if (facility.capacity.includes('GWh') || facility.capacity.includes('MW')) {
        total += extractNumericCapacity(facility.capacity);
      }
    }
    if (typeof facility.capacity === 'number') {
      total += facility.capacity;
    }
  });

  return total;
}

// Helper function to extract capacity from capacity_target
function extractTargetCapacity(capacityTarget) {
  if (!capacityTarget) return 0;

  if (typeof capacityTarget === 'string' || typeof capacityTarget === 'number') {
    return extractNumericCapacity(capacityTarget);
  }

  if (typeof capacityTarget === 'object') {
    // Look for year-based targets or named targets
    const values = Object.values(capacityTarget);
    for (const val of values) {
      const num = extractNumericCapacity(val);
      if (num > 0) return num;
    }
  }

  return 0;
}

// Helper function to extract capacity from a company
function extractCapacity(company) {
  let capacity = 0;

  // Priority 1: Direct capacity_gwh field
  if (company.capacity_gwh !== undefined && company.capacity_gwh !== null) {
    capacity = extractNumericCapacity(company.capacity_gwh);
    if (capacity > 0) return capacity;
  }

  // Priority 2: Total capacity for joint ventures
  if (company.total_capacity_gwh !== undefined && company.total_capacity_gwh !== null) {
    capacity = extractNumericCapacity(company.total_capacity_gwh);
    if (capacity > 0) return capacity;
  }

  // Priority 3: Calculate from facilities
  capacity = extractFacilityCapacity(company.facilities);
  if (capacity > 0) return capacity;

  // Priority 4: Extract from capacity_target
  capacity = extractTargetCapacity(company.capacity_target);
  if (capacity > 0) return capacity;

  // Priority 5: For companies in development/pilot stage, assign a small non-zero value
  if (company.stage && (company.stage.includes('Development') || company.stage.includes('Pilot'))) {
    return 0.1; // 100 MW placeholder for development-stage companies
  }

  // Default to 0 if no capacity found
  return 0;
}

// Helper function to simplify technology description
function simplifyTechnology(tech) {
  if (!tech) return 'Various';

  // Keep it concise for the frontend
  if (tech.length > 80) {
    // Extract key terms
    const parts = tech.split(/[,;()]/);
    return parts.slice(0, 2).map(p => p.trim()).filter(p => p).join(', ');
  }

  return tech;
}

// Convert all companies to the simple format
const topCompanies = [];

// Process public companies
detailedData.publicCompanies.forEach(company => {
  topCompanies.push({
    name: company.name,
    capacity: extractCapacity(company),
    technology: simplifyTechnology(company.technology),
    headquarters: company.headquarters,
    founded: company.founded
  });
});

// Process private companies
detailedData.privateCompanies.forEach(company => {
  topCompanies.push({
    name: company.name,
    capacity: extractCapacity(company),
    technology: simplifyTechnology(company.technology),
    headquarters: company.headquarters,
    founded: company.founded
  });
});

// Process joint ventures
detailedData.jointVentures.forEach(company => {
  topCompanies.push({
    name: company.name,
    capacity: extractCapacity(company),
    technology: simplifyTechnology(company.technology),
    headquarters: company.headquarters,
    founded: company.founded
  });
});

// Process subsidiaries
detailedData.subsidiaries.forEach(company => {
  topCompanies.push({
    name: company.name,
    capacity: extractCapacity(company),
    technology: simplifyTechnology(company.technology),
    headquarters: company.headquarters || company.parent_company,
    founded: company.founded
  });
});

// Sort by capacity (descending) to show largest companies first
topCompanies.sort((a, b) => b.capacity - a.capacity);

// Read the existing visualization data
const vizDataPath = path.join(__dirname, 'frontend/public/data/visualization-data.json');
const vizData = JSON.parse(fs.readFileSync(vizDataPath, 'utf8'));

// Update the topCompanies array
vizData.topCompanies = topCompanies;

// Update metadata
vizData.metadata.reportDate = new Date().toISOString().split('T')[0];
if (!vizData.metadata.dataSource.includes('data/companies-detailed.json')) {
  vizData.metadata.dataSource.push('data/companies-detailed.json');
}

// Write back to the file
fs.writeFileSync(vizDataPath, JSON.stringify(vizData, null, 2));

console.log(`Successfully converted ${topCompanies.length} companies to frontend format`);
console.log(`\nTop 20 companies by capacity:`);
topCompanies.slice(0, 20).forEach((c, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. ${c.name.padEnd(55)} ${c.capacity.toFixed(1).padStart(7)} GWh`);
});

const companiesWithCapacity = topCompanies.filter(c => c.capacity > 0).length;
const companiesWithoutCapacity = topCompanies.filter(c => c.capacity === 0).length;
const developmentStage = topCompanies.filter(c => c.capacity === 0.1).length;

console.log(`\n=== Statistics ===`);
console.log(`Total companies: ${topCompanies.length}`);
console.log(`With production capacity: ${companiesWithCapacity - developmentStage}`);
console.log(`In development (0.1 GWh placeholder): ${developmentStage}`);
console.log(`No capacity data (0 GWh): ${companiesWithoutCapacity}`);
console.log(`\nTotal U.S. battery capacity: ${topCompanies.reduce((sum, c) => sum + c.capacity, 0).toFixed(1)} GWh`);
