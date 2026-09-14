const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('🔍 Testing connection to Supabase project...');
  console.log(`📌 Supabase URL: ${supabaseUrl}`);

  try {
    const { data, error } = await supabase.from('registrations').select('*').limit(1);

    if (error) {
      if (error.code === 'PGRST205') {
        console.log('\n⚠️  STATUS: Table "public.registrations" is NOT yet created in Supabase.');
        console.log('\n📋 QUICK INSTRUCTIONS TO CREATE TABLE:');
        console.log('1. Log in to your Supabase Dashboard: https://supabase.com/dashboard/project/yzkkjnukyjwirjamygsm');
        console.log('2. Click on "SQL Editor" in the left sidebar.');
        console.log('3. Open the schema file located at: ../supabase/schema.sql');
        console.log('4. Copy & Paste the SQL code into Supabase SQL Editor and click "RUN".');
        console.log('\n📄 SQL Content Preview:\n');
        
        const sqlPath = path.join(__dirname, '../../supabase/schema.sql');
        if (fs.existsSync(sqlPath)) {
          console.log(fs.readFileSync(sqlPath, 'utf8'));
        }
      } else {
        console.error('❌ Supabase Query Error:', error);
      }
    } else {
      console.log('✅ SUCCESS! Table "registrations" is created and accessible.');
      console.log(`📊 Total records sample: ${data.length}`);
    }
  } catch (err) {
    console.error('❌ Exception during DB check:', err.message);
  }
}

checkDatabase();
