-- Sample Data for Battery Research Platform
-- This file contains example data to populate the database

-- Note: Run schema.sql first before executing this file

BEGIN;

--------------------------------------------------------------------------------
-- INSERT TECHNOLOGIES
--------------------------------------------------------------------------------
INSERT INTO technologies (name, category, description) VALUES
('Li-ion', 'Chemistry', 'Lithium-ion battery technology'),
('LFP', 'Chemistry', 'Lithium Iron Phosphate'),
('NMC', 'Chemistry', 'Nickel Manganese Cobalt'),
('NCA', 'Chemistry', 'Nickel Cobalt Aluminum'),
('NCMA', 'Chemistry', 'Nickel Cobalt Manganese Aluminum'),
('Solid-State', 'Architecture', 'Solid-state electrolyte battery'),
('Sodium-ion', 'Chemistry', 'Sodium-ion battery'),
('4680', 'Cell Format', 'Tesla 4680 cylindrical cell format'),
('2170', 'Cell Format', '21700 cylindrical cell format'),
('Lithium-Metal', 'Chemistry', 'Lithium-metal anode battery'),
('Iron-Air', 'Chemistry', 'Iron-air battery for long-duration storage'),
('Prussian Blue', 'Chemistry', 'Prussian Blue chemistry for sodium-ion'),
('Sulfide', 'Architecture', 'Sulfide-based solid electrolyte'),
('SemiSolid', 'Architecture', 'Semi-solid battery technology')
ON CONFLICT (name) DO NOTHING;

--------------------------------------------------------------------------------
-- INSERT CHEMISTRIES
--------------------------------------------------------------------------------
INSERT INTO chemistries (name, full_name, description, energy_density_wh_kg, cycle_life) VALUES
('LFP', 'Lithium Iron Phosphate', 'Safe, long-lasting chemistry with lower energy density', 160, 6000),
('NMC', 'Nickel Manganese Cobalt', 'High energy density, versatile chemistry', 260, 2500),
('NCA', 'Nickel Cobalt Aluminum', 'High energy density, used by Tesla/Panasonic', 265, 2500),
('NCMA', 'Nickel Cobalt Manganese Aluminum', 'Next-gen high-nickel chemistry', 275, 2000),
('Lithium-Metal', 'Lithium Metal Anode', 'Solid-state with lithium metal anode', 450, 1000),
('Sodium-ion', 'Sodium Ion', 'Cost-effective alternative to lithium', 150, 5000),
('Iron-Air', 'Iron-Air', 'Ultra-low-cost long-duration storage', 100, 10000),
('Solid-State', 'Solid-State Lithium', 'Solid electrolyte lithium battery', 400, 2000)
ON CONFLICT (name) DO NOTHING;

--------------------------------------------------------------------------------
-- INSERT POLICIES
--------------------------------------------------------------------------------
INSERT INTO policies (name, full_name, description, policy_type, enacted_date) VALUES
('IRA', 'Inflation Reduction Act', 'Federal tax credits and incentives for battery manufacturing', 'Tax Credit', '2022-08-16'),
('DOE Grant', 'Department of Energy Grant', 'Federal grants for battery research and manufacturing', 'Grant', '2009-01-01'),
('DOE Loans', 'Department of Energy Loan Program', 'Low-interest loans for clean energy projects', 'Loan', '2009-01-01')
ON CONFLICT (name) DO NOTHING;

--------------------------------------------------------------------------------
-- INSERT COMPANIES AND FACILITIES
--------------------------------------------------------------------------------

-- Tesla
DO $$
DECLARE
    company_uuid UUID;
    tech_li_ion UUID;
    tech_4680 UUID;
    tech_2170 UUID;
    chem_nmc UUID;
    chem_lfp UUID;
    policy_ira UUID;
    policy_loans UUID;
