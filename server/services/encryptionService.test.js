import dotenv from 'dotenv';
import { encrypt, decrypt, generateAnonymousId, validateEncryptionKey } from './encryptionService.js';

// Load environment variables
dotenv.config();

/**
 * Simple test file for encryption service
 * Run with: node services/encryptionService.test.js
 */

console.log('🧪 Testing Encryption Service...\n');

// Test 1: Encryption and Decryption
console.log('Test 1: Encryption Round-trip');
const testData = 'sensitive-phone-number-1234567890';
try {
  const encrypted = encrypt(testData);
  console.log('✓ Encrypted:', encrypted.substring(0, 50) + '...');
  
  const decrypted = decrypt(encrypted);
  console.log('✓ Decrypted:', decrypted);
  
  if (decrypted === testData) {
    console.log('✅ Round-trip test PASSED\n');
  } else {
    console.log('❌ Round-trip test FAILED\n');
  }
} catch (error) {
  console.log('❌ Encryption test FAILED:', error.message, '\n');
}

// Test 2: Anonymous ID Generation
console.log('Test 2: Anonymous ID Generation');
try {
  const userId = generateAnonymousId('USER', 8);
  const sellerId = generateAnonymousId('SELLER', 8);
  const bidderId = generateAnonymousId('BIDDER', 8);
  
  console.log('✓ User ID:', userId);
  console.log('✓ Seller ID:', sellerId);
  console.log('✓ Bidder ID:', bidderId);
  
  // Check format
  if (userId.startsWith('USER_') && sellerId.startsWith('SELLER_') && bidderId.startsWith('BIDDER_')) {
    console.log('✅ Anonymous ID generation PASSED\n');
  } else {
    console.log('❌ Anonymous ID generation FAILED\n');
  }
} catch (error) {
  console.log('❌ Anonymous ID test FAILED:', error.message, '\n');
}

// Test 3: Encryption Key Validation
console.log('Test 3: Encryption Key Validation');
const validKey = '145a9f725300635d21e2c66987022c77feec21501ea47b6949dc1554bde0a769';
const invalidKey = 'short';

console.log('✓ Valid key check:', validateEncryptionKey(validKey));
console.log('✓ Invalid key check:', !validateEncryptionKey(invalidKey));

if (validateEncryptionKey(validKey) && !validateEncryptionKey(invalidKey)) {
  console.log('✅ Key validation PASSED\n');
} else {
  console.log('❌ Key validation FAILED\n');
}

// Test 4: Empty/Null handling
console.log('Test 4: Empty/Null Handling');
try {
  const emptyEncrypt = encrypt('');
  const nullEncrypt = encrypt(null);
  console.log('✓ Empty string:', emptyEncrypt);
  console.log('✓ Null value:', nullEncrypt);
  console.log('✅ Empty/Null handling PASSED\n');
} catch (error) {
  console.log('❌ Empty/Null handling FAILED:', error.message, '\n');
}

console.log('🎉 All tests completed!');
