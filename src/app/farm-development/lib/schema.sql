-- FarmLink Large-Scale Farming Feature Schema

-- Provider profiles (farming service companies)
CREATE TABLE IF NOT EXISTS farming_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tagline VARCHAR(500),
  logo_url TEXT,
  cover_image_url TEXT,
  website VARCHAR(500),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  location VARCHAR(255),
  country VARCHAR(100) DEFAULT 'Nigeria',
  state VARCHAR(100),
  founded_year INTEGER,
  team_size VARCHAR(50),
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  response_time VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Provider certifications
CREATE TABLE IF NOT EXISTS farming_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES farming_providers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  issuing_body VARCHAR(255) NOT NULL,
  issued_year INTEGER,
  expiry_year INTEGER,
  certificate_number VARCHAR(100),
  document_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service categories
CREATE TABLE IF NOT EXISTS farming_service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Provider services listings
CREATE TABLE IF NOT EXISTS farming_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES farming_providers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES farming_service_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  scope TEXT,
  min_acreage INTEGER,
  max_acreage INTEGER,
  price_min NUMERIC(12,2),
  price_max NUMERIC(12,2),
  price_unit VARCHAR(50) DEFAULT 'per hectare',
  currency VARCHAR(10) DEFAULT 'NGN',
  turnaround_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Portfolio / past projects
CREATE TABLE IF NOT EXISTS farming_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES farming_providers(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  acreage NUMERIC(10,2),
  crop_type VARCHAR(100),
  project_year INTEGER,
  completion_months INTEGER,
  client_name VARCHAR(255),
  outcome TEXT,
  images TEXT[], -- array of image URLs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quote requests from clients
CREATE TABLE IF NOT EXISTS farming_quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES farming_providers(id),
  service_id UUID REFERENCES farming_services(id),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  client_organization VARCHAR(255),
  project_description TEXT NOT NULL,
  land_size NUMERIC(10,2),
  land_size_unit VARCHAR(20) DEFAULT 'hectares',
  location VARCHAR(255),
  budget_range VARCHAR(100),
  timeline VARCHAR(100),
  additional_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, responded, closed
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tags for services
CREATE TABLE IF NOT EXISTS farming_service_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES farming_services(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL
);

-- Seed: Service categories
INSERT INTO farming_service_categories (name, slug, description, icon) VALUES
  ('Farm Design & Planning', 'farm-design', 'Comprehensive farm layout, crop rotation planning, irrigation design', 'layout'),
  ('Land Clearing & Preparation', 'land-clearing', 'Large-scale land clearing, tillage, and soil preparation services', 'trees'),
  ('Irrigation Systems', 'irrigation', 'Installation and management of drip, sprinkler, and flood irrigation', 'droplets'),
  ('Crop Production', 'crop-production', 'End-to-end crop cultivation, planting, and harvesting services', 'wheat'),
  ('Farm Construction', 'farm-construction', 'Farm structures, silos, greenhouses, access roads, and fencing', 'building'),
  ('Agro-consultancy', 'consultancy', 'Expert consultation on large-scale farming operations and agribusiness', 'briefcase'),
  ('Mechanized Farming', 'mechanized', 'Heavy machinery operations for planting, cultivation, and harvesting', 'tractor'),
  ('Soil Analysis & Management', 'soil-management', 'Soil testing, amendment, and fertility management at scale', 'beaker')
ON CONFLICT (slug) DO NOTHING;

-- Seed: Providers
INSERT INTO farming_providers (id, name, slug, description, tagline, email, phone, location, state, country, founded_year, team_size, is_verified, is_featured, rating, review_count, response_time) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'AgroVision Nigeria Ltd', 'agrovision-nigeria', 'AgroVision is a premier large-scale farming and agribusiness company with over 15 years delivering world-class farm design, construction, and management services across Nigeria and West Africa. We specialize in mechanized crop production, precision irrigation, and sustainable land management.', 'Transforming Acres Into Abundance', 'info@agrovision.ng', '+234 803 456 7890', 'Port Harcourt, Rivers State', 'Rivers', 'Nigeria', 2008, '150-200', true, true, 4.8, 47, 'Within 24 hours'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'GreenField Agricultural Services', 'greenfield-ag', 'GreenField provides end-to-end large-scale farming solutions from site assessment to harvest. Our expert teams handle everything from soil analysis and farm design to mechanized planting and post-harvest processing. We have successfully delivered over 200 farm projects across Nigeria.', 'Your Complete Farming Partner', 'projects@greenfield-ag.com', '+234 706 123 4567', 'Abuja, FCT', 'FCT', 'Nigeria', 2012, '80-120', true, true, 4.6, 38, 'Within 48 hours'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'SavannaFarm Constructions', 'savannafarm', 'SavannaFarm specializes in farm infrastructure design and construction — from access roads, irrigation channels, and grain silos to complete greenhouse complexes. We bring engineering precision to agricultural construction throughout the savanna belt of Nigeria.', 'Building the Foundation of Food Security', 'contact@savannafarm.com.ng', '+234 815 987 6543', 'Kaduna, Kaduna State', 'Kaduna', 'Nigeria', 2015, '60-80', true, false, 4.5, 29, 'Within 72 hours'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Delta Agro Solutions', 'delta-agro', 'Delta Agro Solutions serves the Niger Delta and South-South regions with specialized large-scale farming services adapted to tropical and riverine conditions. We offer farm design, land preparation, and crop production services tailored for the unique challenges of this region.', 'Cultivating Excellence in the Delta', 'info@deltaagro.ng', '+234 701 234 5678', 'Warri, Delta State', 'Delta', 'Nigeria', 2016, '40-60', false, false, 4.3, 18, 'Within 48 hours'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Apex Farm Engineering', 'apex-farm-eng', 'Apex Farm Engineering combines civil engineering expertise with deep agricultural knowledge to deliver cutting-edge farm construction and irrigation projects. From smart drip irrigation to precision-controlled greenhouses, we bring innovation to Nigerian agriculture.', 'Engineering Smarter Farms', 'hello@apexfarmeng.com', '+234 902 876 5432', 'Lagos, Lagos State', 'Lagos', 'Nigeria', 2019, '30-50', true, false, 4.7, 22, 'Within 24 hours')
ON CONFLICT (slug) DO NOTHING;

