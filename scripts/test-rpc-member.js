const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gilabetbxcgzndqjlhkl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdpbGFiZXRieGNnem5kcWpsaGtsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQyNzc2NiwiZXhwIjoyMDg3MDAzNzY2fQ.woPtVfj17-uTz3zxYCzE1YE8l1pd-oh_r9SfGYt4XkQ';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  console.log('Testing RPC consume_usage for member...');
  
  // Test Case 1: Existing member logic (mock)
  const params = {
    p_month: '2026-02',
    p_subject_type: 'member',
    p_subject_key: 'debug-member-id', // Mock ID
    p_limit: -1 // Infinity normalized
  };

  console.log('Params:', params);

  const { data, error } = await supabase.rpc('consume_usage', params);

  if (error) {
    console.error('RPC Error:', error);
  } else {
    console.log('Success:', data);
  }
}

test();
