-- ============================================================================
-- LAND & BEYOND REAL ESTATE & AGRO PLATFORM - ENTERPRISE POSTGRESQL DDL SCHEMA
-- Target Database: PostgreSQL 14+
-- Version: 1.0.0
-- Architecture: Relational with JSONB & GIS Support
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES DEFINITION
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM ('Buyer', 'Promoter', 'Admin');
CREATE TYPE property_category_enum AS ENUM ('Plots', 'Villas', 'Apartments', 'Farmland', 'Commercial');
CREATE TYPE property_status_enum AS ENUM ('Draft', 'Active', 'SoldOut', 'UnderReview', 'Archived');
CREATE TYPE approval_type_enum AS ENUM ('DTCP', 'RERA', 'CMDA', 'PPA', 'PattaVerified');
CREATE TYPE deed_audit_status_enum AS ENUM ('Pending', 'InReview', 'VerifiedClear', 'FlaggedEncumbrance');
CREATE TYPE booking_status_enum AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled');
CREATE TYPE farmland_status_enum AS ENUM ('Available', 'Reserved', 'SoldOut', 'UnderAudit');
CREATE TYPE design_type_enum AS ENUM ('Interior', 'Exterior', '3D Walkthrough', 'Landscape');
CREATE TYPE service_status_enum AS ENUM ('Initiated', 'ConsultationScheduled', 'InContract', 'Completed', 'Cancelled');
CREATE TYPE admin_role_enum AS ENUM ('SuperAdmin', 'Moderator', 'SalesAgent', 'LegalAuditor');
CREATE TYPE moderation_action_enum AS ENUM ('Approved', 'Rejected', 'Flagged', 'ChangesRequested');
CREATE TYPE lead_priority_enum AS ENUM ('Low', 'Medium', 'High', 'Urgent');
CREATE TYPE lead_status_enum AS ENUM ('New', 'Contacted', 'Assigned', 'SiteVisitScheduled', 'ClosedWon', 'ClosedLost');

-- ============================================================================
-- AUTOMATED TIMESTAMP TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. USERS DOMAIN
-- ============================================================================

-- Primary Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'Buyer',
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users IS 'Primary user registry for buyers, promoters, and administrative users';

-- User Activity Logs
CREATE TABLE user_activity (
    activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(255),
    filters_used JSONB DEFAULT '{}'::jsonb,
    viewed_locality VARCHAR(150),
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX idx_user_activity_timestamp ON user_activity(timestamp DESC);
CREATE INDEX idx_user_activity_locality ON user_activity(viewed_locality);

-- User Favorites
CREATE TABLE user_favorites (
    favorite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL, -- Logical FK constraint added after properties table
    saved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_favorite UNIQUE (user_id, property_id)
);

CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);

