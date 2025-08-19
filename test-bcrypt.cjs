const bcrypt = require('bcrypt');

async function testBcrypt() {
  const password = 'admin123';
  
  // Generate a new hash
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash for admin123:', newHash);
  
  // Test the new hash
  const isValid = await bcrypt.compare(password, newHash);
  console.log('New hash validation:', isValid);
  
  // Test existing hashes
  const existingHashes = [
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p02tr9Se/rVM6.nic54NAnGO',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
  ];
  
  for (let i = 0; i < existingHashes.length; i++) {
    const hash = existingHashes[i];
    const valid = await bcrypt.compare(password, hash);
    console.log(`Hash ${i + 1} (${hash.substring(0, 20)}...): ${valid}`);
  }
}

testBcrypt().catch(console.error);