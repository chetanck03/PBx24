import dotenv from 'dotenv';
import { sendOTPEmail } from '../services/emailService.js';

// Load environment variables
dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Email Service...\n');
  
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured!');
    console.log('\nPlease set EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('See ENHANCED_AUTH_SETUP.md for instructions\n');
    process.exit(1);
  }
  
  console.log('📧 Email User:', process.env.EMAIL_USER);
  console.log('🔑 Email Pass:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');
  console.log('');
  
  // Test email address (change this to your email)
  const testEmailAddress = process.env.EMAIL_USER;
  const testOTP = '123456';
  
  console.log(`📤 Sending test OTP to: ${testEmailAddress}`);
  console.log(`🔢 Test OTP: ${testOTP}\n`);
  
  try {
    await sendOTPEmail(testEmailAddress, testOTP, 'signup');
    console.log('✅ Email sent successfully!');
    console.log('📬 Check your inbox for the test email\n');
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error(error.message);
    console.log('\nCommon issues:');
    console.log('1. Make sure you are using a Gmail App Password (not your regular password)');
    console.log('2. Enable 2-Factor Authentication on your Google account');
    console.log('3. Generate an App Password from Google Account settings');
    console.log('4. Check if "Less secure app access" is enabled (if not using App Password)');
    console.log('\nSee ENHANCED_AUTH_SETUP.md for detailed instructions\n');
    process.exit(1);
  }
};

testEmail();
