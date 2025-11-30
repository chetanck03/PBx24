import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔄 Testing bidding system...\n');

const testBidding = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to database\n');

    // Find a test user
    const testUser = await User.findOne({});
    if (!testUser) {
      console.log('❌ No users found in database');
      return;
    }
    
    console.log('Test User:');
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Name: ${testUser.name}`);
    console.log(`  AnonymousId: ${testUser.anonymousId}`);
    console.log(`  Has anonymousId: ${!!testUser.anonymousId}\n`);
    
    // Find an active auction
    const activeAuction = await Auction.findOne({ status: 'active' }).populate('phoneId');
    if (!activeAuction) {
      console.log('❌ No active auctions found');
      return;
    }
    
    console.log('Active Auction:');
    console.log(`  Auction ID: ${activeAuction._id}`);
    console.log(`  Phone: ${activeAuction.phoneId.brand} ${activeAuction.phoneId.model}`);
    console.log(`  Current Bid: ₹${activeAuction.currentBid}`);
    console.log(`  Min Bid: ₹${activeAuction.phoneId.minBidPrice}`);
    console.log(`  Total Bids: ${activeAuction.totalBids}\n`);
    
    // Check if user can bid (not the seller)
    const phone = activeAuction.phoneId;
    const sellerId = phone.sellerId;
    
    console.log('Checking if user can bid...');
    console.log(`  Seller ID: ${sellerId}`);
    console.log(`  User ID: ${testUser._id.toString()}`);
    console.log(`  Is same user: ${sellerId.toString() === testUser._id.toString()}\n`);
    
    if (sellerId.toString() === testUser._id.toString()) {
      console.log('⚠️  User is the seller, cannot bid on own listing');
      
      // Find another user
      const anotherUser = await User.findOne({ _id: { $ne: sellerId } });
      if (!anotherUser) {
        console.log('❌ No other users found');
        return;
      }
      
      console.log('\nUsing another user:');
      console.log(`  Email: ${anotherUser.email}`);
      console.log(`  Name: ${anotherUser.name}`);
      console.log(`  AnonymousId: ${anotherUser.anonymousId}\n`);
      
      // Test bid creation
      const testBidAmount = Math.max(activeAuction.currentBid, phone.minBidPrice) + 100;
      console.log(`Creating test bid of ₹${testBidAmount}...`);
      
      const testBid = new Bid({
        auctionId: activeAuction._id,
        bidAmount: testBidAmount,
        isWinning: true,
        anonymousBidderId: anotherUser.anonymousId
      });
      
      testBid.setBidder(anotherUser._id.toString());
      await testBid.save();
      
      console.log('✓ Test bid created successfully!');
      console.log(`  Bid ID: ${testBid._id}`);
      console.log(`  Anonymous Bidder: ${testBid.anonymousBidderId}`);
      console.log(`  Bid Amount: ₹${testBid.bidAmount}\n`);
      
      // Clean up test bid
      await Bid.deleteOne({ _id: testBid._id });
      console.log('✓ Test bid cleaned up\n');
    } else {
      console.log('✓ User can bid on this auction\n');
      
      // Test bid creation
      const testBidAmount = Math.max(activeAuction.currentBid, phone.minBidPrice) + 100;
      console.log(`Creating test bid of ₹${testBidAmount}...`);
      
      const testBid = new Bid({
        auctionId: activeAuction._id,
        bidAmount: testBidAmount,
        isWinning: true,
        anonymousBidderId: testUser.anonymousId
      });
      
      testBid.setBidder(testUser._id.toString());
      await testBid.save();
      
      console.log('✓ Test bid created successfully!');
      console.log(`  Bid ID: ${testBid._id}`);
      console.log(`  Anonymous Bidder: ${testBid.anonymousBidderId}`);
      console.log(`  Bid Amount: ₹${testBid.bidAmount}\n`);
      
      // Clean up test bid
      await Bid.deleteOne({ _id: testBid._id });
      console.log('✓ Test bid cleaned up\n');
    }
    
    console.log('✅ Bidding system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
};

// Run test
testBidding()
  .then(() => {
    console.log('\n🎉 Test script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test script failed:', error);
    process.exit(1);
  });
