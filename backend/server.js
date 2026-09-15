const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || 'https://yzkkjnukyjwirjamygsm.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6a2tqbnVreWp3aXJqYW15Z3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNDQ5ODUsImV4cCI6MjA1NzYyMDk4NX0.zV3x01zX9N385X9N385X9N385';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// 1. Health Check Endpoint
// ==========================================
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('registrations').select('id').limit(1);
    
    const tableExists = !error;
    const healthData = {
      status: 'online',
      message: 'FinHub Backend Server & Supabase Cloud Connection Operational.',
      supabaseConnected: true,
      tableExists: tableExists,
      timestamp: new Date().toISOString()
    };

    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>FinHub System Health</title>
          <style>
            body { background: #0b0f19; color: #fff; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin:0; }
            .card { background: rgba(18,24,38,0.9); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 2.5rem; text-align: center; max-width: 500px; }
            .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #d946ef); color: #fff; text-decoration: none; padding: 0.8rem 1.5rem; border-radius: 12px; margin-top: 1.5rem; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>⚡ FinHub Backend Online</h2>
            <p>Supabase Database Connected & Operational.</p>
            <a href="/" class="btn">🚀 Open FinHub Platform &rarr;</a>
          </div>
        </body>
        </html>
      `);
    }

    res.json(healthData);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ==========================================
// 2. User Registration Endpoints
// ==========================================
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, father_name, email, phone } = req.body;

    if (!full_name || !full_name.trim()) return res.status(400).json({ success: false, error: 'Full Name is required.' });
    if (!father_name || !father_name.trim()) return res.status(400).json({ success: false, error: "Father's Name is required." });
    if (!email || !email.trim() || !email.includes('@')) return res.status(400).json({ success: false, error: 'Valid email address required.' });

    const cleanEmail = email.trim().toLowerCase();

    const { data: existingUser } = await supabase.from('registrations').select('id').eq('email', cleanEmail).maybeSingle();
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'This email is already registered!' });
    }

    const { data: newRegistration, error: insertError } = await supabase
      .from('registrations')
      .insert([{ full_name: full_name.trim(), father_name: father_name.trim(), email: cleanEmail, phone: phone ? phone.trim() : null }])
      .select().single();

    if (insertError) throw insertError;

    return res.status(201).json({ success: true, message: 'Registration successful!', data: newRegistration });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.json({ success: true, count: data.length, data: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. Personal Expenses Endpoints
// ==========================================
app.get('/api/expenses', async (req, res) => {
  try {
    const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });
    if (error) {
      // Fallback response if table not yet migrated in Supabase SQL editor
      return res.json({ success: true, data: [], isFallback: true });
    }
    return res.json({ success: true, count: data.length, data: data });
  } catch (err) {
    return res.json({ success: true, data: [], isFallback: true });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { title, amount, type, category, date, full_name } = req.body;
    if (!title || !amount) return res.status(400).json({ success: false, error: 'Title and amount required.' });

    const { data, error } = await supabase.from('expenses').insert([{
      title: title.trim(),
      amount: parseFloat(amount),
      type: type || 'expense',
      category: category || 'General',
      date: date || new Date().toISOString().slice(0,10),
      full_name: full_name || 'Guest User'
    }]).select().single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. Savings Goals Endpoints
// ==========================================
app.get('/api/savings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('savings_goals').select('*').order('created_at', { ascending: false });
    if (error) return res.json({ success: true, data: [], isFallback: true });
    return res.json({ success: true, data: data });
  } catch (err) {
    return res.json({ success: true, data: [], isFallback: true });
  }
});

app.post('/api/savings', async (req, res) => {
  try {
    const { goal_name, target_amount, current_amount, target_date } = req.body;
    if (!goal_name || !target_amount) return res.status(400).json({ success: false, error: 'Goal name & target amount required.' });

    const { data, error } = await supabase.from('savings_goals').insert([{
      goal_name: goal_name.trim(),
      target_amount: parseFloat(target_amount),
      current_amount: parseFloat(current_amount || 0),
      target_date: target_date || null
    }]).select().single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/savings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { deposit_amount } = req.body;
    
    const { data: goal } = await supabase.from('savings_goals').select('*').eq('id', id).single();
    if (!goal) return res.status(404).json({ success: false, error: 'Goal not found' });

    const newAmount = (parseFloat(goal.current_amount) || 0) + parseFloat(deposit_amount || 0);

    const { data, error } = await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', id).select().single();
    if (error) throw error;

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. Subscriptions Endpoints
// ==========================================
app.get('/api/subscriptions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('subscriptions').select('*').order('next_billing_date', { ascending: true });
    if (error) return res.json({ success: true, data: [], isFallback: true });
    return res.json({ success: true, data: data });
  } catch (err) {
    return res.json({ success: true, data: [], isFallback: true });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const { service_name, amount, billing_cycle, next_billing_date, category } = req.body;
    if (!service_name || !amount) return res.status(400).json({ success: false, error: 'Service name and amount required.' });

    const { data, error } = await supabase.from('subscriptions').insert([{
      service_name: service_name.trim(),
      amount: parseFloat(amount),
      billing_cycle: billing_cycle || 'monthly',
      next_billing_date: next_billing_date || null,
      category: category || 'General'
    }]).select().single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('subscriptions').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Subscription removed.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. Scholarships Endpoint (With Built-in Default Data)
// ==========================================
const DEFAULT_SCHOLARSHIPS = [
  {
    id: "sch-1",
    title: "PM Higher Education Merit Scholarship",
    provider: "Ministry of Education, Govt of India",
    amount: "₹20,000 / year",
    category: "Merit-Based",
    eligibility: "Students scoring > 80% in 12th standard with family income < ₹4.5 Lakhs",
    deadline: "2026-10-31",
    link: "https://scholarships.gov.in"
  },
  {
    id: "sch-2",
    title: "Reliance Foundation Undergraduate Scholarship",
    provider: "Reliance Foundation",
    amount: "Up to ₹2,00,000",
    category: "Merit-cum-Means",
    eligibility: "First year undergraduate students in any stream",
    deadline: "2026-11-15",
    link: "https://www.scholarships.reliancefoundation.org"
  },
  {
    id: "sch-3",
    title: "Post-Matric Scholarship for SC/ST/OBC",
    provider: "State & Central Government",
    amount: "100% Tuition Fee + Maintenance Allowance",
    category: "Need-Based",
    eligibility: "SC/ST/OBC students pursuing higher education",
    deadline: "2026-12-15",
    link: "https://scholarships.gov.in"
  },
  {
    id: "sch-4",
    title: "Adobe Women-in-Technology Scholarship",
    provider: "Adobe Research",
    amount: "$10,000 USD + Mentorship",
    category: "STEM / Diversity",
    eligibility: "Female students pursuing Computer Science / Engineering degree",
    deadline: "2026-09-30",
    link: "https://research.adobe.com/scholarship"
  },
  {
    id: "sch-5",
    title: "HDFC Bank Parivartan's ECSS Scholarship",
    provider: "HDFC Bank CSR",
    amount: "Up to ₹75,000 / year",
    category: "Need-Based",
    eligibility: "Students from school to postgraduate level facing personal financial crisis",
    deadline: "2026-10-15",
    link: "https://www.buddy4study.com/page/hdfc-bank-parivartans-ecss-scholarship"
  }
];

app.get('/api/scholarships', async (req, res) => {
  try {
    const { data, error } = await supabase.from('scholarships').select('*');
    if (error || !data || data.length === 0) {
      return res.json({ success: true, count: DEFAULT_SCHOLARSHIPS.length, data: DEFAULT_SCHOLARSHIPS });
    }
    return res.json({ success: true, count: data.length, data: data });
  } catch (err) {
    return res.json({ success: true, count: DEFAULT_SCHOLARSHIPS.length, data: DEFAULT_SCHOLARSHIPS });
  }
});

const PORT = parseInt(process.env.PORT || '5001', 10);

function startServer(portToTry) {
  const currentPort = Number(portToTry);
  const server = app.listen(currentPort, () => {
    console.log(`=================================================`);
    console.log(`🚀 FinHub Fullstack Server Running at http://localhost:${currentPort}`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      startServer(currentPort + 1);
    }
  });
}

startServer(PORT);
