import mongoose from 'mongoose';
import Phone from '../models/Phone.js';
import dotenv from 'dotenv';

dotenv.config();

const testPhoneVerification = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a pending phone
    const pendingPhone = await Phone.findOne({ verificationStatus: 'pending' });
    
    if (!pendingPhone) {
      console.log('No pending phones found');
      process.exit(0);
    }

    console.log('Found pending phone:', {
      id: pendingPhone._id,
      brand: pendingPhone.brand,
      model: pendingPhone.model,
      verificationStatus: pendingPhone.verificationStatus,
      status: pendingPhone.status
    });

    // Test approval
    console.log('\nTesting approval...');
    pendingPhone.verificationStatus = 'approved';
    pendingPhone.status = 'live';
    await pendingPhone.save();

    console.log('Phone after approval:', {
      id: pendingPhone._id,
      verificationStatus: pendingPhone.verificationStatus,
      status: pendingPhone.status
    });

    // Verify it was saved
    const savedPhone = await Phone.findById(pendingPhone._id);
    console.log('Phone from database:', {
      id: savedPhone._id,
      verificationStatus: savedPhone.verificationStatus,
      status: savedPhone.status
    });

    console.log('\nTest completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
};

testPhoneVerification();