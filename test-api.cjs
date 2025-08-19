require('dotenv').config();
const axios = require('axios');

async function testAPI() {
  console.log('Testing API endpoints...');
  
  try {
    // Test materials list endpoint
    console.log('\n1. Testing GET /api/materials');
    const materialsResponse = await axios.get('http://localhost:3001/api/materials');
    console.log('Status:', materialsResponse.status);
    console.log('Data:', JSON.stringify(materialsResponse.data, null, 2));
    
    // Test specific material by ID
    if (materialsResponse.data.success && materialsResponse.data.data.data.length > 0) {
      const firstMaterial = materialsResponse.data.data.data[0];
      console.log('\n2. Testing GET /api/materials/' + firstMaterial.id);
      
      try {
        const materialResponse = await axios.get(`http://localhost:3001/api/materials/${firstMaterial.id}`);
        console.log('Status:', materialResponse.status);
        console.log('Data:', JSON.stringify(materialResponse.data, null, 2));
      } catch (error) {
        console.log('Error:', error.response?.status, error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('API Test error:', error.response?.status, error.response?.data || error.message);
  }
}

testAPI();