-- Seed: Certifications
INSERT INTO farming_certifications (provider_id, name, issuing_body, issued_year, expiry_year, certificate_number) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'ISO 9001:2015 Quality Management', 'Bureau Veritas', 2020, 2026, 'BV-NG-2020-9001-4521'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'GAP Certification (Good Agricultural Practice)', 'Federal Ministry of Agriculture', 2021, 2024, 'FMARD-GAP-0234'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'COREN Registered Engineering Firm', 'Council for the Regulation of Engineering in Nigeria', 2019, 2025, 'COREN-2019-F-7823'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'ISO 14001:2015 Environmental Management', 'SGS Nigeria', 2021, 2027, 'SGS-14001-NG-0112'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'NAFDAC Approved Agro Inputs Distributor', 'NAFDAC', 2022, 2025, 'NAFDAC-AID-2022-0089'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'COREN Registered Engineering Firm', 'Council for the Regulation of Engineering in Nigeria', 2020, 2026, 'COREN-2020-F-8901'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'NIA Member Practice', 'Nigerian Institute of Architects', 2021, 2025, 'NIA-2021-M-0445'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'ISO 9001:2015 Quality Management', 'Intertek Nigeria', 2022, 2028, 'ITK-9001-2022-0567'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'COREN Registered Engineering Firm', 'Council for the Regulation of Engineering in Nigeria', 2021, 2027, 'COREN-2021-F-9102');

-- Seed: Services (using category IDs from selects, done with subqueries)
INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0001-0001-0001-000000000001',
  id,
  'Comprehensive Farm Design & Layout',
  'Complete farm master planning covering land use zoning, crop rotation design, drainage planning, road network layout, irrigation infrastructure mapping, and facility placement. Delivered with detailed CAD drawings and GIS mapping.',
  'Includes topographic survey, soil sampling, water availability assessment, crop suitability analysis, and phased implementation roadmap.',
  50, 5000, 2500000, 15000000, 'per project', 'NGN', 45
