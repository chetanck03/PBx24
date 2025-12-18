import dotenv from 'dotenv';
import { sendOTPEmail } from '../services/emailService.js';

// Load environment variables
dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Resend Email Service...\n');
  
  // Check if Resend API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not configured!');
    console.log('\nPlease set RESEND_API_KEY in your .env file');
    process.exit(1);
  }
  
  console.log('🔑 Resend API Key:', process.env.RESEND_API_KEY ? '***configured***' : 'NOT SET');
  console.log('');
  
  // Test email address - use your email here
  const testEmailAddress = process.argv[2] || 'delivered@resend.dev';
  const testOTP = '123456';
  
  console.log(`📤 Sending test OTP to: ${testEmailAddress}`);
  console.log(`🔢 Test OTP: ${testOTP}\n`);
  
  try {
    const result = await sendOTPEmail(testEmailAddress, testOTP, 'Test User');
    console.log('✅ Email sent successfully!');
    console.log('📧 Email ID:', result.id);
    console.log('📬 Check your inbox for the test email\n');
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
    console.log('\nCommon issues:');
    console.log('1. Make sure RESEND_API_KEY is correct');
    console.log('2. Verify your Resend account is active');
    console.log('3. Check if the recipient email is valid');
    console.log('\nNote: Free tier can only send to your verified email or delivered@resend.dev\n');
    process.exit(1);
  }
};

testEmail();
