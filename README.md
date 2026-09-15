# 🪙 FinHub — Fullstack Financial Literacy & Management Platform

**FinHub** is an all-in-one web-based financial solution designed to help individuals and students manage, understand, and optimize their finances effectively. Built with modern glassmorphism aesthetics, Express backend, Supabase PostgreSQL database, and bilingual support (English & Hindi).

---

## ✨ Features Included

1. 📊 **Personal Expense & Budget Manager**:
   - Track Income vs Expenses with live net savings balance.
   - Category breakdown (Food, Rent, Transit, Education, Fun, Health).
   - Monthly budget cap progress indicators & history table.

2. 🎓 **Student Finance & Scholarship Finder**:
   - Semester tuition & living allowance budget planner.
   - Searchable & filterable active scholarship directory (Merit, Need-based, STEM) with direct apply links.

3. 🎯 **Savings Goal Planner**:
   - Set custom target goals (e.g. Emergency Fund, Laptop, Higher Education).
   - Target completion date, deposit tracker, and visual progress percentage rings.

4. 🧮 **EMI & Loan Calculator with Side-by-Side Comparison**:
   - Exact monthly EMI formula calculation: `P × r × (1+r)^n / ((1+r)^n - 1)`.
   - Side-by-side comparison of 2 loan offers (Interest Rate, Term, Total Interest, Total Payment).

5. 🔁 **Subscription Tracker**:
   - Track monthly and yearly subscriptions (Netflix, Spotify, Cloud, Software).
   - Monthly burn calculator & upcoming renewal alert badges.

6. 📚 **Financial Literacy Platform & Quiz**:
   - Bite-sized learning guides on 50/30/20 Rule, Mutual Funds, Credit Score, and Taxes.
   - Interactive Financial Knowledge Quiz with real-time scoring.

7. 🌐 **Bilingual UI Support (Hindi / English)**:
   - One-click language switcher (`English` ↔ `हिंदी`) for maximum accessibility.

---

## 🗄️ Supabase Database Setup

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor**.
3. Copy and execute the SQL contents from [`supabase/schema.sql`](supabase/schema.sql) to create `registrations`, `expenses`, `savings_goals`, `subscriptions`, and `scholarships` tables.

---

## 🐙 Pushing Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Feat: FinHub financial platform with Supabase, Vercel config, and bilingual support"

# Link to your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/finhub-financial-platform.git
git branch -M main
git push -u origin main
```

---

## 🚀 Deploying to Vercel

This project includes a ready-to-use [`vercel.json`](vercel.json) configuration.

### Option 1: Via Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Via Vercel Web Dashboard
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your GitHub repository (`finhub-financial-platform`).
3. Set Environment Variables:
   - `SUPABASE_URL`: `https://yzkkjnukyjwirjamygsm.supabase.co`
   - `SUPABASE_ANON_KEY`: `your_supabase_anon_key`
4. Click **Deploy**. Vercel will automatically host the Express serverless backend and static glassmorphism frontend!

---

## 💻 Running Locally

```bash
# Install backend dependencies
cd backend
npm install

# Start local server (Default Port 5001)
npm start
```
Open `http://localhost:5001/` in your browser.
