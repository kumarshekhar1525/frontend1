# User Registration System (Supabase + Node.js Express + Glassmorphism Frontend)

A fullstack user registration web application built with a modern frontend, Node.js Express backend, and Supabase database integration.

---

## 📌 Project Overview

- **Supabase Project ID**: `yzkkjnukyjwirjamygsm`
- **Supabase URL**: `https://yzkkjnukyjwirjamygsm.supabase.co`
- **Architecture**:
  - **Frontend (`frontend/`)**: Modern responsive web form featuring glassmorphism UI, Father's Name field, password strength indicator, real-time validation, and registered users modal view.
  - **Backend (`backend/`)**: Express REST API server connected to Supabase using `@supabase/supabase-js`. Handles data validation, duplicate email detection, and record insertion into the database.
  - **Supabase Database (`supabase/schema.sql`)**: PostgreSQL schema definition and Row Level Security (RLS) policies.

---

## 🚀 Quick Setup Guide

### Step 1: Run SQL Schema in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/yzkkjnukyjwirjamygsm).
2. Click **SQL Editor** in the left sidebar.
3. Open [`supabase/schema.sql`](supabase/schema.sql) in your code editor or copy its contents:

```sql
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

-- 3. Policy: Allow public insertion
CREATE POLICY "Allow public insert on registrations" 
ON public.registrations FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 4. Policy: Allow public reading
CREATE POLICY "Allow public read on registrations" 
ON public.registrations FOR SELECT TO anon, authenticated USING (true);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(email);
```

4. Paste into the SQL Editor and click **RUN**.

---

### Step 2: Start the Backend Server

```bash
cd backend
npm install
npm start
```

The backend server will launch at `http://localhost:5000`. You can check server health at `http://localhost:5000/api/health`.

To test table readiness at any time, run:
```bash
npm run init-db
```

---

### Step 3: Launch the Frontend

Open [`frontend/index.html`](frontend/index.html) in your browser (or use VS Code Live Server / standard HTTP server).

---

## 🐙 Pushing to GitHub

This repository has been initialized with Git. Follow these commands to push your project to GitHub:

1. Create a new repository on [GitHub](https://github.com/new) (e.g., `user-registration-supabase`).
2. Run the following terminal commands inside this project directory (`frontend1`):

```bash
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git branch -M main
git push -u origin main
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Check API & Supabase connectivity |
| `POST` | `/api/register` | Register new user into `registrations` table |
| `GET` | `/api/registrations` | Fetch all registered records |
