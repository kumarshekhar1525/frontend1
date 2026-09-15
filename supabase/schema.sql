-- =======================================================
-- Supabase Schema for FinHub SaaS Platform
-- Project ID: yzkkjnukyjwirjamygsm
-- =======================================================

-- 1. Registrations Table (Admin Database)
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User Applications Table (User Portal)
CREATE TABLE IF NOT EXISTS public.user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    scholarship_id TEXT NOT NULL,
    scholarship_title TEXT NOT NULL,
    amount TEXT,
    status TEXT DEFAULT 'Submitted',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT DEFAULT 'Guest User',
    title TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) DEFAULT 'expense',
    category TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT DEFAULT 'Guest User',
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(10, 2) NOT NULL,
    current_amount NUMERIC(10, 2) DEFAULT 0.00,
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT DEFAULT 'Guest User',
    service_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')) DEFAULT 'monthly',
    next_billing_date DATE,
    category TEXT DEFAULT 'Entertainment',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Scholarships Table
CREATE TABLE IF NOT EXISTS public.scholarships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    provider TEXT NOT NULL,
    amount TEXT NOT NULL,
    category TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    deadline DATE,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access
CREATE POLICY "Allow public all on registrations" ON public.registrations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on user_applications" ON public.user_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on expenses" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on savings_goals" ON public.savings_goals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on subscriptions" ON public.subscriptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on scholarships" ON public.scholarships FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
