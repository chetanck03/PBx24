import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔄 Fixing user anonymousIds...\n');

const fixAnonymousIds = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to database\n');

    // Find users without anonymousId
    const usersWithoutAnonymousId = await User.find({ 
      $or: [
        { anonymousId: { $exists: false } },
        { anonymousId: null },
        { anonymousId: '' }
      ]
    });
    
    console.log(`Found ${usersWithoutAnonymousId.length} users without anonymousId\n`);
    
    let fixedCount = 0;
    for (const user of usersWithoutAnonymousId) {
      console.log(`Fixing user: ${user.email}`);
      // The pre-save hook will generate the anonymousId
      await user.save();
      console.log(`  ✓ Generated anonymousId: ${user.anonymousId}`);
      fixedCount++;
    }
    
    console.log(`\n✅ Fixed ${fixedCount} users`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
};

// Run fix
fixAnonymousIds()
  .then(() => {
    console.log('\n🎉 Fix script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fix script failed:', error);
    process.exit(1);
  });
