import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Phone from '../models/Phone.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';
import Transaction from '../models/Transaction.js';
import Auction from '../models/Auction.js';
import { generateAnonymousId } from '../services/encryptionService.js';

dotenv.config();

console.log('🔄 Starting database migration...\n');

const migrate = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to database\n');

    // Step 1: Migrate Users
    console.log('Step 1: Migrating Users...');
    const users = await User.find({});
    let userCount = 0;
    
    for (const user of users) {
      let updated = false;
      
      // Add anonymousId if missing
      if (!user.anonymousId) {
        user.anonymousId = generateAnonymousId('USER', 8);
        updated = true;
      }
      
      // Add new fields with defaults
      if (user.walletBalance === undefined) {
        user.walletBalance = 0;
        updated = true;
      }
      
      if (!user.kycStatus) {
        user.kycStatus = 'pending';
        updated = true;
      }
      
      if (user.isBanned === undefined) {
        user.isBanned = false;
        updated = true;
      }
      
      // Update role enum
      if (user.role === 'user') {
        user.role = 'buyer';
        updated = true;
      }
      
      if (updated) {
        await user.save();
        userCount++;
      }
    }
    console.log(`✓ Migrated ${userCount} users\n`);

    // Step 2: Migrate Listings to Phones
    console.log('Step 2: Migrating Listings to Phones...');
    const listings = await Listing.find({});
    let phoneCount = 0;
    
    for (const listing of listings) {
      // Check if phone already exists
      const existingPhone = await Phone.findOne({ 
        sellerId: listing.seller,
        brand: listing.brand,
        model: listing.model
      });
      
      if (!existingPhone) {
        const seller = await User.findById(listing.seller);
        
        const phone = new Phone({
          sellerId: listing.seller,
          anonymousSellerId: seller?.anonymousId || generateAnonymousId('SELLER', 8),
          brand: listing.brand,
          model: listing.model,
          storage: listing.specifications?.storage || 'Unknown',
          ram: listing.specifications?.ram || 'Unknown',
          color: listing.specifications?.color || 'Unknown',
          condition: listing.condition,
          images: listing.images || [],
          description: listing.description,
          minBidPrice: listing.startingPrice,
          auctionStartTime: listing.createdAt,
          auctionEndTime: listing.auctionEndTime,
          status: listing.status === 'active' ? 'live' : 
                  listing.status === 'sold' ? 'sold' : 
                  listing.status === 'expired' ? 'ended' : 'cancelled',
          verificationStatus: 'approved', // Assume existing listings were approved
          createdAt: listing.createdAt,
          updatedAt: listing.updatedAt
        });
        
        // Set dummy encrypted IMEI
        phone.setImei('000000000000000');
        
        await phone.save();
        phoneCount++;
        
        // Create auction for this phone if listing was active
        if (listing.status === 'active') {
          const auction = new Auction({
            phoneId: phone._id,
            currentBid: listing.currentHighestBid || 0,
            totalBids: 0,
            auctionEndTime: listing.auctionEndTime,
            status: 'active'
          });
          await auction.save();
        }
      }
    }
    console.log(`✓ Migrated ${phoneCount} listings to phones\n`);

    // Step 3: Create Auctions for existing Phones
    console.log('Step 3: Creating Auctions...');
    const phones = await Phone.find({ status: 'live' });
    let auctionCount = 0;
    
    for (const phone of phones) {
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (!existingAuction && phone.auctionEndTime) {
        const auction = new Auction({
          phoneId: phone._id,
          currentBid: phone.minBidPrice,
          totalBids: 0,
          auctionEndTime: phone.auctionEndTime,
          status: new Date() > phone.auctionEndTime ? 'ended' : 'active'
        });
        await auction.save();
        auctionCount++;
      }
    }
    console.log(`✓ Created ${auctionCount} auctions\n`);

    // Step 4: Migrate Bids
    console.log('Step 4: Migrating Bids...');
    const oldBids = await Bid.find({});
    let bidCount = 0;
    
    for (const oldBid of oldBids) {
      // Find corresponding auction
      const listing = await Listing.findById(oldBid.listing);
      if (!listing) continue;
      
      const phone = await Phone.findOne({
        sellerId: listing.seller,
        brand: listing.brand,
        model: listing.model
      });
      
      if (!phone) continue;
      
      const auction = await Auction.findOne({ phoneId: phone._id });
      if (!auction) continue;
      
      // Check if bid already migrated
      const existingBid = await Bid.findOne({
        auctionId: auction._id,
        bidAmount: oldBid.amount
      });
      
      if (!existingBid) {
        const newBid = new Bid({
          auctionId: auction._id,
          bidAmount: oldBid.amount,
          timestamp: oldBid.createdAt,
          isWinning: oldBid.isWinning,
          createdAt: oldBid.createdAt
        });
        
        // Encrypt bidder ID
        newBid.setBidder(oldBid.bidder);
        
        await newBid.save();
        bidCount++;
      }
    }
    console.log(`✓ Migrated ${bidCount} bids\n`);

    // Step 5: Migrate Transactions
    console.log('Step 5: Migrating Transactions...');
    const oldTransactions = await Transaction.find({});
    let transactionCount = 0;
    
    for (const oldTx of oldTransactions) {
      // Find corresponding auction
      const listing = await Listing.findById(oldTx.listing);
      if (!listing) continue;
      
      const phone = await Phone.findOne({
        sellerId: listing.seller,
        brand: listing.brand,
        model: listing.model
      });
      
      if (!phone) continue;
      
      const auction = await Auction.findOne({ phoneId: phone._id });
      if (!auction) continue;
      
      // Check if transaction already migrated
      const existingTx = await Transaction.findOne({ auctionId: auction._id });
      
      if (!existingTx) {
        const newTx = new Transaction({
          auctionId: auction._id,
          phoneId: phone._id,
          finalAmount: oldTx.amount,
          platformCommission: oldTx.amount * 0.05,
          sellerPayout: oldTx.amount * 0.95,
          escrowStatus: oldTx.status === 'completed' ? 'released' : 'held',
          meetingStatus: oldTx.status === 'completed' ? 'completed' : 'pending',
          adminNotes: oldTx.adminNotes || '',
          createdAt: oldTx.createdAt,
          updatedAt: oldTx.updatedAt
        });
        
        // Encrypt seller and buyer IDs
        newTx.setSeller(oldTx.seller);
        newTx.setBuyer(oldTx.buyer);
        
        if (oldTx.status === 'completed') {
          newTx.completedAt = oldTx.updatedAt;
        }
        
        await newTx.save();
        transactionCount++;
      }
    }
    console.log(`✓ Migrated ${transactionCount} transactions\n`);

    console.log('✅ Migration completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Users updated: ${userCount}`);
    console.log(`  - Phones created: ${phoneCount}`);
    console.log(`  - Auctions created: ${auctionCount}`);
    console.log(`  - Bids migrated: ${bidCount}`);
    console.log(`  - Transactions migrated: ${transactionCount}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
  }
};

// Run migration
migrate()
  .then(() => {
    console.log('\n🎉 Migration script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