BEGIN
    -- Get technology IDs
    SELECT id INTO tech_li_ion FROM technologies WHERE name = 'Li-ion';
    SELECT id INTO tech_4680 FROM technologies WHERE name = '4680';
    SELECT id INTO tech_2170 FROM technologies WHERE name = '2170';

    -- Get chemistry IDs
    SELECT id INTO chem_nmc FROM chemistries WHERE name = 'NMC';
    SELECT id INTO chem_lfp FROM chemistries WHERE name = 'LFP';

    -- Get policy IDs
    SELECT id INTO policy_ira FROM policies WHERE name = 'IRA';
    SELECT id INTO policy_loans FROM policies WHERE name = 'DOE Loans';

    -- Insert company
    INSERT INTO companies (name, slug, description, capacity_gwh, stage, website, founded_year)
    VALUES (
        'Tesla',
        'tesla',
        'Leading electric vehicle manufacturer with integrated battery production',
        110,
        'Gigafactory',
        'https://tesla.com',
        2003
    )
    RETURNING id INTO company_uuid;

    -- Link technologies
    INSERT INTO company_technologies (company_id, technology_id) VALUES
    (company_uuid, tech_li_ion),
    (company_uuid, tech_4680),
    (company_uuid, tech_2170);

    -- Link chemistries
    INSERT INTO company_chemistries (company_id, chemistry_id) VALUES
    (company_uuid, chem_nmc),
    (company_uuid, chem_lfp);

    -- Link policies
    INSERT INTO company_policies (company_id, policy_id) VALUES
    (company_uuid, policy_ira),
    (company_uuid, policy_loans);

    -- Insert facility
    INSERT INTO facilities (
        company_id, name, location, city, state_code, state_name,
        capacity_gwh, status, year_established, coordinates, employees_count
    ) VALUES (
        company_uuid,
        'Gigafactory Nevada',
        'Sparks, Nevada',
        'Sparks',
        'NV',
        'Nevada',
        100,
        'Operational',
        2016,
        ST_SetSRID(ST_MakePoint(-119.4374, 39.5378), 4326)::geography,
        7000
    );
END $$;

-- QuantumScape
DO $$
DECLARE
    company_uuid UUID;
    tech_ss UUID;
    chem_lm UUID;
    policy_grant UUID;
BEGIN
    SELECT id INTO tech_ss FROM technologies WHERE name = 'Solid-State';
    SELECT id INTO chem_lm FROM chemistries WHERE name = 'Lithium-Metal';
    SELECT id INTO policy_grant FROM policies WHERE name = 'DOE Grant';

    INSERT INTO companies (name, slug, description, capacity_gwh, stage, website, founded_year)
    VALUES (
        'QuantumScape',
        'quantumscape',
        'Solid-state battery developer with breakthrough lithium-metal technology',
        5,
        'R&D',
        'https://quantumscape.com',
        2010
    )
    RETURNING id INTO company_uuid;

    INSERT INTO company_technologies (company_id, technology_id) VALUES
    (company_uuid, tech_ss);

    INSERT INTO company_chemistries (company_id, chemistry_id) VALUES
    (company_uuid, chem_lm);

    INSERT INTO company_policies (company_id, policy_id) VALUES
    (company_uuid, policy_grant);

    INSERT INTO facilities (
        company_id, name, location, city, state_code, state_name,
        capacity_gwh, status, year_established, coordinates, employees_count
    ) VALUES (
        company_uuid,
        'QuantumScape QS-0',
        'San Jose, California',
        'San Jose',
        'CA',
        'California',
        1,
        'Pilot',
        2023,
        ST_SetSRID(ST_MakePoint(-121.8863, 37.3382), 4326)::geography,
        500
    );
END $$;

-- Natron Energy
DO $$
DECLARE
    company_uuid UUID;
    tech_naion UUID;
    tech_pb UUID;
    chem_naion UUID;
    policy_grant UUID;
