import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';
import User from '../models/User.js';

dotenv.config();

async function updateModels() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update Phone documents
    console.log('\n📱 Updating Phone documents...');
    
    // Fix condition field - convert lowercase to capitalized
    const phonesWithLowercase = await Phone.find({
      condition: { $in: ['excellent', 'good', 'fair', 'poor'] }
    });
    
    for (const phone of phonesWithLowercase) {
      const capitalizedCondition = phone.condition.charAt(0).toUpperCase() + phone.condition.slice(1);
      phone.condition = capitalizedCondition;
      await phone.save();
    }
    console.log(`✅ Updated ${phonesWithLowercase.length} phone conditions to capitalized format`);

    // Add accessories field to phones that don't have it
    const phonesWithoutAccessories = await Phone.find({
      accessories: { $exists: false }
    });
    
    for (const phone of phonesWithoutAccessories) {
      phone.accessories = {
        charger: false,
        bill: false,
        box: false
      };
      await phone.save();
    }
    console.log(`✅ Added accessories field to ${phonesWithoutAccessories.length} phones`);

    // Update Auction documents
    console.log('\n🔨 Updating Auction documents...');
    
    // Add seller information to auctions
    const auctionsWithoutSeller = await Auction.find({
      $or: [
        { sellerId: { $exists: false } },
        { anonymousSellerId: { $exists: false } }
      ]
    }).populate('phoneId');
    
    for (const auction of auctionsWithoutSeller) {
      if (auction.phoneId) {
        auction.sellerId = auction.phoneId.sellerId;
        auction.anonymousSellerId = auction.phoneId.anonymousSellerId;
        
        // Add startingBid if missing
        if (!auction.startingBid) {
          auction.startingBid = auction.phoneId.minBidPrice || auction.currentBid || 0;
        }
        
        // Initialize bids array if missing
        if (!auction.bids) {
          auction.bids = [];
        }
        
        await auction.save();
      }
    }
    console.log(`✅ Updated ${auctionsWithoutSeller.length} auctions with seller information`);

    // Update User documents
    console.log('\n👤 Updating User documents...');
    
    // Add missing fields to users
    const usersToUpdate = await User.find({
      $or: [
        { phoneNumber: { $exists: false } },
        { isVerified: { $exists: false } },
        { governmentIdNumber: { $exists: false } }
      ]
    });
    
    for (const user of usersToUpdate) {
      if (!user.phoneNumber) user.phoneNumber = '';
      if (user.isVerified === undefined) user.isVerified = false;
      if (!user.governmentIdNumber) user.governmentIdNumber = '';
      await user.save();
    }
    console.log(`✅ Updated ${usersToUpdate.length} users with missing fields`);

    // Summary
    console.log('\n📊 Database Update Summary:');
    console.log('================================');
    
    const totalPhones = await Phone.countDocuments();
    const totalAuctions = await Auction.countDocuments();
    const totalUsers = await User.countDocuments();
    
    console.log(`📱 Total Phones: ${totalPhones}`);
    console.log(`🔨 Total Auctions: ${totalAuctions}`);
    console.log(`👤 Total Users: ${totalUsers}`);
    
    const phonesByCondition = await Phone.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);
    console.log('\n📱 Phones by Condition:');
    phonesByCondition.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });
    
    const auctionsByStatus = await Auction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('\n🔨 Auctions by Status:');
    auctionsByStatus.forEach(item => {
      console.log(`   ${item._id}: ${item.count}`);
    });

    console.log('\n✅ All models updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating models:', error);
    process.exit(1);
  }
}

updateModels();
