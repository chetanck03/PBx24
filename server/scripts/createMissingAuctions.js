import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';

dotenv.config();

const createMissingAuctions = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔍 Finding approved phones without auctions...');
    
    // Find all approved/live phones
    const approvedPhones = await Phone.find({
      verificationStatus: 'approved',
      status: 'live'
    });

    console.log(`   Found ${approvedPhones.length} approved phones\n`);

    let created = 0;
    let skipped = 0;

    for (const phone of approvedPhones) {
      // Check if auction already exists
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (existingAuction) {
        console.log(`⏭️  Skipped: ${phone.brand} ${phone.model} (auction exists)`);
        skipped++;
        continue;
      }

      // Create auction
      const auction = new Auction({
        phoneId: phone._id,
        auctionEndTime: phone.auctionEndTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
        status: 'active'
      });

      await auction.save();
      console.log(`✅ Created auction for: ${phone.brand} ${phone.model}`);
      console.log(`   Auction ID: ${auction._id}`);
      console.log(`   Ends: ${auction.auctionEndTime}`);
      created++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Auctions created: ${created}`);
    console.log(`   Skipped (already exist): ${skipped}`);
    console.log(`\n✅ Migration completed successfully!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

createMissingAuctions();