BEGIN
    SELECT id INTO tech_naion FROM technologies WHERE name = 'Sodium-ion';
    SELECT id INTO tech_pb FROM technologies WHERE name = 'Prussian Blue';
    SELECT id INTO chem_naion FROM chemistries WHERE name = 'Sodium-ion';
    SELECT id INTO policy_grant FROM policies WHERE name = 'DOE Grant';

    INSERT INTO companies (name, slug, description, capacity_gwh, stage, website, founded_year)
    VALUES (
        'Natron Energy',
        'natron-energy',
        'Sodium-ion battery manufacturer for industrial and data center applications',
        10,
        'Commercial',
        'https://natron.energy',
        2012
    )
    RETURNING id INTO company_uuid;

    INSERT INTO company_technologies (company_id, technology_id) VALUES
    (company_uuid, tech_naion),
    (company_uuid, tech_pb);

    INSERT INTO company_chemistries (company_id, chemistry_id) VALUES
    (company_uuid, chem_naion);

    INSERT INTO company_policies (company_id, policy_id) VALUES
    (company_uuid, policy_grant);

    INSERT INTO facilities (
        company_id, name, location, city, state_code, state_name,
        capacity_gwh, status, year_established, coordinates, employees_count
    ) VALUES (
        company_uuid,
        'Natron Holland',
        'Holland, Michigan',
        'Holland',
        'MI',
        'Michigan',
        10,
        'Operational',
        2023,
        ST_SetSRID(ST_MakePoint(-86.1089, 42.7875), 4326)::geography,
        200
    );
END $$;

-- Form Energy
DO $$
DECLARE
    company_uuid UUID;
    tech_ironair UUID;
    chem_ironair UUID;
    policy_grant UUID;
BEGIN
    SELECT id INTO tech_ironair FROM technologies WHERE name = 'Iron-Air';
    SELECT id INTO chem_ironair FROM chemistries WHERE name = 'Iron-Air';
    SELECT id INTO policy_grant FROM policies WHERE name = 'DOE Grant';

    INSERT INTO companies (name, slug, description, capacity_gwh, stage, website, founded_year)
    VALUES (
        'Form Energy',
        'form-energy',
        'Iron-air battery developer for long-duration grid storage',
        1,
        'Pilot',
        'https://formenergy.com',
        2017
    )
    RETURNING id INTO company_uuid;

    INSERT INTO company_technologies (company_id, technology_id) VALUES
    (company_uuid, tech_ironair);

    INSERT INTO company_chemistries (company_id, chemistry_id) VALUES
    (company_uuid, chem_ironair);

    INSERT INTO company_policies (company_id, policy_id) VALUES
    (company_uuid, policy_grant);

    INSERT INTO facilities (
        company_id, name, location, city, state_code, state_name,
        capacity_gwh, status, year_established, coordinates, employees_count
    ) VALUES (
        company_uuid,
        'Form Energy Weirton',
        'Weirton, West Virginia',
        'Weirton',
        'WV',
        'West Virginia',
        1,
        'Under Construction',
        2024,
        ST_SetSRID(ST_MakePoint(-80.5895, 40.4187), 4326)::geography,
        150
    );
END $$;

-- Create test user
INSERT INTO users (email, name) VALUES
('test@example.com', 'Test User');

-- Refresh materialized view
REFRESH MATERIALIZED VIEW company_search_view;

COMMIT;

-- Verify data
SELECT 'Companies: ' || COUNT(*) FROM companies;
SELECT 'Facilities: ' || COUNT(*) FROM facilities;
SELECT 'Technologies: ' || COUNT(*) FROM technologies;
SELECT 'Chemistries: ' || COUNT(*) FROM chemistries;
SELECT 'Policies: ' || COUNT(*) FROM policies;

-- Example search queries to test

-- 1. Find all solid-state companies
SELECT c.name, c.stage, c.capacity_gwh
FROM companies c
JOIN company_technologies ct ON c.id = ct.company_id
JOIN technologies t ON ct.technology_id = t.id
WHERE t.name = 'Solid-State';

-- 2. Find facilities in California
SELECT c.name AS company, f.name AS facility, f.location, f.capacity_gwh
FROM facilities f
JOIN companies c ON f.company_id = c.id
WHERE f.state_code = 'CA';

-- 3. Companies with IRA support
SELECT c.name, c.capacity_gwh, c.stage
FROM companies c
JOIN company_policies cp ON c.id = cp.company_id
JOIN policies p ON cp.policy_id = p.id
WHERE p.name = 'IRA';

-- 4. Geospatial: Find facilities within 100 miles of San Francisco
SELECT
    c.name AS company,
    f.name AS facility,
    f.location,
    ST_Distance(
        f.coordinates,
        ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
    ) / 1609.34 AS distance_miles
FROM facilities f
JOIN companies c ON f.company_id = c.id
WHERE ST_DWithin(
    f.coordinates,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
    100 * 1609.34
)
ORDER BY distance_miles;
