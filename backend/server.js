const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==========================================
// API ROUTES
// ==========================================

// 1. Health Check Endpoint
app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.from('registrations').select('id').limit(1);
    
    const tableExists = !error;
    res.json({
      status: 'online',
      message: 'Backend server is running properly.',
      supabaseConnected: true,
      tableExists: tableExists,
      tableErrorMsg: error ? error.message : null,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: err.message
    });
  }
});

// 2. User Registration Endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, father_name, email, phone } = req.body;

    // Server-side Input Validation
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, error: 'Full Name is required.' });
    }
    if (!father_name || !father_name.trim()) {
      return res.status(400).json({ success: false, error: "Father's Name is required." });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const cleanFullName = full_name.trim();
    const cleanFatherName = father_name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : null;

    // Check if user with email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('registrations')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (checkError && checkError.code === 'PGRST205') {
      return res.status(500).json({
        success: false,
        error: 'Database table "registrations" not found. Please run the schema.sql in Supabase SQL Editor first.'
      });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'This email address is already registered!'
      });
    }

    // Insert new registration record into Supabase
    const { data: newRegistration, error: insertError } = await supabase
      .from('registrations')
      .insert([
        {
          full_name: cleanFullName,
          father_name: cleanFatherName,
          email: cleanEmail,
          phone: cleanPhone
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase Insert Error:', insertError);
      return res.status(500).json({
        success: false,
        error: insertError.message || 'Failed to save registration to database.'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration completed successfully!',
      data: newRegistration
    });
  } catch (err) {
    console.error('Server Exception:', err);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred.'
    });
  }
});

// 3. Fetch All Registrations Endpoint
app.get('/api/registrations', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') {
        return res.status(404).json({
          success: false,
          error: 'Table "registrations" does not exist yet. Please execute supabase/schema.sql script in Supabase SQL Editor.'
        });
      }
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Start Express Server with Automatic Port Retry on EADDRINUSE
function startServer(portToTry) {
  const server = app.listen(portToTry, () => {
    console.log(`=================================================`);
    console.log(`🚀 Registration Backend Server Running!`);
    console.log(`📡 URL: http://localhost:${portToTry}`);
    console.log(`🔗 Health Check: http://localhost:${portToTry}/api/health`);
    console.log(`=================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${portToTry} is currently in use. Trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error('❌ Server error:', err);
    }
  });
}

startServer(PORT);
