-- =======================================================
-- Supabase Schema for Registration System
-- Project ID: yzkkjnukyjwirjamygsm
-- Table: registrations
-- =======================================================

-- 1. Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anonymous users to insert new registrations
CREATE POLICY "Allow public insert on registrations" 
ON public.registrations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow anonymous users to select registrations
CREATE POLICY "Allow public read on registrations" 
ON public.registrations 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 5. Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