FROM farming_service_categories WHERE slug = 'farm-design'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0001-0001-0001-000000000001',
  id,
  'Large-Scale Land Clearing & Preparation',
  'Professional land clearing services using heavy machinery for forests, bush land, and degraded farmland. Services include tree felling, stump removal, root raking, subsoiling, and primary/secondary tillage for commercial crop production.',
  'Covers clearing, stumping, land leveling, windrow burning, deep plowing, harrowing, and seedbed preparation.',
  100, 10000, 180000, 350000, 'per hectare', 'NGN', 30
FROM farming_service_categories WHERE slug = 'land-clearing'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0001-0001-0001-000000000001',
  id,
  'Drip & Sprinkler Irrigation Installation',
  'Design and installation of precision irrigation systems for large-scale farms. We supply, install, and commission drip tape, micro-sprinklers, pivot irrigation, and fertigation systems with full automation capability.',
  'Includes hydraulic design, pump station installation, main/sub-main pipelines, field manifolds, emitters, and control systems.',
  20, 2000, 350000, 800000, 'per hectare', 'NGN', 60
FROM farming_service_categories WHERE slug = 'irrigation'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0002-0002-0002-000000000002',
  id,
  'Farm Design & Agro-Business Planning',
  'End-to-end farm design combined with viable agribusiness planning. We create technically sound, commercially viable farm layouts optimized for specific crop types, markets, and investor requirements.',
  'Farm masterplan, enterprise mix selection, capital cost estimates, financial projections, and phased expansion roadmap.',
  30, 3000, 3000000, 12000000, 'per project', 'NGN', 40
FROM farming_service_categories WHERE slug = 'farm-design'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0002-0002-0002-000000000002',
  id,
  'Commercial Crop Production Management',
  'Full-service commercial crop production from land preparation through harvest for maize, rice, sorghum, soybean, cassava, and other staple crops. We provide inputs, machinery, skilled labour, and agronomic supervision.',
  'Covers seedbed prep, certified seed supply, fertilizer application, pest/disease management, mechanical harvesting, and primary processing.',
  100, 5000, 220000, 420000, 'per hectare per season', 'NGN', 90
FROM farming_service_categories WHERE slug = 'crop-production'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0003-0003-0003-000000000003',
  id,
  'Silo & Grain Storage Construction',
  'Engineering design and construction of modern grain silos, flat storage warehouses, and processing facilities for large-scale farms. We work with steel, concrete, and hybrid structures from 500 to 50,000 metric tonne capacity.',
  'Structural engineering design, foundation works, steel erection, aeration system, monitoring sensors, and commissioning.',
  NULL, NULL, 45000000, 500000000, 'per project', 'NGN', 120
FROM farming_service_categories WHERE slug = 'farm-construction'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0003-0003-0003-000000000003',
  id,
  'Farm Road & Infrastructure Development',
  'Construction of all-season farm access roads, drainage channels, culverts, bridges, and internal farm road networks. Designed to withstand heavy machinery loads and rainy season conditions.',
  'Route survey, road design, earthworks, laterite compaction, culvert installation, and surface treatment.',
  NULL, NULL, 8000000, 80000000, 'per project', 'NGN', 60
FROM farming_service_categories WHERE slug = 'farm-construction'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0005-0005-0005-000000000005',
  id,
  'Smart Greenhouse Design & Construction',
  'Design and build of climate-controlled, technology-equipped greenhouse complexes for year-round crop production. Specializing in high-value crops such as tomatoes, peppers, cucumbers, and flowers for commercial markets.',
  'Structural design, covering materials, climate control systems, hydroponic/substrate systems, irrigation, fertigation, and crop management training.',
  1, 50, 18000000, 250000000, 'per project', 'NGN', 90
FROM farming_service_categories WHERE slug = 'farm-construction'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0005-0005-0005-000000000005',
  id,
  'Precision Irrigation Engineering',
  'Advanced irrigation system design and installation integrating soil moisture sensors, weather stations, automated controllers, and remote monitoring. We optimize water use efficiency while maximizing crop yields on large-scale farms.',
  'Hydraulic modeling, system design, civil works, pipe supply and installation, pumping stations, automation and SCADA integration.',
  10, 1000, 500000, 1200000, 'per hectare', 'NGN', 75
FROM farming_service_categories WHERE slug = 'irrigation'
ON CONFLICT DO NOTHING;