-- Property Comparisons
CREATE TABLE property_comparisons (
    comparison_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_ids UUID[] NOT NULL CHECK (cardinality(property_ids) <= 4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_property_comparisons_updated_at BEFORE UPDATE ON property_comparisons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User Auth Sessions
CREATE TABLE auth_sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auth_token VARCHAR(512) NOT NULL UNIQUE,
    device VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX idx_auth_sessions_token ON auth_sessions(auth_token);

-- ============================================================================
-- 2. PROPERTIES DOMAIN
-- ============================================================================

-- Primary Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    promoter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    promoter_name VARCHAR(150) NOT NULL,
    category property_category_enum NOT NULL,
    locality VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Coimbatore',
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    status property_status_enum NOT NULL DEFAULT 'Active',
    base_price NUMERIC(14, 2) NOT NULL CHECK (base_price >= 0),
    rate_per_sq_ft NUMERIC(10, 2) CHECK (rate_per_sq_ft >= 0),
    price_label VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_properties_category ON properties(category);
CREATE INDEX idx_properties_locality ON properties(locality);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(base_price);
CREATE INDEX idx_properties_coords ON properties(latitude, longitude);

-- Foreign Key linking user_favorites -> properties
ALTER TABLE user_favorites ADD CONSTRAINT fk_user_favorites_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- Property Technical Specifications
CREATE TABLE property_specs (
    property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    total_area_sqft NUMERIC(10, 2) NOT NULL CHECK (total_area_sqft > 0),
    bhk_config VARCHAR(50),
    total_floors INTEGER,
    floor_number INTEGER,
    facing_direction VARCHAR(30),
    parking_slots INTEGER DEFAULT 0,
    road_width_ft NUMERIC(6, 2),
    amenities JSONB DEFAULT '[]'::jsonb,
    is_gated_community BOOLEAN DEFAULT FALSE
);

-- Legal Approvals
CREATE TABLE legal_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    approval_type approval_type_enum NOT NULL,
    registration_no VARCHAR(100) NOT NULL,
    is_legal_verified BOOLEAN NOT NULL DEFAULT FALSE,
    deed_audit_status deed_audit_status_enum NOT NULL DEFAULT 'Pending',
    verified_at TIMESTAMPTZ,
    auditor_comments TEXT,
    CONSTRAINT uq_property_approval UNIQUE (property_id, registration_no)
);

CREATE INDEX idx_legal_approvals_property ON legal_approvals(property_id);

-- Pricing History & Bank Approvals
CREATE TABLE pricing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    old_price NUMERIC(14, 2) NOT NULL,
    new_price NUMERIC(14, 2) NOT NULL,
    price_per_sq_ft NUMERIC(10, 2),
    approved_bank_loans JSONB DEFAULT '["SBI", "HDFC", "ICICI"]'::jsonb,
    changed_by_user_id UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_history_property ON pricing_history(property_id);

-- Site Visit Bookings
CREATE TABLE site_visit_bookings (
    booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    booking_status booking_status_enum NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_site_visit_bookings_updated_at BEFORE UPDATE ON site_visit_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_site_visit_user ON site_visit_bookings(user_id);
CREATE INDEX idx_site_visit_property ON site_visit_bookings(property_id);
CREATE INDEX idx_site_visit_date ON site_visit_bookings(preferred_date);

-- Media Assets
CREATE TABLE media_assets (
    property_id UUID PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    hero_image_url TEXT NOT NULL,
    master_layout_url TEXT,
    gallery_urls JSONB DEFAULT '[]'::jsonb,
    video_walkthrough_url TEXT,
    virtual_tour_3d_url TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_media_assets_updated_at BEFORE UPDATE ON media_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Reviews & Ratings
CREATE TABLE reviews_ratings (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_property_review UNIQUE (user_id, property_id)
);

CREATE INDEX idx_reviews_property ON reviews_ratings(property_id);

-- ============================================================================
-- 3. FARMLAND CORRIDORS DOMAIN
-- ============================================================================

-- Primary Farmland Corridors Table
CREATE TABLE farmland_corridors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    corridor_name VARCHAR(200) NOT NULL,
    region VARCHAR(150) NOT NULL,
    starting_price NUMERIC(14, 2) NOT NULL CHECK (starting_price >= 0),
    five_year_growth_rate NUMERIC(5, 2) NOT NULL DEFAULT 92.00, -- e.g. 92% Projected Growth
    status farmland_status_enum NOT NULL DEFAULT 'Available',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_farmland_corridors_updated_at BEFORE UPDATE ON farmland_corridors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_farmland_region ON farmland_corridors(region);
CREATE INDEX idx_farmland_status ON farmland_corridors(status);

-- Soil & Water Reports
CREATE TABLE soil_water_reports (
    farmland_id UUID PRIMARY KEY REFERENCES farmland_corridors(id) ON DELETE CASCADE,
    soil_type VARCHAR(100) NOT NULL, -- e.g. Red Sandy Loam / Black Cotton Mix
    groundwater_depth_ft INTEGER NOT NULL CHECK (groundwater_depth_ft > 0),
    soil_ph NUMERIC(3, 2) CHECK (soil_ph >= 0 AND soil_ph <= 14),
    organic_matter_percentage NUMERIC(4, 2),
    telemetry_report_url TEXT,
    certified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructure Specifications
CREATE TABLE infrastructure_specs (
    farmland_id UUID PRIMARY KEY REFERENCES farmland_corridors(id) ON DELETE CASCADE,
    fencing_type VARCHAR(150) NOT NULL, -- e.g. RCC Concrete Post + 7-Strand Barbed Wire
    road_approach_width_meters NUMERIC(5, 2) NOT NULL,
    electricity_grid VARCHAR(100) NOT NULL DEFAULT '3-Phase EB',
    water_source VARCHAR(150) DEFAULT 'Borewell & Canal Feeder',
    has_drip_irrigation BOOLEAN DEFAULT FALSE
);

-- Agro Inspections
CREATE TABLE agro_inspections (
    inspection_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmland_id UUID NOT NULL REFERENCES farmland_corridors(id) ON DELETE CASCADE,
    lead_name VARCHAR(150) NOT NULL,
    lead_phone VARCHAR(20) NOT NULL,
    lead_email VARCHAR(255),
    scheduled_date DATE NOT NULL,
    inspection_status booking_status_enum NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_agro_inspections_farmland ON agro_inspections(farmland_id);
CREATE INDEX idx_agro_inspections_date ON agro_inspections(scheduled_date);

-- ============================================================================
-- 4. SERVICES DOMAIN
-- ============================================================================

-- 3D & Interior Design Consultations
CREATE TABLE design_3d_consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    floorplan_file_url TEXT,
    design_type design_type_enum NOT NULL DEFAULT 'Interior',
    budget NUMERIC(12, 2),
    status service_status_enum NOT NULL DEFAULT 'Initiated',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_design_3d_consultations_updated_at BEFORE UPDATE ON design_3d_consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Griha Pravesh & Vedic Pooja Bookings
CREATE TABLE griha_pravesh_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    preferred_date DATE NOT NULL,
    muhurtham_nakshatra VARCHAR(100),
    package_tier VARCHAR(50) NOT NULL DEFAULT 'Gold', -- Silver, Gold, Platinum
    samagri_included BOOLEAN NOT NULL DEFAULT TRUE,
    status service_status_enum NOT NULL DEFAULT 'Initiated',
    special_requests TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_griha_pravesh_bookings_updated_at BEFORE UPDATE ON griha_pravesh_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Home Loan Leads
CREATE TABLE home_loan_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    loan_principal_amount NUMERIC(14, 2) NOT NULL CHECK (loan_principal_amount > 0),
    tenure_years INTEGER NOT NULL CHECK (tenure_years > 0 AND tenure_years <= 30),
    preferred_bank VARCHAR(100) NOT NULL DEFAULT 'SBI', -- SBI, HDFC, ICICI, Axis
    monthly_income NUMERIC(12, 2),
    status service_status_enum NOT NULL DEFAULT 'Initiated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_home_loan_leads_updated_at BEFORE UPDATE ON home_loan_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. INQUIRIES & LEADS DOMAIN
-- ============================================================================

-- Site Tours Leads
CREATE TABLE site_tours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    preferred_date DATE NOT NULL,
    lead_source VARCHAR(100) DEFAULT 'Website Showcase',
    status lead_status_enum NOT NULL DEFAULT 'New',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_site_tours_property ON site_tours(property_id);
CREATE INDEX idx_site_tours_status ON site_tours(status);

-- Cab Pickups for Site Tours
CREATE TABLE cab_pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tour_id UUID NOT NULL REFERENCES site_tours(id) ON DELETE CASCADE,
    is_cab_required BOOLEAN NOT NULL DEFAULT TRUE,
    pickup_address TEXT NOT NULL,
    passenger_count INTEGER NOT NULL DEFAULT 1 CHECK (passenger_count > 0),
    status booking_status_enum NOT NULL DEFAULT 'Pending',
    driver_contact VARCHAR(50),
    scheduled_pickup_time TIMESTAMPTZ
);

CREATE INDEX idx_cab_pickups_tour ON cab_pickups(tour_id);

-- Brochure Downloads Tracking
CREATE TABLE brochure_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    lead_name VARCHAR(150) NOT NULL,
    lead_phone VARCHAR(20) NOT NULL,
    lead_email VARCHAR(255),
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_brochure_downloads_property ON brochure_downloads(property_id);

-- ============================================================================
-- 6. ADMINS & MODERATION DOMAIN
-- ============================================================================

-- Primary Admins Table
CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role admin_role_enum NOT NULL DEFAULT 'SalesAgent',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Listing Moderation
CREATE TABLE listing_moderation (
    moderation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    action_taken moderation_action_enum NOT NULL,
    comments TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_moderation_property ON listing_moderation(property_id);
CREATE INDEX idx_listing_moderation_admin ON listing_moderation(admin_id);

-- Lead Assignments
CREATE TABLE lead_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES site_tours(id) ON DELETE CASCADE,
    assigned_agent_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
    priority lead_priority_enum NOT NULL DEFAULT 'Medium',
    status lead_status_enum NOT NULL DEFAULT 'Assigned',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_lead_assignments_updated_at BEFORE UPDATE ON lead_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE INDEX idx_lead_assignments_agent ON lead_assignments(assigned_agent_id);

-- System Audit Logs
CREATE TABLE system_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admins(id) ON DELETE SET NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g. PROPERTY_UPDATE, LEAD_REASSIGN, USER_SUSPEND
    target_entity VARCHAR(100) NOT NULL, -- e.g. properties, users, farmland_corridors
    target_id UUID,
    changes_payload JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_audit_admin ON system_audit_logs(admin_id);
CREATE INDEX idx_system_audit_target ON system_audit_logs(target_entity, target_id);
CREATE INDEX idx_system_audit_timestamp ON system_audit_logs(timestamp DESC);

-- ============================================================================
-- END OF DDL SCRIPT
-- ============================================================================
