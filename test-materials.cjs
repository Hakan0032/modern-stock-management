require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMaterials() {
  console.log('Testing materials table...');
  
  try {
    // Test basic select
    const { data, error } = await supabase
      .from('materials')
      .select('*');
    
    console.log('Materials data:', data);
    console.log('Error:', error);
    console.log('Count:', data ? data.length : 0);
    
    // Test specific material by ID
    if (data && data.length > 0) {
      const firstMaterial = data[0];
      console.log('\nTesting single material fetch...');
      const { data: singleData, error: singleError } = await supabase
        .from('materials')
        .select('*')
        .eq('id', firstMaterial.id)
        .single();
      
      console.log('Single material:', singleData);
      console.log('Single error:', singleError);
    }
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

testMaterials();