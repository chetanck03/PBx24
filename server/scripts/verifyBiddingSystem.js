import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';

dotenv.config();

const verifyBiddingSystem = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('                 BIDDING SYSTEM VERIFICATION');
    console.log('═══════════════════════════════════════════════════════\n');

    // Check Users
    console.log('👥 USERS:');
    const users = await User.find({});
    users.forEach(user => {
      console.log(`   ✓ ${user.name} (${user.email})`);
      console.log(`     Role: ${user.role} | Anonymous ID: ${user.anonymousId}`);
    });
    console.log(`   Total: ${users.length} users\n`);

    // Check Phones
    console.log('📱 PHONES:');
    const phones = await Phone.find({});
    console.log(`   Total: ${phones.length} phones\n`);
    
    for (const phone of phones) {
      console.log(`   📱 ${phone.brand} ${phone.model}`);
      console.log(`      Status: ${phone.status}`);
      console.log(`      Verification: ${phone.verificationStatus}`);
      console.log(`      Min Bid: ₹${phone.minBidPrice}`);
      console.log(`      Seller: ${phone.anonymousSellerId}`);
      console.log(`      Images: ${phone.images.length}`);
      
      // Check if auction exists
      const auction = await Auction.findOne({ phoneId: phone._id });
      if (auction) {
        console.log(`      ✅ AUCTION EXISTS`);
        console.log(`         Auction ID: ${auction._id}`);
        console.log(`         Status: ${auction.status}`);
        console.log(`         Current Bid: ₹${auction.currentBid || 0}`);
        console.log(`         Total Bids: ${auction.totalBids}`);
        console.log(`         Ends: ${auction.auctionEndTime}`);
        
        // Check bids
        const bids = await Bid.find({ auctionId: auction._id });
        if (bids.length > 0) {
          console.log(`         💰 BIDS (${bids.length}):`);
          bids.forEach(bid => {
            console.log(`            - ₹${bid.bidAmount} by ${bid.anonymousBidderId} ${bid.isWinning ? '👑 WINNING' : ''}`);
          });
        } else {
          console.log(`         💰 No bids yet`);
        }
      } else {
        console.log(`      ❌ NO AUCTION - Creating now...`);
        const newAuction = new Auction({
          phoneId: phone._id,
          auctionEndTime: phone.auctionEndTime || new Date(Date.now() + 7*24*60*60*1000),
          status: 'active'
        });
        await newAuction.save();
        console.log(`      ✅ Auction created: ${newAuction._id}`);
      }
      console.log('');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('                        SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    
    const livePhones = await Phone.countDocuments({ status: 'live', verificationStatus: 'approved' });
    const activeAuctions = await Auction.countDocuments({ status: 'active' });
    const totalBids = await Bid.countDocuments({});
    
    console.log(`✓ Live Phones: ${livePhones}`);
    console.log(`✓ Active Auctions: ${activeAuctions}`);
    console.log(`✓ Total Bids: ${totalBids}`);
    
    if (livePhones === activeAuctions) {
      console.log('\n✅ ALL LIVE PHONES HAVE AUCTIONS!');
    } else {
      console.log(`\n⚠️  WARNING: ${livePhones} live phones but only ${activeAuctions} auctions`);
    }
    
    console.log('\n✅ Verification completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

verifyBiddingSystem();