INSERT INTO farming_services (provider_id, category_id, title, description, scope, min_acreage, max_acreage, price_min, price_max, price_unit, currency, turnaround_days)
SELECT 
  'a1b2c3d4-0004-0004-0004-000000000004',
  id,
  'Tropical Farm Design for Niger Delta',
  'Specialized farm design services for the unique ecology of the Niger Delta — accounting for high rainfall, waterlogging risk, acid sulfate soils, and flood-prone areas. Crop selection and layout optimized for tropical conditions.',
  'Ecological assessment, drainage design, raised bed systems, acid soil correction, crop suitability mapping.',
  10, 500, 1500000, 8000000, 'per project', 'NGN', 35
FROM farming_service_categories WHERE slug = 'farm-design'
ON CONFLICT DO NOTHING;

-- Seed: Portfolio projects
INSERT INTO farming_portfolio (provider_id, title, description, location, acreage, crop_type, project_year, completion_months, client_name, outcome) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', '5,000-Hectare Rice Farm, Kebbi State', 'Complete design and development of a large-scale irrigated rice farm including land clearing, canal irrigation system, farm roads, and 3 harvesting seasons of management. The project was developed for a Federal Government food security initiative.', 'Kebbi State, Northwest Nigeria', 5000, 'Rice', 2021, 18, 'Federal Ministry of Agriculture', 'Successfully produced 4.2 tonnes/hectare average yield across 5,000 ha. Farm now generates ₦8.4B in annual gross revenue. 1,200 permanent and seasonal jobs created.'),
  ('a1b2c3d4-0001-0001-0001-000000000001', '800-Hectare Maize & Soybean Estate, Benue', 'Farm design and mechanized production management for a private investor estate producing maize and soybean in rotation. Included full irrigation infrastructure, storage facility, and market linkage support.', 'Benue State, North Central Nigeria', 800, 'Maize / Soybean', 2022, 12, 'BenueFoods Investment Ltd', 'Achieved 6.8 tonnes/ha maize yield and 2.4 tonnes/ha soybean yield. Project exceeded investor ROI targets by 22% in year one.'),
  ('a1b2c3d4-0002-0002-0002-000000000002', '2,000-Hectare Cassava Processing Farm, Ogun', 'End-to-end cassava farm development and management including land clearing, planting of improved varieties, and harvest logistics connected to a cassava processing factory. Delivered on a 24-month contract.', 'Ogun State, Southwest Nigeria', 2000, 'Cassava', 2020, 24, 'Nigerian Starch Mills Plc', 'Delivered 18,000 MT of fresh cassava root in year 1. Reduced factory raw material sourcing costs by 35%.'),
  ('a1b2c3d4-0002-0002-0002-000000000002', '300-Hectare Irrigation Scheme, Kano', 'Design and construction of a 300-hectare drip irrigation scheme for a vegetable and tomato production farm supplying Kano markets and processing companies.', 'Kano State, Northwest Nigeria', 300, 'Tomatoes / Vegetables', 2023, 8, 'Kano Fresh Produce Cooperative', 'Irrigation system commissioned on schedule. Farm now produces year-round supplying 3 major processing companies. Water use efficiency improved by 60% vs. traditional flood irrigation.'),
  ('a1b2c3d4-0003-0003-0003-000000000003', '50,000 MT Grain Silo Complex, Abuja', 'Engineering design and construction of a 50,000 metric tonne grain storage complex including steel silos, receiving pit, conveying systems, dryer, and administration building for the Strategic Grain Reserve programme.', 'Abuja, FCT', NULL, 'Multi-Commodity Storage', 2022, 14, 'Federal Government of Nigeria', 'Delivered on schedule and within budget. Complex now stores strategic grain reserves with full moisture monitoring and pest control systems operational.'),
  ('a1b2c3d4-0005-0005-0005-000000000005', '5-Hectare Smart Tomato Greenhouse, Lagos', 'Design and construction of a climate-controlled greenhouse complex for premium tomato production supplying Lagos supermarkets and hotels. Features automated irrigation, climate control, and crop monitoring system.', 'Epe, Lagos State', 5, 'Tomatoes', 2023, 7, 'FreshChoice Farms Ltd', 'First harvest yielded 280 tonnes/ha — 8x open field yields. Product commands 40% price premium in target markets. Payback period projected at 4.2 years.');
