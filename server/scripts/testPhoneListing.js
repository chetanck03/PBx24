import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Phone from '../models/Phone.js';

dotenv.config();

const testPhoneListing = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check users
    console.log('📊 Checking Users:');
    const users = await User.find({});
    console.log(`   Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Anonymous ID: ${user.anonymousId}`);
      console.log(`     Active: ${user.isActive}`);
    });

    // Check phones
    console.log('\n📱 Checking Phone Listings:');
    const phones = await Phone.find({});
    console.log(`   Total phones: ${phones.length}`);
    
    if (phones.length === 0) {
      console.log('   No phones listed yet');
    } else {
      phones.forEach(phone => {
        console.log(`\n   - ${phone.brand} ${phone.model}`);
        console.log(`     Seller ID: ${phone.sellerId}`);
        console.log(`     Anonymous Seller: ${phone.anonymousSellerId}`);
        console.log(`     Status: ${phone.status}`);
        console.log(`     Verification: ${phone.verificationStatus}`);
        console.log(`     Images: ${phone.images.length}`);
        console.log(`     Min Bid: ₹${phone.minBidPrice}`);
      });
    }

    // Check if users can create listings
    console.log('\n✅ User Role Check:');
    const regularUsers = users.filter(u => u.role === 'user');
    const adminUsers = users.filter(u => u.role === 'admin');
    console.log(`   Regular users (can buy & sell): ${regularUsers.length}`);
    console.log(`   Admin users: ${adminUsers.length}`);

    if (regularUsers.length === 0 && adminUsers.length === 0) {
      console.log('\n⚠️  WARNING: No users found! Please create a user first.');
    }

    console.log('\n✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

testPhoneListing();
