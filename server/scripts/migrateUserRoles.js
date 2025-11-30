import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const migrateUserRoles = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Migrating user roles...');
    
    // Update all users with 'buyer' or 'seller' role to 'user'
    const result = await User.updateMany(
      { role: { $in: ['buyer', 'seller'] } },
      { $set: { role: 'user' } }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to 'user' role`);
    
    // Show current role distribution
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    console.log('\n📊 Current role distribution:');
    roleStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} users`);
    });

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

migrateUserRoles();
