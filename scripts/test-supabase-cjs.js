const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gilabetbxcgzndqjlhkl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbGFiZXRieGNnem5kcWpsaGtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQyNzc2NiwiZXhwIjoyMDg3MDAzNzY2fQ.woPtVfj17-uTz3zxYCzE1YE8l1pd-oh_r9SfGYt4XkQ';

console.log('Testing Supabase connection with hardcoded keys...');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Keys are missing');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('usage_counters')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase Error:', error);
    } else {
      console.log('Success! Connection established.');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();
