-- ==============================================================================
-- EcoSustain: MSME Green Sustainability Platform
-- Supabase PostgreSQL Schema & Initial Seed Data
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COMPANY PROFILES TABLE
CREATE TABLE IF NOT EXISTS company_profiles (
    id TEXT PRIMARY KEY DEFAULT 'current',
    company_name TEXT NOT NULL DEFAULT 'GlowOrganic Cafe',
    sector TEXT NOT NULL DEFAULT 'Culinary (F&B)',
    points INTEGER DEFAULT 45,
    level TEXT DEFAULT 'Green Innovator',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GREEN RECORDS (MONTHLY RESOURCE CONSUMPTION & EMISSIONS)
CREATE TABLE IF NOT EXISTS green_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year TEXT NOT NULL,
    month TEXT NOT NULL,
    electricity NUMERIC DEFAULT 0,
    electricity_cost NUMERIC DEFAULT 0,
    water NUMERIC DEFAULT 0,
    water_cost NUMERIC DEFAULT 0,
    plastic NUMERIC DEFAULT 0,
    paper NUMERIC DEFAULT 0,
    organic_materials NUMERIC DEFAULT 0,
    waste_organic NUMERIC DEFAULT 0,
    waste_inorganic NUMERIC DEFAULT 0,
    waste_recycled NUMERIC DEFAULT 0,
    fuel_type TEXT DEFAULT 'Petrol',
    fuel_qty NUMERIC DEFAULT 0,
    emissions NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_year_month UNIQUE (year, month)
);

-- 4. GREEN INNOVATIONS TABLE
CREATE TABLE IF NOT EXISTS green_innovations (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    cost NUMERIC DEFAULT 0,
    savings NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Planned',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ECO TARGETS TABLE
CREATE TABLE IF NOT EXISTS eco_targets (
    id TEXT PRIMARY KEY,
    metric TEXT NOT NULL,
    val NUMERIC NOT NULL,
    month TEXT NOT NULL,
    achieved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE green_innovations ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_targets ENABLE ROW LEVEL SECURITY;

-- Allow read/write for all users (Anon Key)
CREATE POLICY "Allow public read access on company_profiles" ON company_profiles FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on company_profiles" ON company_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on green_records" ON green_records FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on green_records" ON green_records FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on green_innovations" ON green_innovations FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on green_innovations" ON green_innovations FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on eco_targets" ON eco_targets FOR SELECT USING (true);
CREATE POLICY "Allow public insert/update on eco_targets" ON eco_targets FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO company_profiles (id, company_name, sector, points, level)
VALUES ('current', 'GlowOrganic Cafe', 'Culinary (F&B)', 45, 'Green Innovator')
ON CONFLICT (id) DO NOTHING;

INSERT INTO green_records (year, month, electricity, electricity_cost, water, water_cost, plastic, paper, organic_materials, waste_organic, waste_inorganic, waste_recycled, fuel_type, fuel_qty, emissions)
VALUES
('2025', 'December', 480, 720000, 24.5, 196000, 18.0, 50.0, 130.0, 95.0, 38.0, 22.0, 'Petrol', 45.0, 673.8),
('2026', 'January', 450, 675000, 22.0, 176000, 16.0, 48.0, 140.0, 92.0, 32.0, 28.0, 'Petrol', 40.0, 620.4),
('2026', 'February', 410, 615000, 19.5, 156000, 14.5, 42.0, 145.0, 88.0, 28.0, 34.0, 'Petrol', 38.0, 566.2),
('2026', 'March', 380, 570000, 17.0, 136000, 12.0, 46.0, 150.0, 82.0, 24.0, 38.0, 'Petrol', 35.0, 522.6),
('2026', 'April', 360, 540000, 16.2, 129600, 10.5, 44.0, 160.0, 80.0, 20.0, 42.0, 'Petrol', 32.0, 491.5)
ON CONFLICT (year, month) DO NOTHING;

INSERT INTO green_innovations (id, title, type, cost, savings, status, description)
VALUES
('inno-1', 'LED Swapping', 'Process', 850000, 105.0, 'Implemented', 'Replaced 18 high-energy fluorescent tubes with Philips LED lamps.'),
('inno-2', 'Cassava Packaging Bags', 'Product', 1200000, 65.0, 'Implemented', 'Transitioned takeout carriers to native Indonesian cassava bag packaging.'),
('inno-3', 'Organic Kitchen Composting', 'Material', 450000, 80.0, 'In Progress', 'Partnered with local organic waste managers for coffee grounds and peelings.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO eco_targets (id, metric, val, month, achieved)
VALUES
('target-1', 'Electricity', 350.0, 'May', false),
('target-2', 'Plastic', 8.0, 'May', false)
ON CONFLICT (id) DO NOTHING;
