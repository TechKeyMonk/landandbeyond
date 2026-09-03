-- ============================================================================
-- LAND & BEYOND REAL ESTATE & AGRO PLATFORM - MASTER SUPABASE SCHEMA
-- Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ============================================================================

-- 1. MANAGE LISTINGS / PROPERTIES TABLE
CREATE TABLE IF NOT EXISTS public.properties (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Residential',
    location TEXT,
    builder TEXT,
    price TEXT,
    price_label TEXT,
    approval_type TEXT,
    approval TEXT,
    legal_no TEXT,
    status TEXT DEFAULT 'Active',
    area TEXT,
    metrics TEXT,
    bhk TEXT,
    facing TEXT,
    image_url TEXT,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. UPCOMING PROJECTS & NEW LAUNCHES TABLE
CREATE TABLE IF NOT EXISTS public.new_projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    name TEXT,
    builder TEXT,
    developer TEXT,
    location TEXT,
    category TEXT DEFAULT 'New Launch',
    price TEXT,
    starting_price TEXT,
    launch_date TEXT,
    description TEXT,
    highlights TEXT,
    status TEXT DEFAULT 'Active',
    image_url TEXT,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STRATEGIC FARMLAND CORRIDORS TABLE
CREATE TABLE IF NOT EXISTS public.farmland (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    name TEXT,
    location TEXT,
    category TEXT DEFAULT 'Farmland',
    acres TEXT,
    soil_type TEXT,
    water_source TEXT,
    price TEXT,
    price_label TEXT,
    roi TEXT,
    status TEXT DEFAULT 'Active',
    image_url TEXT,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INQUIRIES & VIP SITE VISIT LEADS TABLE
CREATE TABLE IF NOT EXISTS public.site_tours (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    project_name TEXT,
    visit_date TEXT,
    time_slot TEXT,
    pickup_location TEXT,
    status TEXT DEFAULT 'New',
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 3D STUDIO & INTERIOR DESIGN LEADS TABLE
CREATE TABLE IF NOT EXISTS public.interiors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    property_type TEXT,
    budget TEXT,
    timeline TEXT,
    requirements TEXT,
    status TEXT DEFAULT 'New',
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GRIHA PRAVESH & POOJA LEADS TABLE
CREATE TABLE IF NOT EXISTS public.poojas (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    pooja_type TEXT,
    preferred_date TEXT,
    location TEXT,
    status TEXT DEFAULT 'New',
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & SET PERMISSIVE ACCESS POLICIES
-- ============================================================================
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.new_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmland ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interiors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poojas ENABLE ROW LEVEL SECURITY;

-- Allow Public / Service Access for Read and Write
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public Full Access Properties" ON public.properties;
    CREATE POLICY "Public Full Access Properties" ON public.properties FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access New Projects" ON public.new_projects;
    CREATE POLICY "Public Full Access New Projects" ON public.new_projects FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access Farmland" ON public.farmland;
    CREATE POLICY "Public Full Access Farmland" ON public.farmland FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access Site Tours" ON public.site_tours;
    CREATE POLICY "Public Full Access Site Tours" ON public.site_tours FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access Interiors" ON public.interiors;
    CREATE POLICY "Public Full Access Interiors" ON public.interiors FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public Full Access Poojas" ON public.poojas;
    CREATE POLICY "Public Full Access Poojas" ON public.poojas FOR ALL USING (true) WITH CHECK (true);
END $$;
