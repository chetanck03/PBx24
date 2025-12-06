import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';

dotenv.config();

const fixMissingAuctions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all approved/live phones
    const livePhones = await Phone.find({ 
      status: 'live',
      verificationStatus: 'approved'
    });

    console.log(`Found ${livePhones.length} live phones`);

    let created = 0;
    let skipped = 0;

    for (const phone of livePhones) {
      // Check if auction exists
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (!existingAuction) {
        // Create auction with all required fields
        const auctionEndTime = phone.auctionEndTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const auction = new Auction({
          phoneId: phone._id,
          sellerId: phone.sellerId,
          anonymousSellerId: phone.anonymousSellerId,
          startingBid: phone.minBidPrice,
          currentBid: 0,
          auctionEndTime: auctionEndTime,
          status: 'active'
        });
        
        await auction.save();
        console.log(`Created auction for phone: ${phone.brand} ${phone.model} (${phone._id})`);
        created++;
      } else {
        console.log(`Auction already exists for: ${phone.brand} ${phone.model}`);
        skipped++;
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Auctions created: ${created}`);
    console.log(`- Already had auctions: ${skipped}`);

    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixMissingAuctions();
