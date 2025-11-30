import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { sendBidAcceptanceEmail } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔄 Testing Bid Acceptance Email...\n');

const testEmail = async () => {
  try {
    // Test data
    const testRecipient = 'test@example.com'; // Change this to your email
    const testName = 'Test User';
    const phoneDetails = {
      brand: 'OnePlus',
      model: 'OnePlus 11',
      storage: '128GB',
      condition: 'excellent'
    };
    const bidAmount = 15000;

    console.log('Sending test email to:', testRecipient);
    console.log('Phone:', phoneDetails.brand, phoneDetails.model);
    console.log('Bid Amount: ₹', bidAmount);
    console.log('\nSending email...\n');

    await sendBidAcceptanceEmail(testRecipient, testName, phoneDetails, bidAmount);

    console.log('✅ Email sent successfully!');
    console.log('\nCheck your inbox for the bid acceptance email.');
    console.log('\nEmail contains:');
    console.log('  ✓ Congratulations message');
    console.log('  ✓ Phone details');
    console.log('  ✓ Winning bid amount');
    console.log('  ✓ Payment instructions (₹2,000 deposit)');
    console.log('  ✓ Next steps');
    console.log('  ✓ Dashboard link');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('\nPossible issues:');
    console.error('  - Check EMAIL_USER in .env');
    console.error('  - Check EMAIL_PASS in .env');
    console.error('  - Ensure Gmail App Password is correct');
    console.error('  - Check internet connection');
    throw error;
  }
};

testEmail()
  .then(() => {
    console.log('\n🎉 Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
