import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fc from 'fast-check';
import User from './User.js';

// Load environment variables
dotenv.config();

console.log('🧪 Running Property-Based Tests for User Model...\n');

// Connect to test database
const connectTestDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to test database\n');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Clean up test data
const cleanupTestData = async () => {
  try {
    await User.deleteMany({ email: /^test-/ });
  } catch (error) {
    console.error('Cleanup error:', error.message);
  }
};

/**
 * Feature: anonymous-bidding-system, Property 10: Initial state correctness
 * For any newly created user, the wallet balance should be 0, KYC status should be "pending",
 * isActive should be true, and isBanned should be false
 * Validates: Requirements 9.1, 9.3
 */
const testInitialUserState = async () => {
  console.log('Property 10: Initial State Correctness');
  console.log('Testing with 20 random user creations...\n');
  
  let passedTests = 0;
  const totalTests = 20;
  
  try {
    for (let i = 0; i < totalTests; i++) {
      // Generate random user data
      const randomEmail = `test-user-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const randomGoogleId = `google-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const randomName = `Test User ${i}`;
      
      // Create user
      const user = new User({
        googleId: randomGoogleId,
        email: randomEmail,
        name: randomName
      });
      
      await user.save();
      
      // Verify initial state
      const checks = {
        walletBalance: user.walletBalance === 0,
        kycStatus: user.kycStatus === 'pending',
        isActive: user.isActive === true,
        isBanned: user.isBanned === false,
        anonymousId: user.anonymousId && user.anonymousId.startsWith('USER_'),
        role: user.role === 'user' // Default role
      };
      
      const allChecksPassed = Object.values(checks).every(check => check === true);
      
      if (allChecksPassed) {
        passedTests++;
      } else {
        console.log(`❌ Test ${i + 1} failed:`, checks);
      }
      
      // Clean up
      await User.deleteOne({ _id: user._id });
    }
    
    if (passedTests === totalTests) {
      console.log(`✅ Property 10 PASSED: All ${totalTests} users had correct initial state`);
      console.log(`   - walletBalance: 0`);
      console.log(`   - kycStatus: 'pending'`);
      console.log(`   - isActive: true`);
      console.log(`   - isBanned: false`);
      console.log(`   - anonymousId: generated with USER_ prefix`);
      console.log(`   - role: 'user' (default - can both buy and sell)\n`);
    } else {
      console.log(`❌ Property 10 FAILED: ${passedTests}/${totalTests} tests passed\n`);
    }
  } catch (error) {
    console.log('❌ Property 10 FAILED:', error.message, '\n');
  }
};

/**
 * Test encryption/decryption methods
 */
const testEncryptionMethods = async () => {
  console.log('Additional Test: Encryption Methods');
  console.log('Testing phone and address encryption...\n');
  
  try {
    const testUser = new User({
      googleId: `google-test-${Date.now()}`,
      email: `test-encryption-${Date.now()}@example.com`,
      name: 'Encryption Test User'
    });
    
    // Test phone encryption
    const testPhone = '+1234567890';
    testUser.setPhone(testPhone);
    await testUser.save();
    
    // Verify phone is encrypted in database
    const storedUser = await User.findById(testUser._id);
    const phoneIsEncrypted = storedUser.phone !== testPhone && storedUser.phone.includes(':');
    const phoneDecrypts = storedUser.getPhone() === testPhone;
    
    // Test address encryption
    const testAddress = '123 Main St, City, State 12345';
    testUser.setAddress(testAddress);
    await testUser.save();
    
    // Verify address is encrypted
    const updatedUser = await User.findById(testUser._id);
    const addressIsEncrypted = updatedUser.address !== testAddress && updatedUser.address.includes(':');
    const addressDecrypts = updatedUser.getAddress() === testAddress;
    
    // Clean up
    await User.deleteOne({ _id: testUser._id });
    
    if (phoneIsEncrypted && phoneDecrypts && addressIsEncrypted && addressDecrypts) {
      console.log('✅ Encryption methods PASSED');
      console.log('   - Phone encrypted in storage: ✓');
      console.log('   - Phone decrypts correctly: ✓');
      console.log('   - Address encrypted in storage: ✓');
      console.log('   - Address decrypts correctly: ✓\n');
    } else {
      console.log('❌ Encryption methods FAILED');
      console.log('   - Phone encrypted:', phoneIsEncrypted);
      console.log('   - Phone decrypts:', phoneDecrypts);
      console.log('   - Address encrypted:', addressIsEncrypted);
      console.log('   - Address decrypts:', addressDecrypts, '\n');
    }
  } catch (error) {
    console.log('❌ Encryption methods FAILED:', error.message, '\n');
  }
};

// Run all tests
const runTests = async () => {
  await connectTestDB();
  await cleanupTestData();
  await testInitialUserState();
  await testEncryptionMethods();
  await cleanupTestData();
  await mongoose.connection.close();
  console.log('🎉 User Model Property-Based Testing Complete!');
};

runTests();
