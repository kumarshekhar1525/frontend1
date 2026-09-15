-- =======================================================
-- Supabase Schema for FinHub SaaS Platform (v4.0)
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

-- 2. User Applications Table
CREATE TABLE IF NOT EXISTS public.user_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    scholarship_id TEXT NOT NULL,
    scholarship_title TEXT NOT NULL,
    amount TEXT,
    status TEXT DEFAULT 'Submitted',
    applied_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Loan Applications Table (Aadhaar/PAN Documents & Nominee)
CREATE TABLE IF NOT EXISTS public.loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_name TEXT NOT NULL,
    father_name TEXT NOT NULL,
    nominee_name TEXT NOT NULL,
    nominee_relation TEXT NOT NULL,
    aadhaar_number TEXT NOT NULL,
    pan_number TEXT NOT NULL,
    loan_amount NUMERIC(10, 2) NOT NULL,
    loan_purpose TEXT NOT NULL,
    status TEXT DEFAULT 'Under Review',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Debts & Udhar Tracker Table
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT DEFAULT 'guest',
    person_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    type TEXT CHECK (type IN ('given', 'taken', 'received')) NOT NULL,
    status TEXT DEFAULT 'Pending',
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Expenses Table
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

-- 6. Savings Goals Table
CREATE TABLE IF NOT EXISTS public.savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT DEFAULT 'Guest User',
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(10, 2) NOT NULL,
    current_amount NUMERIC(10, 2) DEFAULT 0.00,
    target_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public all on registrations" ON public.registrations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on user_applications" ON public.user_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on loan_applications" ON public.loan_applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on debts" ON public.debts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on expenses" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on savings_goals" ON public.savings_goals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
