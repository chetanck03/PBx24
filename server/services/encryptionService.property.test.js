import dotenv from 'dotenv';
import fc from 'fast-check';
import { encrypt, decrypt, generateAnonymousId } from './encryptionService.js';

// Load environment variables
dotenv.config();

console.log('🧪 Running Property-Based Tests for Encryption Service...\n');

/**
 * Feature: anonymous-bidding-system, Property 1: Encryption round-trip for sensitive fields
 * For any user with phone number, address, or any phone with IMEI, or any bid with real bidder ID,
 * storing the data and then retrieving it as an authorized user should return the original unencrypted value
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */
console.log('Property 1: Encryption Round-trip for Sensitive Fields');
console.log('Testing with 100 random strings...');

try {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 500 }), // Generate random strings
      (originalText) => {
        // Encrypt then decrypt should return original
        const encrypted = encrypt(originalText);
        const decrypted = decrypt(encrypted);
        return decrypted === originalText;
      }
    ),
    { numRuns: 100 } // Run 100 iterations as specified
  );
  console.log('✅ Property 1 PASSED: All 100 random strings encrypted and decrypted correctly\n');
} catch (error) {
  console.log('❌ Property 1 FAILED:', error.message, '\n');
}

/**
 * Feature: anonymous-bidding-system, Property 2: Sensitive fields are encrypted in storage
 * For any sensitive field (phone number, address, IMEI, real bidder ID in transactions),
 * the value stored in the database should not equal the plaintext value
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4
 */
console.log('Property 2: Sensitive Fields are Encrypted in Storage');
console.log('Testing with 100 random sensitive data values...');

try {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 200 }), // Generate random sensitive data
      (sensitiveData) => {
        // Encrypted value should never equal plaintext
        const encrypted = encrypt(sensitiveData);
        
        // Encrypted should be different from original
        if (encrypted === sensitiveData) {
          return false;
        }
        
        // Encrypted should contain our format markers (iv:authTag:data)
        const parts = encrypted.split(':');
        if (parts.length !== 3) {
          return false;
        }
        
        // Each part should be hex encoded
        const hexPattern = /^[0-9a-f]+$/i;
        return parts.every(part => hexPattern.test(part));
      }
    ),
    { numRuns: 100 }
  );
  console.log('✅ Property 2 PASSED: All 100 values were properly encrypted and not stored as plaintext\n');
} catch (error) {
  console.log('❌ Property 2 FAILED:', error.message, '\n');
}

/**
 * Feature: anonymous-bidding-system, Property 3: Anonymous ID generation and uniqueness
 * For any user, phone listing, or bid created, the system should generate a unique anonymous ID
 * that follows the correct format and no two entities of the same type should have the same anonymous ID
 * Validates: Requirements 1.1, 1.3, 1.4
 */
console.log('Property 3: Anonymous ID Generation and Uniqueness');
console.log('Testing with 100 ID generations per type...');

try {
  // Test USER IDs
  const userIds = new Set();
  for (let i = 0; i < 100; i++) {
    const id = generateAnonymousId('USER', 8);
    
    // Check format
    if (!id.startsWith('USER_') || id.length !== 13) {
      throw new Error(`Invalid USER ID format: ${id}`);
    }
    
    // Check uniqueness
    if (userIds.has(id)) {
      throw new Error(`Duplicate USER ID generated: ${id}`);
    }
    userIds.add(id);
  }
  
  // Test SELLER IDs
  const sellerIds = new Set();
  for (let i = 0; i < 100; i++) {
    const id = generateAnonymousId('SELLER', 8);
    
    // Check format
    if (!id.startsWith('SELLER_') || id.length !== 15) {
      throw new Error(`Invalid SELLER ID format: ${id}`);
    }
    
    // Check uniqueness
    if (sellerIds.has(id)) {
      throw new Error(`Duplicate SELLER ID generated: ${id}`);
    }
    sellerIds.add(id);
  }
  
  // Test BIDDER IDs
  const bidderIds = new Set();
  for (let i = 0; i < 100; i++) {
    const id = generateAnonymousId('BIDDER', 8);
    
    // Check format
    if (!id.startsWith('BIDDER_') || id.length !== 15) {
      throw new Error(`Invalid BIDDER ID format: ${id}`);
    }
    
    // Check uniqueness
    if (bidderIds.has(id)) {
      throw new Error(`Duplicate BIDDER ID generated: ${id}`);
    }
    bidderIds.add(id);
  }
  
  console.log('✅ Property 3 PASSED: All 300 anonymous IDs were unique and properly formatted\n');
} catch (error) {
  console.log('❌ Property 3 FAILED:', error.message, '\n');
}

console.log('🎉 Property-Based Testing Complete!');
console.log('📊 Total iterations: 300+ (100 per property)');
