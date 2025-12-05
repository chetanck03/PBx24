/**
 * Test script to verify government ID proof is required during signup
 * This script tests the signup flow with and without government ID proof
 */

const testSignupWithoutId = async () => {
  console.log('\n=== Test 1: Signup without Government ID (Should Fail) ===');
  
  try {
    const response = await fetch('http://localhost:3000/api/v2/auth/signup/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
        name: 'Test User',
        password: 'password123'
        // Missing governmentIdProof and governmentIdType
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (!data.success && data.error.message.includes('government ID')) {
      console.log('✅ Test Passed: Signup correctly rejected without government ID');
    } else {
      console.log('❌ Test Failed: Signup should require government ID');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const testSignupWithoutIdType = async () => {
  console.log('\n=== Test 2: Signup without ID Type (Should Fail) ===');
  
  try {
    const response = await fetch('http://localhost:3000/api/v2/auth/signup/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
        name: 'Test User',
        password: 'password123',
        governmentIdProof: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        // Missing governmentIdType
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (!data.success && data.error.message.includes('ID type')) {
      console.log('✅ Test Passed: Signup correctly rejected without ID type');
    } else {
      console.log('❌ Test Failed: Signup should require ID type');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const testSignupWithId = async () => {
  console.log('\n=== Test 3: Signup with Government ID and Type (Should Succeed if OTP valid) ===');
  
  try {
    const response = await fetch('http://localhost:3000/api/v2/auth/signup/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        otp: '123456',
        name: 'Test User',
        password: 'password123',
        governmentIdProof: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        governmentIdType: 'Aadhaar'
      })
    });
    
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.error && data.error.message.includes('Invalid or expired OTP')) {
      console.log('✅ Test Passed: Request format correct (OTP validation expected to fail)');
    } else if (data.success) {
      console.log('✅ Test Passed: Signup successful with government ID and type');
    } else {
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
};

const runTests = async () => {
  console.log('Starting Government ID Proof Tests...');
  console.log('Make sure the server is running on http://localhost:3000');
  
  await testSignupWithoutId();
  await testSignupWithoutIdType();
  await testSignupWithId();
  
  console.log('\n=== Tests Complete ===\n');
};

runTests();
