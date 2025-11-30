import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { generateAnonymousId } from '../services/encryptionService.js';

dotenv.config();

const createDefaultAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@phonebid24.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Anonymous ID: ${existingAdmin.anonymousId}`);
      console.log(`   Role: ${existingAdmin.role}`);
      
      // Update to admin role if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Updated existing user to admin role');
      }
      
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = new User({
      email: 'admin@phonebid24.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
      anonymousId: generateAnonymousId('ADMIN', 8),
      kycStatus: 'verified',
      isActive: true,
      walletBalance: 0
    });

    await admin.save();

    console.log('🎉 Default admin account created successfully!');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Email: admin@phonebid24.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('🔑 Admin Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Anonymous ID: ${admin.anonymousId}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   KYC Status: ${admin.kycStatus}`);
    console.log('');
    console.log('🚀 Access Admin Portal:');
    console.log('   1. Go to: http://localhost:5173/auth/signin');
    console.log('   2. Login with above credentials');
    console.log('   3. Navigate to: http://localhost:5173/admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
